// Modelos alineados a los DTOs del backend para álbumes

// Representa la petición para crear o editar un álbum
export interface AlbumRequest {
  title: string;
  releaseYear: number;
  cover?: string; // Puede ser opcional
  artistId: number;
  genreId: number;
  songs: SongRequest[] | { title: string }[];
}

// Representa la respuesta de un álbum recibido del backend
export interface AlbumResponse {
  id: number;
  title: string;
  releaseYear: number;
  cover?: string;
  artistId: number;
  artistName: string;
  genreName: string;
  songs: AlbumSongSummaryResponse[];
}

// Resumen de canción dentro de un álbum
export interface AlbumSongSummaryResponse {
  id: number;
  title: string;
  releaseDate: string;
  youtubeUrl: string;
}

// Opcional: Modelo para una canción en la petición (basado en SongRequest)
export interface SongRequest {
  title: string;
  isPublicSong: boolean;
  artistId: number;
}
