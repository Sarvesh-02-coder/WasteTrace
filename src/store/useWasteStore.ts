import { create } from 'zustand';
import { WasteTicket } from '../types';
import { useAuthStore } from './useAuthStore';
const API_URL = import.meta.env.VITE_API_URL;



interface WasteState {
  tickets: WasteTicket[];
  currentTicket: WasteTicket | null;

  fetchTickets: () => Promise<void>;

  createWasteTicket: (
    citizenId: string,
    imageUrl: string,
    classification?: string,
    location?: { lat?: number; lng?: number; address?: string }
  ) => Promise<WasteTicket>;

  updateTicketStatus: (
    wasteId: string,
    status: WasteTicket['status'],
    collectorId?: string,
    proofImageUrl?: string
  ) => Promise<void>;

  getTicketsByUser: (userId: string) => WasteTicket[];
  getTicketByWasteId: (wasteId: string) => WasteTicket | undefined;
  setCurrentTicket: (ticket: WasteTicket | null) => void;
}

export const useWasteStore = create<WasteState>((set, get) => ({
  tickets: [],
  currentTicket: null,

  // ==============================
  // Fetch tickets from backend
  // ==============================
  fetchTickets: async () => {
    try {
      const res = await fetch(`${API_URL}/tickets`);
      const data = await res.json();
      set({ tickets: data });
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  },

  // ==============================
  // Create ticket via backend
  // ==============================
  createWasteTicket: async (
    citizenId,
    imageUrl,
    classification = 'Plastic Waste',
    location
  ) => {
    const res = await fetch(`${API_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        citizenId,
        classification,
        imageUrl,
        location,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to create waste ticket');
    }

    const ticket = await res.json();

    set((state) => ({
      tickets: [ticket, ...state.tickets],
      currentTicket: ticket,
    }));

    return ticket;
  },

  // ==============================
  // Update status via backend (SOURCE OF TRUTH)
  // ==============================
  updateTicketStatus: async (wasteId, status, collectorId, proofImageUrl) => {
    await fetch(`${API_URL}/tickets/${wasteId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        collectorId,
        proofImageUrl,
      }),
    });

    // 🔁 Always re-fetch from backend
    await get().fetchTickets();
  },

  getTicketsByUser: (userId) =>
    get().tickets.filter(ticket => ticket.citizenId === userId),

  getTicketByWasteId: (wasteId) =>
    get().tickets.find(ticket => ticket.wasteId === wasteId),

  setCurrentTicket: (ticket) => set({ currentTicket: ticket }),
}));
