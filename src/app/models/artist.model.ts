export interface CreateArtistRequest {
    name: string;
    country: string;
    biography: string;
    urlImage?: string;
  }

  export interface UpdateArtistRequest {
    name?: string;
    country?: string;
    biography?: string;
    urlImage?: string;
  }

  export interface ArtistResponse {
    id: number;
    name: string;
    country: string;
    biography: string;
    userId: number;
    isActive: boolean;
    urlImage?: string;
    user?: {
        email: string;
        url_image?: string;
        // otras propiedades del usuario
      };
      albums?: any[]; // Ajusta según tu modelo
      songs?: any[]; 
  }