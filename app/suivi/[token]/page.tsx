"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { api, type CheckinPublicOut } from "@/lib/api";

type Lang = "fr" | "darija";

const SYMPTOM_GROUPS: { icon: string; label: { fr: string; darija: string }; chips: { fr: string; darija: string }[] }[] = [
  { icon: "🔴", label: { fr: "Peau", darija: "الجلد" }, chips: [
    { fr: "Boutons", darija: "حبوب" },
    { fr: "Démangeaisons", darija: "حكة" },
    { fr: "Rougeurs", darija: "حمرة" },
    { fr: "Gonflement", darija: "تورم" },
  ]},
  { icon: "🫁", label: { fr: "Respiration", darija: "التنفس" }, chips: [
    { fr: "Essoufflement", darija: "ضيق النفس" },
    { fr: "Toux", darija: "كحة" },
    { fr: "Douleur thoracique", darija: "وجع الصدر" },
  ]},
  { icon: "🤢", label: { fr: "Digestif", darija: "المعدة" }, chips: [
    { fr: "Nausées", darija: "غثيان" },
    { fr: "Vomissements", darija: "قيء" },
    { fr: "Diarrhée", darija: "إسهال" },
    { fr: "Douleur ventre", darija: "وجع الكرش" },
  ]},
  { icon: "💪", label: { fr: "Muscles", darija: "الجسم" }, chips: [
    { fr: "Douleurs musculaires", darija: "وجع العضلات" },
    { fr: "Fatigue intense", darija: "تعب شديد" },
    { fr: "Faiblesse", darija: "ضعف" },
  ]},
  { icon: "🧠", label: { fr: "Neurologique", darija: "الراس" }, chips: [
    { fr: "Maux de tête", darija: "صداع" },
    { fr: "Vertiges", darija: "دوخة" },
    { fr: "Confusion", darija: "تشويش" },
  ]},
  { icon: "❤️", label: { fr: "Cardiaque", darija: "القلب" }, chips: [
    { fr: "Palpitations", darija: "خفقان" },
    { fr: "Douleur poitrine", darija: "وجع صدر" },
  ]},
  { icon: "🌡️", label: { fr: "Général", darija: "عام" }, chips: [
    { fr: "Fièvre", darija: "سخانة" },
    { fr: "Frissons", darija: "قشعريرة" },
    { fr: "Perte d'appétit", darija: "ما كلاش" },
  ]},
];

const STOP_REASONS = [
  { fr: "Effets secondaires", darija: "أعراض جانبية" },
  { fr: "Médicament terminé", darija: "سالات الدواء" },
  { fr: "Changement de traitement", darija: "بدلت الدواء" },
  { fr: "Autre raison", darija: "سبب آخر" },
];

const T = {
  fr: {
    headerTitle: "Suivi de votre traitement",
    day: (x: number) => `Jour ${x} depuis le début`,
    q1: "Depuis votre dernière prise, avez-vous remarqué quelque chose d'inhabituel ?",
    yes: "OUI, j'ai quelque chose à signaler",
    no: "NON, tout va bien",
    stop: "Je ne prends plus ce médicament",
    thanksNo: "Merci pour votre réponse.\nVotre médecin en est informé.",
    nextIn: (x: number) => `Prochain suivi dans ${x} jour${x > 1 ? "s" : ""}.`,
    stopWhy: "Pouvez-vous nous dire pourquoi ?",
    q2: "Comment décririez-vous ce que vous ressentez ?",
    other: "Autre chose ? Décrivez en quelques mots",
    q3: "Pouvez-vous prendre une photo ?",
    takePhoto: "📷 Prendre une photo",
    skip: "Passer cette étape",
    retake: "Reprendre",
    confirm: "Confirmer et envoyer",
    final: "Merci. Votre médecin va être prévenu.\nEn cas d'urgence, appelez le 15 ou rendez-vous aux urgences les plus proches.",
    ended: "Le suivi de ce traitement est terminé. Merci pour votre participation.",
    loading: "Chargement...",
    notFound: "Lien de suivi introuvable ou expiré.",
    next: "Continuer",
    back: "Retour",
  },
  darija: {
    headerTitle: "متابعة ديال الدواء ديالك",
    day: (x: number) => `النهار ${x} من بداية العلاج`,
    q1: "منين بديتي تاخد الدواء، واش لقيتي شي حاجة مزيانة؟",
    yes: "آيه، عندي شي حاجة",
    no: "لا، كلشي مزيان",
    stop: "ما بقيتش كاتاخد الدواء",
    thanksNo: "شكراً على الجواب ديالك.\nالدكتور ديالك توصل بالخبر.",
    nextIn: (x: number) => `المتابعة الجاية من بعد ${x} يوم.`,
    stopWhy: "واش تقدر تقول لينا علاش؟",
    q2: "كيفاش كتحس بحالك؟",
    other: "شي حاجة أخرى؟ كتب شوية كلمات",
    q3: "واش تقدر تاخد صورة؟",
    takePhoto: "📷 خود تصويرة",
    skip: "تخطى هاد المرحلة",
    retake: "عاود خود",
    confirm: "أكد و صيفط",
    final: "شكراً. الدكتور ديالك غادي يتواصل معاك.\nفحالة الطوارئ، اتصل ب 15 ولا سير للمستعجلات.",
    ended: "المتابعة ديال هاد العلاج سالات. شكراً على المشاركة.",
    loading: "كيتحمل...",
    notFound: "الرابط ديال المتابعة ماكاينش ولا سالا وقتو.",
    next: "تابع",
    back: "رجوع",
  },
} as const;

