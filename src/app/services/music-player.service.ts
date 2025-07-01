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

  // Computed signals útiles
  hasCurrentSong = computed(() => this.currentSong() !== null);
  canPlay = computed(() => this.playerRef() !== null);

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
  }

  setPlayerRef(playerRef: any): void {
    this.playerRefSignal.set(playerRef);
    this.playerRefSubject.next(playerRef);
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
      if (!this.isPlaying()) {
        player.playVideo();
        this.setPlayingState(true);
      }
    }
  }
}
