import { useEffect, useRef } from "react";

/**
 * Accessibilité des modals :
 * - ferme le modal sur la touche Échap ;
 * - place le focus dans le modal à l'ouverture (lecteurs d'écran / clavier).
 *
 * Retourne une ref à attacher au conteneur du modal (à compléter par
 * role="dialog" aria-modal="true" côté JSX).
 */
export function useModalClose(onClose: () => void, enabled: boolean = true) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Focus initial sur le conteneur (rendu focusable via tabIndex={-1}).
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, enabled]);

  return ref;
}
