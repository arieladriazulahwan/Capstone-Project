import { useNavigate } from "react-router-dom";

function RoomCard({ room }) {

  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-4 shadow">

      <div className="flex justify-between items-start">

        <div>
          <h3 className="font-bold text-lg">
            {room.title}
          </h3>

          <p className="text-sm text-gray-500">
            {room.category}
          </p>
        </div>

        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
          {room.room_code}
        </span>
      </div>

      <button
        onClick={() =>
          navigate(`/guru/room/${room.id}`)
        }
        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl"
      >
        Lihat Detail
      </button>
    </div>
  );
}

export default RoomCard;