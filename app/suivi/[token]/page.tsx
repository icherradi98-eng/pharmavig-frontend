"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { api, type CheckinPublicOut } from "@/lib/api";
import { type Lang, type Step, SYMPTOM_GROUPS, STOP_REASONS, T } from "./_constants";
import { Shell, CenterScreen } from "./_components/Shell";
import { BigButton } from "./_components/BigButton";

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
  const [photoError, setPhotoError] = useState<string | null>(null);
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
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_BYTES = 2 * 1024 * 1024;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoError(t.photoFormatError);
      e.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setPhotoError(t.photoSizeError);
      e.target.value = "";
      return;
    }
    setPhotoError(null);
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
                      className={`text-sm font-medium px-3.5 py-2 rounded-full border transition-colors ${selectedSymptoms.includes(c.fr) ? "text-white border-transparent" : "bg-white text-gray-700 border-gray-300"}`}
                      style={selectedSymptoms.includes(c.fr) ? { background: "#0F5B57" } : undefined}
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
                <button onClick={() => { setPhoto(null); fileInputRef.current?.click(); }} className="text-sm font-medium" style={{ color: "#0F5B57" }}>{t.retake}</button>
              </div>
            ) : (
              <BigButton color="gray" onClick={() => fileInputRef.current?.click()}>{t.takePhoto}</BigButton>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
            {photoError && (
              <p className="text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{photoError}</p>
            )}
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
