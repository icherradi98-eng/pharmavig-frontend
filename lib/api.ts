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

export const api = {
  // Auth
  register: (data: Record<string, unknown>) =>
    request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
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
};

// ── Types partagés ────────────────────────────────────────────────────────────

export type UserRole = "medecin" | "patient" | "pharmacien" | "admin";

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
  status: string;
  source: string;
  drug_dci?: string;
  drug_nom_commercial?: string;
  gravite_serieux: boolean;
  imput_conclusion?: string;
  capm_reference?: string;
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
