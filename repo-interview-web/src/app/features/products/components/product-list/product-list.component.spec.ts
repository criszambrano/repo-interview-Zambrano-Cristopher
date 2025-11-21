import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../core/services/product.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

const mockProducts = [
    {
        id: 'trj-crd',
        name: 'Tarjeta Crédito',
        description: 'Tarjeta de consumo',
        logo: 'https://example.com/logo.png',
        date_release: '2025-01-01',
        date_revision: '2026-01-01'
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

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(' load products on init', () => {
        expect(productServiceMock.getAll).toHaveBeenCalled();
        expect(component.products().length).toBe(1);
        expect(component.loading()).toBe(false);
    });

    it(' filter products by search term', fakeAsync(() => {
        component.onSearchChange('crédito');
        tick(300);
        expect(component.filteredProducts().length).toBe(1);

        component.onSearchChange('noexiste');
        tick(300);
        expect(component.filteredProducts().length).toBe(0);
    }));

    it(' change page size', () => {
        component.onPageSizeChange({ target: { value: '20' } } as any);
        expect(component.pageSize()).toBe(20);
    });

    it(' open and close delete modal', () => {
        component.openDeleteModal(new MouseEvent('click'), 'trj-crd');
        expect(component.deleteCandidate()).toBe('trj-crd');

        component.cancelDelete();
        expect(component.deleteCandidate()).toBeNull();
    });

    it(' delete product and update list', fakeAsync(() => {
        component.openDeleteModal(new MouseEvent('click'), 'trj-crd');
        component.confirmDelete();
        tick();

        expect(productServiceMock.delete).toHaveBeenCalledWith('trj-crd');
        expect(component.products().length).toBe(0);
    }));

    it(' navigate to add and edit', () => {
        component.onAdd();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/add']);

        component.onEdit('trj-crd');
        expect(routerMock.navigate).toHaveBeenCalledWith(['/edit', 'trj-crd']);
    });
});