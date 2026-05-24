import { useEffect, useState } from "react";
import NavbarAdmin from "../components/NavbarAdmin";
import SidebarAdmin from "../components/SidebarAdmin";
import BottomNavAdmin from "../components/BottomNavAdmin";
import ConfirmDialog from "../components/ConfirmDialog";
import { babList as initialBabList, getLevels as getInitialLevels, filterByLevel } from "../data/levelMap";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API = `${API_BASE_URL}/api/admin`;
const MAX_LESSON_IMAGE_SIZE = 50 * 1024 * 1024;

const emptyLessonItem = { indo: "", kaili: "", tipe: "kosakata", category: "", image: "" };
const emptyPracticeItem = { category: "", question: "", options: ["", "", "", ""], answer: "", image: "" };
const emptyQuizItem = {
  type: "multiple",
  answerType: "pilihan",
  question: "",
  options: ["", "", "", ""],
  blocks: ["", "", "", ""],
  answerBlocks: [],
  answer: "",
  image: "",
};
const buildEditableBabs = () =>
  initialBabList.map((bab) => ({
    ...bab,
    levels: getInitialLevels(bab.key),
  }));

function AdminMateri() {
  const [user, setUser] = useState(null);
  const [selectedDialect, setSelectedDialect] = useState("ledo");
  const [selectedBab, setSelectedBab] = useState(null); // string e.g. "bab1"
  const [selectedLevel, setSelectedLevel] = useState(null); // object e.g. { key: "kata-benda", title: "Kata benda" }
  const [tab, setTab] = useState("materi");

  // Data arrays for the selected Bab (we need the full array to save correctly without deleting other levels)
  const [fullBabLessons, setFullBabLessons] = useState([]);
  const [fullBabPractices, setFullBabPractices] = useState([]);
  const [allQuizzes, setAllQuizzes] = useState([]); // all quizzes across all babs
  const [loading, setLoading] = useState(false);

  // Modals
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [lessonForm, setLessonForm] = useState({ ...emptyLessonItem });
  const [editLessonIndex, setEditLessonIndex] = useState(null);

  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceForm, setPracticeForm] = useState({ ...emptyPracticeItem });
  const [editPracticeIndex, setEditPracticeIndex] = useState(null);

  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({ ...emptyQuizItem });
  const [editQuiz, setEditQuiz] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editableBabs, setEditableBabs] = useState(buildEditableBabs);

  // const { babList, getLevels, refreshBabs } = useBabContext();
  const [showBabModal, setShowBabModal] = useState(false);
  const [babForm, setBabForm] = useState({ key: "", label: "", title: "", description: "", color: "blue", isEdit: false });
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [levelForm, setLevelForm] = useState({ key: "", title: "", description: "", isEdit: false });
  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  const getLevels = (babKey) =>
    editableBabs.find((bab) => bab.key === babKey)?.levels || [];
  const getBabTitle = (babKey) =>
    editableBabs.find((bab) => bab.key === babKey)?.title || babKey?.toUpperCase();
  const moveArrayItem = (items, fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= items.length) return items;
    const nextItems = [...items];
    [nextItems[fromIndex], nextItems[toIndex]] = [nextItems[toIndex], nextItems[fromIndex]];
    return nextItems;
  };
  const normalizeBabLabels = (babs) =>
    babs.map((bab, index) => ({
      ...bab,
      label: `BAB ${index + 1}`,
    }));

  useEffect(() => {
    fetchUser();
    fetchQuiz();
  }, []);

  useEffect(() => {
    if (selectedBab) {
      fetchBabData(selectedDialect, selectedBab);
    }
  }, [selectedDialect, selectedBab]);

  const fetchUser = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, { headers });
    if (res.ok) setUser(await res.json());
  };

  const fetchQuiz = async () => {
    const res = await fetch(`${API}/quiz`, { headers });
    if (res.ok) setAllQuizzes(await res.json());
  };

  const fetchBabData = async (dialect, babKey) => {
    setLoading(true);
    try {
      const [resLessons, resPractices] = await Promise.all([
        fetch(`${API}/lessons/${dialect}/${babKey}`, { headers }),
        fetch(`${API}/practices/${dialect}/${babKey}`, { headers })
      ]);

      if (resLessons.ok) setFullBabLessons(await resLessons.json());
      else setFullBabLessons([]);

      if (resPractices.ok) setFullBabPractices(await resPractices.json());
      else setFullBabPractices([]);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  // ================= MATERI ================= //
  const openAddLesson = () => {
    setEditLessonIndex(null);
    setLessonForm({ ...emptyLessonItem, category: selectedLevel.title.toLowerCase() });
    setShowLessonModal(true);
  };

  const openEditLesson = (item, index) => {
    setEditLessonIndex(index);
    setLessonForm({ ...item });
    setShowLessonModal(true);
  };

  const saveLesson = async () => {
    const itemToSave = {
      indo: lessonForm.indo.trim(),
      kaili: lessonForm.kaili.trim(),
      tipe: lessonForm.tipe.trim() || "kosakata",
      category: lessonForm.category || selectedLevel.title.toLowerCase(),
      image: (lessonForm.image || "").trim()
    };

    if (!itemToSave.indo || !itemToSave.kaili) return alert("Field wajib diisi!");

    const newFullArray = [...fullBabLessons];
    if (editLessonIndex !== null) {
      newFullArray[editLessonIndex] = itemToSave;
    } else {
      newFullArray.push(itemToSave);
    }

    const res = await fetch(`${API}/lessons/${selectedDialect}/${selectedBab}`, {
      method: "PUT", headers, body: JSON.stringify(newFullArray)
    });

    if (res.ok) {
      setShowLessonModal(false);
      fetchBabData(selectedDialect, selectedBab);
    } else {
      alert("Gagal menyimpan materi");
    }
  };

  const deleteLesson = async (index) => {
    const newFullArray = fullBabLessons.filter((_, i) => i !== index);
    const res = await fetch(`${API}/lessons/${selectedDialect}/${selectedBab}`, {
      method: "PUT", headers, body: JSON.stringify(newFullArray)
    });
    if (res.ok) {
      fetchBabData(selectedDialect, selectedBab);
      setDeleteTarget(null);
    } else alert("Gagal menghapus");
  };

  const handleLessonImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Harus gambar.");
    if (file.size > MAX_LESSON_IMAGE_SIZE) return alert("Maks 50MB.");
    const reader = new FileReader();
    reader.onloadend = () => setLessonForm(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  // ================= LATIHAN ================= //
  const openAddPractice = () => {
    setEditPracticeIndex(null);
    setPracticeForm({ ...emptyPracticeItem, category: selectedLevel.title.toLowerCase() });
    setShowPracticeModal(true);
  };

  const openEditPractice = (item, index) => {
    setEditPracticeIndex(index);
    setPracticeForm({
      category: item.category || selectedLevel.title.toLowerCase(),
      question: item.question || "",
      options: Array.isArray(item.options) ? [...item.options, "", "", "", ""].slice(0, 4) : ["", "", "", ""],
      answer: item.answer || "",
      image: item.image || "",
    });
    setShowPracticeModal(true);
  };

  const savePractice = async () => {
    const itemToSave = {
      category: practiceForm.category || selectedLevel.title.toLowerCase(),
      question: practiceForm.question.trim(),
      options: practiceForm.options.map(o => o.trim()).filter(Boolean),
      answer: practiceForm.answer.trim(),
      image: (practiceForm.image || "").trim()
    };

    if (!itemToSave.question || !itemToSave.answer || itemToSave.options.length === 0) {
      return alert("Field latihan belum lengkap!");
    }

    const newFullArray = [...fullBabPractices];
    if (editPracticeIndex !== null) {
      newFullArray[editPracticeIndex] = itemToSave;
    } else {
      newFullArray.push(itemToSave);
    }

    const res = await fetch(`${API}/practices/${selectedDialect}/${selectedBab}`, {
      method: "PUT", headers, body: JSON.stringify(newFullArray)
    });

    if (res.ok) {
      setShowPracticeModal(false);
      fetchBabData(selectedDialect, selectedBab);
    } else alert("Gagal menyimpan latihan");
  };

  const deletePractice = async (index) => {
    const newFullArray = fullBabPractices.filter((_, i) => i !== index);
    const res = await fetch(`${API}/practices/${selectedDialect}/${selectedBab}`, {
      method: "PUT", headers, body: JSON.stringify(newFullArray)
    });
    if (res.ok) {
      fetchBabData(selectedDialect, selectedBab);
      setDeleteTarget(null);
    } else alert("Gagal menghapus");
  };

  const handlePracticeImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Harus gambar.");
    const reader = new FileReader();
    reader.onloadend = () => setPracticeForm(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  // ================= KUIS ================= //
  const openAddQuiz = () => {
    setEditQuiz(null);
    setQuizForm({ ...emptyQuizItem });
    setShowQuizModal(true);
  };

  const openEditQuiz = (q) => {
    const options = Array.isArray(q.options) ? [...q.options, "", "", "", ""].slice(0, 4) : ["", "", "", ""];
    const answer = typeof q.answer === "number" ? options[q.answer] || "" : q.answer || "";

    setEditQuiz(q);
    setQuizForm({
      type: q.type || (Array.isArray(q.blocks) && q.blocks.length > 0 ? "susun" : "multiple"),
      answerType: q.answerType || q.answer_type || (Array.isArray(q.blocks) && q.blocks.length > 0 ? "blok" : "pilihan"),
      question: q.question || "",
      options,
      blocks: Array.isArray(q.blocks) ? [...q.blocks, "", "", "", ""].slice(0, 8) : ["", "", "", ""],
      answerBlocks: [],
      answer,
      image: q.image || "",
    });
    setShowQuizModal(true);
  };

  const syncQuizAnswerBlocks = (answerBlocks) => {
    setQuizForm(prev => ({
      ...prev,
      answerBlocks,
      answer: answerBlocks.join(" "),
    }));
  };

  const selectQuizAnswerBlock = (block) => {
    if (!block.trim()) return;
    syncQuizAnswerBlocks([...(quizForm.answerBlocks || []), block]);
  };

  const removeQuizAnswerBlock = (index) => {
    const nextBlocks = [...(quizForm.answerBlocks || [])];
    nextBlocks.splice(index, 1);
    syncQuizAnswerBlocks(nextBlocks);
  };

  const clearQuizBlockAnswer = () => {
    setQuizForm(prev => ({
      ...prev,
      answerBlocks: [],
      answer: "",
    }));
  };

  const saveQuiz = async () => {
    if (!quizForm.question.trim()) return alert("Pertanyaan wajib diisi!");
    const usesOptions = quizForm.type === "multiple" || (quizForm.type === "gambar" && quizForm.answerType === "pilihan");
    const usesBlocks = quizForm.type === "susun" || (quizForm.type === "sambung" && quizForm.answerType === "blok") || (quizForm.type === "gambar" && quizForm.answerType === "blok");

    const body = {
      type: quizForm.type,
      answerType: quizForm.answerType,
      question: quizForm.question.trim(),
      options: usesOptions ? quizForm.options.map(o => o.trim()).filter(Boolean) : [],
      blocks: usesBlocks ? quizForm.blocks.map(b => b.trim()).filter(Boolean) : [],
      answer: quizForm.answer.trim(),
      image: quizForm.type === "gambar" ? (quizForm.image || "").trim() : "",
      dialect: selectedDialect,
      bab: selectedBab,
      category: selectedLevel.title.toLowerCase(),
    };

    if (!body.answer) return alert("Jawaban benar wajib diisi!");
    if (usesOptions && body.options.length < 2) return alert("Minimal 2 pilihan jawaban.");
    if (usesBlocks && body.blocks.length < 2) return alert("Minimal 2 blok kata.");
    if (quizForm.type === "gambar" && !body.image) return alert("Gambar wajib diisi untuk tipe gambar.");

    let res;
    if (editQuiz) {
      res = await fetch(`${API}/quiz/${editQuiz.id}`, { method: "PUT", headers, body: JSON.stringify(body) });
    } else {
      res = await fetch(`${API}/quiz`, { method: "POST", headers, body: JSON.stringify(body) });
    }

    if (res.ok) {
      setShowQuizModal(false);
      fetchQuiz();
    } else alert("Gagal menyimpan kuis");
  };

  const handleQuizImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Harus gambar.");
    if (file.size > MAX_LESSON_IMAGE_SIZE) return alert("Maks 50MB.");
    const reader = new FileReader();
    reader.onloadend = () => setQuizForm(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const deleteQuiz = async (id) => {
    const res = await fetch(`${API}/quiz/${id}`, { method: "DELETE", headers });
    if (res.ok) {
      fetchQuiz();
      setDeleteTarget(null);
    } else alert("Gagal menghapus kuis");
  };

  const getQuizTypeLabel = (quiz) => {
    const hasImage = Boolean(quiz.image);
    const hasBlocks = Array.isArray(quiz.blocks) && quiz.blocks.filter(Boolean).length > 0;
    const hasOptions = Array.isArray(quiz.options) && quiz.options.filter(Boolean).length > 0;
    const answerType = quiz.answerType || quiz.answer_type;

    if (quiz.type === "gambar" || hasImage) {
      if (answerType === "blok" || hasBlocks) return "Gambar - Susun Kata";
      if (answerType === "ketik") return "Gambar - Ketik";
      return "Gambar - Pilihan Ganda";
    }

    if (quiz.type === "sambung") {
      return answerType === "ketik" ? "Sambung - Ketik" : "Sambung - Blok Kata";
    }

    if (quiz.type === "susun" || (hasBlocks && !hasOptions)) {
      return "Susun Kata";
    }

    return "Pilihan Ganda";
  };

  const saveBabsOrder = async (newBabs) => {
    const orderedBabs = normalizeBabLabels(newBabs);
    const res = await fetch(`${API_BASE_URL}/api/admin/babs`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ babs: orderedBabs }),
    });

    if (res.ok) {
      setEditableBabs(orderedBabs);
    } else {
      alert("Gagal menyimpan urutan");
    }
  };

  const moveBab = (index, direction) => {
    const newBabs = moveArrayItem(editableBabs, index, direction);
    if (newBabs !== editableBabs) saveBabsOrder(newBabs);
  };

  const moveLevel = (index, direction) => {
    const newBabs = JSON.parse(JSON.stringify(editableBabs));
    const bab = newBabs.find((item) => item.key === selectedBab);
    if (!bab) return;
    bab.levels = moveArrayItem(bab.levels || [], index, direction);
    saveBabsOrder(newBabs);
  };

  const moveLesson = async (originalIndex, direction) => {
    const newFullArray = moveArrayItem(fullBabLessons, originalIndex, direction);
    if (newFullArray === fullBabLessons) return;

    const res = await fetch(`${API}/lessons/${selectedDialect}/${selectedBab}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(newFullArray),
    });

    if (res.ok) setFullBabLessons(newFullArray);
    else alert("Gagal menyimpan urutan materi");
  };

  const movePractice = async (originalIndex, direction) => {
    const newFullArray = moveArrayItem(fullBabPractices, originalIndex, direction);
    if (newFullArray === fullBabPractices) return;

    const res = await fetch(`${API}/practices/${selectedDialect}/${selectedBab}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(newFullArray),
    });

    if (res.ok) setFullBabPractices(newFullArray);
    else alert("Gagal menyimpan urutan latihan");
  };

  const moveQuiz = async (quizId, direction) => {
    const currentIndex = allQuizzes.findIndex((quiz) => quiz.id === quizId);
    if (currentIndex === -1) return;

    const currentQuiz = allQuizzes[currentIndex];
    const sameLevelIndexes = allQuizzes
      .map((quiz, index) => ({ quiz, index }))
      .filter(({ quiz }) =>
        quiz.dialect === currentQuiz.dialect &&
        quiz.bab === currentQuiz.bab &&
        quiz.category?.toLowerCase() === currentQuiz.category?.toLowerCase()
      )
      .map(({ index }) => index);
    const position = sameLevelIndexes.indexOf(currentIndex);
    const targetIndex = sameLevelIndexes[position + direction];
    if (targetIndex === undefined) return;

    const newQuizzes = [...allQuizzes];
    [newQuizzes[currentIndex], newQuizzes[targetIndex]] = [newQuizzes[targetIndex], newQuizzes[currentIndex]];

    const res = await fetch(`${API}/quiz/reorder`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ quiz: newQuizzes }),
    });

    if (res.ok) setAllQuizzes(newQuizzes);
    else alert("Gagal menyimpan urutan kuis");
  };


  const saveBab = async () => {
    if (!babForm.key || !babForm.title) return alert("Key dan Title wajib diisi!");
    let newBabs = JSON.parse(JSON.stringify(editableBabs));
    if (babForm.isEdit) {
      newBabs = newBabs.map(b => b.key === babForm.key ? { ...b, label: babForm.label, title: babForm.title, description: babForm.description, color: babForm.color } : b);
    } else {
      if(newBabs.find(b => b.key === babForm.key)) return alert("Key bab sudah ada!");
      newBabs.push({ key: babForm.key, label: babForm.label, title: babForm.title, description: babForm.description, color: babForm.color, levels: [] });
    }
    newBabs = normalizeBabLabels(newBabs);
    const res = await fetch(`${API_BASE_URL}/api/admin/babs`, { method: "PUT", headers, body: JSON.stringify({ babs: newBabs }) });
    if (res.ok) {
      setEditableBabs(newBabs);
      setShowBabModal(false);
      if (!babForm.isEdit) setSelectedBab(babForm.key);
    } else alert("Gagal menyimpan Bab");
  };

  const deleteBab = async (key) => {
    const newBabs = normalizeBabLabels(editableBabs.filter(b => b.key !== key));
    const res = await fetch(`${API_BASE_URL}/api/admin/babs`, { method: "PUT", headers, body: JSON.stringify({ babs: newBabs }) });
    if (res.ok) {
      setEditableBabs(newBabs);
      setDeleteTarget(null);
      if (selectedBab === key) {
        setSelectedBab(null);
        setSelectedLevel(null);
      }
    } else alert("Gagal menghapus Bab");
  };

  const saveLevel = async () => {
    if (!levelForm.key || !levelForm.title) return alert("Key dan Title wajib diisi!");
    let newBabs = JSON.parse(JSON.stringify(editableBabs));
    let bab = newBabs.find(b => b.key === selectedBab);
    if (!bab) return;
    if (!bab.levels) bab.levels = [];

    if (levelForm.isEdit) {
      bab.levels = bab.levels.map(l => l.key === levelForm.key ? { ...l, title: levelForm.title, description: levelForm.description } : l);
    } else {
      if(bab.levels.find(l => l.key === levelForm.key)) return alert("Key level sudah ada!");
      bab.levels.push({ key: levelForm.key, title: levelForm.title, description: levelForm.description });
    }
    const res = await fetch(`${API_BASE_URL}/api/admin/babs`, { method: "PUT", headers, body: JSON.stringify({ babs: newBabs }) });
    if (res.ok) {
      setEditableBabs(newBabs);
      setShowLevelModal(false);
      if (selectedLevel?.key === levelForm.key) {
        setSelectedLevel(bab.levels.find((level) => level.key === levelForm.key) || null);
      }
    } else alert("Gagal menyimpan Level");
  };

  const deleteLevel = async (key) => {
    let newBabs = JSON.parse(JSON.stringify(editableBabs));
    let bab = newBabs.find(b => b.key === selectedBab);
    bab.levels = bab.levels.filter(l => l.key !== key);
    const res = await fetch(`${API_BASE_URL}/api/admin/babs`, { method: "PUT", headers, body: JSON.stringify({ babs: newBabs }) });
    if (res.ok) {
      setEditableBabs(newBabs);
      setDeleteTarget(null);
      if (selectedLevel?.key === key) setSelectedLevel(null);
    } else alert("Gagal menghapus Level");
  };

  // Filtering for display
  // We attach the original index to the items so we can edit/delete them in the full array
  const filteredMateri = fullBabLessons.map((item, index) => ({ ...item, _originalIndex: index }))
    .filter(item => item.category && item.category.toLowerCase() === selectedLevel?.title.toLowerCase());
    
  const filteredPractices = fullBabPractices.map((item, index) => ({ ...item, _originalIndex: index }))
    .filter(item => item.category && item.category.toLowerCase() === selectedLevel?.title.toLowerCase());

  const filteredQuizzes = allQuizzes.filter(q => 
    q.dialect === selectedDialect && 
    q.bab === selectedBab && 
    q.category?.toLowerCase() === selectedLevel?.title.toLowerCase()
  );

  if (!user) return <div className="admin-page-bg min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="admin-page-bg min-h-screen flex overflow-hidden">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col min-w-0">
        <NavbarAdmin user={user} />
        <main className="flex-1 p-4 pb-24 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-6xl mx-auto w-full">

            {/* HEADER & BREADCRUMBS */}
            <div className="admin-hero-card mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl p-5 text-white shadow-lg shadow-purple-500/20">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  Kelola Materi
                </h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-purple-100">
                  <span className="cursor-pointer hover:text-white" onClick={() => { setSelectedBab(null); setSelectedLevel(null); }}>Semua Bab</span>
                  {selectedBab && (
                    <>
                      <span>/</span>
                      <span className="cursor-pointer hover:text-white" onClick={() => setSelectedLevel(null)}>{getBabTitle(selectedBab)}</span>
                    </>
                  )}
                  {selectedLevel && (
                    <>
                      <span>/</span>
                      <span className="font-semibold text-white">{selectedLevel.title}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Dialect Selector */}
              <div className="flex gap-2 bg-white/15 p-1 rounded-xl shadow-sm border border-white/20 backdrop-blur">
                <button
                  onClick={() => { setSelectedDialect("ledo"); setSelectedLevel(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${selectedDialect === "ledo" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  Ledo
                </button>
                <button
                  onClick={() => { setSelectedDialect("rai"); setSelectedLevel(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${selectedDialect === "rai" ? "bg-purple-100 text-purple-700" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  Rai
                </button>
              </div>
            </div>

            {/* LEVEL 1: BAB SELECTION */}
            {!selectedBab && (
              <>
                <div className="flex justify-end mb-4">
                  <button onClick={() => { setBabForm({ key: "", label: "", title: "", description: "", color: "blue", isEdit: false }); setShowBabModal(true); }} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition">＋ Tambah Bab</button>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {editableBabs.map((bab, index) => (
                  <div key={bab.key} className="admin-glass-card rounded-3xl shadow-sm hover:shadow-md hover:border-purple-300 transition group overflow-hidden">
                    <div onClick={() => setSelectedBab(bab.key)} className="p-6 cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${bab.color}-100 text-${bab.color}-600`}>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-purple-500 transition">{bab.label}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">{bab.title}</h3>
                      <p className="text-sm text-gray-500">{bab.description}</p>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex flex-wrap gap-3">
                      <button disabled={index === 0} onClick={(e) => { e.stopPropagation(); moveBab(index, -1); }} className="text-sm font-semibold text-gray-600 hover:text-purple-700 disabled:opacity-30">Naik</button>
                      <button disabled={index === editableBabs.length - 1} onClick={(e) => { e.stopPropagation(); moveBab(index, 1); }} className="text-sm font-semibold text-gray-600 hover:text-purple-700 disabled:opacity-30">Turun</button>
                      <button onClick={(e) => { e.stopPropagation(); setBabForm({ ...bab, isEdit: true }); setShowBabModal(true); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "bab", id: bab.key, title: bab.title }); }} className="text-sm font-semibold text-red-600 hover:text-red-800">Hapus</button>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}

            {/* LEVEL 2: LEVEL SELECTION */}
            {selectedBab && !selectedLevel && (
              <>
                <div className="flex justify-end mb-4">
                  <button onClick={() => { setLevelForm({ key: "", title: "", description: "", isEdit: false }); setShowLevelModal(true); }} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition">＋ Tambah Level</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getLevels(selectedBab).map((level, index) => (
                    <div key={level.key} className="admin-glass-card rounded-3xl shadow-sm hover:shadow-md hover:border-purple-300 transition overflow-hidden">
                      <div onClick={() => setSelectedLevel(level)} className="p-5 cursor-pointer">
                        <span className="inline-flex mb-3 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                          Level {index + 1}
                        </span>
                        <h4 className="font-bold text-gray-800 mb-1">{level.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{level.description}</p>
                      </div>
                      <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex flex-wrap gap-3">
                        <button onClick={(e) => { e.stopPropagation(); moveLevel(index, -1); }} disabled={index === 0} className="text-sm font-semibold text-gray-600 hover:text-purple-700 disabled:opacity-30">Naik</button>
                        <button onClick={(e) => { e.stopPropagation(); moveLevel(index, 1); }} disabled={index === getLevels(selectedBab).length - 1} className="text-sm font-semibold text-gray-600 hover:text-purple-700 disabled:opacity-30">Turun</button>
                        <button onClick={(e) => { e.stopPropagation(); setLevelForm({ ...level, isEdit: true }); setShowLevelModal(true); }} className="text-sm font-semibold text-blue-600 hover:text-blue-800">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "level", id: level.key, title: level.title }); }} className="text-sm font-semibold text-red-600 hover:text-red-800">Hapus</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* LEVEL 3: CONTENT MANAGEMENT */}
            {selectedBab && selectedLevel && (
              <>
                <div className="flex flex-wrap gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm w-fit border border-gray-100">
                  <button onClick={() => setTab("materi")} className={`px-5 py-2 rounded-lg text-sm font-bold transition ${tab === "materi" ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-gray-50"}`}>
                    📖 Materi ({filteredMateri.length})
                  </button>
                  <button onClick={() => setTab("latihan")} className={`px-5 py-2 rounded-lg text-sm font-bold transition ${tab === "latihan" ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-gray-50"}`}>
                    📝 Latihan ({filteredPractices.length})
                  </button>
                  <button onClick={() => setTab("quiz")} className={`px-5 py-2 rounded-lg text-sm font-bold transition ${tab === "quiz" ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-gray-50"}`}>
                    🏆 Kuis ({filteredQuizzes.length})
                  </button>
                </div>

                {loading ? (
                  <div className="text-center p-10 text-gray-400">Memuat data...</div>
                ) : (
                  <div className="admin-glass-card rounded-3xl shadow-sm overflow-hidden">
                    
                    {/* TAB MATERI */}
                    {tab === "materi" && (
                      <div className="p-5">
                        <div className="flex justify-end mb-4">
                          <button onClick={openAddLesson} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition">＋ Tambah Materi</button>
                        </div>
                        {filteredMateri.length === 0 ? <div className="text-center p-10 text-gray-400">Belum ada materi untuk level ini</div> : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                  <th className="px-4 py-3 text-center w-24">Urutan</th>
                                  <th className="px-4 py-3 text-left">Indonesia</th>
                                  <th className="px-4 py-3 text-left">Kaili ({selectedDialect})</th>
                                  <th className="px-4 py-3 text-center w-32">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {filteredMateri.map((m) => (
                                  <tr key={m._originalIndex} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                      <span className="mr-3 inline-flex min-w-6 justify-center rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                                        {m._originalIndex + 1}
                                      </span>
                                      <button onClick={() => moveLesson(m._originalIndex, -1)} disabled={m._originalIndex === 0} className="mr-2 font-bold text-gray-500 hover:text-purple-700 disabled:opacity-30">↑</button>
                                      <button onClick={() => moveLesson(m._originalIndex, 1)} disabled={m._originalIndex === fullBabLessons.length - 1} className="font-bold text-gray-500 hover:text-purple-700 disabled:opacity-30">↓</button>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{m.indo}</td>
                                    <td className="px-4 py-3 text-gray-600">{m.kaili}</td>
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                      <button onClick={() => openEditLesson(m, m._originalIndex)} className="text-blue-600 font-medium mr-3">Edit</button>
                                      <button onClick={() => setDeleteTarget({ type: "lesson", id: m._originalIndex, title: m.indo })} className="text-red-500 font-medium">Hapus</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB LATIHAN */}
                    {tab === "latihan" && (
                      <div className="p-5">
                        <div className="flex justify-end mb-4">
                          <button onClick={openAddPractice} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition">＋ Tambah Latihan</button>
                        </div>
                        {filteredPractices.length === 0 ? <div className="text-center p-10 text-gray-400">Belum ada latihan untuk level ini</div> : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                  <th className="px-4 py-3 text-center w-24">Urutan</th>
                                  <th className="px-4 py-3 text-left">Pertanyaan</th>
                                  <th className="px-4 py-3 text-left">Jawaban</th>
                                  <th className="px-4 py-3 text-center w-32">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {filteredPractices.map((p) => (
                                  <tr key={p._originalIndex} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                      <span className="mr-3 inline-flex min-w-6 justify-center rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                                        {p._originalIndex + 1}
                                      </span>
                                      <button onClick={() => movePractice(p._originalIndex, -1)} disabled={p._originalIndex === 0} className="mr-2 font-bold text-gray-500 hover:text-purple-700 disabled:opacity-30">↑</button>
                                      <button onClick={() => movePractice(p._originalIndex, 1)} disabled={p._originalIndex === fullBabPractices.length - 1} className="font-bold text-gray-500 hover:text-purple-700 disabled:opacity-30">↓</button>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{p.question}</td>
                                    <td className="px-4 py-3 text-green-600 font-bold">{p.answer}</td>
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                      <button onClick={() => openEditPractice(p, p._originalIndex)} className="text-blue-600 font-medium mr-3">Edit</button>
                                      <button onClick={() => setDeleteTarget({ type: "practice", id: p._originalIndex, title: "Latihan ini" })} className="text-red-500 font-medium">Hapus</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB KUIS */}
                    {tab === "quiz" && (
                      <div className="p-5">
                        <div className="flex justify-end mb-4">
                          <button onClick={openAddQuiz} className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition">＋ Tambah Kuis</button>
                        </div>
                        {filteredQuizzes.length === 0 ? <div className="text-center p-10 text-gray-400">Belum ada soal kuis untuk level ini</div> : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-gray-600 border-b">
                                <tr>
                                  <th className="px-4 py-3 text-center w-24">Urutan</th>
                                  <th className="px-4 py-3 text-left">Tipe Soal</th>
                                  <th className="px-4 py-3 text-left">Pertanyaan</th>
                                  <th className="px-4 py-3 text-left">Jawaban Benar</th>
                                  <th className="px-4 py-3 text-center w-32">Aksi</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {filteredQuizzes.map((q, index) => (
                                  <tr key={q.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                      <span className="mr-3 inline-flex min-w-6 justify-center rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                                        {index + 1}
                                      </span>
                                      <button onClick={() => moveQuiz(q.id, -1)} disabled={index === 0} className="mr-2 font-bold text-gray-500 hover:text-purple-700 disabled:opacity-30">↑</button>
                                      <button onClick={() => moveQuiz(q.id, 1)} disabled={index === filteredQuizzes.length - 1} className="font-bold text-gray-500 hover:text-purple-700 disabled:opacity-30">↓</button>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                                        {getQuizTypeLabel(q)}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                      {q.question}
                                    </td>
                                    <td className="px-4 py-3 text-green-600 font-bold">{typeof q.answer === "number" ? q.options?.[q.answer] : q.answer}</td>
                                    <td className="px-4 py-3 text-center whitespace-nowrap">
                                      <button onClick={() => openEditQuiz(q)} className="text-blue-600 font-medium mr-3">Edit</button>
                                      <button onClick={() => setDeleteTarget({ type: "quiz", id: q.id, title: "Kuis ini" })} className="text-red-500 font-medium">Hapus</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      {/* MATERI MODAL */}
      {showLessonModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="admin-glass-card rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-4">{editLessonIndex !== null ? "Edit Materi" : "Tambah Materi"}</h3>
            <div className="space-y-4">
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Indonesia</label><input type="text" value={lessonForm.indo} onChange={e => setLessonForm({...lessonForm, indo: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Kaili ({selectedDialect})</label><input type="text" value={lessonForm.kaili} onChange={e => setLessonForm({...lessonForm, kaili: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Gambar (Opsional)</label><input type="file" accept="image/*" onChange={e => handleLessonImage(e.target.files[0])} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />{lessonForm.image && <img src={lessonForm.image} alt="Preview" className="h-24 mt-3 rounded-lg object-contain bg-gray-50" />}</div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowLessonModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition">Batal</button>
              <button onClick={saveLesson} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* LATIHAN MODAL */}
      {showPracticeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="admin-glass-card rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="font-bold text-lg mb-4">{editPracticeIndex !== null ? "Edit Latihan" : "Tambah Latihan"}</h3>
            <div className="space-y-4">
              <div><label className="text-sm font-medium mb-1 block text-gray-700">Pertanyaan</label><input type="text" value={practiceForm.question} onChange={e => setPracticeForm({...practiceForm, question: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700">Pilihan (Termasuk jawaban benar)</label>
                {practiceForm.options.map((opt, idx) => (
                  <input key={idx} type="text" value={opt} onChange={e => {
                    const newOpts = [...practiceForm.options];
                    newOpts[idx] = e.target.value;
                    setPracticeForm(prev => ({
                      ...prev,
                      options: newOpts,
                      answer: prev.answer === opt ? e.target.value : prev.answer,
                    }));
                  }} className="w-full border rounded-xl px-4 py-2 text-sm mb-2 outline-none focus:ring-2 focus:ring-purple-500/50" placeholder={`Pilihan ${idx+1}`} />
                ))}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700">Jawaban Benar</label>
                <select
                  value={practiceForm.answer}
                  onChange={e => setPracticeForm({...practiceForm, answer: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/50 font-bold bg-green-50/50 text-green-700"
                >
                  <option value="">Pilih jawaban dari opsi</option>
                  {practiceForm.options.map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {idx + 1}. {opt || "Kosong"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowPracticeModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition">Batal</button>
              <button onClick={savePractice} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* KUIS MODAL */}
      {showQuizModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="admin-glass-card rounded-3xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="font-bold text-lg mb-4">{editQuiz ? "Edit Kuis" : "Tambah Kuis"}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-700">Tipe Soal</label>
                <select
                  value={quizForm.type}
                  onChange={e => {
                    const nextType = e.target.value;
                    setQuizForm({
                      ...quizForm,
                      type: nextType,
                      answerType:
                        nextType === "multiple"
                          ? "pilihan"
                          : nextType === "gambar"
                          ? quizForm.answerType
                          : nextType === "sambung"
                          ? "blok"
                          : "blok",
                    });
                  }}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="multiple">Pilihan Ganda</option>
                  <option value="susun">Susun Kata</option>
                  <option value="gambar">Soal Gambar</option>
                  <option value="sambung">Sambung Kalimat</option>
                </select>
              </div>

              <div><label className="text-sm font-medium mb-1 block text-gray-700">Pertanyaan</label><input type="text" value={quizForm.question} onChange={e => setQuizForm({...quizForm, question: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/50" /></div>

              {quizForm.type === "gambar" && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-gray-700">Gambar</label>
                    <input type="file" accept="image/*" onChange={e => handleQuizImage(e.target.files[0])} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                    {quizForm.image && <img src={quizForm.image} alt="Preview" className="h-32 mt-3 rounded-lg object-contain bg-gray-50 border" />}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block text-gray-700">Tipe Jawaban Gambar</label>
                    <select value={quizForm.answerType} onChange={e => setQuizForm({...quizForm, answerType: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/50">
                      <option value="pilihan">Pilihan Ganda</option>
                      <option value="blok">Susun Kata</option>
                    </select>
                  </div>
                </>
              )}

              {quizForm.type === "sambung" && (
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700">Tipe Jawaban Sambung Kalimat</label>
                  <select value={quizForm.answerType} onChange={e => setQuizForm({...quizForm, answerType: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/50">
                    <option value="ketik">Ketik Jawaban</option>
                    <option value="blok">Blok Kata</option>
                  </select>
                </div>
              )}

              {(quizForm.type === "multiple" || (quizForm.type === "gambar" && quizForm.answerType === "pilihan")) && (
                <div>
                <label className="text-sm font-medium mb-1 block text-gray-700">Pilihan Ganda</label>
                {quizForm.options.map((opt, idx) => (
                  <input key={idx} type="text" value={opt} onChange={e => {
                    const newOpts = [...quizForm.options];
                    newOpts[idx] = e.target.value;
                    setQuizForm({...quizForm, options: newOpts});
                  }} className="w-full border rounded-xl px-4 py-2 text-sm mb-2 outline-none focus:ring-2 focus:ring-purple-500/50" placeholder={`Pilihan ${idx+1}`} />
                ))}
              </div>
              )}

              {(quizForm.type === "susun" || (quizForm.type === "sambung" && quizForm.answerType === "blok") || (quizForm.type === "gambar" && quizForm.answerType === "blok")) && (
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700">Blok Kata</label>
                  {quizForm.blocks.map((block, idx) => (
                    <input key={idx} type="text" value={block} onChange={e => {
                      const newBlocks = [...quizForm.blocks];
                      newBlocks[idx] = e.target.value;
                      setQuizForm({...quizForm, blocks: newBlocks});
                    }} className="w-full border rounded-xl px-4 py-2 text-sm mb-2 outline-none focus:ring-2 focus:ring-purple-500/50" placeholder={`Blok ${idx+1}`} />
                  ))}
                  <button type="button" onClick={() => setQuizForm({...quizForm, blocks: [...quizForm.blocks, ""]})} className="text-sm font-bold text-purple-600 hover:text-purple-800">+ Tambah Blok</button>

                  <div className="mt-4 rounded-2xl bg-gray-50 p-3">
                    <p className="mb-2 text-sm font-semibold text-gray-700">Pilih Jawaban dari Blok</p>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {quizForm.blocks.map((block, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectQuizAnswerBlock(block)}
                          className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                        >
                          {block || "Kosong"}
                        </button>
                      ))}
                    </div>

                    <p className="mb-2 text-sm font-semibold text-gray-700">Jawaban Tersusun</p>
                    <div className="flex min-h-[44px] flex-wrap gap-2 rounded-xl border bg-white p-2">
                      {(quizForm.answerBlocks || []).length > 0 ? (
                        quizForm.answerBlocks.map((block, idx) => (
                          <button
                            key={`${block}-${idx}`}
                            type="button"
                            onClick={() => removeQuizAnswerBlock(idx)}
                            className="rounded-xl bg-green-500 px-3 py-2 text-sm font-semibold text-white"
                          >
                            {block} x
                          </button>
                        ))
                      ) : (
                        <span className="px-2 py-1 text-sm text-gray-400">Belum ada blok yang dipilih</span>
                      )}
                    </div>

                    {(quizForm.answerBlocks || []).length > 0 && (
                      <button type="button" onClick={clearQuizBlockAnswer} className="mt-3 rounded-xl bg-red-500 px-3 py-2 text-sm font-bold text-white hover:bg-red-600">
                        Hapus Jawaban
                      </button>
                    )}
                  </div>
                </div>
              )}

              {(quizForm.type === "multiple" || (quizForm.type === "gambar" && quizForm.answerType === "pilihan")) ? (
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700">Jawaban Benar</label>
                  <select value={quizForm.answer} onChange={e => setQuizForm({...quizForm, answer: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/50 font-bold bg-green-50/50 text-green-700">
                    <option value="">Pilih jawaban benar</option>
                  {quizForm.options.map((opt, idx) => (
                      <option key={idx} value={opt}>{idx+1}. {opt || "Kosong"}</option>
                  ))}
                </select>
              </div>
              ) : (quizForm.type === "sambung" && quizForm.answerType === "ketik") ? (
                <div><label className="text-sm font-medium mb-1 block text-gray-700">Jawaban Benar</label><input type="text" value={quizForm.answer} onChange={e => setQuizForm({...quizForm, answer: e.target.value})} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/50 text-green-700 font-bold bg-green-50/50" placeholder="Contoh: Kata benda" /></div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-1 block text-gray-700">Jawaban Benar</label>
                  <div className="w-full rounded-xl border bg-green-50/50 px-4 py-2.5 text-sm font-bold text-green-700">
                    {quizForm.answer || "Pilih blok jawaban di atas"}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowQuizModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition">Batal</button>
              <button onClick={saveQuiz} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-600/30">Simpan</button>
            </div>
          </div>
        </div>
      )}

      <BottomNavAdmin />
      {/* BAB MODAL */}
      {showBabModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="admin-glass-card rounded-3xl w-full max-w-md p-6 shadow-2xl">
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
          <div className="admin-glass-card rounded-3xl w-full max-w-md p-6 shadow-2xl">
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
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus Item?"
        message={`Data ${deleteTarget?.title} akan dihapus permanen.`}
        confirmLabel="Hapus"
        onConfirm={() => {
          if (deleteTarget.type === "lesson") deleteLesson(deleteTarget.id);
          else if (deleteTarget.type === "practice") deletePractice(deleteTarget.id);
          else if (deleteTarget.type === "quiz") deleteQuiz(deleteTarget.id);
          else if (deleteTarget.type === "bab") deleteBab(deleteTarget.id);
          else if (deleteTarget.type === "level") deleteLevel(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default AdminMateri;

