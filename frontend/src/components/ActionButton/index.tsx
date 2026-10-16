import type { ButtonHTMLAttributes } from 'react';
import styles from './ActionButton.module.scss';

export interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  imagePath: string;
  label: string;
}

export default function ActionButton({
  imagePath,
  label,
  className,
  type = 'button',
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[styles.button, className].filter(Boolean).join(' ')}
      aria-label={label}
    >
      <img className={styles.image} src={imagePath} alt="" draggable={false} />
    </button>
  );
}
