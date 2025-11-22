import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../core/services/product.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

const mockProducts = [
    {
        id: 'trj-crd',
        name: 'Tarjeta Crédito',
        description: 'Tarjeta de consumo',
        logo: 'https://example.com/logo.png',
        date_release: new Date('2025-01-01T00:00:00.000Z'),
        date_revision: new Date('2026-01-01T00:00:00.000Z')
    }
];

describe('ProductListComponent', () => {
    let component: ProductListComponent;
    let fixture: ComponentFixture<ProductListComponent>;
    let productServiceMock: any;
    let routerMock: any;

    beforeEach(async () => {
        productServiceMock = {
            getAll: jest.fn().mockReturnValue(of(mockProducts)),
            delete: jest.fn().mockReturnValue(of({}))
        };

        routerMock = {
            navigate: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ProductListComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    // TEST: Creación del componente
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // TEST: Carga de productos
    it('load products on init', () => {
        expect(productServiceMock.getAll).toHaveBeenCalled();
        expect(component.products().length).toBe(1);
        expect(component.loading()).toBe(false);
    });

    // TEST: Manejo de error al cargar productos
    it('should set error=true when getAll() fails', () => {
        productServiceMock.getAll.mockReturnValueOnce(
            throwError(() => new Error('fail'))
        );

        component['loadProducts']();
        expect(component.error()).toBe(true);
        expect(component.loading()).toBe(false);
    });

    // TEST: Filtro de búsqueda
    it('filter products by search term', fakeAsync(() => {
        component.onSearchChange('crédito');
        tick(300);
        expect(component.filteredProducts().length).toBe(1);

        component.onSearchChange('noexiste');
        tick(300);
        expect(component.filteredProducts().length).toBe(0);
    }));

    // TEST: Cambio de página y tamaño de página
    it('change page size', () => {
        component.onPageSizeChange({ target: { value: '20' } } as any);
        expect(component.pageSize()).toBe(20);
    });

    it('should not change page if invalid', () => {
        component.pageSize.set(10);
        component.products.set(mockProducts);

        component.goToPage(0);
        expect(component.currentPage()).toBe(1);

        component.goToPage(999);
        expect(component.currentPage()).toBe(1);
    });

    // TEST: Navegación a agregar y editar
    it('navigate to add and edit', () => {
        component.onAdd();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/add']);

        component.onEdit('trj-crd');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/edit', 'trj-crd']);
    });

    // TEST: Menú contextual
    it('should close menu if already open', () => {
        component.openMenuId.set('trj-crd');

        component.toggleMenu(new MouseEvent('click'), 'trj-crd');

        expect(component.openMenuId()).toBeNull();
    });

    it('should close menu on document click', () => {
        component.openMenuId.set('trj-crd');

        document.dispatchEvent(new MouseEvent('click'));
        fixture.detectChanges();

        expect(component.openMenuId()).toBeNull();
    });

    // TEST: Modal de eliminación
    it('open and close delete modal', () => {
        component.openDeleteModal(new MouseEvent('click'), 'trj-crd');
        expect(component.deleteCandidate()).toBe('trj-crd');

        component.cancelDelete();
        expect(component.deleteCandidate()).toBeNull();
    });

    it('should return empty string when deleteCandidate is null', () => {
        component.products.set(mockProducts);
        component.deleteCandidate.set(null);

        expect(component.deleteProductName()).toBe('');
    });

    it('should return product name when deleteCandidate matches an existing product id', () => {
        component.products.set(mockProducts);
        component.deleteCandidate.set('trj-crd');

        expect(component.deleteProductName()).toBe('Tarjeta Crédito');
    });

    it('should return "este producto" when deleteCandidate id not found', () => {
        component.products.set(mockProducts);
        component.deleteCandidate.set('no-existe');

        expect(component.deleteProductName()).toBe('este producto');
    });

    // TEST: Eliminación de producto
    it('delete product and update list', fakeAsync(() => {
        component.openDeleteModal(new MouseEvent('click'), 'trj-crd');
        component.confirmDelete();
        tick();

        expect(productServiceMock.delete).toHaveBeenCalledWith('trj-crd');
        expect(component.products().length).toBe(0);
    }));

    it('should do nothing when confirmDelete() is called with no deleteCandidate', () => {
        component.deleteCandidate.set(null);

        component.confirmDelete();

        expect(productServiceMock.delete).not.toHaveBeenCalled();
    });

    it('should show alert on delete error', fakeAsync(() => {
        jest.spyOn(window, 'alert').mockImplementation(() => { });

        productServiceMock.delete.mockReturnValueOnce(
            throwError(() => new Error('delete error'))
        );

        component.deleteCandidate.set('trj-crd');

        component.confirmDelete();
        tick();

        expect(window.alert).toHaveBeenCalledWith('Error al eliminar el producto');
    }));

    // TEST: toggleMenu abre menú cuando está cerrado
    it('should open menu when it is closed', () => {
        const event = new MouseEvent('click');
        jest.spyOn(event, 'stopPropagation');

        component.openMenuId.set(null);
        component.toggleMenu(event, 'trj-crd');

        expect(event.stopPropagation).toHaveBeenCalled();
        expect(component.openMenuId()).toBe('trj-crd');
    });

    // TEST: onEdit cierra el menú abierto
    it('should close menu when editing', () => {
        component.openMenuId.set('trj-crd');
        component.onEdit('trj-crd');

        expect(component.openMenuId()).toBeNull();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/edit', 'trj-crd']);
    });

    // TEST: openDeleteModal cierra el menú y abre modal
    it('should close menu when opening delete modal', () => {
        const event = new MouseEvent('click');
        jest.spyOn(event, 'stopPropagation');

        component.openMenuId.set('trj-crd');
        component.openDeleteModal(event, 'trj-crd');

        expect(event.stopPropagation).toHaveBeenCalled();
        expect(component.openMenuId()).toBeNull();
        expect(component.deleteCandidate()).toBe('trj-crd');
    });

    // TEST: goToPage con página válida
    it('should change to valid page', () => {
        component.products.set([...mockProducts, ...mockProducts, ...mockProducts]);
        component.pageSize.set(1);

        component.goToPage(2);
        expect(component.currentPage()).toBe(2);

        component.goToPage(1);
        expect(component.currentPage()).toBe(1);
    });

    // TEST: filteredProducts filtra por ID
    it('should filter products by ID', fakeAsync(() => {
        const products = [
            { ...mockProducts[0], id: 'ABC123', name: 'Producto A', description: 'Descripción A' },
            { ...mockProducts[0], id: 'XYZ789', name: 'Producto B', description: 'Descripción B' }
        ];
        component.products.set(products);

        component.onSearchChange('ABC');
        tick(300);

        expect(component.filteredProducts().length).toBe(1);
        expect(component.filteredProducts()[0].id).toBe('ABC123');
    }));

    // TEST: filteredProducts filtra por description
    it('should filter products by description', fakeAsync(() => {
        const products = [
            { ...mockProducts[0], id: 'P1', name: 'Producto A', description: 'Tarjeta especial' },
            { ...mockProducts[0], id: 'P2', name: 'Producto B', description: 'Cuenta de ahorro' }
        ];
        component.products.set(products);

        component.onSearchChange('especial');
        tick(300);

        expect(component.filteredProducts().length).toBe(1);
        expect(component.filteredProducts()[0].description).toBe('Tarjeta especial');
    }));

    // TEST: filteredProducts retorna todos si el término está vacío
    it('should return all products when search term is empty', () => {
        component.products.set(mockProducts);
        component.searchTerm.set('');

        expect(component.filteredProducts()).toEqual(mockProducts);
    });

    // TEST: filteredProducts con término solo espacios
    it('should return all products when search term is only spaces', () => {
        component.products.set(mockProducts);
        component.searchTerm.set('   ');

        expect(component.filteredProducts()).toEqual(mockProducts);
    });

    // TEST: totalResults computed
    it('should calculate total results correctly', () => {
        const products = [...mockProducts, ...mockProducts];
        component.products.set(products);
        component.searchTerm.set('');

        expect(component.totalResults()).toBe(2);
    });

    // TEST: totalPages computed
    it('should calculate total pages correctly', () => {
        const products = new Array(25).fill(mockProducts[0]);
        component.products.set(products);
        component.pageSize.set(10);
        component.searchTerm.set('');

        expect(component.totalPages()).toBe(3);
    });

    // TEST: paginatedProducts
    it('should paginate products correctly', () => {
        const products = [
            { ...mockProducts[0], id: 'P1' },
            { ...mockProducts[0], id: 'P2' },
            { ...mockProducts[0], id: 'P3' }
        ];
        component.products.set(products);
        component.pageSize.set(2);
        component.searchTerm.set('');
        component.currentPage.set(1);

        expect(component.paginatedProducts().length).toBe(2);
        expect(component.paginatedProducts()[0].id).toBe('P1');

        component.currentPage.set(2);
        expect(component.paginatedProducts().length).toBe(1);
        expect(component.paginatedProducts()[0].id).toBe('P3');
    });

    // TEST: pageNumbers computed
    it('should generate page numbers array', () => {
        const products = new Array(25).fill(mockProducts[0]);
        component.products.set(products);
        component.pageSize.set(10);
        component.searchTerm.set('');

        expect(component.pageNumbers()).toEqual([1, 2, 3]);
    });

    // TEST: onPageSizeChange resetea a página 1
    it('should reset to page 1 when page size changes', () => {
        component.currentPage.set(3);
        component.onPageSizeChange({ target: { value: '20' } } as any);

        expect(component.pageSize()).toBe(20);
        expect(component.currentPage()).toBe(1);
    });

    // TEST: searchSubject con debounce no ejecuta inmediatamente
    it('should debounce search input', fakeAsync(() => {
        component.onSearchChange('test');
        expect(component.searchTerm()).toBe('');

        tick(200);
        expect(component.searchTerm()).toBe('');

        tick(100);
        expect(component.searchTerm()).toBe('test');
    }));

    // TEST: searchSubject con distinctUntilChanged
    it('should not trigger search if value is the same', fakeAsync(() => {
        component.onSearchChange('test');
        tick(300);
        expect(component.searchTerm()).toBe('test');

        const initialPage = component.currentPage();
        component.currentPage.set(2);

        component.onSearchChange('test');
        tick(300);

        expect(component.currentPage()).toBe(2);
    }));

    // TEST: searchSubject resetea a página 1 cuando cambia búsqueda
    it('should reset to page 1 when search term changes', fakeAsync(() => {
        component.currentPage.set(3);
        component.onSearchChange('nuevo término');
        tick(300);

        expect(component.currentPage()).toBe(1);
    }));
});