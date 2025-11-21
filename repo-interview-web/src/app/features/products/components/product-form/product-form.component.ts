import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../models/product.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: [
    '../../../../core/styles/global-styles.css',
    './product-form.component.css'
  ]
})
export class ProductFormComponent {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  productId = signal<string>('');
  hasErrors = computed(() => Object.keys(this.errors()).length > 0);

  form = signal<Product>({
    id: '',
    name: '',
    description: '',
    logo: '',
    date_release: new Date(),
    date_revision: new Date()
  });

  errors = signal<Record<string, string>>({});

  private idCheckSubject = new Subject<string>();

  constructor() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.productId.set(params['id']);
        this.loadProduct(params['id']);
      }
    });

    this.idCheckSubject.pipe(
      debounceTime(500),
      switchMap(id => this.productService.verifyId(id))
    ).subscribe(exists => {
      if (exists && !this.isEditMode()) {
        this.errors.update(errs => ({ ...errs, id: 'El ID ya existe' }));
      } else if (this.form().id.length >= 5) {
        const newErrors = { ...this.errors() };
        delete newErrors['id'];
        this.errors.set(newErrors);
      }
    });
  }

  private loadProduct(id: string) {
    this.productService.getById(id).subscribe({
      next: (product) => this.form.set(product),
      error: () => this.router.navigate(['/'])
    });
  }

  private toLocalDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  onIdChange(value: string) {
    this.form.update(f => ({ ...f, id: value.trim() }));
    if (value.length >= 5 && !this.isEditMode()) {
      this.idCheckSubject.next(value);
    }
  }

  validateForm(): boolean {
    const f = this.form();
    const errs: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!f.id || f.id.length < 3 || f.id.length > 10) {
      errs['id'] = 'Requerido, debe tener entre 3 y 10 caracteres';
    }
    if (!f.name || f.name.length < 5 || f.name.length > 100) {
      errs['name'] = 'Requerido, debe tener entre 5 y 100 caracteres';
    }
    if (!f.description || f.description.length < 10 || f.description.length > 200) {
      errs['description'] = 'Requerido, debe tener entre 10 y 200 caracteres';
    }
    if (!f.logo) errs['logo'] = 'Este campo es requerido';
    if (!f.date_release) errs['date_release'] = 'Requerido';
    if (new Date(f.date_release) < today) {
      errs['date_release'] = 'La fecha debe ser igual o mayor a hoy';
    }
    if (!f.date_revision) errs['date_revision'] = 'Requerido';

    this.errors.set(errs);
    return Object.keys(errs).length === 0;
  }

  onDateReleaseChange(value: string) {
    const release = this.toLocalDate(value);

    const revision = new Date(release);
    revision.setFullYear(revision.getFullYear() + 1);

    this.form.update(f => ({
      ...f,
      date_release: release,
      date_revision: revision
    }));
  }


  onSubmit() {
    if (!this.validateForm()) return;

    const action = this.isEditMode()
      ? this.productService.update(this.productId(), this.form())
      : this.productService.create(this.form());

    action.subscribe({
      next: () => {
        this.router.navigate(['/'])
      },
      error: (err) => {
        if (err.status === 400 && err.error.message.includes('Duplicate')) {
          this.errors.set({ id: 'El ID ya existe' });
        }
      }
    });
  }

  onReset() {
    this.form.set({
      id: '', name: '', description: '', logo: '',
      date_release: new Date(), date_revision: new Date()
    });
    this.errors.set({});
  }

  onBackToList() {
    this.router.navigate(['/']);
  }
}