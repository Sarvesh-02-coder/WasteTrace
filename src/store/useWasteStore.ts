import { create } from 'zustand';
import QRCode from 'qrcode';
import { WasteTicket } from '../types';
import { useAuthStore } from './useAuthStore';

interface WasteState {
  tickets: WasteTicket[];
  currentTicket: WasteTicket | null;
  createWasteTicket: (
    citizenId: string,
    imageUrl: string,
    classification?: string,
    location?: { lat?: number; lng?: number; address?: string } // <-- added
  ) => Promise<WasteTicket>;
  updateTicketStatus: (
    wasteId: string, 
    status: WasteTicket['status'], 
    collectorId?: string, 
    proofImageUrl?: string
  ) => void;
  getTicketsByUser: (userId: string) => WasteTicket[];
  getTicketByWasteId: (wasteId: string) => WasteTicket | undefined;
  setCurrentTicket: (ticket: WasteTicket | null) => void;
}

// Utility to generate a unique Waste ID
const generateWasteId = () => 'WT' + Math.random().toString(36).substring(2, 8).toUpperCase();

// Utility to generate QR Code for a waste ticket
const generateQRCode = async (wasteId: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(wasteId, {
      width: 200,
      margin: 2,
      color: { dark: '#059669', light: '#FFFFFF' },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

export const useWasteStore = create<WasteState>()((set, get) => ({
  tickets: [],
  currentTicket: null,

  // Create a new waste ticket
  createWasteTicket: async (citizenId, imageUrl, classification = 'Plastic Waste', location) => {
    const wasteId = generateWasteId();
    const qrCode = await generateQRCode(wasteId);

    const ticket: WasteTicket = {
      id: `ticket-${Date.now()}`,
      wasteId,
      citizenId,
      classification,
      status: 'pending',
      imageUrl,
      qrCode,
      location: location || { lat: 18.463499, lng: 73.868136, address: 'Pune, India' },
      timestamps: { created: new Date().toISOString() },
      ecoPointsAwarded: 5, // points for submission
    };

    set(state => ({
      tickets: [ticket, ...state.tickets],
      currentTicket: ticket,
    }));

    // Award eco points to user safely
    const { updateUser, user } = useAuthStore.getState();
    updateUser({ ecoPoints: (user?.ecoPoints || 0) + 5 });

    return ticket;
  },

  // Update ticket status and optionally award points
  updateTicketStatus: (wasteId, status, collectorId, proofImageUrl) => {
    set(state => ({
      tickets: state.tickets.map(ticket => {
        if (ticket.wasteId !== wasteId) return ticket;

        const updatedTicket: WasteTicket = {
          ...ticket,
          status,
          collectorId: collectorId || ticket.collectorId,
          proofImageUrl: proofImageUrl || ticket.proofImageUrl,
          timestamps: { ...ticket.timestamps, [status]: new Date().toISOString() },
        };

        // Award points once when recycled
        if (status === 'recycled' && (!ticket.ecoPointsAwarded || ticket.ecoPointsAwarded < 15)) {
          updatedTicket.ecoPointsAwarded = 15;
          const { updateUser, user } = useAuthStore.getState();
          updateUser({ ecoPoints: (user?.ecoPoints || 0) + 15 });
        }

        return updatedTicket;
      }),
    }));
  },

  getTicketsByUser: userId => get().tickets.filter(ticket => ticket.citizenId === userId),
  getTicketByWasteId: wasteId => get().tickets.find(ticket => ticket.wasteId === wasteId),
  setCurrentTicket: ticket => set({ currentTicket: ticket }),
}));
