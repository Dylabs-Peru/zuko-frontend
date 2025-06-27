import { AlbumResponse } from "./album.model";
import { PlaylistSummaryResponse } from "./playlist.model";

export interface AddPlaylistToShortcutsRequest {
    playlistId: number 
}

export interface ShortcutsResponse {
    ShortcutsId: number;
    Playlists : PlaylistSummaryResponse[];
    // cambiar por un album summary response o como lo manejes en el backend
    Albums: AlbumResponse[];
}