import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Favorites() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${API_BASE_URL}/api/favorites`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">❤️ Favorit</h1>

      {data.map((item) => (
        <div key={item.id} className="bg-white p-4 rounded-xl mb-3 shadow">
          <p className="font-semibold">{item.indonesia}</p>

          {item.translations?.map((t, i) => (
            <p key={i} className="text-green-600">
              {t.word} ({t.dialect})
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Favorites;
