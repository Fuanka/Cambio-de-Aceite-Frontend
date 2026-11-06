import { ClienteService } from '../services/cliente.service.js';
import { ModalComponent } from '../components/modal.component.js';

export const ClienteForm = {
    render() {
        return `
            <div class="modal-overlay" id="modal-cliente">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2><i data-lucide="user-plus"></i> Registrar Nuevo Cliente</h2>
                        <button class="btn-close" data-close="modal-cliente">&times;</button>
                    </div>
                    <form id="form-cliente-post">
                        <div class="form-group">
                            <label>Tipo de Cliente</label>
                            <select id="cli-tipo" required>
                                <option value="Particular">Particular (Paga contra entrega / Regla 10%)</option>
                                <option value="Flota">Flota (Prioridad Alta / Crédito 30 días)</option>
                                <option value="Convenio">Convenio (Prioridad Media / Requiere Nº Autorización)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Documento / NIT</label>
                            <input type="text" id="cli-documento" required placeholder="Ej: 1040123456">
                        </div>
                        <div class="form-group">
                            <label>Nombre / Razón Social</label>
                            <input type="text" id="cli-nombre" required placeholder="Nombre completo o Empresa">
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="text" id="cli-telefono" required placeholder="Ej: 3001234567">
                        </div>
                        <div class="form-group">
                            <label>Correo Electrónico</label>
                            <input type="email" id="cli-correo" required placeholder="cliente@correo.com">
                        </div>

                        <!-- Campos dinámicos según el tipo de cliente -->
                        <div id="cli-campos-credito" style="display:none;">
                            <div class="form-group">
                                <label>Cupo de Crédito Pactado ($)</label>
                                <input type="number" id="cli-cupo" value="0">
                            </div>
                            <div class="form-group">
                                <label>Monto Autorizado Automático ($)</label>
                                <input type="number" id="cli-monto-auth" value="0">
                            </div>
                        </div>

                        <div id="cli-campos-convenio" style="display:none;">
                            <div class="form-group">
                                <label>Descuento de Convenio (%)</label>
                                <input type="number" id="cli-descuento" value="15" min="15" max="25">
                            </div>
                        </div>

                        <button type="submit" class="btn"><i data-lucide="save"></i> Guardar Cliente en Backend</button>
                    </form>
                </div>
            </div>
        `;
    },

    setupListeners(onSuccess) {
        const selectTipo = document.getElementById('cli-tipo');
        const divCredito = document.getElementById('cli-campos-credito');
        const divConvenio = document.getElementById('cli-campos-convenio');

        selectTipo?.addEventListener('change', () => {
            const val = selectTipo.value;
            divCredito.style.display = (val === 'Flota') ? 'block' : 'none';
            divConvenio.style.display = (val === 'Convenio') ? 'block' : 'none';
        });

        document.getElementById('form-cliente-post')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const dto = {
                documento: document.getElementById('cli-documento').value,
                nombre: document.getElementById('cli-nombre').value,
                telefono: document.getElementById('cli-telefono').value,
                correo: document.getElementById('cli-correo').value,
                tipo: selectTipo.value,
                cupoCredito: parseFloat(document.getElementById('cli-cupo').value || 0),
                montoAutorizado: parseFloat(document.getElementById('cli-monto-auth').value || 0),
                tieneFacturasVencidas: false,
                descuentoConvenio: parseFloat(document.getElementById('cli-descuento').value || 0)
            };

            try {
                await ClienteService.create(dto);
                alert('¡Cliente creado exitosamente!');
                ModalComponent.close('modal-cliente');
                e.target.reset();
                if (onSuccess) onSuccess();
            } catch (err) {
                alert('Error al guardar cliente en la API.');
            }
        });
    }
};