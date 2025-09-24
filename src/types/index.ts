export interface User {
  id: string;
  email: string;
  role: 'citizen' | 'collector' | 'municipality';
  name: string;
  ecoPoints?: number;
  totalWasteCollected?: number;
}

export interface WasteTicket {
  id: string;
  wasteId: string;
  citizenId: string;
  classification: string;
  status: 'pending' | 'collected' | 'recycled';
  imageUrl?: string;
  qrCode?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamps: {
    created: string;
    collected?: string;
    recycled?: string;
  };
  collectorId?: string;
  proofImageUrl?: string;
  ecoPointsAwarded?: number;
}

export interface Collector {
  id: string;
  name: string;
  email: string;
  dailyStats: {
    pickups: number;
    totalWeight: number;
    verificationRate: number;
  };
  location?: {
    lat: number;
    lng: number;
  };
  proofPhotos: string[];
}

export interface EcoBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  dateUnlocked?: string;
}

export interface Voucher {
  id: string;
  title: string;
  value: string;
  cost: number;
  type: 'paytm' | 'amazon' | 'grocery';
  available: boolean;
}

export interface DashboardStats {
  segregatedWaste: number;
  recyclingRate: number;
  citizenParticipation: number;
  totalWasteProcessed: number;
}