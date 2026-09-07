import { useEffect } from 'react';
import styles from './Toast.module.scss';

export type ToastType = 'success' | 'error' | 'info';

export type ToastLocation =
  | 'TOP-CENTER'
  | 'TOP-RIGHT'
  | 'TOP-LEFT'
  | 'BOTTOM-CENTER'
  | 'BOTTOM-RIGHT'
  | 'BOTTOM-LEFT';

export interface ToastProps {
  message: string | null;
  type: ToastType;
  location?: ToastLocation;
  durationMs?: number;
  onClose?: () => void;
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '×',
  info: 'ℹ',
};

/**
 * Toast de notificación reutilizable.
 *
 * @example
 * <Toast
 *   message="El juego se ha creado correctamente."
 *   type="success"
 *   location="TOP-RIGHT"
 *   durationMs={3000}
 *   onClose={() => setToast(null)}
 * />
 */

export function Toast({
  message,
  type,
  location = 'TOP-RIGHT',
  durationMs = 3000,
  onClose,
}: ToastProps) {
  if (!message) {
    return null;
  }
  useEffect(() => {
    if (!durationMs) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onClose?.();
    }, durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [durationMs, onClose]);

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${styles[location]}`}
      role="alert"
    >
      <div className={styles.icon}>{icons[type]}</div>

      <div className={styles.content}>
        <p>{message}</p>
      </div>

      {onClose && (
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          ×
        </button>
      )}
    </div>
  );
}
