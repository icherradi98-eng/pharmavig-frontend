"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

type FormData = {
  // Section 1
  age: string;
  sexe: string;
  region: string;
  suivi: string;
  contact: string;
  contactEmail: string;
  contactTel: string;
  // Section 2
  medicamentNom: string;
  medicamentLot: string;
  medicamentPeremption: string;
  medicamentLabo: string;
  indication: string;
  indicationAutre: string;
  duree: string;
  prescripteur: string;
  // Section 3
  zonesCorps: string[];
  symptomes: string[];
  description: string;
  delaiApparition: string;
  problemePersiste: string;
  // Section 4
  activitesImpactees: string;
  urgences: string;
  arretMedicament: string;
  ameliorationApresArret: string;
  // Section 5
  autresMedicaments: string;
  autresMedicamentsDetail: string;
  maladiesChroniques: string[];
  reactionPassee: string;
  reactionPasseeDetail: string;
  // Section 6
  signaleAuMedecin: string;
  documents: boolean;
  consentement: boolean;
};

const INITIAL: FormData = {
  age: "", sexe: "", region: "", suivi: "", contact: "", contactEmail: "", contactTel: "",
  medicamentNom: "", medicamentLot: "", medicamentPeremption: "", medicamentLabo: "",
  indication: "", indicationAutre: "", duree: "", prescripteur: "",
  zonesCorps: [], symptomes: [], description: "", delaiApparition: "", problemePersiste: "",
  activitesImpactees: "", urgences: "", arretMedicament: "", ameliorationApresArret: "",
  autresMedicaments: "", autresMedicamentsDetail: "", maladiesChroniques: [], reactionPassee: "", reactionPasseeDetail: "",
  signaleAuMedecin: "", documents: false, consentement: false,
};

const SECTIONS = [
  { id: 1, label: "Identité", labelDarija: "Huwiytak" },
  { id: 2, label: "Médicament", labelDarija: "Dwa" },
  { id: 3, label: "Ce qui s'est passé", labelDarija: "Ashmen mushkil" },
  { id: 4, label: "Gravité", labelDarija: "Khdura" },
  { id: 5, label: "Contexte médical", labelDarija: "Hal tibii" },
  { id: 6, label: "Finalisation", labelDarija: "Akhir khatwa" },
];

const REGIONS = [
  "Casablanca-Settat", "Rabat-Salé-Kénitra", "Marrakech-Safi", "Fès-Meknès",
  "Tanger-Tétouan-Al Hoceïma", "Souss-Massa", "Oriental", "Béni Mellal-Khénifra",
  "Drâa-Tafilalet", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab",
];

const SYMPTOMES_CATEGORIES = [
  {
    cat: "🩺 Peau / Jeld",
    items: ["Boutons / Hbob", "Rougeurs / Homra", "Démangeaisons / Chkiwa", "Gonflement / Tewrem", "Plaies / Jroh", "Peau qui pèle / Tsellakh"],
  },
  {
    cat: "🤢 Digestion / Kerch",
    items: ["Nausées / Tqiyyan", "Vomissements / Tuqiya", "Diarrhée / Khrouj", "Douleurs ventre / Wja3 f kerch", "Constipation / Hbess", "Perte appétit / Ma3andouch cha3ra"],
  },
  {
    cat: "🧠 Tête / Ras",
    items: ["Mal de tête / Wja3 ras", "Vertiges / Dwakha", "Vision trouble / Dhla3 f 3inayn", "Confusion / Kheltita", "Somnolence / N3ass bzaf", "Tremblements / Hriza"],
  },
  {
    cat: "🫀 Cœur / Qelb",
    items: ["Palpitations / Tkhbita", "Essoufflement / Ma kaynefss", "Douleur poitrine / Wja3 sder", "Jambes gonflées / Rejalin tewrmet", "Fatigue intense / 3ya bzaf"],
  },
  {
    cat: "💊 Général / 3am",
    items: ["Fièvre / Skhanit", "Frissons / Berrda", "Sueurs / 3raq", "Perte de poids / Nqes f wazn", "Douleurs musculaires / Wja3 f 3dham", "Réaction allergique / Hasasiya"],
  },
];

