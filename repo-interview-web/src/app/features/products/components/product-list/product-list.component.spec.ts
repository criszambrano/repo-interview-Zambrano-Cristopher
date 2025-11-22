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
});