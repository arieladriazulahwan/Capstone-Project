import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";
import { FaFire } from "react-icons/fa";


export const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  return context || { showToast: () => {} };
};

const getToastType = (message) => {
  const text = String(message).toLowerCase();

  if (
    text.includes("berhasil") ||
    text.includes("benar") ||
    text.includes("selesai") ||
    text.includes("level up")
  ) {
    return "success";
  }

  if (
    text.includes("gagal") ||
    text.includes("salah") ||
    text.includes("error") ||
    text.includes("invalid")
  ) {
    return "error";
  }

  if (
    text.includes("wajib") ||
    text.includes("minimal") ||
    text.includes("masukkan") ||
    text.includes("waktu habis") ||
    text.includes("tidak") ||
    text.includes("hapus")
  ) {
    return "warning";
  }

  return "info";
};

const styles = {
  success: {
    icon: FiCheckCircle,
    bg: "bg-white",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-green-600 bg-green-100",
    bar: "bg-gradient-to-r from-green-400 to-emerald-500",
  },
  error: {
    icon: FiAlertCircle,
    bg: "bg-white",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-600 bg-red-100",
    bar: "bg-gradient-to-r from-red-400 to-rose-500",
  },
  info: {
    icon: FiInfo,
    bg: "bg-white",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-600 bg-blue-100",
    bar: "bg-gradient-to-r from-blue-400 to-sky-500",
  },
  warning: {
    icon: FaFire,
    bg: "bg-white",
    border: "border-orange-200",
    text: "text-orange-800",
    iconColor: "text-orange-600 bg-orange-100",
    bar: "bg-gradient-to-r from-orange-400 to-amber-500",
  },
};

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type) => {
    const id = Date.now() + Math.random();
    const normalizedMessage = String(message || "");
    const toastType = type || getToastType(normalizedMessage);

    setToasts((current) => [
      ...current,
      {
        id,
        message: normalizedMessage,
        type: toastType,
      },
    ]);

    window.setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (message) => {
      showToast(message);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed bottom-5 left-4 right-4 z-[9999] flex flex-col gap-3 md:left-auto md:right-6 md:w-96">
        {toasts.map((toast) => {
          const style = styles[toast.type] || styles.info;
          const Icon = style.icon;
          const lines = toast.message.split("\n").filter(Boolean);
          const title = lines[0] || "Notifikasi";
          const detail = lines.slice(1).join(" - ");

          return (
            <div
              key={toast.id}
              className={`${style.bg} ${style.border} border rounded-2xl shadow-2xl overflow-hidden animate-[toast-in_180ms_ease-out]`}
            >
              <div className={`${style.bar} h-1`}></div>
              <div className="p-4 flex items-start gap-3">
                <div className={`${style.iconColor} mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl`}>
                  <Icon size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`${style.text} font-bold leading-snug`}>
                    {title}
                  </p>
                  {detail && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {detail}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Tutup notifikasi"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