const ZONES_CORPS = [
  { id: "tete", label: "🧠 Tête / Ras", sub: "mal de tête, vertiges..." },
  { id: "yeux", label: "👁️ Yeux / 3inayn", sub: "vision trouble..." },
  { id: "oreilles", label: "👂 Oreilles / Widnayn", sub: "bourdonnements..." },
  { id: "nez", label: "👃 Nez / Gorge — Nif", sub: "saignement..." },
  { id: "bras", label: "💪 Bras / Mains — Yeddin", sub: "fourmillements..." },
  { id: "peau", label: "🩺 Peau / Jeld", sub: "boutons, rougeurs..." },
  { id: "ventre", label: "🫃 Ventre / Kerch", sub: "douleurs, nausées..." },
  { id: "jambes", label: "🦵 Jambes / Rejalin", sub: "gonflement, douleurs..." },
];

// ─── Helper components ────────────────────────────────────────────────────────

function Label({ fr, dar, required }: { fr: string; dar: string; required?: boolean }) {
  return (
    <div className="mb-2">
      <span className="font-medium text-gray-900 text-sm">
        {fr} {required && <span className="text-red-500">★</span>}
      </span>
      <div className="text-xs text-emerald-700 mt-0.5" dir="rtl">{dar}</div>
    </div>
  );
}

