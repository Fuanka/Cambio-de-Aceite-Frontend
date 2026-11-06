import { OrdenService } from '../services/orden.service.js';
import { ModalComponent } from '../components/modal.component.js';

export const OrdenForm = {
    lineasCount: 0,
    motocicletasCache: [],
    mecanicosCache: [],

    render() {
        return `
            <div class="modal-overlay" id="modal-orden">
                <div class="modal-container" style="max-width: 750px;">
                    <div class="modal-header">
                        <h2><i data-lucide="clipboard-list"></i> Crear Orden de Trabajo</h2>
                        <button class="btn-close" data-close="modal-orden">&times;</button>
                    </div>
                    <form id="form-orden-post">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Cliente</label>
                                <select id="orden-cliente-select" required>
                                    <option value="">Seleccione Cliente...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Motocicleta</label>
                                <select id="orden-moto-select" required disabled>
                                    <option value="">Primero seleccione un cliente...</option>
                                </select>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label>Kilometraje de Ingreso</label>
                                <input type="number" id="orden-km-ingreso" required placeholder="Ej: 34500">
                            </div>
                            <div class="form-group">
                                <label>Nº Autorización Externo (Req. Convenios)</label>
                                <input type="text" id="orden-auth-ext" placeholder="Obligatorio si es Convenio">
                            </div>
                        </div>

                        <h3 style="font-size:0.95rem; margin: 1rem 0 0.5rem 0; color: var(--primary);">
                            Líneas de Servicio & Repuestos
                        </h3>
                        <div id="lineas-container"></div>
                        
                        <button type="button" id="btn-add-linea" class="btn" style="background: var(--bg-hover); margin-bottom: 1rem;">
                            + Agregar Servicio
                        </button>

                        <button type="submit" class="btn btn-accent"><i data-lucide="check"></i> Generar Orden de Trabajo</button>
                    </form>
                </div>
            </div>
        `;
    },

    // ⚡ FUNCIÓN PARA ACTUALIZAR DESPLEGABLES CON LA CACHÉ
    updateMecanicosSelects() {
        document.querySelectorAll('.linea-mecanico').forEach(select => {
            const valorActual = select.value;
            select.innerHTML = '<option value="">Seleccione Mecánico...</option>';
            
            if (Array.isArray(this.mecanicosCache) && this.mecanicosCache.length > 0) {
                this.mecanicosCache.forEach(m => {
                    const id = m.id ?? m.Id ?? m.idMecanico ?? m.mecanicoId;
                    const nombre = m.nombre ?? m.Nombre ?? m.nombreCompleto ?? `Mecánico #${id}`;
                    select.innerHTML += `<option value="${id}">${nombre}</option>`;
                });
                if (valorActual) select.value = valorActual;
            }
        });
    },

    addLinea() {
        this.lineasCount++;
        const container = document.getElementById('lineas-container');
        const lineaId = this.lineasCount;

        const html = `
            <div class="linea-item" id="linea-${lineaId}">
                <button type="button" class="btn-remove-linea" onclick="document.getElementById('linea-${lineaId}').remove()">&times;</button>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                    <div class="form-group">
                        <label>Tipo de Servicio</label>
                        <select class="linea-codigo" required>
                            <option value="PREV-01">Preventivo (Garantía 30 días / 1.000 km)</option>
                            <option value="CORR-01">Correctivo (Garantía 90 días / 3.000 km / Req. Cotización)</option>
                            <option value="AJUS-01">Ajuste rápido (&lt; 30 min / Sin fila)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Mecánico Asignado</label>
                        <select class="linea-mecanico" required>
                            <option value="">Cargando mecánicos...</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Diagnóstico Inicial</label>
                    <input type="text" class="linea-diag" placeholder="Detalle del diagnóstico">
                </div>
            </div>
        `;
        container?.insertAdjacentHTML('beforeend', html);

        // Actualizar el select recién creado con la lista de mecánicos
        this.updateMecanicosSelects();
    },

    setupCascadingEvents() {
        const selectCliente = document.getElementById('orden-cliente-select');
        const selectMoto = document.getElementById('orden-moto-select');
        const inputKm = document.getElementById('orden-km-ingreso');

        selectCliente?.addEventListener('change', () => {
            const clienteIdSeleccionado = parseInt(selectCliente.value);

            if (!clienteIdSeleccionado) {
                selectMoto.innerHTML = '<option value="">Primero seleccione un cliente...</option>';
                selectMoto.disabled = true;
                if (inputKm) inputKm.value = '';
                return;
            }

            const motosDelCliente = this.motocicletasCache.filter(m => 
                (m.clienteId || m.ClienteId) === clienteIdSeleccionado
            );

            selectMoto.innerHTML = '<option value="">Seleccione Moto...</option>';

            if (motosDelCliente.length === 0) {
                selectMoto.innerHTML = '<option value="">Este cliente no tiene motos registradas</option>';
                selectMoto.disabled = true;
            } else {
                motosDelCliente.forEach(m => {
                    const id = m.id || m.Id;
                    const placa = m.placa || m.Placa;
                    const marca = m.marca || m.Marca;
                    const modelo = m.modelo || m.Modelo || '';
                    selectMoto.innerHTML += `<option value="${id}">${placa} - ${marca} ${modelo}</option>`;
                });
                selectMoto.disabled = false;
            }

            if (inputKm) inputKm.value = '';
        });

        selectMoto?.addEventListener('change', () => {
            const motoIdSeleccionada = parseInt(selectMoto.value);
            const motoEncontrada = this.motocicletasCache.find(m => (m.id || m.Id) === motoIdSeleccionada);

            if (motoEncontrada && inputKm) {
                inputKm.value = motoEncontrada.kilometraje || motoEncontrada.Kilometraje || 0;
            } else if (inputKm) {
                inputKm.value = '';
            }
        });
    },

    setupListeners(onSuccess) {
        this.setupCascadingEvents();

        document.getElementById('btn-add-linea')?.addEventListener('click', () => this.addLinea());

        document.getElementById('form-orden-post')?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const lineasElementos = document.querySelectorAll('.linea-item');
            const lineas = Array.from(lineasElementos).map(item => ({
                codigoServicio: item.querySelector('.linea-codigo').value,
                mecanicoId: parseInt(item.querySelector('.linea-mecanico').value || 1),
                diagnostico: item.querySelector('.linea-diag').value || '',
                repuestos: []
            }));

            const dto = {
                clienteId: parseInt(document.getElementById('orden-cliente-select').value),
                motocicletaId: parseInt(document.getElementById('orden-moto-select').value),
                kilometrajeIngreso: parseInt(document.getElementById('orden-km-ingreso').value),
                numeroAutorizacionExterna: document.getElementById('orden-auth-ext').value || '',
                lineas: lineas
            };

            try {
                await OrdenService.create(dto);
                alert('¡Orden de trabajo generada correctamente!');
                ModalComponent.close('modal-orden');
                e.target.reset();
                if (onSuccess) onSuccess();
            } catch (err) {
                alert('Error al generar la orden.');
            }
        });
    }
};