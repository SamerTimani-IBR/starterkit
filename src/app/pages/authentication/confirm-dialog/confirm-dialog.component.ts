import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <mat-dialog-content class="content">
      <p>{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="close(false)">{{ data.cancelText || 'Cancel' }}</button>
      <button mat-raised-button color="primary" (click)="close(true)">{{ data.okText || 'Confirm' }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .content { padding-top: 6px; min-width: 320px; }
    p { margin: 0; color: rgba(0,0,0,.72); }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    private ref: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      okText?: string;
      cancelText?: string;
    }
  ) {}

  close(result: boolean) {
    this.ref.close(result);
  }
}