export interface ReleaseItem {
  id: number;
  title: string;
  type: 'song' | 'album';
  artistName: string;
  imageUrl: string;
  youtubeUrl: string | null;
  releaseDate: string;
  isPublicSong?: boolean;
  cover?: string;
  songs?: Array<{
    id: number;
    title: string;
    releaseDate: string;
    youtubeUrl: string | null;
  }>;
}
