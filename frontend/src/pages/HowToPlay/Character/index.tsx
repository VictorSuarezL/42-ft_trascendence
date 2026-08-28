import { useEffect, useState } from 'react';
import { useUser } from '../../../contexts/UserContext';

interface VillainImage {
  id: string;
  path: string;
}

interface VillainGuide {
  name: string;
  images: VillainImage[];
  objective: string;
}

const backendUrl = '/api';

export function Character({ name }: { name: string }) {
  const [guide, setGuide] = useState<VillainGuide | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useUser();

  useEffect(() => {
    async function loadGuide() {
      try {
        const response = await fetch(
          `${backendUrl}/villains/${encodeURIComponent(name)}` +
            `?lang=${encodeURIComponent(language)}`,
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
  }, [name, language]);

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

      <h2>{language === 'es' ? 'Objetivo' : 'Objective'}</h2>
      <p>{guide.objective}</p>
    </main>
  );
}
