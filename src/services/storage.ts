import { BuyerVisit, GoogleSheetsConfig } from '../types';

const VISITS_STORAGE_KEY = 'homecenter_buyer_visits_v2';
const CONFIG_STORAGE_KEY = 'homecenter_sheets_config_v1';
const DEPARTMENTS_STORAGE_KEY = 'homecenter_custom_departments_v2';
const PS_NAMES_STORAGE_KEY = 'homecenter_custom_ps_names_v2';

// Pemetaan Resmi NEW DEPT & NAMA PS sesuai data pengguna
export const OFFICIAL_DEPT_PS_MAPPING: Record<string, string[]> = {
  'SOFA & CHAIR': ['DEAN', 'FIRMAN'],
  'TABLE & CABINET': ['NASRUL', 'DHEDE'],
  'ASHLEY': ['JAKA', 'CECEP'],
  'LIGHTING': ['ARI'],
  'HOME TEXTILE': ['JAYA', 'SHELI'],
  'HOME DECORE': ['SUPRI', 'BENI'],
  'HOME ORGANIZER': ['ANDRI'],
  'DINING': ['VICKY', 'LUTFI'],
  'KITCHEN': ['BAYU'],
  'BATHROOM': ['ANDRI'],
  'HOMEWARE': ['ONKY', 'YURI'],
  'BEDROOM': ['DODI', 'SANDI'],
  'MATTRESS': ['SOFYAN'],
  'TEXTILE BEDDING': ['HAYANI', 'SIGIT'],
  'KIDS SPACE': ['CIPTO'],
  'OFFICE SEATING': ['ALI', 'RUDI'],
  'OFFICE': ['ANTO', 'SYAFRIANSYAH'],
  'COMMERCIAL & BUSINESS': ['IRONA', 'KHOMAR'],
  'KELLS': ['IMAN', 'IVAN'],
  'HG': ['MIKO'],
};

export const DEFAULT_DEPARTMENTS: string[] = Object.keys(OFFICIAL_DEPT_PS_MAPPING);

// Kumpulkan semua nama PS unik dari pemetaan resmi
export const DEFAULT_PS_NAMES: string[] = Array.from(
  new Set(Object.values(OFFICIAL_DEPT_PS_MAPPING).flat())
).sort();

export const DEFAULT_BUYER_NAMES: string[] = [
  'Aurelio Adolf Komuna',
  'Hendry Wijaya',
  'Jessica Tan',
  'Michael Gunawan',
  'Linda Permata',
];

export const DEFAULT_CONFIG: GoogleSheetsConfig = {
  scriptUrl: '',
  sheetId: '1Gr4hynXvtuiMhu6ejzv-fR7gon-3BLwT',
  sheetName: 'Hasil_Visit_Buyer',
  folderUrl: 'https://drive.google.com/drive/folders/1Gr4hynXvtuiMhu6ejzv-fR7gon-3BLwT',
  autoSync: true,
  lastSyncedAt: undefined,
};

