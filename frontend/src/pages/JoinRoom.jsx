import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinRoom() {

  const [code, setCode] = useState("");

  const navigate = useNavigate();

  const joinRoom = async () => {

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:3000/api/rooms/join/${code}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );

    const data = await res.json();

    if (res.ok) {

      navigate(`/quiz/${data.room_code}`);

    } else {

      alert("Kode room salah");

    }
  };

  return (
    <div className="p-4">

      <input
        type="text"
        placeholder="Masukkan kode room"
        className="w-full border rounded-xl p-4 mb-3"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        onClick={joinRoom}
        className="w-full bg-green-500 text-white p-4 rounded-xl"
      >
        Masuk Room
      </button>

    </div>
  );
}

export default JoinRoom;