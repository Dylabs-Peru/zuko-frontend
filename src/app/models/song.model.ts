export interface SongRequest {
  title: string;
  isPublicSong: boolean;
  artistId?: number; // Solo para admin
}

export interface SongResponse {
  id: number;
  title: string;
  isPublicSong: boolean;
  releaseDate: string;
  message: string;
  artistId: number;
  artistName: string;
}