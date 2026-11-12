import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Layers,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Camera,
  Award,
  ListTodo,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';
import { BuyerVisit } from '../types';
import { generateWeeklyVisitPDF } from '../services/pdfExport';

interface AnalyticsDashboardProps {
  visits: BuyerVisit[];
  onOpenReportTab: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  visits,
  onOpenReportTab,
}) => {
  // Key Metrics
  const totalVisits = visits.length;

  const uniqueDepartments = useMemo(() => {
    return new Set(visits.map((v) => v.department).filter(Boolean)).size;
  }, [visits]);

  const allTasks = useMemo(() => visits.flatMap((v) => v.tasks), [visits]);
  const doneTasks = useMemo(() => allTasks.filter((t) => t.isDone).length, [allTasks]);
  const taskCompletionRate = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 100;

  const statusCounts = useMemo(() => {
    const counts = { Selesai: 0, 'Follow Up': 0, 'In Progress': 0, 'Pending Vendor': 0 };
    visits.forEach((v) => {
      if (counts[v.status] !== undefined) counts[v.status]++;
    });
    return counts;
  }, [visits]);

  const totalPhotos = useMemo(() => {
    return visits.reduce((acc, v) => acc + (v.photos?.length || 0), 0);
  }, [visits]);

  // Visits per Department
  const deptDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    visits.forEach((v) => {
      const dept = v.department || 'Lainnya';
      map[dept] = (map[dept] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
        percent: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [visits, totalVisits]);

  // Top PS Leaderboard
  const psLeaderboard = useMemo(() => {
    const map: Record<string, { count: number; completedTasks: number; totalTasks: number }> = {};
    visits.forEach((v) => {
      const ps = v.psName || 'Tidak Diketahui';
      if (!map[ps]) map[ps] = { count: 0, completedTasks: 0, totalTasks: 0 };
      map[ps].count++;
      v.tasks.forEach((t) => {
        map[ps].totalTasks++;
        if (t.isDone) map[ps].completedTasks++;
      });
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .sort((a, b) => b.count - a.count);
  }, [visits]);

  // Buyer Leaderboard
  const buyerDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    visits.forEach((v) => {
      const buyer = v.buyerName || 'Buyer';
      map[buyer] = (map[buyer] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
        percent: totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [visits, totalVisits]);

  // Common topics count
  const topicAnalysis = useMemo(() => {
    const categories: Record<string, number> = {
      'Display & Planogram': 0,
      'Stock & Out of Stock': 0,
      'Pricing & Promo POP': 0,
      'Vendor & Kualitas Retur': 0,
      'Clearance & Slow-Moving': 0,
      'Lainnya / Umum': 0,
    };

    visits.forEach((v) => {
      const text = `${v.discussionTopic} ${v.result}`.toLowerCase();
      if (text.includes('display') || text.includes('planogram') || text.includes('gondola') || text.includes('rak')) {
        categories['Display & Planogram']++;
      } else if (text.includes('stock') || text.includes('oos') || text.includes('kosong') || text.includes('buffer')) {
        categories['Stock & Out of Stock']++;
      } else if (text.includes('harga') || text.includes('promo') || text.includes('diskon') || text.includes('pop')) {
        categories['Pricing & Promo POP']++;
      } else if (text.includes('vendor') || text.includes('cacat') || text.includes('retur') || text.includes('defect')) {
        categories['Vendor & Kualitas Retur']++;
      } else if (text.includes('clearance') || text.includes('slow') || text.includes('cuci')) {
        categories['Clearance & Slow-Moving']++;
      } else {
        categories['Lainnya / Umum']++;
      }
    });

    return Object.entries(categories).sort((a, b) => b[1] - a[1]);
  }, [visits]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
              Live Executive Dashboard
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">Dasbor Analitik Kinerja Visit Buyer</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Pantau statistik kunjungan per departemen, kedisiplinan eksekusi PS, dan tren isu merchandising di toko secara menyeluruh.
          </p>
        </div>

        <button
          onClick={() => generateWeeklyVisitPDF(visits)}
          className="self-start sm:self-center px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center space-x-2 transition-all cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
          <span>Unduh Laporan Lengkap PDF</span>
        </button>
      </div>

      {/* KPI 4-Card Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: Total Visits */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kunjungan</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{totalVisits}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">Kunjungan</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Terupdate real-time</span>
          </div>
        </div>

        {/* KPI 2: Departments Covered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cakupan Dept</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{uniqueDepartments}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">Departemen</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-semibold">
            Area Store Tercover
          </div>
        </div>

        {/* KPI 3: Task Execution Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi Selesai</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{taskCompletionRate}%</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">({doneTasks}/{allTasks.length})</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold">
            Tingkat Penyelesaian Tugas
          </div>
        </div>

        {/* KPI 4: Follow-up required */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Butuh Follow-Up</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900">{statusCounts['Follow Up']}</span>
            <span className="text-xs text-slate-500 ml-1.5 font-medium">Pending Action</span>
          </div>
          <div className="mt-2 text-[11px] text-red-600 font-semibold">
            Membutuhkan koordinasi lanjutan
          </div>
        </div>
      </div>

      {/* Main Charts Row: Dept Distribution & Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits per Department Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Distribusi Kunjungan per Departemen</h2>
              <p className="text-xs text-slate-500">Frekuensi kunjungan Buyer ke tiap departemen store</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {deptDistribution.length} Kategori
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {deptDistribution.map((item, idx) => {
              const maxCount = deptDistribution[0]?.count || 1;
              const barWidth = Math.max(8, Math.round((item.count / maxCount) * 100));

              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">
                      {idx + 1}. {item.name}
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      {item.count} Visit ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-orange-600'
                          : idx === 1
                          ? 'bg-amber-500'
                          : idx === 2
                          ? 'bg-sky-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown & Resolution Ring */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Status Kunjungan</h2>
            <p className="text-xs text-slate-500 mb-4">Progres penyelesaian kesepakatan visit</p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-800">Selesai (Resolved)</span>
                </div>
                <span className="text-sm font-black text-emerald-700">{statusCounts['Selesai']}</span>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-slate-800">Follow Up</span>
                </div>
                <span className="text-sm font-black text-red-700">{statusCounts['Follow Up']}</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-bold text-slate-800">In Progress</span>
                </div>
                <span className="text-sm font-black text-blue-700">{statusCounts['In Progress']}</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-slate-800">Pending Vendor</span>
                </div>
                <span className="text-sm font-black text-amber-700">{statusCounts['Pending Vendor']}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-slate-700">
              <Camera className="w-4 h-4 text-orange-600" />
              <span>Total Bukti Foto Before-After</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalPhotos} Pasang Foto</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Dokumentasi fisik store & display</p>
          </div>
        </div>
      </div>

      {/* Row 2: Top PS & Buyer Leaderboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top PS Staff */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Product Specialist (PS) Teraktif</span>
              </h2>
              <p className="text-xs text-slate-500">Staf section yang paling sering didampingi & eksekusi tugas</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {psLeaderboard.slice(0, 5).map((ps, idx) => (
              <div
                key={ps.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      idx === 0
                        ? 'bg-amber-400 text-amber-950 shadow-sm'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{ps.name}</h4>
                    <span className="text-[10px] text-slate-500">
                      Tugas Selesai: {ps.completedTasks} dari {ps.totalTasks}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">{ps.count}</span>
                  <span className="text-[10px] text-slate-500 block">Kunjungan</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity per Buyer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Aktivitas Commercial Buyer</h2>
              <p className="text-xs text-slate-500">Jumlah kunjungan yang telah dicatatkan tiap Buyer</p>
            </div>
          </div>

          <div className="space-y-3">
            {buyerDistribution.map((b) => (
              <div key={b.name} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800">{b.name}</span>
                  <span className="text-xs font-extrabold text-orange-600">
                    {b.count} Visit ({b.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-orange-600 rounded-full"
                    style={{ width: `${b.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Topic Frequency Insights */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Topik Paling Sering Didiskusikan:
            </h3>
            <div className="flex flex-wrap gap-2">
              {topicAnalysis.map(([topic, count]) => (
                <span
                  key={topic}
                  className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 font-medium"
                >
                  {topic}: <strong>{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