const INITIAL_SAMPLE_VISITS: BuyerVisit[] = [
  {
    id: 'visit-202611-01',
    visitDate: '2026-11-10',
    visitTime: '10:30',
    department: 'SOFA & CHAIR',
    psName: 'DEAN',
    buyerName: 'Aurelio Adolf Komuna',
    discussionTopic: 'Display Sofa Bed L-Shape & Promo Weekend Clearance',
    result: 'Disepakati relokasi sofa tipe Modena ke main aisle display. Stock buffer 5 unit sudah dipesan dari DC. Target closing 12 unit minggu ini.',
    status: 'Selesai',
    tasks: [
      { id: 't-1', title: 'Pindahkan Sofa Modena ke Main Aisle Display', isDone: true, assignedTo: 'DEAN', dueDate: '2026-11-10' },
      { id: 't-2', title: 'Cetak POP price tag promo diskon 30%', isDone: true, assignedTo: 'DEAN', dueDate: '2026-11-10' },
      { id: 't-3', title: 'Request alokasi buffer DC 5 unit ke tim logistic', isDone: true, assignedTo: 'Aurelio Adolf Komuna', dueDate: '2026-11-11' }
    ],
    photos: [
      {
        id: 'p-1',
        label: 'Relokasi Main Aisle Sofa & Chair',
        beforeUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
        afterUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
        notes: 'Display sebelum terhalang pilar, setelah dipindah visibilitas customer dari pintu masuk naik 80%.',
        timestamp: '2026-11-10 11:15'
      }
    ],
    notes: 'PS Dean sangat kooperatif. Pastikan kebersihan kain display dibersihkan setiap pagi sebelum store buka.',
    syncedToSheets: true,
    createdAt: '2026-11-10T10:30:00.000Z',
    updatedAt: '2026-11-10T11:45:00.000Z',
  },
  {
    id: 'visit-202611-02',
    visitDate: '2026-11-09',
    visitTime: '14:00',
    department: 'HOMEWARE',
    psName: 'ONKY',
    buyerName: 'Jessica Tan',
    discussionTopic: 'Planogram Wajan Anti Lengket Granit & Slow Moving Stock',
    result: 'Tiga SKU frypan non-stick ukuran 24cm kosong di rak padahal stock di gudang ada 18 pcs. Dilakukan restock langsung bersama PS Onky.',
    status: 'Selesai',
    tasks: [
      { id: 't-4', title: 'Tarik 18 pcs frypan 24cm dari gudang ke rak display', isDone: true, assignedTo: 'ONKY', dueDate: '2026-11-09' },
      { id: 't-5', title: 'Pasang shelf talker "Best Seller Chef Choice"', isDone: true, assignedTo: 'ONKY', dueDate: '2026-11-09' }
    ],
    photos: [
      {
        id: 'p-2',
        label: 'Restock Rak Homeware Utama',
        beforeUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        afterUrl: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80',
        notes: 'Kondisi rak sebelum melompong karena belum restock. Setelah ditata penuh rapi per grading ukuran.',
        timestamp: '2026-11-09 14:40'
      }
    ],
    notes: 'PS Onky perlu cek daily OOS (out of stock) audit setiap jam 11 siang sebelum traffic peak sore.',
    syncedToSheets: true,
    createdAt: '2026-11-09T14:00:00.000Z',
    updatedAt: '2026-11-09T15:20:00.000Z',
  },
  {
    id: 'visit-202611-03',
    visitDate: '2026-11-08',
    visitTime: '11:15',
    department: 'LIGHTING',
    psName: 'ARI',
    buyerName: 'Aurelio Adolf Komuna',
    discussionTopic: 'Sample Lampu Gantung Nordic Minimalis & Fitting Trial',
    result: 'Sampel baru fitting E27 kuningan sudah dipasang di chandelier testing ceiling. Menunggu feedback penjualan seminggu.',
    status: 'In Progress',
    tasks: [
      { id: 't-6', title: 'Sambungkan wiring trial lampu gantung ke demo switch panel', isDone: true, assignedTo: 'ARI', dueDate: '2026-11-08' },
      { id: 't-7', title: 'Pantau traffic dan pertanyaan customer terkait harga', isDone: false, assignedTo: 'ARI', dueDate: '2026-11-15' }
    ],
    photos: [
      {
        id: 'p-3',
        label: 'Pemasangan Demo Lampu Gantung Lighting',
        beforeUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=80',
        afterUrl: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=600&q=80',
        notes: 'Demo gantung baru menyala sempurna dengan suhu warna warm white 3000K.',
        timestamp: '2026-11-08 11:50'
      }
    ],
    notes: 'Buyer akan evaluasi reorder 50 set jika minggu ini terjual di atas 5 unit.',
    syncedToSheets: true,
    createdAt: '2026-11-08T11:15:00.000Z',
    updatedAt: '2026-11-08T12:30:00.000Z',
  },
  {
    id: 'visit-202611-04',
    visitDate: '2026-11-05',
    visitTime: '15:30',
    department: 'TEXTILE BEDDING',
    psName: 'HAYANI',
    buyerName: 'Hendry Wijaya',
    discussionTopic: 'Cacat Jahitan Sprei Microtex & Retur Vendor',
    result: 'Ditemukan 4 pack sprei motif floral jahitan lepas. Dibuatkan BAP retur ke vendor PT Tekstil Mulia. Buyer konfirmasi pergantian batch baru.',
    status: 'Follow Up',
    tasks: [
      { id: 't-8', title: 'Pisahkan 4 pack defect ke area karantina gudang', isDone: true, assignedTo: 'HAYANI', dueDate: '2026-11-05' },
      { id: 't-9', title: 'Kirim foto defect ke Vendor & buat memo retur', isDone: true, assignedTo: 'Hendry Wijaya', dueDate: '2026-11-06' },
      { id: 't-10', title: 'Konfirmasi kedatangan barang pengganti batch baru', isDone: false, assignedTo: 'SIGIT', dueDate: '2026-11-12' }
    ],
    photos: [
      {
        id: 'p-4',
        label: 'Defect Packaging & Jahitan Sprei Bedding',
        beforeUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
        afterUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80',
        notes: 'Area bedding dirapikan kembali dengan display bed runner baru yang rapi.',
        timestamp: '2026-11-05 16:10'
      }
    ],
    notes: 'Kualitas QC vendor harus diperketat sebelum pengiriman ke store.',
    syncedToSheets: true,
    createdAt: '2026-11-05T15:30:00.000Z',
    updatedAt: '2026-11-05T16:30:00.000Z',
  },
  {
    id: 'visit-202611-05',
    visitDate: '2026-11-04',
    visitTime: '16:00',
    department: 'TABLE & CABINET',
    psName: 'NASRUL',
    buyerName: 'Aurelio Adolf Komuna',
    discussionTopic: 'Penyusunan Meja Kerja & Credenza Minimalis',
    result: 'Display meja kabinet diposisikan dengan lampu spot agar tekstur kayu terlihat premium.',
    status: 'Selesai',
    tasks: [
      { id: 't-11', title: 'Atur posisi spotlight ke meja display utama', isDone: true, assignedTo: 'NASRUL', dueDate: '2026-11-04' },
      { id: 't-12', title: 'Cek stok buffer cabinet 3 pintu di gudang', isDone: true, assignedTo: 'DHEDE', dueDate: '2026-11-04' }
    ],
    photos: [],
    notes: 'Display meja dan kabinet terlihat sangat elegan dan siap untuk promosi akhir pekan.',
    syncedToSheets: true,
    createdAt: '2026-11-04T16:00:00.000Z',
    updatedAt: '2026-11-04T16:45:00.000Z',
  }
];

