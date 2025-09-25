import { create } from 'zustand';

interface LocationState {
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  setLocation: (area: string, latitude: number, longitude: number) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  area: null,
  latitude: null,
  longitude: null,
  setLocation: (area, latitude, longitude) => set({ area, latitude, longitude }),
}));
