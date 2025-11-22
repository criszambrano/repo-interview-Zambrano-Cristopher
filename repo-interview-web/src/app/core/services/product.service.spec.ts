import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../../features/products/models/product.interface';
import { environment } from '../../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.appApiUrl;

  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'test-logo.png',
    date_release: new Date('2024-01-01'),
    date_revision: new Date('2025-01-01')
  };

  const mockProducts: Product[] = [
    mockProduct,
    {
      id: '2',
      name: 'Test Product 2',
      description: 'Test Description 2',
      logo: 'test-logo-2.png',
      date_release: new Date('2024-02-01'),
      date_revision: new Date('2025-02-01')
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return an array of products', (done) => {
      service.getAll().subscribe(products => {
        expect(products).toEqual(mockProducts);
        expect(products.length).toBe(2);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProducts });
    });

    it('should return empty array on error', (done) => {
      service.getAll().subscribe(products => {
        expect(products).toEqual([]);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' });
    });
  });

  describe('verifyId', () => {
    it('should verify if product id exists', (done) => {
      const testId = '123';

      service.verifyId(testId).subscribe(result => {
        expect(result).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/verification/${testId}`);
      expect(req.request.method).toBe('GET');
      req.flush(true);
    });

    it('should return false if product id does not exist', (done) => {
      const testId = '999';

      service.verifyId(testId).subscribe(result => {
        expect(result).toBe(false);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/verification/${testId}`);
      expect(req.request.method).toBe('GET');
      req.flush(false);
    });
  });

  describe('getById', () => {
    it('should return a product by id', (done) => {
      const testId = '1';

      service.getById(testId).subscribe(product => {
        expect(product).toEqual(mockProduct);
        expect(product.id).toBe(testId);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${testId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });
  });

  describe('create', () => {
    it('should create a new product', (done) => {
      const newProduct: Product = {
        id: '3',
        name: 'New Product',
        description: 'New Description',
        logo: 'new-logo.png',
        date_release: new Date('2024-03-01'),
        date_revision: new Date('2025-03-01')
      };

      service.create(newProduct).subscribe(product => {
        expect(product).toEqual(newProduct);
        done();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProduct);
      req.flush(newProduct);
    });
  });

  describe('update', () => {
    it('should update an existing product', (done) => {
      const testId = '1';
      const partialUpdate: Partial<Product> = {
        name: 'Updated Product Name',
        description: 'Updated Description'
      };

      const updatedProduct = { ...mockProduct, ...partialUpdate };

      service.update(testId, partialUpdate).subscribe(product => {
        expect(product).toEqual(updatedProduct);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${testId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(partialUpdate);
      req.flush(updatedProduct);
    });

    it('should update product with all fields', (done) => {
      const testId = '1';
      const fullUpdate: Product = {
        id: '1',
        name: 'Fully Updated Product',
        description: 'Fully Updated Description',
        logo: 'updated-logo.png',
        date_release: new Date('2024-04-01'),
        date_revision: new Date('2025-04-01')
      };

      service.update(testId, fullUpdate).subscribe(product => {
        expect(product).toEqual(fullUpdate);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${testId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(fullUpdate);
      req.flush(fullUpdate);
    });
  });

  describe('delete', () => {
    it('should delete a product by id', (done) => {
      const testId = '1';

      service.delete(testId).subscribe(response => {
        expect(response).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${testId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('should handle delete response with message', (done) => {
      const testId = '1';
      const deleteResponse = { message: 'Product deleted successfully' };

      service.delete(testId).subscribe(response => {
        expect(response).toEqual(deleteResponse);
        done();
      });

      const req = httpMock.expectOne(`${apiUrl}/${testId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(deleteResponse);
    });
  });
});
