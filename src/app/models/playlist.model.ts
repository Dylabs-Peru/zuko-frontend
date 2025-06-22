import { SongResponse } from './song.model';
export interface PlaylistResponse {
    playlistId: number;
    name: string;
    description: string;
    isPublic: boolean;
    createdAt: string;
    songs: SongResponse[];
}

export interface PlaylistRequest {
    name: string;
    description?: string;
    isPublic?: boolean;
}