import { Component, OnInit, OnDestroy, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicPlayerService } from '../../../services/music-player.service';
import { SongResponse } from '../../../models/song.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {
  // Ya no necesitamos estas propiedades locales
  private subscriptions: Subscription[] = [];

  constructor(private musicPlayerService: MusicPlayerService) {
    // Effect para debug/logging cuando cambian los signals
    effect(() => {
      console.log('🎵 Footer - Signal currentSong:', this.musicPlayerService.currentSong());
      console.log('🎵 Footer - Signal isPlaying:', this.musicPlayerService.isPlaying());
      console.log('🎵 Footer - Current time:', this.musicPlayerService.currentTimeFormatted());
      console.log('🎵 Footer - Duration:', this.musicPlayerService.durationFormatted());
    });
  }

  // Getters para acceder a los signals en el template
  get currentSong() {
    return this.musicPlayerService.currentSong();
  }

  get isPlaying() {
    return this.musicPlayerService.isPlaying();
  }

  get currentTime() {
    return this.musicPlayerService.currentTimeFormatted();
  }

  get durationText() {
    return this.musicPlayerService.durationFormatted();
  }

  get currentTimeSeconds() {
    return this.musicPlayerService.currentTime();
  }

  get duration() {
    return this.musicPlayerService.duration();
  }

  ngOnInit(): void {
    console.log('🎵 Footer inicializado');
    // Ya no necesitamos suscripciones para signals, pero mantenemos para compatibilidad si es necesario
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // El servicio manejará su propio cleanup
  }

  togglePlay(): void {
    this.musicPlayerService.togglePlay();
  }

  restartSong(): void {
    this.musicPlayerService.restartSong();
  }

  onSeek(event: Event): void {
    const target = event.target as HTMLInputElement;
    const seekTime = parseInt(target.value, 10);
    
    console.log('🎯 Seeking to:', seekTime, 'seconds');
    this.musicPlayerService.seekTo(seekTime);
  }
}
