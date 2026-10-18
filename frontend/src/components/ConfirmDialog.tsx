import React, { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  isLoading?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  isLoading = false,
  onConfirmar,
  onCancelar,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        // Mueve el foco inicial al botón de cancelar por seguridad
        cancelBtnRef.current?.focus();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Manejo de la tecla Escape nativa del navegador
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancelar();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog"
      onKeyDown={handleKeyDown}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
    >
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="dialog-title">{titulo}</h2>
        </header>

        <p id="dialog-desc" className="modal-body">
          {mensaje}
        </p>

        <footer className="modal-footer">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-outline"
            onClick={onCancelar}
            disabled={isLoading}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirmar}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Eliminando...' : textoConfirmar}
          </button>
        </footer>
      </div>
    </dialog>
  );
};
