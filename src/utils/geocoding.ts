import axios from 'axios';
import { logger } from './logger';

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Converts a street address into geographic coordinates using Nominatim.
 * It uses the last two parts of the address for a more accurate query.
 * @param address The full address string (e.g., "Union, Upazila, District").
 * @returns A promise that resolves to a coordinates object or null.
 */
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  try {
  
    // 1. Split the address by commas and trim whitespace from each part.
    const parts = address.split(',').map(part => part.trim());
    
    // 2. Take the last two parts of the address for the query.
    // For "Prithimpassa, Kulaura, Moulvibazar", this becomes "Kulaura, Moulvibazar"
    const queryAddress = parts.slice(-2).join(', ');
    

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: queryAddress,
        format: 'json',
        limit: 1,
        countrycodes: 'BD', // Limit search to Bangladesh
      },
      headers: {
        'User-Agent': 'CourierApp/1.0 (workof.graon@gmail.com)',
      },
    });

    if (response.data && response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }

    logger.warn(`Geocoding failed for address: "${address}". No results found for query: "${queryAddress}".`);
    return null;
  } catch (error) {
    logger.error(`Error during geocoding for address "${address}":`, error);
    return null;
  }
};