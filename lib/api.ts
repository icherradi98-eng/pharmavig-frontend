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

  getReport: (id: string) => request<ReportOut>(`/reports/${id}`),
};

// ── Types partagés ────────────────────────────────────────────────────────────

export type UserRole = "medecin" | "patient" | "pharmacien";

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
