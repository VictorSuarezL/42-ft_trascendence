import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface VillainImage {
  id: string;
  label: string;
  path: string;
}

interface VillainGuide {
  name: string;
  language: string;
  objective: {
    summary: string;
  };
  images: VillainImage[];
}

const backendUrl = 'http://localhost:3000';

export function ComoJugar() {
  const { villain } = useParams<{ villain: string }>();
  const [guide, setGuide] = useState<VillainGuide | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuide() {
      if (!villain) {
        return;
      }

      try {
        const response = await fetch(
          `${backendUrl}/how-to-play/${encodeURIComponent(villain)}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: VillainGuide = await response.json();
        setGuide(data);
      } catch (requestError) {
        setError(
          requestError instanceof Error ? requestError.message : 'Unknown error',
        );
      }
    }

    loadGuide();
  }, [villain]);

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
          alt={portrait.label}
          width="300"
        />
      )}

      <h2>Objetivo</h2>
      <p>{guide.objective.summary}</p>
    </main>
  );
}
