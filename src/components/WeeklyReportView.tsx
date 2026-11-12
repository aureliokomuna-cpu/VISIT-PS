import React, { useState, useMemo } from 'react';
import {
  FileDown,
  Calendar,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { BuyerVisit } from '../types';
import { generateWeeklyVisitPDF } from '../services/pdfExport';
import { exportVisitsToCsv } from '../services/googleSheets';

interface WeeklyReportViewProps {
  visits: BuyerVisit[];
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({ visits }) => {
  // Date calculation defaults
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

  const [datePreset, setDatePreset] = useState<'thisWeek' | 'lastWeek' | 'thisMonth' | 'all'>('thisWeek');
  const [customStart, setCustomStart] = useState<string>(startOfWeek.toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState<string>(endOfWeek.toISOString().slice(0, 10));
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedBuyer, setSelectedBuyer] = useState<string>('all');

  // Handle Preset Changes
  const handlePresetChange = (preset: 'thisWeek' | 'lastWeek' | 'thisMonth' | 'all') => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'thisWeek') {
      const mon = new Date(now);
      mon.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      setCustomStart(mon.toISOString().slice(0, 10));
      setCustomEnd(sun.toISOString().slice(0, 10));
    } else if (preset === 'lastWeek') {
      const mon = new Date(now);
      mon.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) - 7);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      setCustomStart(mon.toISOString().slice(0, 10));
      setCustomEnd(sun.toISOString().slice(0, 10));
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setCustomStart(firstDay.toISOString().slice(0, 10));
      setCustomEnd(lastDay.toISOString().slice(0, 10));
    } else {
      // all
      setCustomStart('');
      setCustomEnd('');
    }
  };

  // Filtered visits for the report
  const reportVisits = useMemo(() => {
    return visits.filter((v) => {
      let matchDate = true;
      if (customStart && v.visitDate < customStart) matchDate = false;
      if (customEnd && v.visitDate > customEnd) matchDate = false;

      const matchDept = selectedDept === 'all' || v.department === selectedDept;
      const matchBuyer = selectedBuyer === 'all' || v.buyerName === selectedBuyer;

      return matchDate && matchDept && matchBuyer;
    });
  }, [visits, customStart, customEnd, selectedDept, selectedBuyer]);

  const departments = useMemo(() => {
    return Array.from(new Set(visits.map((v) => v.department).filter(Boolean))).sort();
  }, [visits]);

  const buyers = useMemo(() => {
    return Array.from(new Set(visits.map((v) => v.buyerName).filter(Boolean))).sort();
  }, [visits]);

  // Report statistics
  const totalVisits = reportVisits.length;
  const uniqueDepts = new Set(reportVisits.map((v) => v.department)).size;
  const allTasks = reportVisits.flatMap((v) => v.tasks);
  const doneTasks = allTasks.filter((t) => t.isDone).length;
  const taskRate = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 100;

  const handleDownloadPDF = () => {
    generateWeeklyVisitPDF(reportVisits, {
      title: 'Laporan Mingguan Kunjungan Buyer',
      startDate: customStart,
      endDate: customEnd,
      departmentFilter: selectedDept !== 'all' ? selectedDept : undefined,
      buyerFilter: selectedBuyer !== 'all' ? selectedBuyer : undefined,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            Modul Pelaporan Resmi
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Laporan Mingguan Kunjungan Buyer</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Buat rekapitulasi evaluasi display, stok barang, performa PS, dan kesepakatan komersial mingguan dalam format PDF resmi dengan tanda tangan otorisasi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => exportVisitsToCsv(reportVisits)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF Resmi ({totalVisits})</span>
          </button>
        </div>
      </div>

      {/* Filter Options Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Filter Periode & Departemen Laporan:
        </h3>

        {/* Date presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'thisWeek', label: 'Minggu Ini' },
            { id: 'lastWeek', label: 'Minggu Lalu' },
            { id: 'thisMonth', label: 'Bulan Ini' },
            { id: 'all', label: 'Semua Periode' },
          ].map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetChange(preset.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                datePreset === preset.id
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Date range & Dept picker */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Mulai Tanggal</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => {
                setCustomStart(e.target.value);
                setDatePreset('all');
              }}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => {
                setCustomEnd(e.target.value);
                setDatePreset('all');
              }}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Departemen</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
            >
              <option value="all">Semua Departemen ({departments.length})</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Buyer</label>
            <select
              value={selectedBuyer}
              onChange={(e) => setSelectedBuyer(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
            >
              <option value="all">Semua Buyer ({buyers.length})</option>
              {buyers.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live PDF Preview Document */}
      <div className="bg-white rounded-3xl border border-slate-300 shadow-md p-6 sm:p-10 space-y-6">
        {/* Document Header */}
        <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-orange-600 text-white font-black text-sm flex items-center justify-center">
                HC
              </span>
              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900">
                  HOMECENTER RETAIL OPERATIONS
                </h2>
                <span className="text-[11px] text-slate-500 uppercase tracking-widest block font-bold">
                  Commercial & Buying Division
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h3 className="text-sm font-extrabold text-orange-600 uppercase">
              LAPORAN REKAPITULASI KUNJUNGAN BUYER
            </h3>
            <span className="text-xs text-slate-500 font-medium block">
              {customStart && customEnd
                ? `Periode: ${customStart} s/d ${customEnd}`
                : 'Periode: Seluruh Data Tersimpan'}
            </span>
          </div>
        </div>

        {/* 4 KPI Summary Pill blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total Kunjungan</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{totalVisits} Visit</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-700 uppercase">Departemen</span>
            <div className="text-xl font-black text-blue-900 mt-0.5">{uniqueDepts} Area</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Aksi Terealisasi</span>
            <div className="text-xl font-black text-emerald-900 mt-0.5">
              {doneTasks}/{allTasks.length} ({taskRate}%)
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-700 uppercase">Status Selesai</span>
            <div className="text-xl font-black text-amber-900 mt-0.5">
              {reportVisits.filter((v) => v.status === 'Selesai').length} Done
            </div>
          </div>
        </div>

        {/* Table of Visits */}
        {reportVisits.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Tidak ada kunjungan tercatat pada rentang periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
              <thead className="bg-slate-800 text-white font-bold">
                <tr>
                  <th className="p-2.5 w-10 text-center">No</th>
                  <th className="p-2.5 w-24">Tgl & Jam</th>
                  <th className="p-2.5 w-36">Departemen</th>
                  <th className="p-2.5 w-32">Nama PS</th>
                  <th className="p-2.5 w-28">Nama Buyer</th>
                  <th className="p-2.5">Topik Diskusi & Kesimpulan Result</th>
                  <th className="p-2.5 w-24 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {reportVisits.map((v, i) => (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 text-center font-bold text-slate-500">{i + 1}</td>
                    <td className="p-2.5 font-medium">
                      <div>{v.visitDate}</div>
                      <div className="text-[10px] text-slate-400">{v.visitTime}</div>
                    </td>
                    <td className="p-2.5 font-bold text-orange-600">{v.department}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{v.psName}</td>
                    <td className="p-2.5 text-slate-700">{v.buyerName}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900 mb-0.5">{v.discussionTopic}</div>
                      <div className="text-slate-600 line-clamp-2">{v.result}</div>
                      {v.tasks.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          Aksi: {v.tasks.map((t) => `${t.isDone ? '✓' : '○'} ${t.title}`).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : v.status === 'Follow Up'
                            ? 'bg-red-100 text-red-800'
                            : v.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Area Preview */}
        <div className="pt-8 border-t border-slate-200">
          <div className="text-xs font-bold text-slate-600 mb-6">
            Tanda Tangan Pengesahan Laporan Kunjungan:
          </div>
          <div className="grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="font-bold text-slate-800">Dibuat Oleh,</div>
              <div className="text-[11px] text-slate-500">Commercial Buyer</div>
              <div className="mt-14 border-b border-slate-300 w-36 mx-auto" />
              <div className="text-[10px] text-slate-400 mt-1">(Tanda Tangan & Nama Terang)</div>
            </div>

            <div>
              <div className="font-bold text-slate-800">Mengetahui,</div>
              <div className="text-[11px] text-slate-500">Store Operation Head</div>
              <div className="mt-14 border-b border-slate-300 w-36 mx-auto" />
              <div className="text-[10px] text-slate-400 mt-1">(Tanda Tangan & Nama Terang)</div>
            </div>

            <div>
              <div className="font-bold text-slate-800">PIC Departemen,</div>
              <div className="text-[11px] text-slate-500">Product Specialist (PS)</div>
              <div className="mt-14 border-b border-slate-300 w-36 mx-auto" />
              <div className="text-[10px] text-slate-400 mt-1">(Tanda Tangan & Nama Terang)</div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-100">
          Dokumen ini dibuat otomatis oleh Sistem Buyer Visit Tracker Homecenter. Tersinkronisasi dengan Google Drive Folder: 1Gr4hynXvtuiMhu6ejzv-fR7gon-3BLwT.
        </div>
      </div>
    </div>
  );
};
