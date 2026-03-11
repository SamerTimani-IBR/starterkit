import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { ProductsService } from 'src/app/services/products.service';
import { CatagoriesService } from 'src/app/services/catagories.service';

import { Product } from 'src/assets/models/products';
import { Catagory } from 'src/assets/models/catagories';

export interface ProductRow extends Product {
  catagoryName: string;
  catagoryType: string;
  expiryStatus: 'Expired' | 'Near Expiry' | 'Valid';
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'Name',
    'Price',
    'ExpiryDate',
    'catagoryName',
    'catagoryType',
    'expiryStatus',
    'actions',
  ];

  dataSource = new MatTableDataSource<ProductRow>([]);
  isLoading = true;
  errorMessage = '';

  catagories: Catagory[] = [];
  selectedCatagoryId: string = 'all';
  searchText = '';

  isCreating = false;
  isSaving = false;



  // ===== Inline edit state =====
  editingId: string | null = null;
  editModel: Partial<Product> = {};

  // ===== ADD (POST) model =====
  newProduct: Omit<Product, 'id'> = {
    catagoryId: '',
    Name: '',
    Price: 0,
    ExpiryDate: '',
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productsService: ProductsService,
    private catagoriesService: CatagoriesService
  ) { }

  ngOnInit(): void {
    this.loadAll();
  }

  ngAfterViewInit(): void {
    // filter predicate stays here
    this.dataSource.filterPredicate = (row, filter) => {
      const f = JSON.parse(filter) as { catagoryId: string; search: string };
      const matchCat = f.catagoryId === 'all' ? true : row.catagoryId === f.catagoryId;
      const s = (f.search || '').trim().toLowerCase();
      const matchSearch = !s ? true : row.Name.toLowerCase().includes(s);
      return matchCat && matchSearch;
    };

    this.bindTableControls();
  }
  private bindTableControls(): void {
    if (this.paginator) this.dataSource.paginator = this.paginator;
    if (this.sort) this.dataSource.sort = this.sort;
  }
  // ===== Load (GET) =====
  loadAll(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // if we reload, exit edit mode to avoid stale updates
    this.cancelEdit();

    this.catagoriesService.getAllCatagories().subscribe({
      next: (cats: Catagory[]) => {
        this.catagories = Array.isArray(cats) ? cats : [];

        this.productsService.getAllProducts().subscribe({
          next: (products: Product[]) => {
            const rows = this.joinProductsWithCatagories(products || [], this.catagories);

            this.dataSource.data = rows;

            this.applyFilters();

            // ✅ re-bind paginator/sort after data is present and view is rendered
            setTimeout(() => {
              this.bindTableControls();
              this.paginator?.firstPage();
            });

            this.isLoading = false;
            if (this.paginator) this.paginator.firstPage();
          },
          error: (err) => {
            console.error(err);
            this.isLoading = false;
            this.errorMessage = 'Failed to load products.';
            this.dataSource.data = [];
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load categories (required for products mapping).';
        this.dataSource.data = [];
      },
    });
  }

  private joinProductsWithCatagories(products: Product[], cats: Catagory[]): ProductRow[] {
    const map: Record<string, Catagory> = {};
    for (const c of cats) map[c.id] = c;

    return products.map((p) => {
      const cat = map[p.catagoryId];
      return {
        ...p,
        catagoryName: cat?.name ?? 'Unknown',
        catagoryType: cat?.catagoryType ?? 'Unknown',
        expiryStatus: this.getExpiryStatus(p.ExpiryDate),
      };
    });
  }

  private getExpiryStatus(dateStr: string): 'Expired' | 'Near Expiry' | 'Valid' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(dateStr);
    expiry.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return 'Expired';
    if (diffDays <= 30) return 'Near Expiry';
    return 'Valid';
  }

  // ===== Filters =====
  onCategoryChange(value: string): void {
    this.selectedCatagoryId = value;
    this.applyFilters();
  }

  onSearchChange(value: string): void {
    this.searchText = value || '';
    this.applyFilters();
  }

  private applyFilters(): void {
    this.dataSource.filter = JSON.stringify({
      catagoryId: this.selectedCatagoryId,
      search: this.searchText,
    });

    // If paginator exists, reset page
    this.paginator?.firstPage();
  }

  get isEmpty(): boolean {
    return !this.isLoading && !this.errorMessage && this.dataSource.filteredData.length === 0;
  }

  // ===== ADD (POST) =====
  resetNewProduct(): void {
    this.newProduct = { catagoryId: '', Name: '', Price: 0, ExpiryDate: '' };
  }

  saveNew(): void {
    if (this.isCreating) return;

    const name = (this.newProduct.Name || '').trim();
    const catId = this.newProduct.catagoryId;
    const expiry = this.newProduct.ExpiryDate;
    const price = Number(this.newProduct.Price);

    if (!catId || !name || !expiry) {
      alert('Please fill all required fields.');
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      alert('Please enter a valid price.');
      return;
    }

    this.isCreating = true;

    const payload: Omit<Product, 'id'> = {
      catagoryId: catId,
      Name: name,
      Price: price,
      ExpiryDate: expiry,
    };

    this.productsService.createProduct(payload).subscribe({
      next: () => {
        this.isCreating = false;
        this.resetNewProduct();
        this.loadAll();
      },
      error: (err) => {
        console.error(err);
        this.isCreating = false;
        alert('Failed to create product.');
      },
    });
  }

  // ===== Inline Edit (PUT) =====
  startEdit(row: ProductRow): void {
    console.log('🖊 edit clicked', row); // quick proof it fires

    this.editingId = String(row.id);

    this.editModel = {
      id: String(row.id) as any,           // keep model consistent
      catagoryId: String(row.catagoryId),
      Name: row.Name,
      Price: Number(row.Price),
      ExpiryDate: row.ExpiryDate
    };
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editModel = {};
    this.isSaving = false;
  }

  saveEdit(): void {
    if (!this.editingId || this.isSaving) return;

    const name = (this.editModel.Name || '').trim();
    const catId = this.editModel.catagoryId || '';
    const expiry = this.editModel.ExpiryDate || '';
    const price = Number(this.editModel.Price);

    if (!catId || !name || !expiry) {
      alert('Please fill all required fields before saving.');
      return;
    }
    if (Number.isNaN(price) || price < 0) {
      alert('Please enter a valid price.');
      return;
    }

    this.isSaving = true;

    const payload: Product = {
      id: this.editingId,
      catagoryId: catId,
      Name: name,
      Price: price,
      ExpiryDate: expiry,
    };

    this.productsService.updateProduct(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.cancelEdit();
        this.loadAll(); // ✅ reload after PUT
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        alert('Failed to update product.');
      },
    });
  }

  // Keep updateRow for quick tests if you still want it
  updateRow(row: ProductRow): void {
    const payload: Product = {
      id: row.id,
      catagoryId: row.catagoryId,
      Name: row.Name,
      Price: Number(row.Price),
      ExpiryDate: row.ExpiryDate,
    };

    this.productsService.updateProduct(payload).subscribe({
      next: () => this.loadAll(),
      error: (err) => {
        console.error(err);
        alert('Failed to update product.');
      },
    });
  }

  // ===== DELETE =====
delete(row: ProductRow): void {
  console.log('Deleting product id =>', row.id);

  const ok = confirm(`Delete "${row.Name}"?`);
  if (!ok) return;

  this.productsService.deleteProduct(String(row.id)).subscribe({
    next: (res) => {
      console.log('DELETE success =>', res);
      this.loadAll();
    },
    error: (err) => {
      console.error('DELETE failed =>', err);
      alert('Failed to delete product.');
    }
  });
}
}