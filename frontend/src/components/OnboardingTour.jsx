import { useState } from "react";
import { FiBookOpen, FiChevronRight, FiHeart, FiTarget } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";


const steps = [
  {
    icon: FiBookOpen,
    title: "Kamus Bahasa Kaili",
    description:
      "Cari arti kata dan terjemahkan kalimat dari Bahasa Indonesia ke Bahasa Kaili. Kamu juga bisa menyimpan kosakata favoritmu!",
    color: "from-green-500 to-emerald-600",
  },
  {
    icon: FiTarget,
    title: "Level & Bab Pembelajaran",
    description:
      "Pelajari kosakata dan kalimat secara bertahap mulai dari BAB 1. Selesaikan level untuk membuka materi berikutnya.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: FiHeart,
    title: "Simpan Favorit",
    description:
      "Tandai kosakata favoritmu agar mudah diakses kembali kapan saja dari halaman Dashboard.",
    color: "from-rose-500 to-pink-600",
  },
  {
    icon: FaTrophy,
    title: "Room Kuis dari Guru",
    description:
      "Masukkan kode room dari guru untuk mengerjakan kuis interaktif dan dapatkan XP untuk naik level!",
    color: "from-amber-500 to-orange-600",
  },
];

export default function OnboardingTour({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (current < steps.length - 1) setCurrent(current + 1);
    else onComplete();
  };

  const handlePrev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header gradient */}
        <div
          className={`bg-gradient-to-br ${step.color} p-8 text-center text-white relative`}
        >
          {/* Step counter */}
          <div className="absolute top-4 right-4 text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur">
            {current + 1} / {steps.length}
          </div>

          <div className="mx-auto mb-4 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
            <StepIcon size={32} />
          </div>
          <h2 className="text-xl font-bold">{step.title}</h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6 leading-relaxed">
            {step.description}
          </p>

          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? "bg-green-500 w-6"
                    : i < current
                      ? "bg-green-300 w-2.5"
                      : "bg-gray-200 w-2.5"
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {current > 0 ? (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition"
              >
                Kembali
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition"
              >
                Lewati
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold shadow-md hover:bg-green-600 transition flex items-center justify-center gap-1"
            >
              {current < steps.length - 1 ? (
                <>
                  <span>Lanjut</span>
                  <FiChevronRight size={18} />
                </>
              ) : (
                "Mulai Belajar!"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
