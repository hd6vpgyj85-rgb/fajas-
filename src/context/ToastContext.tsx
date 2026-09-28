import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import "./Toast.css";

interface ToastAction {
  label: string;
  to: string;
}

interface Toast {
  id: number;
  message: string;
  image?: string | null;
  action?: ToastAction;
  leaving?: boolean;
}

interface ToastContextValue {
  showToast: (message: string, options?: { image?: string | null; action?: ToastAction }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 280);
  }, []);

  const showToast = useCallback<ToastContextValue["showToast"]>(
    (message, options) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev.slice(-2), { id, message, ...options }]);
      setTimeout(() => dismiss(id), 3200);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.leaving ? "is-leaving" : ""}`}>
            {toast.image ? (
              <img src={toast.image} alt="" className="toast-image" />
            ) : (
              <span className="toast-icon" aria-hidden="true">
                ✓
              </span>
            )}
            <span className="toast-message">{toast.message}</span>
            {toast.action && (
              <Link to={toast.action.to} className="toast-action" onClick={() => dismiss(toast.id)}>
                {toast.action.label}
              </Link>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de <ToastProvider>");
  return ctx;
}
