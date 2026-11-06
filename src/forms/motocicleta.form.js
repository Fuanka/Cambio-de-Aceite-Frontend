import { MotocicletaService } from '../services/motocicleta.service.js';
import { ModalComponent } from '../components/modal.component.js';

export const MotocicletaForm = {
    render() {
        return `
            <div class="modal-overlay" id="modal-motocicleta">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i data-lucide="bike"></i> Registrar Nueva Motocicleta</h2>
                        <button class="btn-close" data-close="modal-motocicleta">&times;</button>
                    </div>
                    <form id="form-moto-post">
                        <div class="form-group">
                            <label>Placa</label>
                            <input type="text" id="moto-placa" required placeholder="Ej: ABC-123">
                        </div>
                        <div class="form-group">
                            <label>Marca</label>
                            <input type="text" id="moto-marca" required placeholder="Ej: Yamaha">
                        </div>
                        <div class="form-group">
                            <label>Modelo</label>
                            <input type="text" id="moto-modelo" required placeholder="Ej: FZ 250">
                        </div>
                        <div class="form-group">
                            <label>Cilindraje (cc)</label>
                            <input type="number" id="moto-cilindraje" required placeholder="Ej: 250">
                        </div>
                        <div class="form-group">
                            <label>Kilometraje Actual</label>
                            <input type="number" id="moto-km" required placeholder="Ej: 34500">
                        </div>
                        <div class="form-group">
                            <label>Propietario (Cliente)</label>
                            <select id="moto-cliente-id" required>
                                <option value="">Cargando clientes...</option>
                            </select>
                        </div>

                        <button type="submit" class="btn"><i data-lucide="save"></i> Guardar Motocicleta</button>
                    </form>
                </div>
            </div>
        `;
    },

    setupListeners(onSuccess) {
        document.getElementById('form-moto-post')?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const dto = {
                placa: document.getElementById('moto-placa').value,
                marca: document.getElementById('moto-marca').value,
                modelo: document.getElementById('moto-modelo').value,
                cilindraje: parseInt(document.getElementById('moto-cilindraje').value),
                kilometraje: parseInt(document.getElementById('moto-km').value),
                clienteId: parseInt(document.getElementById('moto-cliente-id').value)
            };

            try {
                await MotocicletaService.create(dto);
                alert('¡Motocicleta asociada con éxito!');
                ModalComponent.close('modal-motocicleta');
                e.target.reset();
                if (onSuccess) onSuccess();
            } catch (err) {
                alert('Error al guardar motocicleta en la API.');
            }
        });
    }
};