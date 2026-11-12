import React from 'react';
import {
  ClipboardList,
  BarChart3,
  FileSpreadsheet,
  FileDown,
  PlusCircle,
  ExternalLink,
  Sparkles,
  CloudCheck,
  CloudUpload,
} from 'lucide-react';
import { GoogleSheetsConfig } from '../types';

interface NavbarProps {
  activeTab: 'form' | 'list' | 'analytics' | 'report';
  setActiveTab: (tab: 'form' | 'list' | 'analytics' | 'report') => void;
  visitCount: number;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsModal: () => void;
  onOpenDeployModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  visitCount,
  sheetsConfig,
  onOpenSheetsModal,
  onOpenDeployModal,
}) => {
  const isSheetsConnected = Boolean(sheetsConfig.scriptUrl && sheetsConfig.scriptUrl.trim());

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('form')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold text-lg">
              HC
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-lg text-white">
                  Buyer Visit Tracker
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full">
                  Homecenter Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monitoring Kunjungan Buyer, Evaluasi PS, & Foto Before-After
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'form'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Input Visit</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Daftar Visit ({visitCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dasbor Analitik</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'report'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Laporan Mingguan PDF</span>
            </button>
          </nav>

          {/* Quick Actions (Live DB, Sheets Sync & Netlify Deploy) */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-User Terkoneksi</span>
            </div>

            <button
              onClick={onOpenSheetsModal}
              title="Pengaturan Koneksi Google Sheets & Drive"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isSheetsConnected
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Google Sheets</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isSheetsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>

            <button
              onClick={onOpenDeployModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white shadow-sm border border-sky-400/30 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Netlify / Deploy</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Tabs */}
        <div className="flex md:hidden overflow-x-auto space-x-2 py-2 border-t border-slate-800 text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('form')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'form' ? 'bg-orange-600 text-white' : 'text-slate-300 bg-slate-800'
            }`}
          >
            Input Visit
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'list' ? 'bg-orange-600 text-white' : 'text-slate-300 bg-slate-800'
            }`}
          >
            Daftar ({visitCount})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'analytics' ? 'bg-orange-600 text-white' : 'text-slate-300 bg-slate-800'
            }`}
          >
            Analitik
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1 rounded-md shrink-0 font-medium ${
              activeTab === 'report' ? 'bg-orange-600 text-white' : 'text-slate-300 bg-slate-800'
            }`}
          >
            Laporan PDF
          </button>
        </div>
      </div>
    </header>
  );
};
