import Link from "next/link";

const C = {
  petrol: "#0F5B57", gold: "#D4AF37", night: "#1F2D3D",
  cream: "#F7F3EE", creamDark: "#ede8e2",
};

function MaiaLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: C.petrol }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" fill="white" fillOpacity="0.9" />
          <path d="M9 12l2 2 4-4" stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-black text-lg tracking-tight">
        <span style={{ color: C.petrol }}>MAI</span>{" "}
        <span style={{ color: C.gold }}>DAWA</span>
      </span>
    </div>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.cream }}>
      <nav className="sticky top-0 z-40 backdrop-blur-md" style={{ background: "rgba(247,243,238,0.93)", borderBottom: `1px solid ${C.creamDark}` }}>
        <div className="max-w-sm mx-auto px-6 py-3">
          <Link href="/"><MaiaLogo /></Link>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm p-8" style={{ border: `1px solid ${C.creamDark}` }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors";
export const inputStyle = { borderColor: C.creamDark, ["--tw-ring-color" as string]: C.petrol };
export { C };
