/**
 * Traduit les messages d'erreur backend (FastAPI) en français lisible.
 * Les messages de l'API arrivent en anglais ou en codes techniques —
 * cette fonction les rend compréhensibles pour médecins et patients.
 */

const MAP: Array<[RegExp | string, string]> = [
  // Auth
  ["Invalid email or password",       "Email ou mot de passe incorrect."],
  ["Incorrect email or password",     "Email ou mot de passe incorrect."],
  ["incorrect email or password",     "Email ou mot de passe incorrect."],
  ["User not active",                 "Ce compte est désactivé. Contactez l'administrateur."],
  ["Email already registered",        "Un compte existe déjà avec cet email."],
  ["Email already in use",            "Un compte existe déjà avec cet email."],
  ["email already registered",        "Un compte existe déjà avec cet email."],
  ["User not found",                  "Compte introuvable."],
  ["user not found",                  "Compte introuvable."],
  ["Invalid token",                   "Lien invalide ou expiré. Demandez-en un nouveau."],
  ["invalid token",                   "Lien invalide ou expiré. Demandez-en un nouveau."],
  ["Token expired",                   "Ce lien a expiré. Demandez-en un nouveau."],
  ["Not verified",                    "Votre email n'est pas encore vérifié."],
  ["Email not verified",              "Votre email n'est pas encore vérifié."],

  // Déclarations
  ["Report not found",                "Déclaration introuvable."],
  ["Not authorized",                  "Accès non autorisé à cette déclaration."],
  ["not authorized",                  "Accès non autorisé à cette déclaration."],

  // Fichiers
  [/file.*(too large|size)/i,         "Fichier trop volumineux (max 10 Mo)."],
  [/unsupported.*(type|format)/i,     "Format de fichier non supporté."],

  // Réseau / générique
  ["Failed to fetch",                 "Problème de connexion — vérifiez votre réseau."],
  ["Network request failed",          "Problème de connexion — vérifiez votre réseau."],
  ["NetworkError",                    "Problème de connexion — vérifiez votre réseau."],
  ["Load failed",                     "Problème de connexion — vérifiez votre réseau."],
  ["Erreur inconnue",                 "Erreur inattendue — veuillez réessayer."],
  ["Erreur serveur",                  "Erreur serveur — réessayez dans quelques instants."],
  ["Internal server error",           "Erreur serveur — réessayez dans quelques instants."],
  ["Internal Server Error",           "Erreur serveur — réessayez dans quelques instants."],
  ["Service unavailable",             "Service temporairement indisponible — réessayez dans quelques minutes."],
];

export function friendlyError(raw: string | undefined | null): string {
  if (!raw) return "Erreur inattendue — veuillez réessayer.";

  for (const [pattern, friendly] of MAP) {
    if (typeof pattern === "string") {
      if (raw.toLowerCase().includes(pattern.toLowerCase())) return friendly;
    } else {
      if (pattern.test(raw)) return friendly;
    }
  }

  // Si le message est déjà en français correct (commence par une majuscule, pas de jargon)
  // on le laisse passer tel quel
  if (/^[A-ZÀÂÉÈÊËÎÏÔÙÛÜÇ]/.test(raw) && raw.length < 120) return raw;

  return "Erreur inattendue — veuillez réessayer.";
}
