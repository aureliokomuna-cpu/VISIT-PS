export interface ActionTask {
  id: string;
  title: string;
  isDone: boolean;
  assignedTo?: string;
  dueDate?: string;
}

export interface BeforeAfterPhoto {
  id: string;
  label?: string;
  beforeUrl: string;
  afterUrl: string;
  notes?: string;
  timestamp: string;
}

export type VisitStatus = 'Selesai' | 'Follow Up' | 'In Progress' | 'Pending Vendor';

export interface BuyerVisit {
  id: string;
  visitDate: string; // YYYY-MM-DD
  visitTime?: string; // HH:mm
  department: string;
  psName: string; // Nama PS (Product Specialist / PIC Section)
  buyerName: string;
  discussionTopic: string;
  result: string;
  status: VisitStatus;
  
  // Pekerjaan yang dilakukan & bukti
  tasks: ActionTask[];
  photos: BeforeAfterPhoto[];
  notes: string; // Kolom penjelasan / masukan / arahan
  
  // Metadata
  storeName?: string;
  syncedToSheets?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleSheetsConfig {
  scriptUrl: string; // Google Apps Script Web App URL
  sheetId: string;
  sheetName: string;
  folderUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export interface FilterOptions {
  search: string;
  department: string;
  psName: string;
  buyerName: string;
  status: string;
  startDate: string;
  endDate: string;
}