function RadioGroup({ options, value, onChange }: { options: { val: string; fr: string; dar: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <label key={o.val} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${value === o.val ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
          <input type="radio" className="accent-emerald-600" checked={value === o.val} onChange={() => onChange(o.val)} />
          <div>
            <div className="text-sm text-gray-800">{o.fr}</div>
            <div className="text-xs text-gray-500" dir="rtl">{o.dar}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all text-sm ${checked ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
      <input type="checkbox" className="accent-emerald-600" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

function InfoBox({ text, textDar }: { text: string; textDar?: string }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700">
      <p>💡 {text}</p>
      {textDar && <p className="mt-1 text-blue-600" dir="rtl">🇲🇦 {textDar}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function FormulairePatient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof FormData, value: FormData[keyof FormData]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleArray = (field: "zonesCorps" | "symptomes" | "maladiesChroniques", val: string) => {
    setForm((prev) => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };

  function handleSubmit() {
    if (!form.consentement) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Déclaration envoyée !</h1>
          <p className="text-gray-500 text-sm mb-2">Vous recevrez un accusé de réception immédiat.</p>
          <p className="text-emerald-700 text-sm font-medium mb-6" dir="rtl">Ghatwassel lik confirmation f l-hin 🇲🇦</p>
          <Link href="/dashboard/patient" className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/patient" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
          <div>
            <div className="font-semibold text-gray-900 text-sm">Déclaration d&apos;effet indésirable</div>
            <div className="text-xs text-gray-500">Section {step} / {SECTIONS.length} — {SECTIONS[step - 1].label}</div>
          </div>
        </div>
        <div className="text-xs text-gray-400">{Math.round((step / SECTIONS.length) * 100)}%</div>
      </header>

      {/* Barre de progression */}
      <div className="h-1 bg-gray-200">
        <div className="h-1 bg-emerald-500 transition-all duration-300" style={{ width: `${(step / SECTIONS.length) * 100}%` }} />
      </div>

      {/* Étapes */}
      <div className="overflow-x-auto border-b border-gray-100 bg-white px-6">
        <div className="flex gap-1 py-2 min-w-max">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => s.id < step && setStep(s.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${step === s.id ? "bg-emerald-600 text-white" : s.id < step ? "bg-emerald-100 text-emerald-700 cursor-pointer" : "text-gray-400 cursor-default"}`}
            >
              {s.id}. {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Section 1 : Identité ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-600">
              <p className="mb-1">🔒 <strong>Identité anonyme</strong> — aucun nom ni prénom demandé.</p>
              <p className="text-xs text-gray-500" dir="rtl">🇲🇦 Huwiytak — ma katkhss ism wala lqab. Ghir ila baghi ytsselu bik, 3ti email wella téléphone.</p>
            </div>

            <div>
              <Label fr="Q1 — Quel est votre âge ?" dar="Shhal 3andek f 3omrek ?" required />
              <RadioGroup
                value={form.age}
                onChange={(v) => set("age", v)}
                options={[
                  { val: "<18", fr: "Moins de 18 ans", dar: "Dun 18 3am" },
                  { val: "18-30", fr: "18 – 30 ans", dar: "18 – 30 3am" },
                  { val: "31-45", fr: "31 – 45 ans", dar: "31 – 45 3am" },
                  { val: "46-60", fr: "46 – 60 ans", dar: "46 – 60 3am" },
                  { val: "61-75", fr: "61 – 75 ans", dar: "61 – 75 3am" },
                  { val: ">75", fr: "Plus de 75 ans", dar: "Fuq 75 3am" },
                  { val: "nr", fr: "Je préfère ne pas répondre", dar: "Ma bghitch njaweb" },
                ]}
              />
            </div>

            <div>
              <Label fr="Q2 — Quel est votre sexe ?" dar="Shkun nta / nti ?" required />
              <RadioGroup
                value={form.sexe}
                onChange={(v) => set("sexe", v)}
                options={[
                  { val: "homme", fr: "Homme", dar: "Rajel" },
                  { val: "femme", fr: "Femme", dar: "Mra" },
                  { val: "nr", fr: "Je préfère ne pas répondre", dar: "Ma bghitch njaweb" },
                ]}
              />
            </div>

            <div>
              <Label fr="Q3 — Dans quelle région habitez-vous ?" dar="Fin kateskun ?" />
              <select
                value={form.region}
                onChange={(e) => set("region", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Choisir une région / Khtar mantika</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                <option value="nr">Je préfère ne pas répondre / Ma bghitch njaweb</option>
              </select>
            </div>

            <div>
              <Label fr="Q4 — Êtes-vous suivi(e) par un médecin pour ce problème ?" dar="Wash 3andek tbib kayta3amlek f had l-mushkil ?" />
              <RadioGroup
                value={form.suivi}
                onChange={(v) => set("suivi", v)}
                options={[
                  { val: "oui", fr: "Oui", dar: "Iyeh" },
                  { val: "non", fr: "Non", dar: "La" },
                  { val: "pasencore", fr: "Pas encore", dar: "Mazal" },
                ]}
              />
            </div>

            <div>
              <Label fr="Q5 — Souhaitez-vous être recontacté(e) ?" dar="Baghi/Baghya ytsselu bik ?" />
              <RadioGroup
                value={form.contact}
                onChange={(v) => set("contact", v)}
                options={[
                  { val: "email", fr: "Oui, par email", dar: "Iyeh, b email" },
                  { val: "tel", fr: "Oui, par téléphone", dar: "Iyeh, b tilifun" },
                  { val: "non", fr: "Non, je reste anonyme", dar: "La, bghit nbqa majhul" },
                ]}
              />
              {form.contact === "email" && (
                <input type="email" placeholder="votre@email.com" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)}
                  className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              )}
              {form.contact === "tel" && (
                <input type="tel" placeholder="+212 6XX XXX XXX" value={form.contactTel} onChange={(e) => set("contactTel", e.target.value)}
                  className="mt-3 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              )}
            </div>
          </div>
        )}

        {/* ── Section 2 : Médicament ── */}
        {step === 2 && (
          <div className="space-y-6">
            <InfoBox
              text="Le plus simple : prenez en photo la boîte du médicament — les informations seront détectées automatiquement."
              textDar="Ahsan haja : sur photo dla3bit dyal dwa — smiytu, numero lot w tarikh intihaa ysortiu wehdhoum."
            />

            <div>
              <Label fr="Q6 — Identification du médicament" dar="Huwiyat dwa" required />
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl p-4 text-sm text-gray-500 hover:text-emerald-600 transition-all">
                  📷 Photo de la boîte
                </button>
                <button className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl p-4 text-sm text-gray-500 hover:text-emerald-600 transition-all">
                  📱 Scanner code-barres
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Saisie manuelle / Kteb b yadek</p>
                <input type="text" placeholder="Nom du médicament / Smiyat dwa" value={form.medicamentNom} onChange={(e) => set("medicamentNom", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="text" placeholder="Numéro de lot / Numero lot" value={form.medicamentLot} onChange={(e) => set("medicamentLot", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="text" placeholder="Date de péremption (JJ/MM/AAAA) / Tarikh intihaa" value={form.medicamentPeremption} onChange={(e) => set("medicamentPeremption", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="text" placeholder="Laboratoire / Laboratoire" value={form.medicamentLabo} onChange={(e) => set("medicamentLabo", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div>
              <Label fr="Q7 — Pourquoi prenez-vous ce médicament ?" dar="3lash katakhod had dwa ?" required />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: "tension", fr: "Tension / Dhghout d-demm" },
                  { val: "diabete", fr: "Diabète / Sokkar" },
                  { val: "infection", fr: "Infection" },
                  { val: "douleurs", fr: "Douleurs / Wja3" },
                  { val: "cancer", fr: "Cancer / Saratan" },
                  { val: "cardiaque", fr: "Problème cardiaque / Qelb" },
                  { val: "respiratoire", fr: "Problème respiratoire / Reaah" },
                  { val: "digestif", fr: "Problème digestif / Kerch" },
                  { val: "autre", fr: "Autre / Khour" },
                ].map((o) => (
                  <label key={o.val} className={`flex items-center gap-2 p-3 rounded-lg border text-sm cursor-pointer transition-all ${form.indication === o.val ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                    <input type="radio" className="accent-emerald-600" checked={form.indication === o.val} onChange={() => set("indication", o.val)} />
                    {o.fr}
                  </label>
                ))}
              </div>
              {form.indication === "autre" && (
                <input type="text" placeholder="Précisez / Wessf" value={form.indicationAutre} onChange={(e) => set("indicationAutre", e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              )}
            </div>

            <div>
              <Label fr="Q8 — Depuis combien de temps prenez-vous ce médicament ?" dar="Shhal men wqt w nta katakhdo ?" required />
              <RadioGroup
                value={form.duree}
                onChange={(v) => set("duree", v)}
                options={[
                  { val: "<1sem", fr: "Moins d'une semaine", dar: "Dun simana" },
                  { val: "1-4sem", fr: "1 à 4 semaines", dar: "Simana l arb3a simanat" },
                  { val: "1-6mois", fr: "1 à 6 mois", dar: "Shher l sitta shhor" },
                  { val: ">6mois", fr: "Plus de 6 mois", dar: "Fuq sitta shhor" },
                  { val: "nsp", fr: "Je ne sais pas", dar: "Ma3raftsh" },
                ]}
              />
            </div>

            <div>
              <Label fr="Q9 — Qui vous a prescrit ce médicament ?" dar="Shkun 3tak had dwa ?" required />
              <RadioGroup
                value={form.prescripteur}
                onChange={(v) => set("prescripteur", v)}
                options={[
                  { val: "medecin", fr: "Un médecin", dar: "Tbib" },
                  { val: "pharmacien", fr: "Un pharmacien", dar: "Sqali" },
                  { val: "soi-meme", fr: "Je l'ai acheté moi-même", dar: "Shrihu b rassi" },
                  { val: "proche", fr: "Un proche", dar: "Wahd mn l-3ayla aw sshab" },
                  { val: "autre", fr: "Autre", dar: "Khour" },
                ]}
              />
            </div>
          </div>
        )}

        {/* ── Section 3 : Ce qui s'est passé ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label fr="Q10 — Sur quelle partie du corps avez-vous remarqué le problème ?" dar="Fin f jesdek lqiti l-mushkil ?" required />
              <p className="text-xs text-gray-500 mb-3">Vous pouvez sélectionner plusieurs zones / Momkin tkhtar bzaf d-zonat</p>
              <div className="grid grid-cols-2 gap-2">
                {ZONES_CORPS.map((z) => (
                  <label key={z.id} className={`flex items-start gap-2 p-3 rounded-xl border cursor-pointer transition-all ${form.zonesCorps.includes(z.id) ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="checkbox" className="accent-emerald-600 mt-0.5" checked={form.zonesCorps.includes(z.id)} onChange={() => toggleArray("zonesCorps", z.id)} />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{z.label}</div>
                      <div className="text-xs text-gray-500">{z.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label fr="Q11 — Quels symptômes avez-vous ressentis ?" dar="Ashmen a3rad hessiti bihom ?" required />
              <div className="space-y-4">
                {SYMPTOMES_CATEGORIES.map((cat) => (
                  <div key={cat.cat} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{cat.cat}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {cat.items.map((s) => (
                        <CheckboxItem
                          key={s}
                          label={s}
                          checked={form.symptomes.includes(s)}
                          onChange={() => toggleArray("symptomes", s)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label fr="Q12 — Décrivez le problème avec vos propres mots" dar="Werref l-mushkil b kelmatk nta" required />
              <InfoBox text="Pas besoin d'utiliser des mots médicaux — écrivez comme vous le raconteriez à un ami." textDar="Ma khasseksh tkun tbib — hder bhal ma kathed3i l-wahd sshabi" />
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Décrivez ce que vous avez ressenti... / Wessf ashmen haja hessiti bih..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <Label fr="Q13 — Quand ce problème a-t-il commencé par rapport à la prise du médicament ?" dar="Imta bdat had l-mushkil m3a had dwa ?" required />
              <RadioGroup
                value={form.delaiApparition}
                onChange={(v) => set("delaiApparition", v)}
                options={[
                  { val: "meme-jour", fr: "Le jour même de la prise", dar: "Nfs nhar khdit dwa" },
                  { val: "24h", fr: "Dans les 24 heures", dar: "F 24 sa3a" },
                  { val: "2-7j", fr: "Entre 2 et 7 jours", dar: "Bin juji w sbi3 iyam" },
                  { val: ">1sem", fr: "Plus d'une semaine après", dar: "Fuq simana men b3d" },
                  { val: "nsp", fr: "Je ne sais pas", dar: "Ma3raftsh" },
                ]}
              />
            </div>

            <div>
              <Label fr="Q14 — Est-ce que ce problème est toujours présent ?" dar="Wash had l-mushkil mazal kayn ?" required />
              <RadioGroup
                value={form.problemePersiste}
                onChange={(v) => set("problemePersiste", v)}
                options={[
                  { val: "oui", fr: "Oui, toujours", dar: "Iyeh, mazal" },
                  { val: "non", fr: "Non, c'est passé", dar: "La, dat" },
                  { val: "partiel", fr: "Partiellement amélioré", dar: "Hsen shwiya" },
                  { val: "nsp", fr: "Je ne sais pas", dar: "Ma3raftsh" },
                ]}
              />
            </div>
          </div>
        )}

        {/* ── Section 4 : Gravité ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              ⚠️ Si vous avez été hospitalisé(e) ou si votre vie était en danger, votre déclaration sera traitée en priorité.
              <div className="text-xs text-amber-700 mt-1" dir="rtl">Ila dkhhelti l-sbitar aw kan wdaek f khtar, had l-balgha ghatitsaraj b-awlawiya.</div>
            </div>

            <div>
              <Label fr="Q15 — Ce problème vous a-t-il empêché(e) de faire vos activités normales ?" dar="Wash had l-mushkil khallak ma qdersh dir hayatek l-3adiya ?" required />
              <RadioGroup
                value={form.activitesImpactees}
                onChange={(v) => set("activitesImpactees", v)}
                options={[
                  { val: "oui-total", fr: "Oui, complètement", dar: "Iyeh, bezzaf" },
                  { val: "oui-partiel", fr: "Oui, partiellement", dar: "Iyeh, shwiya" },
                  { val: "non", fr: "Non", dar: "La" },
                ]}
              />
            </div>

            <div>
              <Label fr="Q16 — Avez-vous dû aller aux urgences ou êtes-vous resté(e) hospitalisé(e) ?" dar="Wash mshiti l-urgences aw dkhhelti l-sbitar ?" required />
              <RadioGroup
                value={form.urgences}
                onChange={(v) => set("urgences", v)}
                options={[
                  { val: "urgences", fr: "Oui, urgences", dar: "Iyeh, urgences" },
                  { val: "hospitalise", fr: "Oui, hospitalisé(e)", dar: "Iyeh, dkhhelt l-sbitar" },
                  { val: "non", fr: "Non", dar: "La" },
                ]}
              />
            </div>

            <div>
              <Label fr="Q17 — Avez-vous arrêté le médicament ?" dar="Wash wqqefti dwa ?" required />
              <RadioGroup
                value={form.arretMedicament}
                onChange={(v) => set("arretMedicament", v)}
                options={[
                  { val: "oui-seul", fr: "Oui, de moi-même", dar: "Iyeh, b rassi" },
                  { val: "oui-medecin", fr: "Oui, sur conseil du médecin", dar: "Iyeh, l-tbib qal" },
                  { val: "non-continue", fr: "Non, je continue", dar: "La, mazal katakhdo" },
                  { val: "non-fini", fr: "Non, j'ai terminé le traitement normalement", dar: "La, kemmeltu normal" },
                ]}
              />
            </div>

            <div>
              <Label fr="Q18 — Après avoir arrêté, le problème s'est-il amélioré ?" dar="Men b3d ma wqqefti, wash l-mushkil hsen ?" />
              <RadioGroup
                value={form.ameliorationApresArret}
                onChange={(v) => set("ameliorationApresArret", v)}
                options={[
                  { val: "ameliore", fr: "Oui, amélioré", dar: "Iyeh, hsen" },
                  { val: "disparu", fr: "Oui, complètement disparu", dar: "Iyeh, dat bezzaf" },
                  { val: "non", fr: "Non, pas de changement", dar: "La, bqa bhal bhal" },
                  { val: "pas-arrete", fr: "Je n'ai pas arrêté le médicament", dar: "Ma wqqeftsh dwa" },
                ]}
              />
            </div>
          </div>
        )}

        {/* ── Section 5 : Contexte médical ── */}
        {step === 5 && (
          <div className="space-y-6">
            <p className="text-sm text-gray-500 bg-gray-100 rounded-xl px-4 py-2">
              Cette section est optionnelle mais aide à mieux analyser votre déclaration.
            </p>

            <div>
              <Label fr="Q19 — Prenez-vous d'autres médicaments en même temps ?" dar="Wash katakhod diyur dwiyat f nfs l-wqt ?" />
              <InfoBox text="Incluez vitamines, compléments alimentaires, plantes médicinales." textDar="Dakhhel vitamines, plantes, herbes" />
              <RadioGroup
                value={form.autresMedicaments}
                onChange={(v) => set("autresMedicaments", v)}
                options={[
                  { val: "oui", fr: "Oui", dar: "Iyeh" },
                  { val: "non", fr: "Non", dar: "La" },
                  { val: "nsp", fr: "Je ne sais pas", dar: "Ma3raftsh" },
                ]}
              />
              {form.autresMedicaments === "oui" && (
                <textarea
                  rows={2}
                  placeholder="Lesquels ? / Ashmenin ?"
                  value={form.autresMedicamentsDetail}
                  onChange={(e) => set("autresMedicamentsDetail", e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              )}
            </div>

            <div>
              <Label fr="Q20 — Avez-vous des maladies chroniques ?" dar="Wash 3andek mrad mzmen ?" />
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Diabète / Sokkar", "Hypertension / Dhghout", "Cancer / Saratan",
                  "Maladie rénale / Kilwa", "Maladie cardiaque / Qelb", "Asthme / Rbou",
                  "Non / La",
                ].map((item) => (
                  <CheckboxItem
                    key={item}
                    label={item}
                    checked={form.maladiesChroniques.includes(item)}
                    onChange={() => toggleArray("maladiesChroniques", item)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label fr="Q21 — Avez-vous déjà eu une réaction similaire à un médicament par le passé ?" dar="Wash men qbel 3andek reaction bhal hadi m3a dwa ?" />
              <RadioGroup
                value={form.reactionPassee}
                onChange={(v) => set("reactionPassee", v)}
                options={[
                  { val: "oui", fr: "Oui", dar: "Iyeh" },
                  { val: "non", fr: "Non", dar: "La" },
                  { val: "nsp", fr: "Je ne sais pas", dar: "Ma3raftsh" },
                ]}
              />
              {form.reactionPassee === "oui" && (
                <input type="text" placeholder="Lequel / Ashmen dwa ?" value={form.reactionPasseeDetail} onChange={(e) => set("reactionPasseeDetail", e.target.value)}
                  className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              )}
            </div>
          </div>
        )}

        {/* ── Section 6 : Finalisation ── */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <Label fr="Q22 — Avez-vous déjà signalé ce problème à votre médecin ou pharmacien ?" dar="Wash gher 3aref l-tbib aw l-sqali b had l-mushkil ?" />
              <RadioGroup
                value={form.signaleAuMedecin}
                onChange={(v) => set("signaleAuMedecin", v)}
                options={[
                  { val: "medecin", fr: "Oui, au médecin", dar: "Iyeh, l-tbib 3aref" },
                  { val: "pharmacien", fr: "Oui, au pharmacien", dar: "Iyeh, l-sqali 3aref" },
                  { val: "les-deux", fr: "Oui, aux deux", dar: "Iyeh, juj 3arfin" },
                  { val: "non", fr: "Non, pas encore", dar: "La, mazal" },
                  { val: "pas-de-medecin", fr: "Non, je n'en ai pas", dar: "La, ma3andish tbib" },
                ]}
              />
            </div>

            <div>
              <Label fr="Q23 — Avez-vous des documents ou photos à joindre ?" dar="Wash 3andek wthiqa aw sura tzidha ?" />
              <p className="text-xs text-gray-500 mb-2">Ordonnance, résultats d&apos;analyses, photo de la boîte / Ordonance, résultats, sura dla3ba</p>
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl p-6 text-sm text-gray-500 hover:text-emerald-600 transition-all cursor-pointer">
                📎 Joindre un fichier / Zid wthiqa
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={() => set("documents", true)} />
              </label>
            </div>

            {/* Récap */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800 mb-2">Récapitulatif / Mlakhas</p>
              <p>✅ Médicament : {form.medicamentNom || "—"}</p>
              <p>✅ Symptômes sélectionnés : {form.symptomes.length}</p>
              <p>✅ Zones concernées : {form.zonesCorps.length}</p>
              <p>✅ Description : {form.description ? "Remplie" : "Non remplie"}</p>
            </div>

            {/* Consentement */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.consentement ? "border-emerald-500 bg-emerald-50" : "border-gray-300"}`}>
              <input
                type="checkbox"
                className="accent-emerald-600 mt-1"
                checked={form.consentement}
                onChange={(e) => set("consentement", e.target.checked)}
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  ✅ J&apos;accepte que ces informations soient utilisées de manière anonyme pour améliorer la sécurité des médicaments au Maroc. <span className="text-red-500">★ OBLIGATOIRE</span>
                </p>
                <p className="text-xs text-gray-500 mt-1" dir="rtl">
                  🇲🇦 Qbelt bash tstakhdem had l-ma3lumat b-anonymat bach tahsen slamit dwa f l-Maghrib.
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Aucune information permettant de vous identifier ne sera partagée. / Walu mn ma3lumatek l-shkhsiya ghatshared.
                </p>
              </div>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!form.consentement}
              className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all ${form.consentement ? "bg-emerald-600 hover:bg-emerald-700 shadow-md" : "bg-gray-300 cursor-not-allowed"}`}
            >
              Envoyer ma déclaration / Sifet l-balgha →
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ← Précédent
          </button>
          {step < SECTIONS.length && (
            <button
              onClick={() => setStep((s) => Math.min(SECTIONS.length, s + 1))}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all"
            >
              Suivant →
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
