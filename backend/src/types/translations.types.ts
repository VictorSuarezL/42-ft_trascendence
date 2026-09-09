export interface Translation {
  key: string;
  value: string;
}

export interface TranslationModelContract {
  getByLanguage(language: string): Promise<Translation[]>;
  getByNamespace(namespace: string, language: string): Promise<Translation[]>;
}
