import { useEffect, useState } from 'react';
import { useUser } from '../../../contexts/UserContext';

interface VillainImage {
  id: string;
  path: string;
}

interface VillainGuide {
  name: string;
  language: string;
  images: VillainImage[];
  localized: {
    objective: string;
  };
}

const backendUrl = 'http://localhost:3000';

export function Character({ name }: { name: string }) {
  const [guide, setGuide] = useState<VillainGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useUser();

  const villainLanguage = language === 'es' ? 'es' : 'en';
  useEffect(() => {
    async function loadGuide() {
      try {
        const response = await fetch(
          `${backendUrl}/how-to-play/${encodeURIComponent(name)}` +
            `?lang=${encodeURIComponent(villainLanguage)}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: VillainGuide = await response.json();
        setGuide(data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unknown error',
        );
      }
    }

    loadGuide();
  }, [name, villainLanguage]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!guide) {
    return <p>Cargando...</p>;
  }

  const portrait = guide.images.find((image) => image.id === 'portrait');

  return (
    <main>
      <h1>{guide.name}</h1>

      {portrait && (
        <img
          src={`${backendUrl}${portrait.path}`}
          alt={`Retrato de ${guide.name}`}
          width="300"
        />
      )}

      <h2>{guide.language === 'es' ? 'Objetivo' : 'Objective'}</h2>
      <p>{guide.localized.objective}</p>
    </main>
  );
}