type Step = "intro" | "q1-yes" | "q1-stop" | "q2" | "q3" | "done" | "done-no" | "done-stop";

export default function SuiviPatient() {
  const { token } = useParams<{ token: string }>();
  const [lang, setLang] = useState<Lang>("fr");
  const t = T[lang];
  const dir = lang === "darija" ? "rtl" : "ltr";

  const [info, setInfo] = useState<CheckinPublicOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [step, setStep] = useState<Step>("intro");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [nextInDays, setNextInDays] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getCheckinPublic(token)
      .then(setInfo)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  function toggleSymptom(fr: string) {
    setSelectedSymptoms((cur) => (cur.includes(fr) ? cur.filter((s) => s !== fr) : [...cur, fr]));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function submitNo() {
    setSubmitting(true);
    try {
      const res = await api.submitCheckin(token, { has_symptoms: false });
      setNextInDays(res.next_checkin_in_days ?? null);
      setStep("done-no");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitStop(reasonFr: string) {
    setSubmitting(true);
    try {
      await api.submitCheckin(token, { has_symptoms: false, stopped_treatment: true, stop_reason: reasonFr });
      setStep("done-stop");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitYes() {
    setSubmitting(true);
    try {
      await api.submitCheckin(token, {
        has_symptoms: true,
        symptoms: selectedSymptoms,
        symptoms_other: otherText || undefined,
        photo_data_url: photo || undefined,
      });
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <CenterScreen dir={dir}><p className="text-gray-400 text-sm">{t.loading}</p></CenterScreen>;
  }
  if (error || !info) {
    return <CenterScreen dir={dir}><p className="text-red-500 text-sm text-center px-6">{error || t.notFound}</p></CenterScreen>;
  }
  if (info.monitoring_ended && step === "intro") {
    return (
      <Shell lang={lang} setLang={setLang} dir={dir}>
        <div className="text-center px-6 py-16">
          <div className="text-4xl mb-3">🙏</div>
          <p className="text-gray-700 whitespace-pre-line">{t.ended}</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell lang={lang} setLang={setLang} dir={dir}>
      <div className="px-6 pt-2 pb-10">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold text-gray-900">{t.headerTitle}</h1>
          <p className="text-gray-500 text-sm mt-1">{info.drug_dci} — {t.day(info.days_since_start)}</p>
        </div>

        {step === "intro" && (
          <div className="space-y-3">
            <p className="text-center text-gray-700 font-medium px-2">{t.q1}</p>
            <BigButton color="emerald" onClick={() => setStep("q2")}>{t.yes}</BigButton>
            <BigButton color="gray" onClick={submitNo} disabled={submitting}>{t.no}</BigButton>
            <BigButton color="amber" onClick={() => setStep("q1-stop")}>{t.stop}</BigButton>
          </div>
        )}

        {step === "q1-stop" && (
          <div className="space-y-3">
            <p className="text-center text-gray-700 font-medium px-2">{t.stopWhy}</p>
            {STOP_REASONS.map((r) => (
              <BigButton key={r.fr} color="gray" onClick={() => submitStop(r.fr)} disabled={submitting}>
                {lang === "fr" ? r.fr : r.darija}
              </BigButton>
            ))}
            <button onClick={() => setStep("intro")} className="w-full text-sm text-gray-400 mt-2">{t.back}</button>
          </div>
        )}

        {step === "q2" && (
          <div className="space-y-5">
            <p className="text-center text-gray-700 font-medium px-2">{t.q2}</p>
            {SYMPTOM_GROUPS.map((g) => (
              <div key={g.label.fr}>
                <p className="text-xs font-semibold text-gray-400 mb-1.5">{g.icon} {g.label[lang]}</p>
                <div className="flex flex-wrap gap-2">
                  {g.chips.map((c) => (
                    <button
                      key={c.fr}
                      type="button"
                      onClick={() => toggleSymptom(c.fr)}
                      className={`text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${selectedSymptoms.includes(c.fr) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-300"}`}
                    >
                      {c[lang]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-1.5">✍️ {t.other}</p>
              <textarea
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <BigButton color="emerald" onClick={() => setStep("q3")} disabled={selectedSymptoms.length === 0 && !otherText.trim()}>
              {t.next}
            </BigButton>
            <button onClick={() => setStep("intro")} className="w-full text-sm text-gray-400">{t.back}</button>
          </div>
        )}

        {step === "q3" && (
          <div className="space-y-4">
            <p className="text-center text-gray-700 font-medium px-2">{t.q3}</p>
            {photo ? (
              <div className="text-center space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt="aperçu" className="mx-auto max-h-64 rounded-xl border border-gray-200" />
                <button onClick={() => { setPhoto(null); fileInputRef.current?.click(); }} className="text-sm text-emerald-700 font-medium">{t.retake}</button>
              </div>
            ) : (
              <BigButton color="gray" onClick={() => fileInputRef.current?.click()}>{t.takePhoto}</BigButton>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
            <BigButton color="emerald" onClick={submitYes} disabled={submitting}>{t.confirm}</BigButton>
            {!photo && <button onClick={submitYes} disabled={submitting} className="w-full text-sm text-gray-400">{t.skip}</button>}
          </div>
        )}

        {step === "done" && (
          <div className="text-center px-2 py-10">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-700 whitespace-pre-line font-medium">{t.final}</p>
          </div>
        )}

        {step === "done-no" && (
          <div className="text-center px-2 py-10">
            <div className="text-4xl mb-3">🙏</div>
            <p className="text-gray-700 whitespace-pre-line font-medium">{t.thanksNo}</p>
            {nextInDays != null && <p className="text-gray-400 text-sm mt-2">{t.nextIn(nextInDays)}</p>}
          </div>
        )}

        {step === "done-stop" && (
          <div className="text-center px-2 py-10">
            <div className="text-4xl mb-3">🙏</div>
            <p className="text-gray-700 whitespace-pre-line font-medium">{t.thanksNo}</p>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Shell({ lang, setLang, dir, children }: { lang: Lang; setLang: (l: Lang) => void; dir: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={dir}>
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">PV</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">PharmaVig</span>
        </div>
        <div className="flex bg-gray-100 rounded-full p-0.5 text-xs font-medium">
          <button onClick={() => setLang("fr")} className={`px-3 py-1 rounded-full transition-colors ${lang === "fr" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>Français</button>
          <button onClick={() => setLang("darija")} className={`px-3 py-1 rounded-full transition-colors ${lang === "darija" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>الدارجة</button>
        </div>
      </div>
      <div className="flex-1 max-w-md w-full mx-auto">{children}</div>
    </div>
  );
}

function CenterScreen({ dir, children }: { dir: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={dir}>
      {children}
    </div>
  );
}

function BigButton({ children, onClick, color, disabled }: { children: React.ReactNode; onClick: () => void; color: "emerald" | "gray" | "amber"; disabled?: boolean }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
    gray: "bg-white hover:bg-gray-50 text-gray-800 border-gray-300",
    amber: "bg-white hover:bg-amber-50 text-amber-700 border-amber-300",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-base font-semibold py-4 rounded-2xl border-2 transition-colors disabled:opacity-40 ${colors[color]}`}
    >
      {children}
    </button>
  );
}
