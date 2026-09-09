import { useEffect, useState } from 'react';
import type { TranslationData } from '../types/types';

export type Language = 'en' | 'es';

async function fetchTranslationData(code: Language, namespace: string): Promise<TranslationData> {
  const response = await fetch(
    `/api/translations/${code}?namespace=${encodeURIComponent(namespace)}`,
  );

  if (!response.ok) {
    throw new Error('Error fetching translations');
  }

  return response.json();
}

export function useTranslation(code: Language, namespace: string) {
  const [data, setData] = useState<TranslationData | null>(null);

  useEffect(() => {
    fetchTranslationData(code, namespace)
      .then(setData)
      .catch((error) => {
        console.error(error);
        setData(null);
      });
  }, [code, namespace]);

  return data;
}
