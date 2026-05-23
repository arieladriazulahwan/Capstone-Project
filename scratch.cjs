const fs = require('fs');

let content = fs.readFileSync('frontend/src/pages/AdminMateri.jsx', 'utf-8');

content = content.replace(
  'import { babList, getLevels, filterByLevel } from "../data/levelMap";',
  'import { useBabContext, filterByLevel } from "../context/BabContext";'
);

content = content.replace(
  'const token = localStorage.getItem("token");',
  `const { babList, getLevels, refreshBabs } = useBabContext();
  const [showBabModal, setShowBabModal] = useState(false);
  const [babForm, setBabForm] = useState({ key: "", label: "", title: "", description: "", color: "blue", isEdit: false });
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [levelForm, setLevelForm] = useState({ key: "", title: "", description: "", isEdit: false });
  const token = localStorage.getItem("token");`
);

content = content.replace(
  '  // Filtering for display',
  `
  const saveBab = async () => {
    if (!babForm.key || !babForm.title) return alert("Key dan Title wajib diisi!");
    let newBabs = JSON.parse(JSON.stringify(babList));
    if (babForm.isEdit) {
      newBabs = newBabs.map(b => b.key === babForm.key ? { ...b, label: babForm.label, title: babForm.title, description: babForm.description, color: babForm.color } : b);
    } else {
      if(newBabs.find(b => b.key === babForm.key)) return alert("Key bab sudah ada!");
      newBabs.push({ key: babForm.key, label: babForm.label, title: babForm.title, description: babForm.description, color: babForm.color, levels: [] });
    }
    const res = await fetch(\`\${API_BASE_URL}/api/admin/babs\`, { method: "PUT", headers, body: JSON.stringify({ babs: newBabs }) });
    if (res.ok) { setShowBabModal(false); refreshBabs(); } else alert("Gagal menyimpan Bab");
  };

  const deleteBab = async (key) => {
    const newBabs = babList.filter(b => b.key !== key);
    const res = await fetch(\`\${API_BASE_URL}/api/admin/babs\`, { method: "PUT", headers, body: JSON.stringify({ babs: newBabs }) });
    if (res.ok) { refreshBabs(); setDeleteTarget(null); } else alert("Gagal menghapus Bab");
  };

  const saveLevel = async () => {
    if (!levelForm.key || !levelForm.title) return alert("Key dan Title wajib diisi!");
    let newBabs = JSON.parse(JSON.stringify(babList));
    let bab = newBabs.find(b => b.key === selectedBab);
    if (!bab) return;
    if (!bab.levels) bab.levels = [];

    if (levelForm.isEdit) {
      bab.levels = bab.levels.map(l => l.key === levelForm.key ? { ...l, title: levelForm.title, description: levelForm.description } : l);
    } else {
      if(bab.levels.find(l => l.key === levelForm.key)) return alert("Key level sudah ada!");
      bab.levels.push({ key: levelForm.key, title: levelForm.title, description: levelForm.description });
    }
    const res = await fetch(\`\${API_BASE_URL}/api/admin/babs\`, { method: "PUT", headers, body: JSON.stringify({ babs: newBabs }) });
    if (res.ok) { setShowLevelModal(false); refreshBabs(); } else alert("Gagal menyimpan Level");
  };

  const deleteLevel = async (key) => {
    let newBabs = JSON.parse(JSON.stringify(babList));
    let bab = newBabs.find(b => b.key === selectedBab);
    bab.levels = bab.levels.filter(l => l.key !== key);
    const res = await fetch(\`\${API_BASE_URL}/api/admin/babs\`, { method: "PUT", headers, body: JSON.stringify({ babs: newBabs }) });
    if (res.ok) { refreshBabs(); setDeleteTarget(null); } else alert("Gagal menghapus Level");
  };

  // Filtering for display`
);

content = content.replace(
  '{/* LEVEL 1: BAB SELECTION */}',
  `{/* LEVEL 1: BAB SELECTION */}
            {!selectedBab && (
              <>
                <div className="flex justify-end mb-4">
                  <button onClick={() => { setBabForm({ key: "", label: "", title: "", description: "", color: "blue", isEdit: false }); setShowBabModal(true); }} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition">＋ Tambah Bab</button>
                </div>`
);

