import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useUser } from '../../contexts/UserContext';
import { useParams } from 'react-router-dom';
import type {
  CardDetail,
  VillainDetail,
} from '../../../../backend/src/types/villains.types.ts';
import styles from './TestPage.module.scss';
// interface VillainImage {
//   id: string;
//   path: string;
// }

// interface VillainGuide {
//   name: string;
//   images: VillainImage[];
//   objective: string;
// }

const backendUrl = '/api';

interface AutoFitTextProps {
  children: ReactNode;
  className?: string;
}

function AutoFitText({ children, className }: AutoFitTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const element = textRef.current;

    if (!element) {
      return;
    }

    let fontSize = 29;
    const minimumFontSize = 8;

    element.style.fontSize = `${fontSize}px`;

    while (
      (element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth) &&
      fontSize > minimumFontSize
    ) {
      fontSize -= 0.5;
      element.style.fontSize = `${fontSize}px`;
    }
  }, [children]);

  return (
    <p ref={textRef} className={className} data-card-part="text">
      {children}
    </p>
  );
}

export function TestingVillainPage() {
  const { villain } = useParams<{ villain: string }>();
  const [guide, setGuide] = useState<VillainDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { language } = useUser();

  useEffect(() => {
    async function loadGuide() {
      if (!villain) {
        return;
      }
      try {
        const response = await fetch(
          `${backendUrl}/villains/${encodeURIComponent(villain)}` +
            `?lang=${encodeURIComponent(language)}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: VillainDetail = await response.json();
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
  }, [villain, language]);

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!guide) {
    return <p>Cargando...</p>;
  }

  const portrait = guide.images.find((image) => image.id === 'portrait');
  const orderedRealm = [...guide.realm].sort(
    (firstLocation, secondLocation) =>
      firstLocation.position - secondLocation.position,
  );

  return (
    <main className={styles.villainTestPage}>
      <header className={styles.villainHeader}>
        {portrait && (
          <img
            className={styles.villainPortrait}
            src={`${backendUrl}${portrait.path}`}
            alt={`Retrato de ${guide.name}`}
          />
        )}

        <div>
          <h1>{guide.name}</h1>
          <p>
            <strong>ID:</strong> {guide.id}
          </p>
          <h2>{language === 'es' ? 'Objetivo' : 'Objective'}</h2>
          <p>{guide.objective}</p>
        </div>
      </header>

      <section>
        <h2>Imágenes ({guide.images.length})</h2>

        <div className={styles.villainImageGrid}>
          {guide.images.map((image) => (
            <figure className={styles.villainImageFigure} key={image.id}>
              <img
                src={`${backendUrl}${image.path}`}
                alt={`${guide.name}: ${image.id}`}
              />
              <figcaption>{image.id}</figcaption>
              <small>
                {image.width} × {image.height}
              </small>
            </figure>
          ))}
        </div>
      </section>

      <section>
        <h2>Reino ({orderedRealm.length} localizaciones)</h2>

        <div className={styles.realmGrid}>
          {orderedRealm.map((location) => (
            <article className={styles.testPanel} key={location.id}>
              <h3>
                {location.position}. {location.name}
              </h3>
              <p>ID: {location.id}</p>

              <ul>
                {location.actions.map((action) => (
                  <li key={`${action.area}-${action.position}`}>
                    {action.area} · {action.position} · {action.type}
                    {action.amount !== null && ` (${action.amount})`}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Mazos ({guide.decks.length})</h2>

        <div className={styles.deckGrid}>
          {guide.decks.map((deck) => (
            <article className={styles.testPanel} key={deck.type}>
              <h3>{deck.type}</h3>
              <p>
                {deck.cards.reduce(
                  (total, card) => total + card.quantity,
                  0,
                )}{' '}
                cartas · {deck.cards.length} cartas diferentes
              </p>

              <div className={styles.deckImages}>
                <img
                  src={`${backendUrl}${deck.backImagePath}`}
                  alt={`Reverso del mazo ${deck.type}`}
                />
                <img
                  src={`${backendUrl}${deck.bottomPowerImagePath}`}
                  alt={`Panel con fuerza del mazo ${deck.type}`}
                />
                <img
                  src={`${backendUrl}${deck.bottomPowerlessImagePath}`}
                  alt={`Panel sin fuerza del mazo ${deck.type}`}
                />
              </div>

              <ul className={styles.cardList}>
                {deck.cards.map((card) => (
                  <li key={card.id}>
                    <strong>{card.name}</strong> ({card.id}) · {card.type} · ×
                    {card.quantity}
                    {card.cost !== null && ` · coste ${card.cost}`}
                    {card.strength !== null && ` · fuerza ${card.strength}`}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function TestingCardPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useUser();

  const [card, setCard] = useState<CardDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCard() {
      if (!id) {
        return;
      }

      try {
        const response = await fetch(
          `${backendUrl}/cards/${encodeURIComponent(id)}` +
            `?lang=${encodeURIComponent(language)}`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: CardDetail = await response.json();
        setCard(data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unknown error',
        );
      }
    }

    loadCard();
  }, [id, language]);

  if (!id) {
    return <p>No se ha indicado ninguna carta.</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!card) {
    return <p>Cargando...</p>;
  }

  const bottomImagePath =
    card.strength !== null
      ? card.deck.bottomPowerImagePath
      : card.deck.bottomPowerlessImagePath;

  const originalCardPath =
    `${backendUrl}/assets/${encodeURIComponent(card.villainId)}` +
    `/cards/${card.deck.type.toLowerCase()}/${encodeURIComponent(card.id)}.webp`;

  return (
    <main>
      <h1>Prueba de composición de carta</h1>

      <div className={styles.examples}>
        <figure className={styles.cardFigure}>
          <figcaption className={styles.cardCaption}>Original</figcaption>

          <img
            className={styles.originalCard}
            src={originalCardPath}
            alt={`Carta original de ${card.name}`}
          />
        </figure>

        <figure className={styles.cardFigure}>
          <figcaption className={styles.cardCaption}>
            Composición
          </figcaption>

          <div className={styles.cardPreview}>
            <div className={styles.cardTop}>
              <img
                src={`${backendUrl}${card.imagePath}`}
                alt={`Ilustración de ${card.name}`}
              />
            </div>

            <div className={styles.cardBottomContainer}>
              <img
                className={styles.cardBottom}
                src={`${backendUrl}${bottomImagePath}`}
                alt=""
              />

              <div className={styles.cardContent}>
                <h2 className={styles.cardName} data-card-part="name">
                  {card.name}
                </h2>

                <AutoFitText className={styles.cardText} data-card-part="text">
                  {card.text}
                </AutoFitText>

                <span className={styles.cardType} data-card-part="type">
                  {card.type}
                </span>

                {card.strength !== null && (
                  <strong
                    className={styles.cardStrength}
                    data-card-part="strength"
                  >
                    {card.strength}
                  </strong>
                )}
              </div>
            </div>
          </div>
        </figure>
      </div>
    </main>
  );
}
