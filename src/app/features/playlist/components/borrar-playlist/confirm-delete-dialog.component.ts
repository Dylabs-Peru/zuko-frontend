import { NgIf } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  templateUrl: './confirm-delete-dialog.component.html',
  styleUrls: ['./confirm-delete-dialog.component.css'],
  imports: [NgIf]
})
export class ConfirmDeleteDialogComponent {
  @Input() visible = false;
  @Input() message = '¿Seguro que quieres borrar la playlist?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
