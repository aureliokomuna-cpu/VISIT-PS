import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileSpreadsheet,
  FileDown,
  Calendar,
  Layers,
  UserCheck,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Eye,
  Camera,
  X,
  ListTodo,
  FileText,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { BuyerVisit, VisitStatus, GoogleSheetsConfig } from '../types';
import { deleteVisit, updateVisit } from '../services/storage';
import { exportVisitsToCsv, sendVisitToGoogleSheets } from '../services/googleSheets';
import { generateWeeklyVisitPDF } from '../services/pdfExport';

interface VisitListProps {
  visits: BuyerVisit[];
  onVisitsUpdated: (updated: BuyerVisit[]) => void;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsModal: () => void;
}

export const VisitList: React.FC<VisitListProps> = ({
  visits,
  onVisitsUpdated,
  sheetsConfig,
  onOpenSheetsModal,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedPS, setSelectedPS] = useState<string>('all');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVisitModal, setSelectedVisitModal] = useState<BuyerVisit | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [activePhotoTab, setActivePhotoTab] = useState<'both' | 'before' | 'after'>('both');

  // Distinct lists for filters
  const departments = useMemo(() => {
    return Array.from(new Set(visits.map((v) => v.department).filter(Boolean))).sort();
  }, [visits]);

  const psNames = useMemo(() => {
    return Array.from(new Set(visits.map((v) => v.psName).filter(Boolean))).sort();
  }, [visits]);

  const buyers = useMemo(() => {
    return Array.from(new Set(visits.map((v) => v.buyerName).filter(Boolean))).sort();
  }, [visits]);

  // Filtered visits
  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const matchSearch =
        searchTerm === '' ||
        v.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.psName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.discussionTopic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.result.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.notes && v.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchDept = selectedDept === 'all' || v.department === selectedDept;
      const matchPS = selectedPS === 'all' || v.psName === selectedPS;
      const matchBuyer = selectedBuyer === 'all' || v.buyerName === selectedBuyer;
      const matchStatus = selectedStatus === 'all' || v.status === selectedStatus;

      return matchSearch && matchDept && matchPS && matchBuyer && matchStatus;
    });
  }, [visits, searchTerm, selectedDept, selectedPS, selectedBuyer, selectedStatus]);

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Yakin ingin menghapus data kunjungan ini?')) {
      const updated = deleteVisit(id);
      onVisitsUpdated(updated);
      if (selectedVisitModal?.id === id) {
        setSelectedVisitModal(null);
      }
    }
  };

  const handleToggleTaskInModal = (taskId: string) => {
    if (!selectedVisitModal) return;
    const updatedTasks = selectedVisitModal.tasks.map((t) =>
      t.id === taskId ? { ...t, isDone: !t.isDone } : t
    );
    const updatedVisit = { ...selectedVisitModal, tasks: updatedTasks };
    setSelectedVisitModal(updatedVisit);
    const updated = updateVisit(updatedVisit);
    onVisitsUpdated(updated);
  };

  const handleSyncVisitNow = async (visit: BuyerVisit, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!sheetsConfig.scriptUrl) {
      onOpenSheetsModal();
      return;
    }

    const res = await sendVisitToGoogleSheets(visit, sheetsConfig);
    if (res.success) {
      const updatedVisit = { ...visit, syncedToSheets: true };
      const updated = updateVisit(updatedVisit);
      onVisitsUpdated(updated);
      if (selectedVisitModal?.id === visit.id) {
        setSelectedVisitModal(updatedVisit);
      }
      alert('Berhasil disinkronkan ke Google Sheets!');
    } else {
      alert(`Gagal sync: ${res.message}`);
    }
  };

  const handleSyncAllToSheets = async () => {
    if (!sheetsConfig.scriptUrl) {
      onOpenSheetsModal();
      return;
    }

    setIsSyncingAll(true);
    let successCount = 0;
    for (const v of visits) {
      const res = await sendVisitToGoogleSheets(v, sheetsConfig);
      if (res.success) successCount++;
    }
    setIsSyncingAll(false);
    alert(`Selesai sinkronisasi! ${successCount} dari ${visits.length} data berhasil dikirim ke Google Sheets.`);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daftar Riwayat Kunjungan Buyer</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold">
              {filteredVisits.length} Data
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola arsip kunjungan per departemen, pantau status tindak lanjut PS, dan ekspor data ke Excel/PDF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportVisitsToCsv(filteredVisits)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
            title="Download file CSV siap buka di Excel atau Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => generateWeeklyVisitPDF(filteredVisits)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
            title="Download Laporan PDF Resmi Kunjungan"
          >
            <FileDown className="w-4 h-4 text-orange-400" />
            <span>Cetak PDF ({filteredVisits.length})</span>
          </button>

          <button
            onClick={handleSyncAllToSheets}
            disabled={isSyncingAll}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            title="Sinkronkan seluruh kunjungan ke Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing...' : 'Sync Google Sheets'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-6 shadow-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama departemen, PS, buyer, topik diskusi, atau hasil..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Reset
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Departemen Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Departemen
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="all">Semua Departemen ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* PS Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Nama PS
            </label>
            <select
              value={selectedPS}
              onChange={(e) => setSelectedPS(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="all">Semua PS ({psNames.length})</option>
              {psNames.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Buyer Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Nama Buyer
            </label>
            <select
              value={selectedBuyer}
              onChange={(e) => setSelectedBuyer(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="all">Semua Buyer ({buyers.length})</option>
              {buyers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status Visit
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Follow Up">Follow Up</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Vendor">Pending Vendor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visits Cards Grid */}
      {filteredVisits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">Tidak ada kunjungan ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau reset filter untuk menampilkan data kunjungan lainnya.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedDept('all');
              setSelectedPS('all');
              setSelectedBuyer('all');
              setSelectedStatus('all');
            }}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVisits.map((visit) => {
            const doneTasks = visit.tasks.filter((t) => t.isDone).length;
            const hasPhotos = visit.photos.length > 0;

            return (
              <div
                key={visit.id}
                onClick={() => setSelectedVisitModal(visit)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-orange-400/80 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Top Bar: Date, Time & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      <span>{visit.visitDate}</span>
                      {visit.visitTime && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {visit.visitTime}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        visit.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : visit.status === 'Follow Up'
                          ? 'bg-red-100 text-red-800'
                          : visit.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {visit.status}
                    </span>
                  </div>

                  {/* Department & PS tags */}
                  <div className="mb-2">
                    <span className="text-xs font-extrabold text-orange-600 tracking-wide uppercase block">
                      {visit.department}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 mt-0.5">
                      {visit.discussionTopic}
                    </h3>
                  </div>

                  {/* Result snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                    {visit.result}
                  </p>

                  {/* Tasks count & Photo preview snippet */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700">
                        {doneTasks}/{visit.tasks.length}
                      </span>
                      <span className="text-[11px] text-slate-400">tugas selesai</span>
                    </div>

                    {hasPhotos && (
                      <div className="flex items-center space-x-1 text-slate-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                        <Camera className="w-3 h-3 text-orange-600" />
                        <span className="text-[11px] font-semibold text-orange-800">
                          {visit.photos.length} Foto Before-After
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Photo thumbnails if available */}
                  {hasPhotos && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="relative rounded-lg overflow-hidden h-20 bg-slate-100 border border-slate-200">
                        <img
                          src={visit.photos[0].beforeUrl}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-red-600/90 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                          Before
                        </span>
                      </div>
                      <div className="relative rounded-lg overflow-hidden h-20 bg-slate-100 border border-slate-200">
                        <img
                          src={visit.photos[0].afterUrl}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-emerald-600/90 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                          After
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Personnel & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="truncate pr-2">
                    <div className="flex items-center space-x-1 text-slate-800 font-semibold truncate">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{visit.psName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">Buyer: {visit.buyerName}</div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => handleSyncVisitNow(visit, e)}
                      title={visit.syncedToSheets ? 'Tersinkron ke Sheets' : 'Sync ke Sheets'}
                      className={`p-1.5 rounded-lg border transition-all ${
                        visit.syncedToSheets
                          ? 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'text-slate-400 hover:text-orange-600 border-slate-200 hover:bg-orange-50'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(visit.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200 hover:bg-red-50 transition-all"
                      title="Hapus Kunjungan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Kunjungan */}
      {selectedVisitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                  Detail Kunjungan Buyer
                </span>
                <h2 className="text-xl font-black mt-0.5">{selectedVisitModal.department}</h2>
                <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1">
                  <span>Tgl: {selectedVisitModal.visitDate} {selectedVisitModal.visitTime}</span>
                  <span>•</span>
                  <span>PS: {selectedVisitModal.psName}</span>
                  <span>•</span>
                  <span>Buyer: {selectedVisitModal.buyerName}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedVisitModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status & Sync banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-600">Status Kunjungan:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      selectedVisitModal.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedVisitModal.status === 'Follow Up'
                        ? 'bg-red-100 text-red-800'
                        : selectedVisitModal.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedVisitModal.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSyncVisitNow(selectedVisitModal)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Sync ke Google Sheets</span>
                  </button>
                  <button
                    onClick={() => generateWeeklyVisitPDF([selectedVisitModal], { title: `Kunjungan ${selectedVisitModal.department}` })}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5 text-orange-400" />
                    <span>Unduh PDF</span>
                  </button>
                </div>
              </div>

              {/* Discussion & Result */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Topik Diskusi
                </h4>
                <p className="text-base font-bold text-slate-900 bg-orange-50/50 p-3 rounded-xl border border-orange-200/60">
                  {selectedVisitModal.discussionTopic}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Result / Hasil Kesepakatan
                </h4>
                <div className="text-sm text-slate-800 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedVisitModal.result}
                </div>
              </div>

              {/* Action Tasks */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Pekerjaan yang Dilakukan ({selectedVisitModal.tasks.length})</span>
                  <span className="text-[11px] text-slate-400 font-normal">Klik untuk update status</span>
                </h4>
                <div className="space-y-2">
                  {selectedVisitModal.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTaskInModal(task.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        task.isDone ? 'bg-emerald-50/50 border-emerald-200 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={task.isDone}
                          onChange={() => handleToggleTaskInModal(task.id)}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className={`text-sm ${task.isDone ? 'line-through text-slate-500' : 'font-medium'}`}>
                          {task.title}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${task.isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {task.isDone ? 'Selesai' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos Before After */}
              {selectedVisitModal.photos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Dokumentasi Foto Before & After
                    </h4>
                    <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
                      <button
                        onClick={() => setActivePhotoTab('both')}
                        className={`px-2.5 py-1 rounded-md font-medium ${
                          activePhotoTab === 'both' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        Berdampingan
                      </button>
                      <button
                        onClick={() => setActivePhotoTab('before')}
                        className={`px-2.5 py-1 rounded-md font-medium ${
                          activePhotoTab === 'before' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        Before
                      </button>
                      <button
                        onClick={() => setActivePhotoTab('after')}
                        className={`px-2.5 py-1 rounded-md font-medium ${
                          activePhotoTab === 'after' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        After
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedVisitModal.photos.map((photo) => (
                      <div key={photo.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800">{photo.label}</span>
                          <span className="text-[10px] text-slate-400">{photo.timestamp}</span>
                        </div>

                        {activePhotoTab === 'both' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="relative rounded-xl overflow-hidden border border-red-200 bg-white">
                              <img src={photo.beforeUrl} alt="Before" className="w-full h-56 object-cover" />
                              <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md">
                                BEFORE (Sebelum)
                              </span>
                            </div>
                            <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-white">
                              <img src={photo.afterUrl} alt="After" className="w-full h-56 object-cover" />
                              <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md">
                                AFTER (Sesudah)
                              </span>
                            </div>
                          </div>
                        )}

                        {activePhotoTab === 'before' && (
                          <div className="relative rounded-xl overflow-hidden border border-red-200 bg-white">
                            <img src={photo.beforeUrl} alt="Before" className="w-full h-80 object-cover" />
                            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-md">
                              BEFORE (Sebelum)
                            </span>
                          </div>
                        )}

                        {activePhotoTab === 'after' && (
                          <div className="relative rounded-xl overflow-hidden border border-emerald-200 bg-white">
                            <img src={photo.afterUrl} alt="After" className="w-full h-80 object-cover" />
                            <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow-md">
                              AFTER (Sesudah)
                            </span>
                          </div>
                        )}

                        {photo.notes && (
                          <p className="text-xs text-slate-600 mt-2 bg-white p-2.5 rounded-xl border border-slate-200">
                            <strong>Catatan Perubahan:</strong> {photo.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kolom Penjelasan & Arahan */}
              {selectedVisitModal.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Kolom Penjelasan & Arahan Masukan Buyer
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-800 bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 leading-relaxed">
                    {selectedVisitModal.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedVisitModal.id)}
                className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Kunjungan Ini</span>
              </button>

              <button
                onClick={() => setSelectedVisitModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