export function getVisits(): BuyerVisit[] {
  try {
    const raw = localStorage.getItem(VISITS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_VISITS));
      return INITIAL_SAMPLE_VISITS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading visits from localStorage:', e);
    return INITIAL_SAMPLE_VISITS;
  }
}

export function saveVisits(visits: BuyerVisit[]): void {
  try {
    localStorage.setItem(VISITS_STORAGE_KEY, JSON.stringify(visits));
  } catch (e) {
    console.error('Error saving visits to localStorage:', e);
  }
}

// Fetch shared visits from centralized server so all users see each other's data
export async function syncVisitsFromServer(): Promise<BuyerVisit[]> {
  try {
    const res = await fetch('/api/visits');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.visits && Array.isArray(data.visits)) {
      saveVisits(data.visits);
      // Register departments & PS
      data.visits.forEach((v: BuyerVisit) => {
        if (v.department) registerCustomDepartment(v.department);
        if (v.psName) registerCustomPS(v.psName);
      });
      return data.visits;
    }
  } catch (err) {
    // If offline or network issue, fallback to localStorage
    console.warn('Could not sync visits from server, using local cache:', err);
  }
  return getVisits();
}

export function addVisit(visit: BuyerVisit): BuyerVisit[] {
  const current = getVisits();
  const updated = [visit, ...current.filter(v => v.id !== visit.id)];
  saveVisits(updated);
  
  // Register any custom department or PS
  registerCustomDepartment(visit.department);
  registerCustomPS(visit.psName);

  // Send to centralized server asynchronously
  fetch('/api/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visit),
  }).catch((err) => console.warn('Failed to push visit to server:', err));
  
  return updated;
}

