import ActionButton, { type ActionButtonProps } from '../ActionButton';
import styles from './LocationButton.module.scss';

export interface LocationAction extends Pick<ActionButtonProps, 'imagePath' | 'label' | 'disabled'> {
  area: 'TOP' | 'BOTTOM';
  position: 1 | 2;
}

export interface LocationButtonProps {
  imagePath: string;
  label: string;
  actions: LocationAction[];
  disabled?: boolean;
  onAction?: (action: LocationAction) => void;
  className?: string;
}

export default function LocationButton({
  imagePath,
  label,
  actions,
  disabled = false,
  onAction,
  className,
}: LocationButtonProps) {
  return (
    <div
      className={[styles.location, className].filter(Boolean).join(' ')}
      role="group"
      aria-label={label}
      aria-disabled={disabled}
      data-disabled={disabled}
    >
      <img className={styles.image} src={imagePath} alt="" draggable={false} />
      {actions.map((action) => (
        <ActionButton
          key={`${action.area}-${action.position}`}
          className={styles.action}
          data-area={action.area}
          data-position={action.position}
          imagePath={action.imagePath}
          label={action.label}
          disabled={disabled || action.disabled}
          onClick={() => onAction?.(action)}
        />
      ))}
    </div>
  );
}
