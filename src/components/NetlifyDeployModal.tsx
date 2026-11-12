import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Download,
  FileCode,
  Package,
  Sparkles,
  ArrowRight,
  FileArchive,
} from 'lucide-react';
import { getVisits } from '../services/storage';

interface NetlifyDeployModalProps {
  onClose: () => void;
}

export const NetlifyDeployModal: React.FC<NetlifyDeployModalProps> = ({ onClose }) => {
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const liveUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadBackup = () => {
    const data = JSON.stringify(getVisits(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_visit_buyer_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">
                Download File & Deploy ke Netlify
              </h2>
              <p className="text-xs text-slate-400">
                Unduh file HTML / Paket ZIP siap drop ke Netlify atau bagikan link langsung
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
          {/* Main Action Box: Download ZIP for Netlify Drop */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-600 to-teal-600 text-white shadow-lg shadow-sky-500/20 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-100">
                Cara Paling Cepat & Resmi Netlify Drop
              </span>
            </div>

            <h3 className="text-xl font-black">
              Download Paket Lengkap (ZIP) Siap Drop
            </h3>
            <p className="text-xs text-sky-100 leading-relaxed">
              Paket ini berisi <code className="bg-black/20 px-1 py-0.5 rounded font-mono">index.html</code>, seluruh CSS/JavaScript, aset desain, dan konfigurasi rute SPA (<code className="bg-black/20 px-1 py-0.5 rounded font-mono">_redirects</code>) yang siap di-drop langsung ke Netlify.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <a
                href="/api/download-netlify-zip"
                download="buyer-visit-tracker-netlify.zip"
                className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileArchive className="w-4 h-4 text-sky-600" />
                <span>Download Paket ZIP Netlify (445 KB)</span>
              </a>

              <a
                href="https://app.netlify.com/drop"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Buka Netlify Drop</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
              </a>
            </div>
          </div>

          {/* Download index.html directly */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Hanya Unduh File index.html Saja
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  File entri utama HTML yang sudah dibundel untuk kebutuhan hosting Anda.
                </p>
              </div>
            </div>

            <a
              href="/api/download-html"
              download="index.html"
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-orange-600" />
              <span>Download index.html</span>
            </a>
          </div>

          {/* Panduan Langkah ke Netlify */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Langkah Singkat Pasang di Netlify:
            </h4>

            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <li>
                Klik tombol biru <strong>"Download Paket ZIP Netlify"</strong> di atas.
              </li>
              <li>
                Buka tab baru ke{' '}
                <a
                  href="https://app.netlify.com/drop"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 font-bold underline inline-flex items-center gap-1"
                >
                  app.netlify.com/drop <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                <strong>Tarik (drag & drop)</strong> file <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[11px]">buyer-visit-tracker-netlify.zip</code> yang baru Anda unduh ke dalam area kotak di layar Netlify.
              </li>
              <li>
                Website langsung aktif dalam beberapa detik dan Anda mendapatkan link publik Netlify Anda sendiri!
              </li>
            </ol>
          </div>

          {/* Live Link Saat Ini */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Link Live Web Saat Ini (Bisa Dibuka Langsung Sekarang):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={liveUrl}
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono bg-white text-slate-800 font-medium select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Backup Data */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Ingin cadangkan data kunjungan saat ini?</span>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="text-xs text-orange-600 hover:underline font-bold flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Download Data JSON</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
