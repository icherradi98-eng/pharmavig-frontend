"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import MedecinLayout, { PageHeader, SectionCard, useUnreadAlertsCount } from "@/components/medecin/MedecinLayout";
import { MOCK_ALERTS, MOCK_PROFILE } from "@/lib/mockMedecinData";

const PREFS_KEY = "pharmavig_medecin_notif_prefs";

type Prefs = {
  emailAlerts: boolean;
  pushNotifs: boolean;
  frequency: "immediat" | "quotidien" | "hebdo";
  minSeverity: "urgent" | "urgent_important" | "toutes";
};

const DEFAULT_PREFS: Prefs = { emailAlerts: true, pushNotifs: false, frequency: "immediat", minSeverity: "urgent_important" };

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${checked ? "bg-emerald-600" : "bg-gray-300"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

export default function ProfilMedecin() {
  const { user, logout } = useAuth();
  const unread = useUnreadAlertsCount(MOCK_ALERTS.length);
  const [prefs, setPrefs] = useState<Prefs>(() => {
    if (typeof window === "undefined") return DEFAULT_PREFS;
    try {
      const stored = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
      return stored ?? DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);

  function updatePrefs(next: Partial<Prefs>) {
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    localStorage.setItem(PREFS_KEY, JSON.stringify(merged));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!user) return null;
  const initiales = `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`.toUpperCase() || "MD";

  function downloadData() {
    const data = { profil: user, exporte_le: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pharmavig_mes_donnees.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <MedecinLayout unreadAlerts={unread}>
      <PageHeader title="Mon profil" subtitle="Informations personnelles, sécurité et préférences de notification" />

      <div className="px-5 md:px-8 py-6 space-y-6 max-w-3xl">
        {/* Identité */}
        <SectionCard>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {initiales}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Dr {user.prenom} {user.nom}</h2>
              <p className="text-gray-500 text-sm">{user.specialite || MOCK_PROFILE.specialite} · {MOCK_PROFILE.etablissement}</p>
              <span className="inline-block mt-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Médecin</span>
            </div>
          </div>
        </SectionCard>

        {/* Informations */}
        <SectionCard title="Informations professionnelles">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nom" value={user.nom || "—"} />
            <Field label="Prénom" value={user.prenom || "—"} />
            <Field label="Spécialité" value={user.specialite || MOCK_PROFILE.specialite} />
            <Field label="N° CNOM" value={MOCK_PROFILE.cnom} />
            <Field label="Établissement" value={MOCK_PROFILE.etablissement} />
            <Field label="Ville" value={MOCK_PROFILE.ville} />
            <Field label="Email" value={user.email} />
            <Field label="Téléphone" value={MOCK_PROFILE.telephone} />
          </div>
          <button className="mt-4 text-sm font-medium text-emerald-700 hover:underline">Modifier mes informations</button>
        </SectionCard>

        {/* Préférences de notification */}
        <SectionCard title="Préférences de notification">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Alertes par email</p>
                <p className="text-xs text-gray-400">Recevoir les alertes de sécurité par email</p>
              </div>
              <Toggle checked={prefs.emailAlerts} onChange={(v) => updatePrefs({ emailAlerts: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Notifications push</p>
                <p className="text-xs text-gray-400">Recevoir des notifications sur votre appareil</p>
              </div>
              <Toggle checked={prefs.pushNotifs} onChange={(v) => updatePrefs({ pushNotifs: v })} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1.5">Fréquence des alertes</p>
              <select
                value={prefs.frequency}
                onChange={(e) => updatePrefs({ frequency: e.target.value as Prefs["frequency"] })}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700"
              >
                <option value="immediat">Immédiat</option>
                <option value="quotidien">Résumé quotidien</option>
                <option value="hebdo">Résumé hebdomadaire</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1.5">Gravité minimale pour notification</p>
              <select
                value={prefs.minSeverity}
                onChange={(e) => updatePrefs({ minSeverity: e.target.value as Prefs["minSeverity"] })}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700"
              >
                <option value="urgent">Urgent uniquement</option>
                <option value="urgent_important">Urgent + Important</option>
                <option value="toutes">Toutes les alertes</option>
              </select>
            </div>
            {saved && <p className="text-xs text-emerald-600">✓ Préférences enregistrées</p>}
          </div>
        </SectionCard>

        {/* Mot de passe */}
        <SectionCard title="Changer mon mot de passe">
          <div className="grid sm:grid-cols-3 gap-3">
            <input type="password" placeholder="Mot de passe actuel" value={pwdForm.current}
              onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input type="password" placeholder="Nouveau mot de passe" value={pwdForm.next}
              onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            <input type="password" placeholder="Confirmer" value={pwdForm.confirm}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <button className="mt-3 bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
            Mettre à jour le mot de passe
          </button>
        </SectionCard>

        {/* CNDP / loi 09-08 */}
        <SectionCard title="Vos données personnelles">
          <p className="text-xs text-gray-500 mb-3">
            Conformément à la loi 09-08 (CNDP), vous disposez d&apos;un droit d&apos;accès et de portabilité de vos données.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={downloadData} className="text-sm font-medium text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
              ⬇️ Télécharger mes données
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="text-sm font-medium text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">
              Supprimer mon compte
            </button>
          </div>
        </SectionCard>

        <button
          onClick={logout}
          className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl text-sm font-semibold transition-colors"
        >
          Se déconnecter
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Supprimer votre compte ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Cette action est irréversible. Vos déclarations resteront archivées de façon anonymisée conformément aux obligations réglementaires de pharmacovigilance, mais votre compte et vos informations personnelles seront définitivement supprimés.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-700">
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </MedecinLayout>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}
