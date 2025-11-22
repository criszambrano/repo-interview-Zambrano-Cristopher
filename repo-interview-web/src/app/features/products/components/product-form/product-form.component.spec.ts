import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../../core/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

describe('ProductFormComponent', () => {
    let activatedRouteMock: any;
    let productServiceMock: any;
    let routerMock: any;
    let fixture: ComponentFixture<ProductFormComponent>;
    let component: ProductFormComponent;

    const mockProduct = {
        id: 'trj-crd',
        name: 'Tarjeta de Crédito Clásica',
        description: 'Tarjeta de consumo bajo la modalidad de crédito',
        logo: 'https://www.visa.com.ec/dam/VCOM/regional/lac/SPA/Default/Pay%20With%20Visa/Tarjetas/visa-signature-400x225.jpg',
        date_release: new Date('2025-03-01T00:00:00.000Z'),
        date_revision: new Date('2026-03-01T00:00:00.000Z')
    };

    function normalizeDates() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        component.form.update(f => ({
            ...f,
            date_release: today,
            date_revision: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
        }));

        fixture.detectChanges();
    }

    beforeEach(async () => {
        activatedRouteMock = {
            params: of({})
        };

        productServiceMock = {
            verifyId: jest.fn().mockReturnValue(of(false)),
            create: jest.fn().mockReturnValue(of({})),
            update: jest.fn().mockReturnValue(of({})),
            getById: jest.fn().mockReturnValue(of(mockProduct))
        };

        routerMock = { navigate: jest.fn() };
    });

    // TEST: Comprobar modo edición/creación según ruta
    it('should be in add mode when no id in route', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        normalizeDates();

        expect(component.isEditMode()).toBe(false);
    });

    // TEST: Cargar producto en modo edición
    it('should enter edit mode when route has id param', async () => {
        const product = {
            id: 'A1',
            name: 'Test',
            description: 'Descripción válida larga',
            logo: 'https://logo.com',
            date_release: '2025-01-01',
            date_revision: '2026-01-01'
        };

        activatedRouteMock.params = of({ id: 'A1' });
        productServiceMock.getById.mockReturnValue(of(product));

        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.isEditMode()).toBe(true);
        expect(component.productId()).toBe('A1');
        expect(productServiceMock.getById).toHaveBeenCalledWith('A1');
    });

    // TEST: Cargar producto correctamente
    it('should load a product successfully', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();
        const product = { id: 'X', name: 'Name', description: 'Desc', logo: 'L', date_release: new Date(), date_revision: new Date() };

        productServiceMock.getById.mockReturnValue(of(product));

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;

        component['loadProduct']('X');

        expect(component.form()).toEqual(product);
    });

    // TEST: Manejar error al cargar producto
    it('should navigate on loadProduct error', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        productServiceMock.getById.mockReturnValue(throwError(() => ({})));

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;

        component['loadProduct']('X');

        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    // TEST: Validación campos obligatorios
    it('should validate required fields', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        normalizeDates();

        component.form.set({
            id: '',
            name: '',
            description: '',
            logo: '',
            date_release: new Date(),
            date_revision: new Date()
        } as any);

        const isValid = component.validateForm();
        expect(isValid).toBe(false);

        const err = component.errors();
        expect(err['id']).toBeDefined();
        expect(err['name']).toBeDefined();
        expect(err['description']).toBeDefined();
        expect(err['logo']).toBeDefined();
    });

    // TEST: Validación longitud ID
    it('should validate ID length (3-10 chars)', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        normalizeDates();

        component.onIdChange('ab');
        expect(component.errors()['id']).toBe('Requerido, debe tener entre 3 y 10 caracteres');

        component.onIdChange('a'.repeat(11));
        expect(component.errors()['id']).toBe('Requerido, debe tener entre 3 y 10 caracteres');

        component.onIdChange('valid99');
        expect(component.errors()['id']).toBeUndefined();
    });

    // TEST: Fecha liberación >= hoy
    it('should validate date_release >= today', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        normalizeDates();

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        component.form.update(f => ({ ...f, date_release: yesterday }));
        component.validateForm();

        expect(component.errors()['date_release']).toBeTruthy();
    });

    // TEST: Revisión = Liberación +1 año
    it('should auto set date_revision +1 year', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        normalizeDates();

        component.onDateReleaseChange('2025-12-01');
        expect(component.form().date_revision.getFullYear()).toBe(2026);
    });

    // TEST: Comprobar duplicación de ID
    it('should set duplication error when ID exists and not edit mode', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        jest.useFakeTimers();
        productServiceMock.verifyId.mockReturnValue(of(true));

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;

        component.onIdChange('ABCDE');

        jest.runOnlyPendingTimers();

        expect(component.idDuplicationError()).toBe('El ID ya existe');
    });

    // TEST: Comprobar no duplicación de ID
    it('should clear duplication error when ID does not exist', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();
        jest.useFakeTimers();
        productServiceMock.verifyId.mockReturnValue(of(false));

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;

        component.onIdChange('ABCDE');
        jest.runOnlyPendingTimers();

        expect(component.idDuplicationError()).toBeNull();
    });

    // TEST: No duplicar error en modo edición
    it('should not set duplication error in edit mode', async () => {

        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        jest.useFakeTimers();
        productServiceMock.verifyId.mockReturnValue(of(true));

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;

        component.isEditMode.set(true);

        component.onIdChange('ABCDE');
        jest.runOnlyPendingTimers();

        expect(component.idDuplicationError()).toBeNull();
    });

    // TEST: Enviar formulario correctamente (modo creación)
    it('should submit form when valid (add mode)', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        normalizeDates();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        component.form.set({
            id: 'nuevo1',
            name: 'Producto válido',
            description: 'Una descripción suficientemente larga',
            logo: 'https://logo.com/x.png',
            date_release: today,
            date_revision: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
        });

        component.onSubmit();

        expect(productServiceMock.create).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    // TEST: Resetear formulario
    it('should reset form and errors', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        normalizeDates();

        component.errors.set({ id: 'err' });
        component.onReset();

        expect(component.form().id).toBe('');
        expect(Object.keys(component.errors()).length).toBe(0);
    });

    // TEST: Navegar de vuelta a la lista
    it('should navigate back to list', async () => {
        await TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        normalizeDates();

        component.onBackToList();

        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    // TEST: Manejar error de ID duplicado desde el backend
    it('should handle duplicate ID error from backend', fakeAsync(() => {

        productServiceMock.verifyId.mockReturnValue(of(false));

        productServiceMock.create.mockReturnValue(
            throwError(() => ({ status: 400, error: { message: 'Duplicate' } }))
        );

        TestBed.configureTestingModule({
            imports: [ProductFormComponent],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: { params: of({}) } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProductFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        normalizeDates();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        component.form.set({
            id: 'trj-crd',
            name: 'Producto válido',
            description: 'Descripción suficientemente larga',
            logo: 'https://logo.com/img.png',
            date_release: today,
            date_revision: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
        });

        component.onSubmit();
        tick();

        expect(component.errors()['id']).toBe('El ID ya existe');
    }));
});
