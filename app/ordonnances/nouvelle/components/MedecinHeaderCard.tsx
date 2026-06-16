import { type DoctorProfile } from "@/lib/ordonnancier";

export function MedecinHeaderCard({
  doctorName,
  specialite,
  profile,
  onEditProfile,
}: {
  doctorName: string;
  specialite: string;
  profile: DoctorProfile;
  onEditProfile: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">En-tête médecin</h2>
        <button onClick={onEditProfile} className="text-xs text-petrol hover:text-petrol-dark font-medium">
          Modifier mon profil
        </button>
      </div>
      <div className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 text-sm">
        <p className="font-semibold text-gray-900">{doctorName || "Dr. — (complétez votre profil)"}</p>
        {specialite && <p className="text-gray-500">{specialite}</p>}
        <p className="text-gray-400 text-xs mt-1">
          {[profile.numOrdre && `N° Ordre : ${profile.numOrdre}`, profile.etablissement, profile.ville, profile.telephone].filter(Boolean).join(" · ") || "Complétez vos coordonnées pour qu'elles apparaissent sur le PDF"}
        </p>
        <div className="flex items-center gap-4 mt-2">
          {profile.signatureDataUrl && (
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.signatureDataUrl} alt="Signature" className="h-10 object-contain" />
              <p className="text-[10px] text-gray-400">Signature</p>
            </div>
          )}
          {profile.cachetDataUrl && (
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.cachetDataUrl} alt="Cachet" className="h-10 object-contain" />
              <p className="text-[10px] text-gray-400">Cachet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
