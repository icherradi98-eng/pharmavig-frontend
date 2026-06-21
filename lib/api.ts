import { friendlyError } from "./friendlyError";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Refresh token ──────────────────────────────────────────────────────────────
// On garde une promesse en cours pour éviter les rafales simultanées de refresh
let _refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        // Cookie refresh_token expiré ou invalide → nettoyer l'état local
        localStorage.removeItem("user");
        return false;
      }

      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

// ── Requête avec retry automatique après refresh ────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}, _retry = true): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (networkErr) {
    throw new Error(friendlyError((networkErr as Error)?.message));
  }

  // Les endpoints d'authentification eux-mêmes ne doivent PAS passer par la logique
  // de refresh : un 401 sur /auth/login = mauvais identifiants (et non session expirée),
  // un 401 sur /auth/refresh = pas de session à rafraîchir. Sinon une erreur de mot de
  // passe est masquée en « Session expirée ».
  const isAuthEndpoint = path.startsWith("/auth/login") || path.startsWith("/auth/refresh");

  // Cookie access_token expiré → on tente un refresh puis on rejoue la requête une fois
  if (res.status === 401 && _retry && !isAuthEndpoint) {
    const ok = await tryRefreshToken();
    if (ok) {
      return request<T>(path, options, false); // _retry=false pour éviter boucle infinie
    }
    // Refresh échoué → on dispatch un event pour que AuthContext déconnecte proprement
    window.dispatchEvent(new Event("pharmavig:session-expired"));
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erreur serveur" }));
    throw new Error(friendlyError(err.detail || "Erreur inconnue"));
  }

  return res.json();
}

// L'espace admin utilise le même cookie que l'espace médecin/patient —
// les tokens sont dans des cookies HttpOnly, pas besoin d'un header dédié.
async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401) {
    window.dispatchEvent(new Event("pharmavig:session-expired"));
    throw new Error("Session expirée");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erreur serveur" }));
    throw new Error(friendlyError(err.detail || "Erreur inconnue"));
  }

  return res.json();
}

// ── Terrain public (sans auth) ────────────────────────────────────────────────
export type TerrainOut = {
  dci: string;
  total: number;
  graves: number;
  graves_pct: number;
  begaud_avg: number | null;
  top_effets: { terme: string; count: number }[];
  by_evolution: { evolution: string; count: number }[];
  by_source: Record<string, number>;
  last_report_date: string | null;
};

