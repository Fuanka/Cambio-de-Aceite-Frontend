import { API_CONFIG } from '../config/api.config.js';

export const CatalogoService = {
    async getServicios() {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATALOGO_SERVICIOS}`);
        return await response.json();
    },
    async getMecanicos() {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CATALOGO_MECANICOS}`);
        return await response.json();
    }
};