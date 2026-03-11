import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ConfirmDialogComponent } from '../authentication/confirm-dialog/confirm-dialog.component';
import { CatagoriesService } from 'src/app/services/catagories.service';

export interface Catagory {
  id: string;
  name: string;
  catagoryType: string;
  isActive: boolean;
}

@Component({
  selector: 'app-catagory',
  templateUrl: './catagory.component.html',
  styleUrls: ['./catagory.component.css'],
})
export class CatagoryComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'catagoryType', 'status'];
  dataSource = new MatTableDataSource<Catagory>([]);

  isLoading = true;
  errorMessage = '';
  showActiveOnly = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private crudService: CatagoriesService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadCatagories();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  isCreating = false;

  newCatagory: Omit<Catagory, 'id'> = {
    name: '',
    catagoryType: '',
    isActive: true
  };

  resetNewCatagory(): void {
    this.newCatagory = { name: '', catagoryType: '', isActive: true };
  }

  saveNew(): void {
    if (this.isCreating) return;

    const name = (this.newCatagory.name || '').trim();
    const type = (this.newCatagory.catagoryType || '').trim();

    if (!name || !type) {
      alert('Please fill Name and Type.');
      return;
    }

    this.isCreating = true;

    const payload: Omit<Catagory, 'id'> = {
      name,
      catagoryType: type,
      isActive: !!this.newCatagory.isActive
    };

    this.crudService.AddCatagory(payload).subscribe({
      next: () => {
        this.isCreating = false;
        this.resetNewCatagory();
        this.loadCatagories(); // ✅ reload table after POST
      },
      error: (err) => {
        console.error(err);
        this.isCreating = false;
        alert('Failed to create category.');
      }
    });
  }

  loadCatagories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.crudService.getAllCatagories().subscribe({
      next: (data: Catagory[]) => {
        // Keep original data safe for filtering
        const list = Array.isArray(data) ? data : [];

        // Apply active filter if enabled
        const filtered = this.showActiveOnly
          ? list.filter((x) => x.isActive === true)
          : list;

        this.dataSource.data = filtered;

        // reset paginator
        if (this.paginator) this.paginator.firstPage();

        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Failed to load categories. Please try again.';
        this.dataSource.data = [];
      },
    });
  }

  StatusChange(row: Catagory, event: MatSlideToggleChange): void {
    const newStatus = event.checked;
    const previous = row.isActive;

    // Optimistically reflect toggle (user sees the click)
    row.isActive = newStatus;
    this.dataSource._updateChangeSubscription();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Confirm Status Change',
        message: `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} "${row.name}"?`,
        okText: 'Yes, Confirm',
        cancelText: 'No'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        // Revert UI if cancelled
        row.isActive = previous;
        this.dataSource._updateChangeSubscription();
        return;
      }

      // Full payload
      const payload: Catagory = {
        id: row.id,
        name: row.name,
        catagoryType: row.catagoryType,
        isActive: newStatus
      };

      this.crudService.updateCatagory(payload).subscribe({
        next: () => {
          // ✅ Reload table after successful update
          this.loadCatagories();
        },
        error: (err) => {
          console.error(err);

          // revert on failure
          row.isActive = previous;
          this.dataSource._updateChangeSubscription();

          alert('Failed to update status. Please try again.');
        }
      });
    });
  }

  toggleActiveOnly(): void {
    this.showActiveOnly = !this.showActiveOnly;
    this.loadCatagories(); // simplest approach for exam (refetch + filter)
    // If you want no-refetch, tell me and I’ll switch to local filtering.
  }

  get isEmpty(): boolean {
    return !this.isLoading && !this.errorMessage && this.dataSource.data.length === 0;
  }
}