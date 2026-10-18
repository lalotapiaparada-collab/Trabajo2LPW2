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

/**
 * Diálogo Accesible <dialog> (WCAG 2.1.2 No Keyboard Trap, 2.4.3 Focus Order)
 * - Usa el elemento nativo <dialog> con showModal().
 * - Atrapa el foco de teclado dentro del diálogo mientras esté abierto.
 * - Soporta la tecla Escape para cancelar.
 * - Devuelve el foco al elemento disparador cuando se cierra.
 */
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
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // Guardar el elemento que tenía el foco antes de abrir el modal
      previouslyFocusedElement.current = document.activeElement as HTMLElement | null;

      if (!dialog.open) {
        dialog.showModal();
        // Mover el foco inicial al botón de cancelar (acción no destructiva)
        setTimeout(() => {
          cancelBtnRef.current?.focus();
        }, 50);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      // Devolver el foco al elemento que abrió el diálogo (WCAG 2.4.3)
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen]);

  // Manejo accesible del teclado: Escape y ciclo de foco (Focus Trap)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancelar();
      return;
    }

    if (e.key === 'Tab') {
      const cancelBtn = cancelBtnRef.current;
      const confirmBtn = confirmBtnRef.current;

      if (!cancelBtn || !confirmBtn) return;

      // Trampa de foco: si está en cancelar y presiona Shift+Tab, ir a confirmar
      if (e.shiftKey && document.activeElement === cancelBtn) {
        e.preventDefault();
        confirmBtn.focus();
      } else if (!e.shiftKey && document.activeElement === confirmBtn) {
        // Si está en confirmar y presiona Tab, volver a cancelar
        e.preventDefault();
        cancelBtn.focus();
      }
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
            ref={confirmBtnRef}
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
export default ConfirmDialog;
