import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BuyerVisit } from '../types';

export interface WeeklyReportOptions {
  title?: string;
  startDate?: string;
  endDate?: string;
  departmentFilter?: string;
  buyerFilter?: string;
}

export function generateWeeklyVisitPDF(
  visits: BuyerVisit[],
  options: WeeklyReportOptions = {}
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header Background bar
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 24, 'F');

  // Accent Line
  doc.setFillColor(234, 88, 12); // orange-600 (Homecenter warm energetic accent)
  doc.rect(0, 24, pageWidth, 2.5, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('HOMECENTER RETAIL OPERATIONS - COMMERCIAL & BUYING DIVISION', 14, 11);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('LAPORAN MINGGUAN HASIL VISIT BUYER KE STORE & DEPARTEMEN', 14, 18);

  // Print Date & Meta on top right
  const printDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Dicetak: ${printDateStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text('Status Data: Real-time Synchronized', pageWidth - 14, 18, { align: 'right' });

  // Summary Information Section
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN EKSEKUTIF KUNJUNGAN', 14, 34);

  // Period subtitle
  const periodText = options.startDate && options.endDate
    ? `Periode: ${options.startDate} s/d ${options.endDate}`
    : 'Periode: Seluruh Kunjungan Terdata';
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(periodText, 14, 40);

  // Metric KPI Cards (4 cards)
  const totalVisits = visits.length;
  const uniqueDepts = new Set(visits.map((v) => v.department)).size;
  const allTasks = visits.flatMap((v) => v.tasks);
  const doneTasks = allTasks.filter((t) => t.isDone).length;
  const taskCompletionRate = allTasks.length > 0
    ? Math.round((doneTasks / allTasks.length) * 100)
    : 100;
  const completedVisits = visits.filter((v) => v.status === 'Selesai').length;

  const cardWidth = (pageWidth - 28 - 9) / 4;
  const cardY = 44;
  const cardHeight = 16;

  const cards = [
    { label: 'TOTAL VISIT', value: `${totalVisits} Kunjungan`, sub: 'Bulan berjalan', bg: [241, 245, 249] },
    { label: 'DEPT DIKUNJUNGI', value: `${uniqueDepts} Departemen`, sub: 'Coverage area', bg: [238, 242, 255] },
    { label: 'AKSI TEREALISASI', value: `${doneTasks}/${allTasks.length} (${taskCompletionRate}%)`, sub: 'Tugas diselesaikan', bg: [236, 253, 245] },
    { label: 'STATUS SELESAI', value: `${completedVisits} Selesai`, sub: `${totalVisits - completedVisits} Butuh tindak lanjut`, bg: [254, 243, 199] },
  ];

  cards.forEach((card, index) => {
    const x = 14 + index * (cardWidth + 3);
    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 1.5, 1.5, 'D');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(card.label, x + 3.5, cardY + 4.5);

    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(card.value, x + 3.5, cardY + 10);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(card.sub, x + 3.5, cardY + 14);
  });

  // Table of Visits
  const tableData = visits.map((v, index) => {
    const taskSummary = v.tasks.length > 0
      ? '\n[Pekerjaan]:\n' + v.tasks.map((t) => `${t.isDone ? '✓' : '○'} ${t.title}`).join('\n')
      : '';
    const photosSummary = v.photos.length > 0 ? `\n(Bukti Foto: ${v.photos.length} pair)` : '';

    return [
      (index + 1).toString(),
      `${v.visitDate}\n${v.visitTime || ''}`,
      v.department,
      v.psName,
      v.buyerName,
      v.discussionTopic,
      `${v.result}${taskSummary}${photosSummary}`,
      v.status,
    ];
  });

  autoTable(doc, {
    startY: 65,
    head: [[
      'No',
      'Tgl & Jam',
      'Departemen',
      'Nama PS',
      'Nama Buyer',
      'Topik Diskusi',
      'Result & Pekerjaan Dilakukan',
      'Status',
    ]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      overflow: 'linebreak',
      textColor: [30, 41, 59],
      valign: 'top',
    },
    headStyles: {
      fillColor: [51, 65, 85], // slate-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 9, halign: 'center' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35 },
      3: { cellWidth: 32 },
      4: { cellWidth: 30 },
      5: { cellWidth: 46 },
      6: { cellWidth: 72 },
      7: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 7) {
        const val = data.cell.raw as string;
        if (val === 'Selesai') {
          data.cell.styles.textColor = [16, 185, 129]; // emerald-600
        } else if (val === 'Follow Up') {
          data.cell.styles.textColor = [239, 68, 68]; // red-500
        } else if (val === 'In Progress') {
          data.cell.styles.textColor = [59, 130, 246]; // blue-500
        } else {
          data.cell.styles.textColor = [217, 119, 6]; // amber-600
        }
      }
    },
  });

  // Footer & Signatures section
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  let signatureY = finalY + 12;

  // Add new page if space is too tight
  if (signatureY + 30 > pageHeight) {
    doc.addPage();
    signatureY = 25;
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Tanda Tangan Pengesahan Laporan Kunjungan:', 14, signatureY);

  const signCols = [
    { title: 'Dibuat Oleh,', role: 'Commercial Buyer' },
    { title: 'Mengetahui,', role: 'Store Operation Head' },
    { title: 'PIC Departemen,', role: 'Product Specialist (PS)' },
  ];

  const colWidth = (pageWidth - 28) / 3;
  signCols.forEach((col, idx) => {
    const x = 14 + idx * colWidth;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(col.title, x, signatureY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(`(${col.role})`, x, signatureY + 10);

    // Signature dotted line
    doc.setDrawColor(203, 213, 225);
    doc.line(x, signatureY + 28, x + colWidth - 25, signatureY + 28);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Nama & Tanggal', x, signatureY + 32);
  });

  // Footer page number on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dokumen Resmi Homecenter Retail Operations | Hal ${i} dari ${totalPages} | Arsip Digital Google Drive Folder: 1Gr4hynXvtuiMhu6ejzv-fR7gon-3BLwT`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  // Save file
  const dateSlug = options.startDate || new Date().toISOString().slice(0, 10);
  doc.save(`Laporan_Mingguan_Visit_Buyer_${dateSlug}.pdf`);
}
