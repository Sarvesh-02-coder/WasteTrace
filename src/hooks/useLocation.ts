import { useEffect, useState } from 'react';
import { useLocationStore } from '../store/useLocationStore';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export const useLocation = () => {
  const { setLocation } = useLocationStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();
        const area = data.address?.suburb || data.address?.city || data.address?.town || data.address?.village || 'Unknown Location';
        setLocation(area, lat, lon);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch area name');
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchLocation(latitude, longitude);
      },
      (err) => {
        console.error(err);
        setError('Permission denied or unable to fetch location');
        setLoading(false);
      }
    );
  }, [setLocation]);

  return { loading, error };
};
