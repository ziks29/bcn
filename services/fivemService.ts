import { FiveMServerData } from '../types';

const API_BASE_URL = 'https://servers-frontend.fivem.net/api/servers/single/';

interface FiveMServerResponse {
    EndPoint: string;
    Data: FiveMServerData;
}

/**
 * Fetches server data from the FiveM API.
 * @param serverId The unique ID of the FiveM server (e.g., its cfx.re code).
 */
export const fetchServerData = async (serverId: string): Promise<FiveMServerData | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}${serverId}`, {
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            if (response.status === 404) {
                // Server is offline or does not exist
                return null;
            }
            throw new Error(`Failed to fetch server data: ${response.statusText}`);
        }

        const result: FiveMServerResponse = await response.json();
        return result.Data;
    } catch (error) {
        console.error('Error fetching FiveM server data:', error);
        return null;
    }
};
