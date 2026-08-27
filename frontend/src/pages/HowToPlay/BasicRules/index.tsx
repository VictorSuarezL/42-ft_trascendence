import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';

interface VillainImage {
  id: string;
  path: string;
}

interface VillainListItem {
  id: string;
  name: string;
  images: VillainImage[];
  translation: {
    objective: string;
  };
}

export function BasicRules() {
  const [villains, setVillains] = useState<VillainListItem[]>([]);
  const { language } = useUser();

  const villainLanguage = language === 'es' ? 'es' : 'en';

  useEffect(() => {
    fetch(`/api/villains?lang=${villainLanguage}`)
      .then((response) => response.json())
      .then((data: VillainListItem[]) => {
        setVillains(data);
      });
  }, [villainLanguage]);

  return (
    <main>
      <h1>Cómo jugar</h1>
      <p>Aquí se mostrarán las reglas básicas del juego.</p>
      {villains.map((villain) => {
        const portrait = villain.images.find(
          (image) => image.id === 'portrait',
        );

        return (
          <section key={villain.id}>
            <Link to={`/howtoplay/${villain.id}`}>
              <h2>{villain.name}</h2>
            </Link>

            <p>{villain.translation.objective}</p>

            {portrait && (
              <img
                src={`/api${portrait.path}`}
                alt={`Retrato de ${villain.name}`}
                width="100"
              />
            )}
          </section>
        );
      })}
    </main>
  );
}
