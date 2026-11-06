import { API_CONFIG } from '../config/api.config.js';

export const OrdenService = {
    async getAll() {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDENES}`);
        return await response.json();
    },

    async create(ordenDto) {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDENES}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ordenDto)
        });
        return await response.json();
    }
};