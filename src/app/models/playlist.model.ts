import { SongResponse } from './song.model';
export interface PlaylistResponse {
    playlistId: number;
    name: string;
    description: string;
    isPublic: boolean;
    createdAt: string;
    songs: SongResponse[];
    url_image?: string;
    userID: number;
}

export interface PlaylistRequest {
    name: string;
    description?: string;
    isPublic?: boolean;
    url_image?: string;
}

export interface UpdatePlaylistRequest {
    name ?: string;
    description ?: string;
    isPublic ?: boolean;
    url_image ?: string;
}

export interface PlaylistSummaryResponse {
    playlistId: number;
    name: string;
    url_image?: string;
    owner: string;
}