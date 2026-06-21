import type { ReactNode } from "react";

/** État vide professionnel et sobre (médical, pas alarmant). */
export function EmptyState({
  icon, title, description, action, compact,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`text-center ${compact ? "py-6" : "py-12"}`}>
      {icon && (
        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
          {icon}
        </div>
      )}
      <p className="text-night font-semibold text-sm">{title}</p>
      {description && <p className="text-sm text-gray-400 mt-1.5 max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Ligne « Non renseigné » discrète pour une section clinique sans contenu. */
export function NotProvided() {
  return <span className="text-sm text-gray-300 italic">Non renseigné</span>;
}
