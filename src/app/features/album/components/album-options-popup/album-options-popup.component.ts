import { NgIf } from "@angular/common";
import { Component, EventEmitter, Output, Input } from "@angular/core";

@Component({
  selector: 'app-album-options-popup',
  standalone: true,
  templateUrl: './album-options-popup.component.html',
  styleUrls: ['./album-options-popup.component.css'],
  imports: [NgIf],
})
export class AlbumOptionsPopupComponent {
  @Input() visible = false;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() addShortcut = new EventEmitter<void>();
  @Output() removeShortcut = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  
  @Input() canEdit = false;
  @Input() isInShortcuts = false;

  @Input() editText: string = 'Editar Álbum';
  @Input() deleteText: string = 'Eliminar Álbum';
  @Input() addShortcutText: string = 'Añadir a acceso directo';
  @Input() removeShortcutText: string = 'Eliminar de acceso directo';
}