content = content.replace(
  /<div key={bab\.key} onClick=\{\(\) => setSelectedBab\(bab\.key\)\}/g,
  `<div key={bab.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-300 transition group overflow-hidden">
                    <div onClick={() => setSelectedBab(bab.key)} className="p-6 cursor-pointer">`
);

content = content.replace(
  '<p className="text-sm text-gray-500">{bab.description}</p>',
  `<p className="text-sm text-gray-500">{bab.description}</p>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex gap-4">
                      <button onClick={(e) => { e.stopPropagation(); setBabForm({ ...bab, isEdit: true }); setShowBabModal(true); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "bab", id: bab.key, title: bab.title }); }} className="text-sm font-semibold text-red-600 hover:text-red-800">Hapus</button>
                    </div>`
);

content = content.replace(
  `                  </div>
                ))}
              </div>
            )}`,
  `                ))}
              </div>
              </>
            )}`
);

// Do the same for levels
content = content.replace(
  '{/* LEVEL 2: LEVEL SELECTION */}',
  `{/* LEVEL 2: LEVEL SELECTION */}
            {selectedBab && !selectedLevel && (
              <>
                <div className="flex justify-end mb-4">
                  <button onClick={() => { setLevelForm({ key: "", title: "", description: "", isEdit: false }); setShowLevelModal(true); }} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition">＋ Tambah Level</button>
                </div>`
);

content = content.replace(
  /<div key={level\.key} onClick=\{\(\) => setSelectedLevel\(level\)\}/g,
  `<div key={level.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-300 transition overflow-hidden">
                    <div onClick={() => setSelectedLevel(level)} className="p-5 cursor-pointer">`
);

content = content.replace(
  '<p className="text-xs text-gray-500 line-clamp-2">{level.description}</p>',
  `<p className="text-xs text-gray-500 line-clamp-2">{level.description}</p>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex gap-4">
                      <button onClick={(e) => { e.stopPropagation(); setLevelForm({ ...level, isEdit: true }); setShowLevelModal(true); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "level", id: level.key, title: level.title }); }} className="text-sm font-semibold text-red-600 hover:text-red-800">Hapus</button>
                    </div>`
);

content = content.replace(
  `                  </div>
                ))}
              </div>
            )}`,
  `                ))}
              </div>
              </>
            )}`
);

content = content.replace(
  '      <BottomNavAdmin />',
  `      <BottomNavAdmin />
      {/* BAB MODAL */}
      {showBabModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-4">{babForm.isEdit ? "Edit Bab" : "Tambah Bab"}</h3>
            <div className="space-y-4">
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Key (Contoh: bab4)</label><input type="text" value={babForm.key} disabled={babForm.isEdit} onChange={e => setBabForm({...babForm, key: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 disabled:bg-gray-100" /></div>
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Label (Contoh: BAB 4)</label><input type="text" value={babForm.label} onChange={e => setBabForm({...babForm, label: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Title</label><input type="text" value={babForm.title} onChange={e => setBabForm({...babForm, title: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Description</label><input type="text" value={babForm.description} onChange={e => setBabForm({...babForm, description: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowBabModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition">Batal</button>
              <button onClick={saveBab} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL MODAL */}
      {showLevelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-4">{levelForm.isEdit ? "Edit Level" : "Tambah Level"}</h3>
            <div className="space-y-4">
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Key (Contoh: kata-sifat)</label><input type="text" value={levelForm.key} disabled={levelForm.isEdit} onChange={e => setLevelForm({...levelForm, key: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 disabled:bg-gray-100" /></div>
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Title (Contoh: Kata Sifat)</label><input type="text" value={levelForm.title} onChange={e => setLevelForm({...levelForm, title: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Description</label><input type="text" value={levelForm.description} onChange={e => setLevelForm({...levelForm, description: e.target.value})} className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowLevelModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition">Batal</button>
              <button onClick={saveLevel} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30">Simpan</button>
            </div>
          </div>
        </div>
      )}`
);

content = content.replace(
  'else if (deleteTarget.type === "quiz") deleteQuiz(deleteTarget.id);',
  `else if (deleteTarget.type === "quiz") deleteQuiz(deleteTarget.id);
          else if (deleteTarget.type === "bab") deleteBab(deleteTarget.id);
          else if (deleteTarget.type === "level") deleteLevel(deleteTarget.id);`
);

fs.writeFileSync('frontend/src/pages/AdminMateri.jsx', content);
