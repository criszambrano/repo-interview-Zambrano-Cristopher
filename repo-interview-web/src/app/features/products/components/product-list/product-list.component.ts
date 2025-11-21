import { Component, signal, computed, inject, OnInit, HostListener } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../models/product.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './product-list.component.html',
  styleUrls: [
    '../../../../core/styles/global-styles.css',
    './product-list.component.css'
  ]
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal(false);
  searchTerm = signal('');
  pageSize = signal(10);
  currentPage = signal(1);
  openMenuId = signal<string | null>(null);
  deleteCandidate = signal<string | null>(null);

  deleteProductName = computed(() => {
    const id = this.deleteCandidate();
    if (!id) return '';
    return this.products().find(p => p.id === id)?.name || 'este producto';
  });

  private searchSubject = new Subject<string>();

  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.products();
    return this.products().filter(p =>
      p.id.toLowerCase().includes(term) ||
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  });

  totalResults = computed(() => this.filteredProducts().length);
  totalPages = computed(() => Math.ceil(this.totalResults() / this.pageSize()));

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredProducts().slice(start, end);
  });

  pageNumbers = computed(() => {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  });

  ngOnInit() {
    this.loadProducts();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.currentPage.set(1);
    });
  }

  private loadProducts() {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.openMenuId.set(null);
  }

  toggleMenu($event: any, id: string) {
    $event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  openDeleteModal($event: any, id: string) {
    $event.stopPropagation();
    this.openMenuId.set(null);
    this.deleteCandidate.set(id);
  }

  onAdd() {
    this.router.navigate(['/add']);
  }

  onEdit(id: string) {
    this.openMenuId.set(null);
    this.router.navigate(['/edit', id]);
  }

  confirmDelete() {
    const id = this.deleteCandidate();
    if (!id) return;

    this.productService.delete(id).subscribe({
      next: () => {
        this.products.set(this.products().filter(p => p.id !== id));
        this.deleteCandidate.set(null);
      },
      error: () => alert('Error al eliminar el producto')
    });
  }

  cancelDelete() {
    this.deleteCandidate.set(null);
  }

  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }

  onPageSizeChange(event: Event) {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

}