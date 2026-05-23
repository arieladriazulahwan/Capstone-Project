function ConfirmDialog({
  open,
  title = "Konfirmasi",
  message,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-white/70 bg-white p-5 shadow-2xl">
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
            isDanger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          }`}
        >
          <span className="text-2xl">{isDanger ? "!" : "i"}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{message}</p>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow ${
              isDanger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
