export interface Translation {
  key: string;
  value: string;
}

export interface TranslationModelContract {
  getByLanguage(language: string): Promise<Translation[]>;
}
