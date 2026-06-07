const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erreur serveur" }));
    throw new Error(err.detail || "Erreur inconnue");
  }

  return res.json();
}

// L'espace admin utilise son propre token (`admin_token`, distinct du token
// utilisateur classique `access_token`) — on a donc besoin d'un wrapper de
// requête dédié qui injecte le bon header d'autorisation.
async function adminRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erreur serveur" }));
    throw new Error(err.detail || "Erreur inconnue");
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: Record<string, unknown>) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Connexion admin : passe par le même endpoint /auth/login (et donc la même
  // base d'URL centralisée) ; la vérification du rôle "admin" et le stockage
  // dans `admin_token`/`admin_user` restent gérés côté page de connexion admin.
  adminLogin: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Reports
  createReport: (data: Record<string, unknown>) =>
    request<ReportOut>("/reports/", { method: "POST", body: JSON.stringify(data) }),

  createAnonymousReport: (data: Record<string, unknown>) =>
    request<ReportOut>("/reports/anonymous", { method: "POST", body: JSON.stringify(data) }),

  listReports: () => request<ReportOut[]>("/reports/"),

  getReport: (id: string) => request<ReportDetail>(`/reports/${id}`),

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

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserOut;
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
