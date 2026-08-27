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


import { useNavigate } from 'react-router-dom';
import styles from './Character.module.scss';
import scarMain from '../../../assets/ScarMain.webp';

export function ComoJugar() {
  const navigate = useNavigate();
  return (
    <main className={styles.villainPage}>
      <section
        className={styles.villain}
        style={{ backgroundImage: `url(${scarMain})` }}
      >
        <div className={styles.villainContent}>
          <div className={styles.villainInfo}>
            <button
              onClick={() => navigate('/home')}
              className={styles.customButton}
            >
              BACK TO HOME
            </button>

            <h1>SCAR</h1>

            <p className={styles.subtitle}>
              "Larga vida al rey"
            </p>

          </div>

          <div className={styles.objective}>
            <h2>♛ YOUR OBJECTIVE</h2>

            <p>
              Be the first Villain to have control of 4 Regions at the end of
              your turn.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.realm}>
        <header className={styles.realmHeader}>
          <span className={styles.icon}>✦</span>

          <div>
            <h2>THE REALM</h2>
            <p>The realm is divided into 4 locations.</p>
            <span>From left to right:</span>
          </div>
        </header>

        <div className={styles.realmContent}>{/* Aquí irá el tablero */}</div>
      </section>
    </main>
  );
}
