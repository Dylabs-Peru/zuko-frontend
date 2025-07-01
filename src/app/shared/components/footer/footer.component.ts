import { Component, OnInit, OnDestroy } from '@angular/core';
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
  currentSong: SongResponse | null = null;
  isPlaying = false;
  currentTime = '00:00';
  durationText = '00:00';
  currentTimeSeconds = 0;
  duration = 0;

  private subscriptions: Subscription[] = [];

  constructor(private musicPlayerService: MusicPlayerService) {}

  ngOnInit(): void {
    console.log('🎵 Footer inicializado');
    
    // Suscribirse a los cambios del servicio
    this.subscriptions.push(
      this.musicPlayerService.currentSong$.subscribe((song: SongResponse | null) => {
        console.log('🎵 Footer recibió canción:', song);
        this.currentSong = song;
      })
    );

    this.subscriptions.push(
      this.musicPlayerService.isPlaying$.subscribe((isPlaying: boolean) => {
        console.log('🎵 Footer recibió estado playing:', isPlaying);
        this.isPlaying = isPlaying;
      })
    );
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
    
    const player = this.musicPlayerService.playerRef;
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
