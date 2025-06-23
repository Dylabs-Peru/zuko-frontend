import { SongResponse } from './song.model';
export interface PlaylistResponse {
    playlistId: number;
    name: string;
    description: string;
    isPublic: boolean;
    createdAt: string;
    songs: SongResponse[];
    url_image?: string;
}

export interface PlaylistRequest {
    name: string;
    description?: string;
    isPublic?: boolean;
    url_image?: string;
}