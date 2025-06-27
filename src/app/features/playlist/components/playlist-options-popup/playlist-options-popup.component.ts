import { NgIf } from "@angular/common";
import { Component, EventEmitter, Output, Input } from "@angular/core";
@Component({
  selector: 'app-playlist-options-popup',
  standalone: true,
  templateUrl: './playlist-options-popup.component.html',
  styleUrls: ['./playlist-options-popup.component.css'],
  imports: [NgIf],
})
export class PlaylistOptionsPopupComponent {
  @Input() visible = false;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() addShortcut = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Input() canEdit = false; 
  @Input() isInShortcuts = false;
  @Output() removeShortcut = new EventEmitter<void>();
}

