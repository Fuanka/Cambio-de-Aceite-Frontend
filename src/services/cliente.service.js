import { API_CONFIG } from '../config/api.config.js';

export const ClienteService = {
    async getAll() {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTES}`);
        return await response.json();
    },

    async create(clienteDto) {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTES}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteDto)
        });
        return await response.json();
    }
};