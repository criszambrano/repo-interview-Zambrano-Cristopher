import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductFormComponent } from './product-form.component';
import { ProductService } from '../../../../core/services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('ProductFormComponent', () => {
    let component: ProductFormComponent;
    let fixture: ComponentFixture<ProductFormComponent>;
    let productServiceMock: any;
    let routerMock: any;

    const mockProduct = {
        id: 'existente',
        name: 'Nombre existente',
        description: 'Descripción válida larga',
        logo: 'https://logo.com',
        date_release: '2025-01-01',
        date_revision: '2026-01-01'
    };

    beforeEach(async () => {
        productServiceMock = {
            verifyId: jest.fn(),
            create: jest.fn().mockReturnValue(of({})),
            update: jest.fn().mockReturnValue(of({})),
            getById: jest.fn().mockReturnValue(of(mockProduct))
        };

        routerMock = { navigate: jest.fn() };
    });

    // TEST: Modo creación (sin id en params)
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

        expect(component.isEditMode()).toBe(false);
    });

    // TEST: Validación de campos requeridos
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

        component.form.set({
            id: '', name: '', description: '', logo: '',
            date_release: new Date(), date_revision: new Date()
        } as any);

        const isValid = (component as any).validateForm();
        expect(isValid).toBe(false);
        expect(Object.keys(component.errors())).toContain('id');
        expect(Object.keys(component.errors())).toContain('name');
        expect(Object.keys(component.errors())).toContain('description');
        expect(Object.keys(component.errors())).toContain('logo');
    });

    // TEST: Longitud del ID
    it('should validate ID length (3-10 characters) and show correct error message', async () => {
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

        // Caso inválido: menos de 3 caracteres
        component.onIdChange('ab');
        fixture.detectChanges();
        expect(component.errors()['id']).toBe('Requerido, debe tener entre 3 y 10 caracteres');

        // Caso inválido: más de 10 caracteres
        component.onIdChange('a'.repeat(11));
        fixture.detectChanges();
        expect(component.errors()['id']).toBe('Requerido, debe tener entre 3 y 10 caracteres');

        // Caso válido
        component.onIdChange('valid123');
        fixture.detectChanges();
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

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        component.form.update(f => ({ ...f, date_release: yesterday }));
        (component as any).validateForm();

        expect(component.errors()['date_release']).toBeTruthy();
    });

    // TEST: Fecha revisión = liberación + 1 año
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

        component.onDateReleaseChange('2025-12-01');
        expect(component.form().date_revision.getFullYear()).toBe(2026);
    });

    // TEST: Submit válido → create
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

        component.form.set({
            id: 'nuevo123',
            name: 'Producto válido',
            description: 'Descripción suficientemente larga para pasar validación',
            logo: 'https://logo.com/logo.png',
            date_release: new Date(),
            date_revision: new Date()
        } as any);

        component.onSubmit();

        expect(productServiceMock.create).toHaveBeenCalled();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
});