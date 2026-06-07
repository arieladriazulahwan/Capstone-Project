import SoraKailiLogo from "./SoraKailiLogo";
import { FiBookOpen, FiTarget } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";

function AuthPageShell({
  children,
  eyebrow = "Sora Kaili",
  title,
  subtitle,
  tone = "green",
}) {
  const features = [
    { label: "Materi", Icon: FiBookOpen, color: "text-kaili" },
    { label: "Latihan", Icon: FiTarget, color: "text-red-500" },
    { label: "Kuis", Icon: FaTrophy, color: "text-amber-500" }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden genz-bg px-4 py-8 flex items-center justify-center">
      <div className="pointer-events-none absolute left-8 top-16 h-48 w-48 rounded-full bg-sora/10 blur-3xl landing-float"></div>
      <div className="pointer-events-none absolute bottom-16 right-8 h-64 w-64 rounded-full bg-kaili/15 blur-3xl landing-float-slow"></div>

      <div className="relative grid w-full max-w-5xl items-center gap-6 md:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden md:block landing-rise">
          <div className="mb-5 inline-flex rounded-full bg-white/60 backdrop-blur-md px-5 py-2 text-sm font-black text-kaili shadow-soft-sora border border-sora/5">
            {eyebrow}
          </div>
          <h1 className="mb-4 text-5xl font-black leading-tight text-sora drop-shadow-sm">
            {title}
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-sora/60 font-medium">
            {subtitle}
          </p>
          <div className="mt-8 grid max-w-sm grid-cols-3 gap-3">
            {features.map((item) => (
              <div key={item.label} className="flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md p-3 text-center shadow-soft-sora">
                <item.Icon className={item.color} />
                <p className="text-sm font-bold text-sora">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-rise-delay rounded-[2.5rem] border border-white/60 bg-white/60 p-6 shadow-soft-sora backdrop-blur-xl md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>

          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPageShell;
