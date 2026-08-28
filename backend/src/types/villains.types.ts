export interface RealmAction {
  area: 'TOP' | 'BOTTOM';
  position: number;
  type: string;
  amount: number | null;
}

export interface RealmLocationTranslation {
  name: string;
}

export interface RealmLocation {
  id: string;
  name: string;
  position: number;
  actions: RealmAction[];
}

export interface Villain {
  id: string;
  name: string;
  images: VillainImage[];
  objective: string;
}

export interface VillainDetail extends Villain {
  realm: RealmLocation[];
}

export interface VillainImage {
  id: string;
  path: string;
  width: number;
  height: number;
  mimeType: string;
  sourcePage: string | null;
  sourceUrl: string | null;
}

export interface VillainModelContract {
  getAll(language: string): Promise<Villain[]>;
  getById(id: string, language: string): Promise<VillainDetail | null>;
}
