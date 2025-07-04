import { AlbumResponse } from "./album.model";
import { PlaylistSummaryResponse } from "./playlist.model";

export interface AddPlaylistToShortcutsRequest {
    playlistId: number;
}

export interface AddAlbumToShortcutsRequest {
    albumId: number;
}

export interface AlbumSummaryResponse {
    id: number;
    title: string;
    cover: string;
    artistName: string;
    releaseDate?: string;
}

export interface ShortcutsResponse {
    ShortcutsId: number;
    Playlists: PlaylistSummaryResponse[];
    Albums: AlbumSummaryResponse[];
}