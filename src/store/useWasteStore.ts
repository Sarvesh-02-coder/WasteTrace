import { create } from 'zustand';
import QRCode from 'qrcode';
import { WasteTicket } from '../types';
import { useAuthStore } from './useAuthStore';

interface WasteState {
  tickets: WasteTicket[];
  currentTicket: WasteTicket | null;
  createWasteTicket: (citizenId: string, imageUrl: string) => Promise<WasteTicket>;
  updateTicketStatus: (wasteId: string, status: WasteTicket['status'], collectorId?: string, proofImageUrl?: string) => void;
  getTicketsByUser: (userId: string) => WasteTicket[];
  getTicketByWasteId: (wasteId: string) => WasteTicket | undefined;
  setCurrentTicket: (ticket: WasteTicket | null) => void;
}

const generateWasteId = () => {
  return 'WT' + Math.random().toString(36).substr(2, 5).toUpperCase();
};

const generateQRCode = async (wasteId: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(wasteId, {
      width: 200,
      margin: 2,
      color: {
        dark: '#059669', // Primary green
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

export const useWasteStore = create<WasteState>()((set, get) => ({
  tickets: [
    // Demo tickets
    {
      id: 'ticket-1',
      wasteId: 'WT7X9M2',
      citizenId: 'citizen-1',
      classification: 'Plastic Waste',
      status: 'recycled',
      imageUrl: '/placeholder.svg',
      location: {
        lat: 18.463499,
        lng: 73.868136,
        address: 'Pune, India'
      },
      timestamps: {
        created: new Date(Date.now() - 86400000 * 2).toISOString(),
        collected: new Date(Date.now() - 86400000).toISOString(),
        recycled: new Date().toISOString(),
      },
      collectorId: 'collector-1',
      ecoPointsAwarded: 15,
    },
    {
      id: 'ticket-2',
      wasteId: 'WT4K8L1',
      citizenId: 'citizen-1',
      classification: 'Organic Waste',
      status: 'collected',
      imageUrl: '/placeholder.svg',
      location: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'New Delhi, India'
      },
      timestamps: {
        created: new Date(Date.now() - 86400000).toISOString(),
        collected: new Date().toISOString(),
      },
      collectorId: 'collector-1',
      ecoPointsAwarded: 10,
    }
  ],
  currentTicket: null,

  createWasteTicket: async (citizenId: string, imageUrl: string) => {
    const wasteId = generateWasteId();
    const qrCode = await generateQRCode(wasteId);
    
    const ticket: WasteTicket = {
      id: `ticket-${Date.now()}`,
      wasteId,
      citizenId,
      classification: 'Plastic Waste', // Demo classification
      status: 'pending',
      imageUrl,
      qrCode,
      location: {
        lat: 18.463499,
        lng: 73.868136,
        address: 'Pune, India'
      },
      timestamps: {
        created: new Date().toISOString(),
      },
      ecoPointsAwarded: 5, // Award 5 points for submission
    };

    set(state => ({
      tickets: [ticket, ...state.tickets],
      currentTicket: ticket
    }));

    // Update user's ecoPoints
    const { updateUser } = useAuthStore.getState();
    updateUser({ ecoPoints: (useAuthStore.getState().user?.ecoPoints || 0) + 5 });

    return ticket;
  },

  updateTicketStatus: (wasteId: string, status: WasteTicket['status'], collectorId?: string, proofImageUrl?: string) => {
    set(state => ({
      tickets: state.tickets.map(ticket => {
        if (ticket.wasteId === wasteId) {
          const updatedTicket = {
            ...ticket,
            status,
            collectorId,
            proofImageUrl,
            timestamps: {
              ...ticket.timestamps,
              [status]: new Date().toISOString(),
            }
          };
          
          // Award eco points for recycling
          if (status === 'recycled' && !ticket.ecoPointsAwarded) {
            updatedTicket.ecoPointsAwarded = 15;

            // Update user's ecoPoints
            const { updateUser } = useAuthStore.getState();
            updateUser({ ecoPoints: (useAuthStore.getState().user?.ecoPoints || 0) + 15 });
          }
          
          return updatedTicket;
        }
        return ticket;
      })
    }));
  },

  getTicketsByUser: (userId: string) => {
    return get().tickets.filter(ticket => ticket.citizenId === userId);
  },

  getTicketByWasteId: (wasteId: string) => {
    return get().tickets.find(ticket => ticket.wasteId === wasteId);
  },

  setCurrentTicket: (ticket: WasteTicket | null) => {
    set({ currentTicket: ticket });
  },
}));
