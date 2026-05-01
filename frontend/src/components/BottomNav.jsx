function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 md:hidden">

      <button className="text-green-600 text-sm">
        🏠 <br /> Home
      </button>

      <button className="text-gray-400 text-sm">
        📖 <br /> Kosakata
      </button>

      <button className="text-gray-400 text-sm">
        📊 <br /> Riwayat
      </button>

    </div>
  );
}

export default BottomNav;