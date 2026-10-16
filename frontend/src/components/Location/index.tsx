import { useLayoutEffect, useRef, type ComponentProps, type CSSProperties } from 'react';
import Card from '../Card';
import LocationButton, { type LocationButtonProps } from '../LocationButton';
import styles from './Location.module.scss';

// Use an id unique to each card in play, including repeated copies.
export type LocationCard = ComponentProps<typeof Card>;

export interface LocationProps extends LocationButtonProps {
  fateCards?: LocationCard[];
  villainCards?: LocationCard[];
}

function CardStack({ cards, upper }: { cards: LocationCard[]; upper: boolean }) {
  return (
    <ol
      className={`${styles.stack} ${upper ? styles.upper : styles.lower}`}
      aria-label={upper ? 'Fate' : 'Villain'}
      style={{ '--extra-cards': Math.max(cards.length - 1, 0) } as CSSProperties}
    >
      {cards.map((card, index) => (
        <li
          key={card.id}
          className={styles.card}
          style={{ '--card-index': index } as CSSProperties}
        >
          <div className={styles.cardContent}>
            <Card {...card} />
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function Location({
  fateCards = [],
  villainCards = [],
  className,
  actions,
  ...buttonProps
}: LocationProps) {
  const locationRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = locationRef.current;
    if (!element) return;

    // Scale the existing fixed-size Card without changing its internal layout.
    const resize = () => {
      element.style.setProperty('--card-scale', String(element.clientWidth * 0.88 / 337.34));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const visibleActions = actions.map((action) => ({
    ...action,
    disabled: action.disabled || (fateCards.length > 0 && action.area === 'TOP'),
  }));

  return (
    <div
      ref={locationRef}
      className={[styles.location, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={buttonProps.label}
    >
      <CardStack cards={fateCards} upper />
      <div className={styles.center}>
        <LocationButton {...buttonProps} actions={visibleActions} />
      </div>
      <CardStack cards={villainCards} upper={false} />
    </div>
  );
}
