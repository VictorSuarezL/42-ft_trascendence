export interface Villain {
  id: string;
  name: string;
  images: VillainImage[];
  translations: Record<string, VillainTranslation>;
}

export interface VillainResponse {
  id: string;
  name: string;
  images: VillainImage[];
  translation: VillainTranslation;
}

export interface VillainImage {
  id: string;
  path: string;
  width: number;
  height: number;
  mimeType: string;
  sourcePage: string;
  sourceUrl: string;
}

export interface VillainTranslation {
  objective: string;
}

export interface VillainModelContract {
  getAll(): Promise<Villain[]>;
  getById(id: string): Promise<Villain | null>;
}