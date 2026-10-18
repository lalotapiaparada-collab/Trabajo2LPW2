import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  texto: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className={`toast alert alert-${toast.tipo === 'error' ? 'danger' : toast.tipo}`} role="status">
      <span>{toast.texto}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="toast-close"
        aria-label="Cerrar notificación"
      >
        ×
      </button>
    </div>
  );
};