export function updateVisit(updatedVisit: BuyerVisit): BuyerVisit[] {
  const current = getVisits();
  const updated = current.map(v => v.id === updatedVisit.id ? updatedVisit : v);
  saveVisits(updated);

  // Update on centralized server asynchronously
  fetch(`/api/visits/${updatedVisit.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedVisit),
  }).catch((err) => console.warn('Failed to update visit on server:', err));

  return updated;
}

export function deleteVisit(id: string): BuyerVisit[] {
  const current = getVisits();
  const updated = current.filter(v => v.id !== id);
  saveVisits(updated);

  // Delete on centralized server asynchronously
  fetch(`/api/visits/${id}`, {
    method: 'DELETE',
  }).catch((err) => console.warn('Failed to delete visit on server:', err));

  return updated;
}


export function getSheetsConfig(): GoogleSheetsConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

export function saveSheetsConfig(config: GoogleSheetsConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving sheets config:', e);
  }
}

// Mendapatkan PS spesifik untuk suatu Departemen
export function getPSForDepartment(dept: string): string[] {
  if (!dept) return [];
  const normalizedDept = dept.trim().toUpperCase();
  if (OFFICIAL_DEPT_PS_MAPPING[normalizedDept]) {
    return OFFICIAL_DEPT_PS_MAPPING[normalizedDept];
  }
  // Try case-insensitive matching
  const key = Object.keys(OFFICIAL_DEPT_PS_MAPPING).find(
    k => k.toLowerCase() === dept.trim().toLowerCase()
  );
  if (key) return OFFICIAL_DEPT_PS_MAPPING[key];
  return [];
}

// Extract all historical departments
export function getHistoricalDepartments(): string[] {
  const set = new Set<string>(DEFAULT_DEPARTMENTS);
  
  // Add from visits
  const visits = getVisits();
  visits.forEach(v => {
    if (v.department && v.department.trim()) {
      set.add(v.department.trim());
    }
  });

  // Add from custom store
  try {
    const custom = JSON.parse(localStorage.getItem(DEPARTMENTS_STORAGE_KEY) || '[]');
    custom.forEach((d: string) => set.add(d));
  } catch {}

  // Keep official departments order followed by custom ones
  const officialList = [...DEFAULT_DEPARTMENTS];
  const others = Array.from(set).filter(d => !officialList.includes(d)).sort();
  return [...officialList, ...others];
}

export function registerCustomDepartment(dept: string): void {
  if (!dept || !dept.trim()) return;
  const trimmed = dept.trim();
  try {
    const custom = JSON.parse(localStorage.getItem(DEPARTMENTS_STORAGE_KEY) || '[]');
    if (!custom.includes(trimmed)) {
      custom.push(trimmed);
      localStorage.setItem(DEPARTMENTS_STORAGE_KEY, JSON.stringify(custom));
    }
  } catch {}
}

// Extract all historical PS names
export function getHistoricalPSNames(): string[] {
  const set = new Set<string>(DEFAULT_PS_NAMES);
  
  // Add from visits
  const visits = getVisits();
  visits.forEach(v => {
    if (v.psName && v.psName.trim()) {
      set.add(v.psName.trim());
    }
  });

  // Add from custom store
  try {
    const custom = JSON.parse(localStorage.getItem(PS_NAMES_STORAGE_KEY) || '[]');
    custom.forEach((p: string) => set.add(p));
  } catch {}

  return Array.from(set).sort();
}

export function registerCustomPS(ps: string): void {
  if (!ps || !ps.trim()) return;
  const trimmed = ps.trim();
  try {
    const custom = JSON.parse(localStorage.getItem(PS_NAMES_STORAGE_KEY) || '[]');
    if (!custom.includes(trimmed)) {
      custom.push(trimmed);
      localStorage.setItem(PS_NAMES_STORAGE_KEY, JSON.stringify(custom));
    }
  } catch {}
}

// Extract historical Buyers
export function getHistoricalBuyers(): string[] {
  const set = new Set<string>(DEFAULT_BUYER_NAMES);
  const visits = getVisits();
  visits.forEach(v => {
    if (v.buyerName && v.buyerName.trim()) {
      set.add(v.buyerName.trim());
    }
  });
  return Array.from(set).sort();
}
