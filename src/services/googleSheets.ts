import { BuyerVisit, GoogleSheetsConfig } from '../types';

export const APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script untuk Real-time Sync Kunjungan Buyer
 * 1. Buka Google Sheet Anda di Google Drive: https://drive.google.com/drive/folders/1Gr4hynXvtuiMhu6ejzv-fR7gon-3BLwT
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'
 * 3. Hapus kode bawaan, lalu paste kode di bawah ini.
 * 4. Klik 'Deploy' (Terapkan) > 'New deployment' (Penerapan baru)
 * 5. Pilih type: 'Web app'
 * 6. Set 'Execute as': 'Me' (Saya) dan 'Who has access': 'Anyone' (Siapa saja)
 * 7. Salin URL Web App yang dihasilkan, lalu paste ke pengaturan di aplikasi ini!
 */

function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "ID Kunjungan",
      "Tanggal Visit",
      "Waktu Visit",
      "Departemen",
      "Nama PS",
      "Nama Buyer",
      "Topik Diskusi",
      "Result / Hasil",
      "Status",
      "Pekerjaan Dilakukan",
      "Foto Before URL",
      "Foto After URL",
      "Catatan / Arahan",
      "Waktu Dibuat"
    ]);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  setupHeaders();
  var data = sheet.getDataRange().getValues();
  var visits = [];
  var departments = {};
  var psNames = {};
  var buyers = {};

  if (data.length > 1) {
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var v = {
        id: row[0],
        visitDate: row[1],
        visitTime: row[2],
        department: row[3],
        psName: row[4],
        buyerName: row[5],
        discussionTopic: row[6],
        result: row[7],
        status: row[8],
        notes: row[12]
      };
      visits.push(v);
      if (row[3]) departments[row[3]] = true;
      if (row[4]) psNames[row[4]] = true;
      if (row[5]) buyers[row[5]] = true;
    }
  }

  var result = {
    status: "success",
    visits: visits,
    departments: Object.keys(departments),
    psNames: Object.keys(psNames),
    buyers: Object.keys(buyers),
    timestamp: new Date().toISOString()
  };

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  setupHeaders();
  
  try {
    var item = JSON.parse(e.postData.contents);
    var tasksSummary = (item.tasks || []).map(function(t) {
      return "[" + (t.isDone ? "OK" : "PENDING") + "] " + t.title;
    }).join(" ; ");

    var beforePhoto = (item.photos && item.photos[0]) ? item.photos[0].beforeUrl : "";
    var afterPhoto = (item.photos && item.photos[0]) ? item.photos[0].afterUrl : "";

    sheet.appendRow([
      item.id,
      item.visitDate,
      item.visitTime || "",
      item.department,
      item.psName,
      item.buyerName,
      item.discussionTopic,
      item.result,
      item.status,
      tasksSummary,
      beforePhoto,
      afterPhoto,
      item.notes || "",
      new Date().toISOString()
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data visit berhasil ditambahkan ke Google Sheet!",
      id: item.id
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export async function sendVisitToGoogleSheets(
  visit: BuyerVisit,
  config: GoogleSheetsConfig
): Promise<{ success: boolean; message: string }> {
  if (!config.scriptUrl || !config.scriptUrl.trim()) {
    return {
      success: false,
      message: 'URL Google Apps Script belum diisi. Masukkan URL Web App di tab Pengaturan.',
    };
  }

  try {
    const payload = JSON.stringify(visit);
    
    // We send payload to Apps Script Web App
    const response = await fetch(config.scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Use text/plain to avoid CORS preflight options block in Google Apps Script
      },
      body: payload,
    });

    if (!response.ok && response.type !== 'opaque') {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      success: true,
      message: 'Berhasil dikirim ke Google Sheets secara real-time!',
    };
  } catch (error: any) {
    console.error('Failed to sync to Google Sheets:', error);
    return {
      success: false,
      message: error.message || 'Gagal terhubung ke Google Sheets API.',
    };
  }
}

export async function fetchFromGoogleSheets(
  config: GoogleSheetsConfig
): Promise<{
  success: boolean;
  departments: string[];
  psNames: string[];
  buyers: string[];
  visits?: Partial<BuyerVisit>[];
  message?: string;
}> {
  if (!config.scriptUrl || !config.scriptUrl.trim()) {
    return {
      success: false,
      departments: [],
      psNames: [],
      buyers: [],
      message: 'URL Google Apps Script belum diatur.',
    };
  }

  try {
    const response = await fetch(config.scriptUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return {
      success: true,
      departments: data.departments || [],
      psNames: data.psNames || [],
      buyers: data.buyers || [],
      visits: data.visits || [],
    };
  } catch (error: any) {
    console.warn('Fetch from Google Sheets failed:', error);
    return {
      success: false,
      departments: [],
      psNames: [],
      buyers: [],
      message: error.message || 'Gagal memuat data dari Google Sheets.',
    };
  }
}

export function exportVisitsToCsv(visits: BuyerVisit[]): void {
  const headers = [
    'Tanggal Visit',
    'Waktu Visit',
    'Departemen',
    'Nama PS',
    'Nama Buyer',
    'Topik Diskusi',
    'Result / Hasil',
    'Status',
    'Pekerjaan Dilakukan',
    'Catatan / Penjelasan',
    'Jumlah Foto Before After',
    'ID Kunjungan',
  ];

  const rows = visits.map((v) => {
    const taskSummary = v.tasks
      .map((t) => `[${t.isDone ? 'SELESAI' : 'PENDING'}] ${t.title}`)
      .join(' | ');

    return [
      v.visitDate,
      v.visitTime || '-',
      v.department,
      v.psName,
      v.buyerName,
      `"${(v.discussionTopic || '').replace(/"/g, '""')}"`,
      `"${(v.result || '').replace(/"/g, '""')}"`,
      v.status,
      `"${taskSummary.replace(/"/g, '""')}"`,
      `"${(v.notes || '').replace(/"/g, '""')}"`,
      v.photos.length,
      v.id,
    ].join(',');
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Laporan_Visit_Buyer_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
