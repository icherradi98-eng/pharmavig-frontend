export type Lang = "fr" | "darija";

export type Step = "intro" | "q1-yes" | "q1-stop" | "q2" | "q3" | "done" | "done-no" | "done-stop";

export const SYMPTOM_GROUPS: { icon: string; label: { fr: string; darija: string }; chips: { fr: string; darija: string }[] }[] = [
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

export const STOP_REASONS = [
  { fr: "Effets secondaires", darija: "أعراض جانبية" },
  { fr: "Médicament terminé", darija: "سالات الدواء" },
  { fr: "Changement de traitement", darija: "بدلت الدواء" },
  { fr: "Autre raison", darija: "سبب آخر" },
];

export const T = {
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
    photoFormatError: "Format non autorisé. Utilisez une photo JPEG, PNG ou WebP.",
    photoSizeError: "La photo est trop volumineuse (maximum 2 Mo).",
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
    photoFormatError: "الصيغة ماشي مسموحة. استعمل تصويرة JPEG ولا PNG ولا WebP.",
    photoSizeError: "التصويرة كبيرة بزاف (الحد الأقصى 2 ميغا).",
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
