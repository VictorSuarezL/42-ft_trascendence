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
import { useTranslation } from '../../hooks/useTranslation';
import ActionButton from '../../components/ActionButton';
import actionImage from '../../assets/realmComponents/scar/scar_1Power_button.webp';
import LocationButton, { type LocationAction } from '../../components/LocationButton';
import locationImage from '../../assets/realmComponents/scar/Location_1.webp';
import fateImage from '../../assets/realmComponents/scar/scar_Fate_button.webp';
import playCardImage from '../../assets/realmComponents/scar/scar_PlayCard_button.webp';
import discardImage from '../../assets/realmComponents/scar/scar_Discard_button.webp';
import Location, { type LocationCard } from '../../components/Location';

const testFateCard: LocationCard = {
  id: 'test-fate', name: 'Mufasa', text: 'Carta de prueba para comprobar la cascada superior.',
  strength: 6, type: 'Héroe', typeKey: 'hero', deckType: 'FATE',
  imagePath: '/api/assets/scar/cropped-images/fate/mufasa.webp',
  bottomImage: '/api/assets/scar/cropped-images/scar-power-fate-clean.webp',
};
const testVillainCard: LocationCard = {
  id: 'test-villain', name: 'Banzai', text: 'Carta de prueba para comprobar la cascada inferior.',
  strength: 3, type: 'Aliado', typeKey: 'ally', deckType: 'VILLAIN',
  imagePath: '/api/assets/scar/cropped-images/villain/banzai-the-hyena.webp',
  bottomImage: '/api/assets/scar/cropped-images/scar-power-villain-clean.webp',
};

export function TestingLocationPage() {
  const [fateCount, setFateCount] = useState(2);
  const [villainCount, setVillainCount] = useState(2);
  const [disabled, setDisabled] = useState(false);
  const [lastAction, setLastAction] = useState('Ninguna');
  const [clicks, setClicks] = useState(0);
  const fateCards = Array.from({ length: fateCount }, (_, index) => ({
    ...testFateCard, id: `fate-${index}`, name: `Mufasa ${index + 1}`,
  }));
  const villainCards = Array.from({ length: villainCount }, (_, index) => ({
    ...testVillainCard, id: `villain-${index}`, name: `Banzai ${index + 1}`,
  }));

  return (
    <main className={styles.actionButtonTestPage}>
      <h1>Prueba de Location</h1>
      <p>Las cartas de Fate cubren y desactivan las acciones superiores. Quítalas para habilitarlas.</p>
      <div className={styles.locationTestControls}>
        <label>
          Cartas de Fate: {fateCount}
          <input type="range" min="0" max="5" value={fateCount}
            onChange={(event) => setFateCount(Number(event.target.value))} />
        </label>
        <label>
          Cartas de villano: {villainCount}
          <input type="range" min="0" max="5" value={villainCount}
            onChange={(event) => setVillainCount(Number(event.target.value))} />
        </label>
        <label>
          <input type="checkbox" checked={disabled}
            onChange={(event) => setDisabled(event.target.checked)} />
          Estado inactivo
        </label>
      </div>
      <p role="status">Clics: {clicks} · Última acción: {lastAction}</p>
      <div className={styles.locationButtonPreview}>
        <Location
          imagePath={locationImage}
          label="Localización de prueba de Scar"
          actions={testLocationActions}
          fateCards={fateCards}
          villainCards={villainCards}
          disabled={disabled}
          onAction={(action) => {
            setLastAction(action.label);
            setClicks((count) => count + 1);
          }}
        />
      </div>
    </main>
  );
}

const testLocationActions: LocationAction[] = [
  { area: 'TOP', position: 1, imagePath: actionImage, label: 'Ganar un punto de poder' },
  { area: 'TOP', position: 2, imagePath: fateImage, label: 'Fate' },
  { area: 'BOTTOM', position: 1, imagePath: playCardImage, label: 'Jugar una carta' },
  { area: 'BOTTOM', position: 2, imagePath: discardImage, label: 'Descartar cartas' },
];

export function TestingLocationButtonPage() {
  const [disabled, setDisabled] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [lastAction, setLastAction] = useState('Ninguna');

  return (
    <main className={styles.actionButtonTestPage}>
      <h1>Prueba de LocationButton</h1>
      <p>Pasa el ratón por la localización para ver el brillo y el aumento de tamaño.</p>
      <div className={styles.locationButtonPreview}>
        <LocationButton
          imagePath={locationImage}
          label="Localización de prueba de Scar"
          actions={testLocationActions}
          disabled={disabled}
          onAction={(action) => {
            setLastAction(action.label);
            setClicks((count) => count + 1);
          }}
        />
      </div>
      <label>
        <input
          type="checkbox"
          checked={disabled}
          onChange={(event) => setDisabled(event.target.checked)}
        />
        Estado inactivo
      </label>
      <p role="status">Clics: {clicks} · Última acción: {lastAction}</p>
    </main>
  );
}

export function TestingActionButtonPage() {
  const [disabled, setDisabled] = useState(false);
  const [clicks, setClicks] = useState(0);

  return (
    <main className={styles.actionButtonTestPage}>
      <h1>Prueba de ActionButton</h1>
      <p>Pasa el ratón por encima o usa Tab para ver el halo. Pulsa para contar clics.</p>
      <ActionButton
        imagePath={actionImage}
        label="Ganar un punto de poder"
        disabled={disabled}
        onClick={() => setClicks((count) => count + 1)}
      />
      <label>
        <input
          type="checkbox"
          checked={disabled}
          onChange={(event) => setDisabled(event.target.checked)}
        />
        Estado inactivo
      </label>
      <p role="status">Clics: {clicks}</p>
    </main>
  );
}
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
                {deck.cards.reduce((total, card) => total + card.quantity, 0)}{' '}
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
  const translations = useTranslation(language, 'cardTypes');
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
          <figcaption className={styles.cardCaption}>Composición</figcaption>

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
                  {translations?.cardTypes[card.type] ?? card.type}
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
