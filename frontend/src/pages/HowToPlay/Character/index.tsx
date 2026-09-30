import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { useTranslation } from '../../../hooks/useTranslation';
import styles from './Character.module.scss';
import Card from '../../../components/Card';

interface VillainImage {
  id: string;
  path: string;
}

interface ActionLocation {
  position: number;
  area: string;
  type: string;
  amount: number;
}

interface RealmLocation {
  id: string;
  name: string;
  position: number;
  actions: ActionLocation[];
}

interface cardData {
  id: string;
  quantity: number;
  type: string;
  cost: number;
  strength: number;
  imagePath: string;
  name: string;
  text: string;
}

interface deckTypes {
  type: string;
  backImagePath: string;
  bottomPowerImagePath: string;
  bottomPowerlessImagePath: string;
  cards: cardData[];
}

interface VillainGuide {
  name: string;
  images: VillainImage[];
  objective: string;
  realm: RealmLocation[];
  decks: deckTypes[];
}

const backendUrl = '/api';

interface CharacterProps {
  name: string;
}

export function Character({ name }: CharacterProps) {
  const navigate = useNavigate();

  const { language } = useUser();

  const translations = useTranslation(
    language,
    'howToPage,cardTypes,decks,actions',
  );

  const [guide, setGuide] = useState<VillainGuide | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGuide() {
      try {
        setError(null);

        const response = await fetch(
          `${backendUrl}/villains/${encodeURIComponent(name)}?lang=${encodeURIComponent(language)}`,
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
    return <p className={styles.error}>Error: {error}</p>;
  }

  if (!guide || !translations) {
    return <p className={styles.loading}>Cargando...</p>;
  }

  const fileName = `${name}Main.webp`;

  const villainImage = new URL(`../../../assets/${fileName}`, import.meta.url)
    .href;

  const realmImage = guide.images.find((image) => image.id === 'realm');

  const cardTypeOrder = [
    'EFFECT',
    'ALLY',
    'HERO',
    'ITEM',
    'CONDITION',
    'TITAN',
    'CURSE',
  ];

  const translateAction = (action: ActionLocation): string => {
    const translation = translations.actions[action.type];

    if (!translation) {
      return action.type;
    }

    return translation.replace('{amount}', String(action.amount));
  };

  return (
    <main className={`${styles.villainPage} ${styles[`${name}Theme`]}`}>
      {/* =========================
          VILLAIN
      ========================= */}

      <section
        className={styles.villain}
        style={{
          backgroundImage: `url(${villainImage})`,
        }}
      >
        <div className={styles.villainContent}>
          <div className={styles.villainInfo}>
            <button
              onClick={() => navigate('/home')}
              className={styles.customButton}
            >
              {language === 'es' ? 'PÁGINA PRINCIPAL' : 'BACK TO HOME'}
            </button>

            <h1 className={styles.villainName}>{guide.name}</h1>

            <p className={styles.subtitle}>
              {translations.howToPage[`${name}Subtitle`]}
            </p>
          </div>

          <div className={styles.objectiveGuide}>
            <div className={styles.objective}>
              <h2 className={styles.objectiveTitle}>
                ♛ {language === 'es' ? 'Objetivo' : 'Objective'}
              </h2>

              <p>{guide.objective}</p>
            </div>

            <div className={styles.villainGuide}>
              <p className={styles.villainGuideText}>
                {translations.howToPage[`${name}Guide`]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          REALM
      ========================= */}

      <section className={styles.realmSection}>
        {/* =========================
            SECTION TITLE
        ========================= */}

        <header className={styles.sectionTitle}>
          <div className={styles.compass}>✦</div>

          <div>
            <h2 className={styles.realmTitle}>
              {language === 'es' ? 'EL REINO' : 'THE REALM'}
            </h2>

            <p>
              {language === 'es'
                ? `El reino está dividido en ${guide.realm.length} localizaciones.`
                : `The realm is divided into ${guide.realm.length} locations.`}
            </p>

            <p>
              {language === 'es'
                ? 'De izquierda a derecha:'
                : 'From left to right:'}
            </p>
          </div>
        </header>

        {/* =========================
            LOCATIONS
        ========================= */}

        <div className={styles.locations}>
          {guide.realm.map((location) => (
            <div className={styles.location} key={location.id}>
              {/* NUMBER */}

              <div className={styles.locationNumber}>
                <span>{location.position}</span>
              </div>

              {/* NAME */}

              <div className={styles.locationName}>
                <h3>{location.name}</h3>
              </div>

              {/* ACTIONS */}

              <div className={styles.locationActions}>
                {location.actions.map((action) => (
                  <div key={action.position}>{translateAction(action)}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/*
        <div className={styles.locations}>
          {guide.realm.map((location) => {
            const sortedActions = [...location.actions].sort((a, b) => {
              if (a.area !== b.area) {
                return a.area === 'TOP' ? -1 : 1;
              }

              return a.position - b.position;
            });

            return (
              <div className={styles.location} key={location.id}>
                NUMBER
                <div className={styles.locationNumber}>
                  <span>{location.position}</span>
                </div>

                NAME
                <div className={styles.locationName}>
                  <h3>{location.name}</h3>
                </div>

                ACTIONS
                <div className={styles.locationActions}>
                  {sortedActions.map((action) => (
                    <div
                      className={styles.action}
                      key={`${action.area}-${action.position}`}
                    >
                      <span className={styles.actionIcon}>✦</span>

                      <span>
                        {action.type}
                        {action.amount > 0 && ` ${action.amount}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
/*}
        {/* =========================
            REALM BOARD
        ========================= */}

        <div className={styles.realmContent}>
          {realmImage && (
            <img
              src={`${backendUrl}${realmImage.path}`}
              alt={`${guide.name} Realm`}
              className={styles.realmBoard}
            />
          )}
        </div>
      </section>

      {/* =========================
          CARDS ZONE
      ========================= */}

      <section className={styles.cardsSection}>
        {guide.decks.map((deck) => {
          /*
           * Agrupamos las cartas del mazo por tipo.
           *
           * Ejemplo:
           *
           * {
           *   ALLY: [...],
           *   EFFECT: [...],
           *   HERO: [...]
           * }
           */
          const groupedCards = deck.cards.reduce<Record<string, cardData[]>>(
            (groups, card) => {
              if (!groups[card.type]) {
                groups[card.type] = [];
              }

              groups[card.type].push(card);

              return groups;
            },
            {},
          );

          /*
           * Solo recorremos los tipos definidos en
           * cardTypeOrder y que realmente tengan cartas.
           */
          const availableTypes = cardTypeOrder.filter(
            (type) => groupedCards[type]?.length > 0,
          );

          return (
            <section key={deck.type} className={styles.deck}>
              {/* =========================
                  DECK TITLE
              ========================= */}

              <h2 className={styles.deckTitle}>
                {translations.decks[deck.type]}
              </h2>

              {/* =========================
                  CARD TYPE GROUPS
              ========================= */}

              {availableTypes.map((type) => {
                const cards = groupedCards[type];

                return (
                  <section key={type} className={styles.cardGroup}>
                    <h3 className={styles.groupTitle}>
                      {translations.howToPage[`cardType${type}`]}
                    </h3>

                    <div className={styles.cards}>
                      {cards.map((card) => {
                        const bottomImage =
                          card.strength && card.strength > 0
                            ? deck.bottomPowerImagePath
                            : deck.bottomPowerlessImagePath;

                        return (
                          <div key={card.id} className={styles.cardWrapper}>
                            <Card
                              id={card.id}
                              name={card.name}
                              text={card.text}
                              quantity={card.quantity}
                              strength={card.strength}
                              type={translations.cardTypes[card.type]}
                              typeKey={card.type}
                              deckType={deck.type}
                              imagePath={`${backendUrl}${card.imagePath}`}
                              bottomImage={`${backendUrl}${bottomImage}`}
                            />

                            <p className={styles.copyNumber}>
                              {card.quantity}{' '}
                              {translations.howToPage.copyNumber}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </section>
          );
        })}
      </section>
    </main>
  );
}
