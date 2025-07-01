import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SongResponse } from '../models/song.model';

@Injectable({
  providedIn: 'root'
})
export class MusicPlayerService {
  private currentSongSubject = new BehaviorSubject<SongResponse | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private playerRefSubject = new BehaviorSubject<any>(null);

  // Observables públicos
  currentSong$ = this.currentSongSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  playerRef$ = this.playerRefSubject.asObservable();

  // Getters
  get currentSong(): SongResponse | null {
    return this.currentSongSubject.value;
  }

  get isPlaying(): boolean {
    return this.isPlayingSubject.value;
  }

  get playerRef(): any {
    return this.playerRefSubject.value;
  }

  // Setters
  setCurrentSong(song: SongResponse | null): void {
    console.log('🎵 MusicPlayerService setCurrentSong:', song);
    this.currentSongSubject.next(song);
  }

  setPlayingState(isPlaying: boolean): void {
    console.log('🎵 MusicPlayerService setPlayingState:', isPlaying);
    this.isPlayingSubject.next(isPlaying);
  }

  setPlayerRef(playerRef: any): void {
    this.playerRefSubject.next(playerRef);
  }

  // Métodos de control
  togglePlay(): void {
    const player = this.playerRef;
    if (!player) return;

    if (this.isPlaying) {
      player.pauseVideo();
      this.setPlayingState(false);
    } else {
      player.playVideo();
      this.setPlayingState(true);
    }
  }

  restartSong(): void {
    const player = this.playerRef;
    if (player && player.seekTo) {
      player.seekTo(0);
      if (!this.isPlaying) {
        player.playVideo();
        this.setPlayingState(true);
      }
    }
  }
}
