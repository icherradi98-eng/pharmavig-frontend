"use client";

/**
 * /dashboard/medecin/surveillance — redirigé vers /dashboard/medecin/suivi
 * (fusion des deux modules identiques — voir CPO roadmap S1.1)
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SurveillanceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/medecin/suivi");
  }, [router]);
  return null;
}
