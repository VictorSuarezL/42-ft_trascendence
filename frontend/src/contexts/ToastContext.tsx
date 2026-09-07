import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Toast, type ToastLocation, type ToastType } from '../components/Toast';

type ToastOptions = {
  message: string;
  type: ToastType;
  location?: ToastLocation;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const hideToast = useCallback(() => {
    setToast(null);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      hideToast();
      setToast(options);

      if (options.durationMs !== 0) {
        timeoutRef.current = window.setTimeout(() => {
          setToast(null);
        }, options.durationMs ?? 3000);
      }
    },
    [hideToast],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          location={toast.location}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
