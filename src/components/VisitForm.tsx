import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  User,
  UserCheck,
  Layers,
  MessageSquare,
  CheckCircle2,
  Camera,
  Plus,
  Trash2,
  FileText,
  Send,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BuyerVisit, ActionTask, BeforeAfterPhoto, VisitStatus, GoogleSheetsConfig } from '../types';
import {
  DEFAULT_DEPARTMENTS,
  getPSForDepartment,
  addVisit,
} from '../services/storage';
import { sendVisitToGoogleSheets } from '../services/googleSheets';

interface VisitFormProps {
  onVisitSaved: (newVisit: BuyerVisit) => void;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsModal: () => void;
}

const COMMON_TOPICS = [
  'Display & Planogram Rak',
  'Stok Kosong / OOS Gudang',
  'Label Harga & Promo POP',
  'Retur Barang Rusak / Vendor',
  'Penataan Produk Baru',
];

export const VisitForm: React.FC<VisitFormProps> = ({
  onVisitSaved,
  sheetsConfig,
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const currentTime = new Date().toTimeString().slice(0, 5);

  // Form Fields
  const [visitDate, setVisitDate] = useState<string>(today);
  const [department, setDepartment] = useState<string>('SOFA & CHAIR');
  const [psName, setPsName] = useState<string>('DEAN');
  const [buyerName, setBuyerName] = useState<string>(''); // MANUAL INPUT
  const [discussionTopic, setDiscussionTopic] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [status, setStatus] = useState<VisitStatus>('Selesai');
  const [notes, setNotes] = useState<string>('');

  // Optional: Tasks
  const [tasks, setTasks] = useState<string[]>([]);
  const [taskInput, setTaskInput] = useState<string>('');

  // Optional: Photos
  const [beforeImg, setBeforeImg] = useState<string>('');
  const [afterImg, setAfterImg] = useState<string>('');
  const [photoNotes, setPhotoNotes] = useState<string>('');

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // When department changes, automatically update the PS buttons and select the 1st PS
  const handleSelectDept = (dept: string) => {
    setDepartment(dept);
    const assigned = getPSForDepartment(dept);
    if (assigned.length > 0) {
      setPsName(assigned[0]);
    }
  };

  // Image upload
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (v: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTask = () => {
    if (!taskInput.trim()) return;
    setTasks([...tasks, taskInput.trim()]);
    setTaskInput('');
  };

  const handleRemoveTask = (idx: number) => {
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!department) {
      alert('Pilih departemen terlebih dahulu.');
      return;
    }
    if (!psName) {
      alert('Pilih atau isi nama PS.');
      return;
    }
    if (!buyerName.trim()) {
      alert('Harap isi Nama Buyer.');
      return;
    }
    if (!discussionTopic.trim()) {
      alert('Harap isi Topik Diskusi.');
      return;
    }
    if (!result.trim()) {
      alert('Harap isi Hasil / Kesepakatan visit.');
      return;
    }

    setIsSubmitting(true);

    const actionTasks: ActionTask[] = tasks.map((t, idx) => ({
      id: `task-${Date.now()}-${idx}`,
      title: t,
      isDone: true,
      assignedTo: psName,
      dueDate: visitDate,
    }));

    const photosList: BeforeAfterPhoto[] = [];
    if (beforeImg || afterImg) {
      photosList.push({
        id: `photo-${Date.now()}`,
        label: `Foto Display ${department}`,
        beforeUrl: beforeImg || afterImg,
        afterUrl: afterImg || beforeImg,
        notes: photoNotes,
        timestamp: `${visitDate} ${currentTime}`,
      });
    }

    const newVisit: BuyerVisit = {
      id: `visit-${Date.now()}`,
      visitDate,
      visitTime: currentTime,
      department,
      psName,
      buyerName: buyerName.trim(),
      discussionTopic: discussionTopic.trim(),
      result: result.trim(),
      status,
      tasks: actionTasks,
      photos: photosList,
      notes: notes.trim(),
      syncedToSheets: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save locally
    addVisit(newVisit);

    // Sync to Google Sheets if configured
    if (sheetsConfig.scriptUrl) {
      sendVisitToGoogleSheets(newVisit, sheetsConfig)
        .then((res) => {
          if (res.success) newVisit.syncedToSheets = true;
        })
        .catch(() => {});
    }

    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch {}

    setIsSubmitting(false);
    onVisitSaved(newVisit);

    setSuccessNotice(`Data kunjungan ${department} (PS: ${psName}) berhasil disimpan!`);
    setTimeout(() => setSuccessNotice(null), 4000);

    // Reset simple fields
    setDiscussionTopic('');
    setResult('');
    setNotes('');
    setTasks([]);
    setBeforeImg('');
    setAfterImg('');
    setPhotoNotes('');
  };

  const assignedPS = getPSForDepartment(department);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Header Ringkas */}
      <div className="mb-5 text-center">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Input Hasil Visit Buyer
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pilih Departemen & PS dengan 1 klik, isi topik & hasil kunjungan dengan cepat.
        </p>
      </div>

      {successNotice && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 space-y-5">
        
        {/* 1. Pilih Departemen */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              1. Pilih Departemen:
            </span>
            <span className="text-orange-600 font-extrabold">{department}</span>
          </label>

          {/* Quick Clickable Buttons for all 20 Depts */}
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50/70 rounded-xl border border-slate-200">
            {DEFAULT_DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => handleSelectDept(dept)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                  department === dept
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-orange-400 hover:bg-orange-50'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Pilih Nama PS (Tinggal Klik) */}
        <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-200/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-orange-950 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-orange-600" />
            <span>2. Nama PS ({department}):</span>
          </label>

          {assignedPS.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedPS.map((ps) => (
                <button
                  key={ps}
                  type="button"
                  onClick={() => setPsName(ps)}
                  className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                    psName === ps
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md ring-2 ring-orange-300'
                      : 'bg-white text-slate-800 border-orange-300 hover:bg-orange-100/60'
                  }`}
                >
                  <span>{ps}</span>
                  {psName === ps && <span>✓</span>}
                </button>
              ))}

              <input
                type="text"
                placeholder="Atau ketik nama PS lain..."
                value={psName}
                onChange={(e) => setPsName(e.target.value)}
                className="flex-1 min-w-[140px] text-xs px-3 py-1.5 rounded-xl border border-orange-300 bg-white"
              />
            </div>
          ) : (
            <input
              type="text"
              placeholder="Ketik Nama PS..."
              value={psName}
              onChange={(e) => setPsName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-orange-300 bg-white"
            />
          )}
        </div>

        {/* 3. Tanggal & Nama Buyer (ISI MANUAL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tanggal Visit
            </label>
            <input
              type="date"
              required
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Buyer <span className="text-red-500">* (Isi Manual)</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ketik nama Anda di sini..."
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* 4. Topik Diskusi */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Topik Diskusi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ketik topik pembahasan saat kunjungan..."
            value={discussionTopic}
            onChange={(e) => setDiscussionTopic(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-slate-800 font-medium"
          />

          {/* Quick Topic Chips */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {COMMON_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setDiscussionTopic(topic)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Result / Hasil */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Result / Hasil & Kesepakatan <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Hasil diskusi, kesepakatan display, stok, atau komitmen dengan PS..."
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-slate-800 leading-relaxed"
          />
        </div>

        {/* 6. Status Kunjungan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Status Hasil:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Selesai', 'Follow Up', 'In Progress', 'Pending Vendor'] as VisitStatus[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatus(st)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  status === st
                    ? st === 'Selesai'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : st === 'Follow Up'
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : st === 'In Progress'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Menu Pekerjaan yang Dilakukan (Opsional & Simple) */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Pekerjaan yang Dilakukan (Opsional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ketik pekerjaan lalu tekan Enter atau Tambah..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300"
            />
            <button
              type="button"
              onClick={handleAddTask}
              className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Tambah
            </button>
          </div>

          {tasks.length > 0 && (
            <div className="space-y-1.5 mt-2">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {task}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(idx)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Foto Before & After (Opsional & Simple) */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Foto Before & After (Opsional)
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* Before */}
            <div className="border border-slate-200 rounded-xl p-2.5 text-center bg-slate-50">
              <span className="text-[11px] font-bold text-red-600 block mb-1">Foto Before (Sebelum)</span>
              {beforeImg ? (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200">
                  <img src={beforeImg} alt="Before" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setBeforeImg('')}
                    className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => beforeInputRef.current?.click()}
                  className="w-full h-28 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-orange-50 hover:border-orange-400 text-xs gap-1"
                >
                  <Camera className="w-5 h-5 text-slate-400" />
                  <span>Ambil / Unggah Foto</span>
                </button>
              )}
              <input
                type="file"
                ref={beforeInputRef}
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFile(e, setBeforeImg)}
                className="hidden"
              />
            </div>

            {/* After */}
            <div className="border border-slate-200 rounded-xl p-2.5 text-center bg-slate-50">
              <span className="text-[11px] font-bold text-emerald-600 block mb-1">Foto After (Sesudah)</span>
              {afterImg ? (
                <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200">
                  <img src={afterImg} alt="After" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setAfterImg('')}
                    className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => afterInputRef.current?.click()}
                  className="w-full h-28 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:bg-emerald-50 hover:border-emerald-400 text-xs gap-1"
                >
                  <Camera className="w-5 h-5 text-slate-400" />
                  <span>Ambil / Unggah Foto</span>
                </button>
              )}
              <input
                type="file"
                ref={afterInputRef}
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFile(e, setAfterImg)}
                className="hidden"
              />
            </div>
          </div>

          {(beforeImg || afterImg) && (
            <input
              type="text"
              placeholder="Catatan perubahan foto (contoh: Rak dirapikan per ukuran)..."
              value={photoNotes}
              onChange={(e) => setPhotoNotes(e.target.value)}
              className="w-full text-xs px-3 py-1.5 rounded-xl border border-slate-200 mt-2"
            />
          )}
        </div>

        {/* 9. Penjelasan / Catatan Tambahan (Opsional) */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Penjelasan & Arahan Tambahan (Opsional)
          </label>
          <textarea
            rows={2}
            placeholder="Catatan atau instruksi khusus untuk tim store..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Simpan Kunjungan Buyer</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
