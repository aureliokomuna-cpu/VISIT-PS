/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VisitForm } from './components/VisitForm';
import { VisitList } from './components/VisitList';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WeeklyReportView } from './components/WeeklyReportView';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { NetlifyDeployModal } from './components/NetlifyDeployModal';
import { BuyerVisit, GoogleSheetsConfig } from './types';
import {
  getVisits,
  getSheetsConfig,
  syncVisitsFromServer,
  registerCustomDepartment,
  registerCustomPS,
} from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'list' | 'analytics' | 'report'>('form');
  const [visits, setVisits] = useState<BuyerVisit[]>([]);
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(getSheetsConfig());
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);

  // Initialize data on mount & start real-time multi-user sync
  useEffect(() => {
    // 1. Initial load from local and server
    const local = getVisits();
    if (local && local.length > 0) {
      setVisits(local);
    }
    setSheetsConfig(getSheetsConfig());

    // 2. Sync from centralized multi-user server
    syncVisitsFromServer().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setVisits(loaded);
      }
    });

    // 3. Real-time polling every 5s so all users immediately see new entries
    const interval = setInterval(() => {
      syncVisitsFromServer().then((updated) => {
        if (updated) setVisits(updated);
      });
    }, 5000);

    // 4. Sync on tab focus or screen unlock
    const handleFocus = () => {
      syncVisitsFromServer().then((updated) => {
        if (updated) setVisits(updated);
      });
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const handleVisitSaved = (newVisit: BuyerVisit) => {
    setVisits((prev) => [newVisit, ...prev]);
  };

  const handleVisitsUpdated = (updatedVisits: BuyerVisit[]) => {
    setVisits(updatedVisits);
  };

  const handleConfigSaved = (updatedConfig: GoogleSheetsConfig) => {
    setSheetsConfig(updatedConfig);
  };

  const handleHistoryPulled = (depts: string[], psList: string[]) => {
    depts.forEach((d) => registerCustomDepartment(d));
    psList.forEach((p) => registerCustomPS(p));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        visitCount={visits.length}
        sheetsConfig={sheetsConfig}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* Main Tab Views */}
      <main className="flex-1 pb-16">
        {activeTab === 'form' && (
          <VisitForm
            onVisitSaved={handleVisitSaved}
            sheetsConfig={sheetsConfig}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          />
        )}

        {activeTab === 'list' && (
          <VisitList
            visits={visits}
            onVisitsUpdated={handleVisitsUpdated}
            sheetsConfig={sheetsConfig}
            onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            visits={visits}
            onOpenReportTab={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'report' && <WeeklyReportView visits={visits} />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-slate-300">
              Homecenter Commercial Buyer Visit Tracker
            </span>
            <span>•</span>
            <span>Google Sheets & Drive Sync Active</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSheetsModalOpen(true)}
              className="hover:text-orange-400 transition-colors"
            >
              Koneksi Google Sheets
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDeployModalOpen(true)}
              className="hover:text-sky-400 transition-colors"
            >
              Deploy ke Netlify
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isSheetsModalOpen && (
        <GoogleSheetsModal
          config={sheetsConfig}
          onConfigSaved={handleConfigSaved}
          onClose={() => setIsSheetsModalOpen(false)}
          onHistoryPulled={handleHistoryPulled}
        />
      )}

      {isDeployModalOpen && (
        <NetlifyDeployModal onClose={() => setIsDeployModalOpen(false)} />
      )}
    </div>
  );
}
