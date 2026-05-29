import { Clock3, Eye, KeyRound, Layers3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function RoomCard({ room }) {
  const navigate = useNavigate();
  const roomCode = room.code || room.room_code;

  return (
    <div className="teacher-room-card rounded-3xl border border-white/80 bg-white/90 p-4 shadow">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <Layers3 size={23} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-black text-gray-900">
                {room.title}
              </h3>
              <p className="truncate text-sm text-gray-500">
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
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 hover:bg-blue-100 cursor-pointer px-3 py-1 text-xs font-bold text-blue-700 transition"
              title="Klik untuk salin kode"
            >
              <KeyRound size={14} />
              {roomCode}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
              <Clock3 size={14} />
              {Number(room.timer) || 0}s
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/guru/room/${room.id}`)}
          className="teacher-room-action inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 font-bold text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-600 md:mt-12"
        >
          <Eye size={18} />
          Detail
        </button>
      </div>
    </div>
  );
}

export default RoomCard;
