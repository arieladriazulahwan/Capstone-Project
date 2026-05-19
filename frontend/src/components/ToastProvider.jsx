import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export const ToastContext = createContext(null);

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
    text.includes("tidak") ||
    text.includes("invalid")
  ) {
    return "error";
  }

  return "info";
};

const styles = {
  success: {
    icon: CheckCircle2,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    iconColor: "text-green-600",
    bar: "bg-green-500",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    iconColor: "text-red-600",
    bar: "bg-red-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    iconColor: "text-blue-600",
    bar: "bg-blue-500",
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
              className={`${style.bg} ${style.border} border rounded-2xl shadow-xl overflow-hidden animate-[toast-in_180ms_ease-out]`}
            >
              <div className={`${style.bar} h-1`}></div>
              <div className="p-4 flex items-start gap-3">
                <div className={`${style.iconColor} mt-0.5`}>
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
                  <X size={18} />
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
