import { useEffect, useState } from 'react';
import type { TranslationData } from '../types/types';

export type Language = 'en' | 'es';

async function fetchTranslationData(code: Language): Promise<TranslationData> {
  const response = await fetch(`/api/translations/${code}`);

  if (!response.ok) {
    throw new Error('Error fetching translations');
  }

  return response.json();
}

export function useTranslation(code: Language) {
  const [data, setData] = useState<TranslationData | null>(null);

  useEffect(() => {
    fetchTranslationData(code)
      .then(setData)
      .catch((error) => {
        console.error(error);
        setData(null);
      });
  }, [code]);

  return data;
}