export async function fetchTerrain(dci: string): Promise<TerrainOut | null> {
  try {
    const res = await fetch(`${BASE}/drugs/${encodeURIComponent(dci)}/terrain`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export const api = {
  // Auth
  register: (data: Record<string, unknown>) =>
    request<SessionResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request<SessionResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Connexion admin : même endpoint /auth/login — le cookie HttpOnly est posé par le backend.
  adminLogin: (email: string, password: string) =>
    request<SessionResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    fetch(`${BASE}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => null),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    }),

  forgotPassword: (email: string) =>
    request<{ detail: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ detail: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    }),

  deleteAccount: (password: string) =>
    request<void>("/auth/me", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    }),

  // Reports
  createReport: (data: Record<string, unknown>) =>
    request<ReportOut>("/reports/", { method: "POST", body: JSON.stringify(data) }),

  createAnonymousReport: (data: Record<string, unknown>) =>
    request<ReportOut>("/reports/anonymous", { method: "POST", body: JSON.stringify(data) }),

  listReports: () => request<ReportOut[]>("/reports/"),

  getReport: (id: string) => request<ReportDetail>(`/reports/${id}`),

  getMyStats: () => request<ReportStats>("/reports/stats"),

  // Surveillance active des patients (prescriptions + suivi)
  createPrescription: (data: Record<string, unknown>) =>
    request<PrescriptionOut>("/prescriptions", { method: "POST", body: JSON.stringify(data) }),

  listPrescriptions: () => request<PrescriptionOut[]>("/prescriptions"),

  getPrescription: (id: string) => request<PrescriptionDetail>(`/prescriptions/${id}`),

  listActiveSignals: () => request<CheckInOut[]>("/prescriptions/alerts"),

  markCheckinSeen: (checkinId: string) =>
    request<CheckInOut>(`/prescriptions/checkins/${checkinId}/seen`, { method: "POST" }),

  // Suivi patient public (sans authentification, via lien /suivi/{token})
  getCheckinPublic: (token: string) => request<CheckinPublicOut>(`/suivi/${token}`),

  submitCheckin: (token: string, data: Record<string, unknown>) =>
    request<CheckinPublicOut>(`/suivi/${token}`, { method: "POST", body: JSON.stringify(data) }),

  // Admin (token dédié `admin_token`, espace /admin/*)
  adminStats: () => adminRequest<AdminStats>("/admin/stats"),

  adminListDeclarations: (params: URLSearchParams | Record<string, string> = {}) => {
    const qs = params instanceof URLSearchParams ? params : new URLSearchParams(params);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return adminRequest<AdminReportOut[]>(`/admin/declarations${suffix}`);
  },

  adminGetDeclaration: (id: string) => adminRequest<AdminReportDetail>(`/admin/declarations/${id}`),

  adminUpdateDeclaration: (id: string, data: Record<string, unknown>) =>
    adminRequest<AdminReportDetail>(`/admin/declarations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  adminListUsers: () => adminRequest<AdminUser[]>("/admin/users"),
};

// ── Types partagés ────────────────────────────────────────────────────────────

export type UserRole = "medecin" | "patient" | "pharmacien" | "admin";

// Reflètent les enums Python ReportStatus / ReportSource (backend/app/models/report.py)
// — garder en phase si le backend ajoute/renomme une valeur.
export type ReportStatus = "brouillon" | "soumis" | "transmis_capm" | "traite";
export type ReportSourceType = "medecin" | "patient" | "pharmacien" | "invite";

export type UserOut = {
  id: string;
  email: string;
  role: UserRole;
  nom?: string;
  prenom?: string;
  specialite?: string;
};

/** @deprecated — tokens maintenant dans cookies HttpOnly. Utiliser SessionResponse. */
export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserOut;
};

export type SessionResponse = {
  user: UserOut;
};

// ── Types — surveillance active des patients ─────────────────────────────────

export type ProtocolType = "standard" | "intensif" | "custom";
export type CheckinStatus = "pending" | "rappel_envoye" | "repondu" | "expire";
export type CheckinSeverity = "rien_a_signaler" | "standard" | "urgent";

export type PrescriptionOut = {
  id: string;
  created_at: string;
  patient_initiales: string;
  patient_age?: string;
  patient_sexe?: string;
  drug_dci: string;
  drug_dose?: string;
  drug_frequence?: string;
  drug_duree?: string;
  indication?: string;
  date_debut: string;
  monitoring_active: boolean;
  protocol_type?: ProtocolType;
  protocol_days?: number[];
  contact_method?: string;
  access_token: string;
  monitoring_ended: boolean;
  monitoring_end_reason?: string;
};

export type CheckInOut = {
  id: string;
  day_offset: number;
  scheduled_date: string;
  status: CheckinStatus;
  responded_at?: string;
  has_symptoms?: boolean;
  stopped_treatment?: boolean;
  stop_reason?: string;
  symptoms?: string[];
  symptoms_other?: string;
  photo_url?: string;
  severity?: CheckinSeverity;
  physician_seen_at?: string;
  resulting_report_id?: string;
};

export type PrescriptionDetail = PrescriptionOut & {
  contact_email?: string;
  contact_tel?: string;
  checkins: CheckInOut[];
};

export type CheckinPublicOut = {
  drug_dci: string;
  day_offset: number;
  days_since_start: number;
  status: CheckinStatus;
  next_checkin_in_days?: number;
  monitoring_ended: boolean;
};

export type ReportStats = {
  total: number;
  this_month: number;
  graves: number;
  graves_pct: number;
  begaud_avg: number | null;
  by_month: { month: string; count: number }[]; // "YYYY-MM"
  by_soc: { soc: string; count: number }[];
  by_gravite: { grave: number; non_grave: number };
  molecules: string[];
};

export type ReportOut = {
  id: string;
  created_at: string;
  status: ReportStatus;
  source: ReportSourceType;
  drug_dci?: string;
  drug_nom_commercial?: string;
  gravite_serieux: boolean;
  imput_conclusion?: string;
  capm_reference?: string;
};

// ── Types espace admin ────────────────────────────────────────────────────────

export type AdminReportOut = {
  id: string;
  created_at: string;
  status: ReportStatus;
  source: ReportSourceType;
  drug_dci?: string;
  drug_nom_commercial?: string;
  gravite_serieux: boolean;
  imput_conclusion?: string;
  capm_reference?: string;
  declarant_nom?: string;
  declarant_prenom?: string;
  declarant_email?: string;
  raw_data?: Record<string, unknown>;
};

export type AdminReportDetail = AdminReportOut;

export type AdminStats = {
  total: number;
  this_month: number;
  serieux: number;
  serieux_pct: number;
  by_source: Record<string, number>;
  recent: AdminReportOut[];
};

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  nom?: string;
  prenom?: string;
  specialite?: string;
  etablissement?: string;
  ville?: string;
  is_active: boolean;
  created_at: string;
  declaration_count: number;
};

export type ReportDetail = ReportOut & {
  patient_age?: string;
  patient_sexe?: string;
  patient_poids?: number;
  patient_taille?: number;
  patient_grossesse?: string;
  patient_antecedents?: string;
  patient_allergies?: string;
  drug_forme?: string;
  drug_voie?: string;
  drug_posologie?: string;
  drug_indication?: string;
  drug_date_debut?: string;
  drug_date_fin?: string;
  drug_lot?: string;
  drug_laboratoire?: string;
  concomitants?: { nom: string; posologie: string; indication: string }[];
  ei_description?: string;
  ei_date_debut?: string;
  ei_date_fin?: string;
  ei_evolution?: string;
  gravite_deces: boolean;
  gravite_vie_danger: boolean;
  gravite_hospitalisation: boolean;
  gravite_incapacite: boolean;
  gravite_anomalie_congenitale: boolean;
  imput_chronologie?: string;
  imput_evolution_arret?: string;
  imput_readministration?: string;
  commentaires?: string;
  raw_data?: Record<string, unknown>;
};
