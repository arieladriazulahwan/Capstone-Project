import SoraKailiLogo from "./SoraKailiLogo";

function AuthPageShell({
  children,
  eyebrow = "Sora Kaili",
  title,
  subtitle,
  tone = "green",
}) {
  const toneClass =
    tone === "blue"
      ? "from-blue-50 via-white to-green-50 text-blue-700 bg-blue-100"
      : "from-green-50 via-white to-blue-50 text-green-700 bg-green-100";

  return (
    <div className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${toneClass.split(" ").slice(0, 3).join(" ")} px-4 py-8 flex items-center justify-center`}>
      <div className="pointer-events-none absolute left-8 top-16 h-28 w-28 rounded-full bg-green-200/50 blur-3xl landing-float"></div>
      <div className="pointer-events-none absolute bottom-16 right-8 h-32 w-32 rounded-full bg-yellow-200/60 blur-3xl landing-float-slow"></div>

      <div className="relative grid w-full max-w-5xl items-center gap-6 md:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden md:block landing-rise">
          <div className="mb-5 inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-green-700 shadow-sm">
            {eyebrow}
          </div>
          <h1 className="mb-4 text-5xl font-black leading-tight text-gray-900">
            {title}
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-gray-600">
            {subtitle}
          </p>
          <div className="mt-8 grid max-w-sm grid-cols-3 gap-3">
            {["Materi", "Latihan", "Kuis"].map((item) => (
              <div key={item} className="rounded-2xl border border-white bg-white/80 p-3 text-center shadow-sm">
                <p className="text-sm font-bold text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="landing-rise-delay rounded-[2rem] border border-white bg-white/90 p-6 shadow-2xl backdrop-blur md:p-8">
          <div className="mb-2 flex justify-center">
            <SoraKailiLogo className="h-32 w-52" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthPageShell;
