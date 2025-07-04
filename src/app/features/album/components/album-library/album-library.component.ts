import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AlbumService } from '../../../../services/Album.service';
import { AlbumResponse } from '../../../../models/album.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-album-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './album-library.component.html',
  styleUrls: ['./album-library.component.css']
})
@Component({
  selector: 'app-album-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: '',
  styleUrls: ['./album-library.component.css']
})
export class AlbumLibraryComponent {}
