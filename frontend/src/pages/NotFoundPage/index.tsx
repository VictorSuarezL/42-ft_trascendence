import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { useTranslation } from '../../hooks/useTranslation';
import styles from './NotFoundPage.module.scss';

import scarImg from '../../assets/scarMain.webp';
import hadesImg from '../../assets/hadesMain.webp';
import maleficentImg from '../../assets/maleficentMain.webp';
import captainHookImg from '../../assets/captain-hookMain.webp';

const VILLAINS = [
  { img: scarImg,         name: 'Scar',         key: 'scar' },
  { img: hadesImg,        name: 'Hades',        key: 'hades' },
  { img: maleficentImg,   name: 'Maleficent',   key: 'maleficent' },
  { img: captainHookImg,  name: 'Captain Hook', key: 'captainhook' },
];

export function NotFoundPage() {
  const navigate = useNavigate();
  const { language } = useUser();
  const t = useTranslation(language, 'notFoundPage');

  const villain = useMemo(
    () => VILLAINS[Math.floor(Math.random() * VILLAINS.length)],
    [],
  );

  const villainTrans = (t?.notFoundPage as any)?.[villain.key] as { line?: string; sub?: string } | undefined;
  const eyebrow = t?.notFoundPage?.eyebrow?.replace('{villain}', villain.name) ?? `— ${villain.name} on the matter —`;
  const line    = villainTrans?.line ?? '';
  const sub     = villainTrans?.sub  ?? '';
  const btnHome = t?.notFoundPage?.backToRealm ?? 'Back to the Realm';
  const btnBack = t?.notFoundPage?.goBack      ?? '← Go back';

  return (
    <div className={styles.page}>
      <img src={villain.img} alt="" aria-hidden="true" className={styles.villainBg} />

      <div className={styles.content}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <p className={styles.errorCode}>404</p>
        <h1 className={styles.quote}>&ldquo;{line}&rdquo;</h1>
        <p className={styles.sub}>{sub}</p>

        <div className={styles.actions}>
          <button type="button" className={styles.homeBtn} onClick={() => navigate('/home')}>
            {btnHome}
          </button>
          <button type="button" className={styles.backBtn} onClick={() => navigate(-1)}>
            {btnBack}
          </button>
        </div>
      </div>
    </div>
  );
}
