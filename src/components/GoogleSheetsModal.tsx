import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  FolderOpen,
  Sparkles,
  Layers,
  ArrowDownToLine,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
} from 'lucide-react';
import { GoogleSheetsConfig } from '../types';
import { saveSheetsConfig } from '../services/storage';
import {
  APPS_SCRIPT_TEMPLATE,
  fetchFromGoogleSheets,
  exportVisitsToCsv,
} from '../services/googleSheets';
import { getVisits } from '../services/storage';

interface GoogleSheetsModalProps {
  config: GoogleSheetsConfig;
  onConfigSaved: (config: GoogleSheetsConfig) => void;
  onClose: () => void;
  onHistoryPulled?: (depts: string[], psList: string[]) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  config,
  onConfigSaved,
  onClose,
  onHistoryPulled,
}) => {
  const [scriptUrl, setScriptUrl] = useState<string>(config.scriptUrl || '');
  const [sheetName, setSheetName] = useState<string>(config.sheetName || 'Hasil_Visit_Buyer');
  const [autoSync, setAutoSync] = useState<boolean>(config.autoSync !== false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    stats?: { depts: number; ps: number; visits: number };
  } | null>(null);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSave = () => {
    const updated: GoogleSheetsConfig = {
      ...config,
      scriptUrl: scriptUrl.trim(),
      sheetName: sheetName.trim() || 'Hasil_Visit_Buyer',
      autoSync,
    };
    saveSheetsConfig(updated);
    onConfigSaved(updated);
    alert('Pengaturan koneksi Google Sheets berhasil disimpan!');
  };

  const handleTestAndPull = async () => {
    if (!scriptUrl.trim()) {
      alert('Harap masukkan URL Google Apps Script Web App terlebih dahulu.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await fetchFromGoogleSheets({
      ...config,
      scriptUrl: scriptUrl.trim(),
    });

    setIsTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: `Terhubung dengan Google Sheets! Berhasil membaca ${res.departments.length} Departemen dan ${res.psNames.length} Nama PS.`,
        stats: {
          depts: res.departments.length,
          ps: res.psNames.length,
          visits: res.visits?.length || 0,
        },
      });

      if (onHistoryPulled) {
        onHistoryPulled(res.departments, res.psNames);
      }
    } else {
      setTestResult({
        success: false,
        message: `Gagal terhubung: ${res.message || 'Periksa URL dan pastikan Web App disetel ke Anyone'}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Integrasi API Real-time Google Sheets & Drive
              </h2>
              <p className="text-xs text-slate-400">
                Otomatisasi riwayat Departemen & PS dan sinkronisasi laporan kunjungan
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Drive Folder Direct Link */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <FolderOpen className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Folder Google Drive Anda
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  ID Folder: <code className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800 font-mono text-[11px]">{config.sheetId}</code>
                </p>
              </div>
            </div>

            <a
              href={config.folderUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all"
            >
              <span>Buka Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Web App URL Input & Auto Sync */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Pengaturan Koneksi Web App Real-time:</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                URL Google Apps Script Web App
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono bg-white"
                />
                <button
                  type="button"
                  onClick={handleTestAndPull}
                  disabled={isTesting}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Memeriksa...' : 'Uji & Tarik Data'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Masukkan URL Web App dari Google Sheets Anda untuk mengaktifkan sinkronisasi 2 arah otomatis.
              </p>
            </div>

            {/* Test result feedback */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span className="flex-1 font-medium">{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="autoSyncCheck"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <label htmlFor="autoSyncCheck" className="text-xs text-slate-700 font-semibold cursor-pointer">
                Otomatis kirim data visit ke Google Sheets saat form disimpan
              </label>
            </div>
          </div>

          {/* Tutorial / Steps to setup Google Apps Script */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Panduan Cepat Pasang API di Google Sheets (Hanya 1 Menit):
              </h3>

              <button
                type="button"
                onClick={handleCopyScript}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode Script</span>
                  </>
                )}
              </button>
            </div>

            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <li>
                Buka spreadsheet Anda di folder Drive atau buat baru di{' '}
                <a
                  href={config.folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-600 font-semibold underline"
                >
                  Folder Google Drive Anda
                </a>.
              </li>
              <li>
                Pada menu atas Google Sheet, klik <strong>Extensions (Ekstensi)</strong> &gt; <strong>Apps Script</strong>.
              </li>
              <li>
                Hapus teks kode yang ada di layar, lalu klik tombol <strong>"Salin Kode Script"</strong> di atas dan <strong>Paste (Ctrl+V)</strong> ke editor.
              </li>
              <li>
                Klik tombol biru <strong>Deploy (Terapkan)</strong> di kanan atas &gt; <strong>New deployment (Penerapan baru)</strong>.
              </li>
              <li>
                Pilih type <strong>Web app</strong>. Pada opsi <em>Who has access (Siapa yang memiliki akses)</em>, pilih <strong>Anyone (Siapa saja)</strong>.
              </li>
              <li>
                Klik <strong>Deploy</strong>, lalu salin URL Web App yang muncul dan tempelkan ke kolom URL di atas!
              </li>
            </ol>
          </div>

          {/* Quick Fallback: Export CSV */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Butuh Backup Cepat?</h4>
              <p className="text-[11px] text-slate-500">
                Unduh seluruh data kunjungan lokal dalam format CSV untuk langsung di-upload ke Google Sheets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportVisitsToCsv(getVisits())}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
