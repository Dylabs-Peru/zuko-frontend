import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SongResponse } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class MusicPlayerService {
  // Signals para estado reactivo
  private currentSongSignal = signal<SongResponse | null>(null);
  private isPlayingSignal = signal<boolean>(false);
  private playerRefSignal = signal<any>(null);
  private currentTimeSignal = signal<number>(0);
  private durationSignal = signal<number>(0);

  // Interval para actualizar el tiempo
  private timeUpdateInterval: any;

  // BehaviorSubjects para compatibilidad con código existente
  private currentSongSubject = new BehaviorSubject<SongResponse | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private playerRefSubject = new BehaviorSubject<any>(null);

  // Observables públicos (para compatibilidad)
  currentSong$ = this.currentSongSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  playerRef$ = this.playerRefSubject.asObservable();

  // Signals públicos (nueva API reactiva)
  currentSong = this.currentSongSignal.asReadonly();
  isPlaying = this.isPlayingSignal.asReadonly();
  playerRef = this.playerRefSignal.asReadonly();
  currentTime = this.currentTimeSignal.asReadonly();
  duration = this.durationSignal.asReadonly();

  // Computed signals útiles
  hasCurrentSong = computed(() => this.currentSong() !== null);
  canPlay = computed(() => this.playerRef() !== null);
  
  // Computed signals para tiempo formateado
  currentTimeFormatted = computed(() => this.formatTime(this.currentTime()));
  durationFormatted = computed(() => this.formatTime(this.duration()));
  
  // Progress percentage (0-100)
  progressPercentage = computed(() => {
    const duration = this.duration();
    const current = this.currentTime();
    return duration > 0 ? (current / duration) * 100 : 0;
  });

  // Setters que actualizan tanto signals como subjects
  setCurrentSong(song: SongResponse | null): void {
    console.log('🎵 MusicPlayerService setCurrentSong:', song);
    this.currentSongSignal.set(song);
    this.currentSongSubject.next(song);
  }

  setPlayingState(isPlaying: boolean): void {
    console.log('🎵 MusicPlayerService setPlayingState:', isPlaying);
    this.isPlayingSignal.set(isPlaying);
    this.isPlayingSubject.next(isPlaying);
    
    // Controlar las actualizaciones de tiempo según el estado de reproducción
    if (isPlaying) {
      this.startTimeUpdates();
    } else {
      this.stopTimeUpdates();
    }
  }

  setPlayerRef(playerRef: any): void {
    this.playerRefSignal.set(playerRef);
    this.playerRefSubject.next(playerRef);
    
    // Iniciar la actualización del tiempo cuando se establece el player
    this.startTimeUpdates();
  }

  // Métodos para actualizar tiempo
  private startTimeUpdates(): void {
    this.stopTimeUpdates(); // Detener cualquier intervalo anterior
    
    this.timeUpdateInterval = setInterval(() => {
      const player = this.playerRef();
      if (player && player.getCurrentTime && player.getDuration) {
        try {
          const currentTime = player.getCurrentTime() || 0;
          const duration = player.getDuration() || 0;
          
          this.currentTimeSignal.set(currentTime);
          this.durationSignal.set(duration);
        } catch (error) {
          console.warn('Error obteniendo tiempo del player:', error);
        }
      }
    }, 1000); // Actualizar cada segundo
  }

  private stopTimeUpdates(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  // Método para formatear tiempo en mm:ss
  private formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Método para hacer seek (saltar a un tiempo específico)
  seekTo(seconds: number): void {
    const player = this.playerRef();
    if (player && player.seekTo) {
      player.seekTo(seconds);
      this.currentTimeSignal.set(seconds);
    }
  }

  // Métodos de control
  togglePlay(): void {
    const player = this.playerRef();
    if (!player) return;

    if (this.isPlaying()) {
      player.pauseVideo();
      this.setPlayingState(false);
    } else {
      player.playVideo();
      this.setPlayingState(true);
    }
  }

  restartSong(): void {
    const player = this.playerRef();
    if (player && player.seekTo) {
      player.seekTo(0);
      this.currentTimeSignal.set(0);
      if (!this.isPlaying()) {
        player.playVideo();
        this.setPlayingState(true);
      }
    }
  }

  // Cleanup method para detener intervalos
  destroy(): void {
    this.stopTimeUpdates();
  }
}
