import { useLayoutEffect, useRef, useState } from 'react';
import styles from './Card.module.scss';

export default function Card({
  id,
  name,
  text,
  quantity,
  strength,
  type,
  typeKey,
  deckType,
  imagePath,
  bottomImage,
}: {
  id: string;
  name: string;
  quantity: number;
  text: string;
  strength?: number;
  type: string;
  typeKey: string;
  deckType: string;
  imagePath: string;
  bottomImage: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleScale, setTitleScale] = useState(1);
  const isFate = deckType === 'FATE';

  useLayoutEffect(() => {
    const title = titleRef.current;

    if (!title) return;

    const calculateScale = () => {
      const container = title.parentElement;

      if (!container) return;

      // Quitamos la transformación antes de medir
      title.style.transform = 'scaleX(1)';

      const availableWidth = container.clientWidth;
      const textWidth = title.getBoundingClientRect().width;

      const scale = textWidth > availableWidth ? availableWidth / textWidth : 1;

      setTitleScale(scale);
    };

    calculateScale();

    const observer = new ResizeObserver(calculateScale);

    const container = title.parentElement;

    if (container) {
      observer.observe(container);
    }

    return () => {
      observer.disconnect();
    };
  }, [name]);

  return (
    <article className={styles.card}>
      {/* Imagen superior */}
      <div className={styles.top}>
        <img src={imagePath} alt={name} className={styles.imagePath} />
      </div>

      {/* Imagen inferior + contenido */}
      <div className={styles.bottom}>
        <img src={bottomImage} alt="" className={styles.bottomImage} />

        <div className={styles.content}>
          <div className={styles.titleContainer}>
            <h2
              ref={titleRef}
              className={`${styles.title} ${isFate ? styles.fateText : ''}`}
              style={{ transform: `scaleX(${titleScale})` }}
            >
              {name}
            </h2>
          </div>

          <p className={`${styles.text} ${isFate ? styles.fateText : ''}`}>
            {text}
          </p>
          <div className={`${styles.type} ${styles[typeKey.toLowerCase()]}`}>
            {type}
          </div>

          <div className={styles.strength}>{strength}</div>
        </div>
      </div>
    </article>
  );
}
