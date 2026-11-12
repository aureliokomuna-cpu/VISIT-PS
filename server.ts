import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(import.meta.dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'shared_visits.json');

// Middleware to parse JSON bodies with reasonable limit for base64 photos
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data if file doesn't exist
const INITIAL_SHARED_VISITS = [
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

function readVisitsFromDisk(): any[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading shared visits file:', err);
  }
  // Initialize file with default visits
  writeVisitsToDisk(INITIAL_SHARED_VISITS);
  return INITIAL_SHARED_VISITS;
}

function writeVisitsToDisk(visits: any[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(visits, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving shared visits file:', err);
  }
}

// In-memory cache for ultra-fast response
let sharedVisitsCache = readVisitsFromDisk();

// API Endpoints for Centralized Multi-User Sync
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// GET all visits (accessible by all users and devices)
app.get('/api/visits', (req, res) => {
  res.json({
    status: 'success',
    count: sharedVisitsCache.length,
    visits: sharedVisitsCache,
    lastUpdated: new Date().toISOString(),
  });
});

// POST new visit (saved to server database, visible to everyone)
app.post('/api/visits', (req, res) => {
  try {
    const newVisit = req.body;
    if (!newVisit || !newVisit.department || !newVisit.psName) {
      return res.status(400).json({ error: 'Departemen dan Nama PS wajib diisi' });
    }

    // Add to top of list
    sharedVisitsCache = [newVisit, ...sharedVisitsCache.filter((v: any) => v.id !== newVisit.id)];
    writeVisitsToDisk(sharedVisitsCache);

    res.json({
      status: 'success',
      message: 'Kunjungan berhasil disimpan di server bersama!',
      visit: newVisit,
    });
  } catch (err: any) {
    console.error('POST /api/visits error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update visit (e.g. task checklist checked or status updated by any user)
app.put('/api/visits/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedVisit = req.body;

    let found = false;
    sharedVisitsCache = sharedVisitsCache.map((v: any) => {
      if (v.id === id) {
        found = true;
        return { ...v, ...updatedVisit, updatedAt: new Date().toISOString() };
      }
      return v;
    });

    if (!found) {
      sharedVisitsCache = [updatedVisit, ...sharedVisitsCache];
    }

    writeVisitsToDisk(sharedVisitsCache);
    res.json({ status: 'success', visit: updatedVisit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE visit
app.delete('/api/visits/:id', (req, res) => {
  try {
    const { id } = req.params;
    sharedVisitsCache = sharedVisitsCache.filter((v: any) => v.id !== id);
    writeVisitsToDisk(sharedVisitsCache);
    res.json({ status: 'success', message: 'Kunjungan dihapus dari server bersama' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download ready-to-drop ZIP package for Netlify Drop
app.get('/api/download-netlify-zip', (req, res) => {
  const distZip = path.resolve(import.meta.dirname, 'dist', 'buyer-visit-tracker-netlify.zip');
  const pubZip = path.resolve(import.meta.dirname, 'public', 'buyer-visit-tracker-netlify.zip');
  const target = fs.existsSync(distZip) ? distZip : pubZip;
  if (fs.existsSync(target)) {
    res.download(target, 'buyer-visit-tracker-netlify.zip');
  } else {
    res.status(404).send('File ZIP sedang disiapkan, silakan coba sesaat lagi.');
  }
});

// Download production index.html file
app.get('/api/download-html', (req, res) => {
  const distHtml = path.resolve(import.meta.dirname, 'dist', 'index.html');
  const rootHtml = path.resolve(import.meta.dirname, 'index.html');
  const target = fs.existsSync(distHtml) ? distHtml : rootHtml;
  res.download(target, 'index.html');
});


// Mount Vite middleware in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(import.meta.dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (Multi-user shared database active)`);
  });
}

startServer();
