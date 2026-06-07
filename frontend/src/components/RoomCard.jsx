import { FiClock, FiEye, FiKey, FiLayers } from "react-icons/fi";

import { useNavigate } from "react-router-dom";

function RoomCard({ room }) {
  const navigate = useNavigate();
  const roomCode = room.code || room.room_code;

  return (
    <div className="rounded-3xl border border-sora/10 bg-white/60 backdrop-blur-xl p-4 shadow-soft-sora transition-all duration-300 hover:shadow-md hover:bg-cream/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sora text-cream shadow-md">
              <FiLayers size={23} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-sora">
                {room.title}
              </h3>
              <p className="truncate text-sm text-sora/60 font-medium">
                {room.category || "Tanpa kategori"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigator.clipboard.writeText(roomCode);
                alert(`Kode room "${roomCode}" berhasil disalin!`);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-sora/10 hover:bg-sora/20 cursor-pointer px-3 py-1 text-xs font-bold text-sora transition"
              title="Klik untuk salin kode"
            >
              <FiKey size={14} />
              {roomCode}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-kaili/10 px-3 py-1 text-xs font-bold text-kaili">
              <FiClock size={14} />
              {Number(room.timer) || 0}s
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/guru/room/${room.id}`)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sora px-4 py-3 font-black text-white shadow-soft-sora transition-all hover:scale-105 btn-bouncy md:mt-12"
        >
          <FiEye size={18} />
          Detail
        </button>
      </div>
    </div>
  );
}

export default RoomCard;
