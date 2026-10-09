import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { useTranslation } from '../../../hooks/useTranslation';

interface VillainImage {
  id: string;
  path: string;
}

interface VillainListItem {
  id: string;
  name: string;
  images: VillainImage[];
  objective: string;
}

export function BasicRules() {
  const [villains, setVillains] = useState<VillainListItem[]>([]);
  const { language } = useUser();

  const translations = useTranslation(language, 'howToPage');

  useEffect(() => {
    fetch(`/api/villains?lang=${language}`)
      .then((response) => response.json())
      .then((data: VillainListItem[]) => {
        setVillains(data);
      });
  }, [language]);

  if (!translations) {
    return <p>...</p>;
  }

  return (
    <main>
      <h1>{translations.howToPage.title}</h1>
      <p>{translations.howToPage.basicRulesDescription}</p>
      {villains.map((villain) => {
        const portrait = villain.images.find(
          (image) => image.id === 'portrait',
        );

        return (
          <section key={villain.id}>
            <Link to={`/howtoplay/${villain.id}`}>
              <h2>{villain.name}</h2>
            </Link>

            <p>{villain.objective}</p>

            {portrait && (
              <img
                src={`/api${portrait.path}`}
                alt={translations.howToPage.portrait.replace(
                  '{name}',
                  villain.name,
                )}
                width="100"
              />
            )}
          </section>
        );
      })}
    </main>
  );
}
