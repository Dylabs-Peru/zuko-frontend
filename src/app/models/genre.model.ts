export interface GenreResponse {
  id: number;
  name: string;
  description?: string;
}

export interface GenreRequest {
  name: string;
  description?: string;
}