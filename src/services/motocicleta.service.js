import { API_CONFIG } from '../config/api.config.js';

export const MotocicletaService = {
    async getAll() {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOTOCICLETAS}`);
        return await response.json();
    },

    async create(motoDto) {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOTOCICLETAS}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(motoDto)
        });
        return await response.json();
    }
};