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
  currentTime = '00:00';
  durationText = '00:00';
  currentTimeSeconds = 0;
  duration = 0;

  private subscriptions: Subscription[] = [];

  constructor(private musicPlayerService: MusicPlayerService) {
    // Effect para debug/logging cuando cambian los signals
    effect(() => {
      console.log('🎵 Footer - Signal currentSong:', this.musicPlayerService.currentSong());
      console.log('🎵 Footer - Signal isPlaying:', this.musicPlayerService.isPlaying());
    });
  }

  // Getters para acceder a los signals en el template
  get currentSong() {
    return this.musicPlayerService.currentSong();
  }

  get isPlaying() {
    return this.musicPlayerService.isPlaying();
  }

  ngOnInit(): void {
    console.log('🎵 Footer inicializado');
    // Ya no necesitamos suscripciones para signals, pero mantenemos para compatibilidad si es necesario
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
    
    const player = this.musicPlayerService.playerRef();
    if (player && player.seekTo) {
      player.seekTo(seekTime);
    }
  }

  // Helper para formatear tiempo
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
