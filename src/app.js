import { ClienteService } from './services/cliente.service.js';
import { MotocicletaService } from './services/motocicleta.service.js';
import { OrdenService } from './services/orden.service.js';
import { CatalogoService } from './services/catalogo.service.js';

import { ModalComponent } from './components/modal.component.js';
import { ClienteForm } from './forms/cliente.form.js';
import { MotocicletaForm } from './forms/motocicleta.form.js';
import { OrdenForm } from './forms/orden.form.js';

document.addEventListener('DOMContentLoaded', () => {
    renderModals();
    ModalComponent.initEvents();
    
    initFormListeners();
    initTabs();
    loadAllData();
});

// Renderizar contenedores de formularios en el HTML
function renderModals() {
    const div = document.createElement('div');
    div.innerHTML = ClienteForm.render() + MotocicletaForm.render() + OrdenForm.render();
    document.body.appendChild(div);
}

function initFormListeners() {
    ClienteForm.setupListeners(() => loadClientes());
    MotocicletaForm.setupListeners(() => loadMotocicletas());
    OrdenForm.setupListeners(() => loadOrdenes());

    // Asignar apertura a los botones principales
    document.getElementById('btn-open-cliente')?.addEventListener('click', () => ModalComponent.open('modal-cliente'));
    document.getElementById('btn-open-moto')?.addEventListener('click', () => ModalComponent.open('modal-motocicleta'));
    document.getElementById('btn-open-orden')?.addEventListener('click', () => {
        OrdenForm.addLinea(); // Línea inicial
        ModalComponent.open('modal-orden');
    });
}

function initTabs() {
    const buttons = document.querySelectorAll('.nav-btn');
    const tabs = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            buttons.forEach(b => b.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');
        });
    });
}

async function loadAllData() {
    await Promise.all([loadClientes(), loadMotocicletas(), loadOrdenes(), loadCatalogo()]);
}

async function loadClientes() {
    try {
        const data = await ClienteService.getAll();
        const tbody = document.getElementById('tbl-clientes');
        const selectMoto = document.getElementById('moto-cliente-id');
        const selectOrden = document.getElementById('orden-cliente-select');

        if (tbody) tbody.innerHTML = '';
        if (selectMoto) selectMoto.innerHTML = '<option value="">Seleccione Cliente...</option>';
        if (selectOrden) selectOrden.innerHTML = '<option value="">Seleccione Cliente...</option>';

        data.forEach(c => {
            const id = c.id || c.Id;
            const nombre = c.nombre || c.Nombre || c.razonSocial;
            const doc = c.documento || c.Documento;
            const tel = c.telefono || c.Telefono;
            const tipo = c.tipo || c.Tipo || 'Particular';

            if (tbody) {
                tbody.innerHTML += `<tr><td>${id}</td><td>${doc}</td><td>${nombre}</td><td><span class="badge">${tipo}</span></td><td>${tel}</td></tr>`;
            }
            if (selectMoto) selectMoto.innerHTML += `<option value="${id}">${nombre} (${doc})</option>`;
            if (selectOrden) selectOrden.innerHTML += `<option value="${id}">${nombre} [${tipo}]</option>`;
        });
    } catch (e) { console.error(e); }
}

async function loadMotocicletas() {
    try {
        const [motos, clientes] = await Promise.all([
            MotocicletaService.getAll(),
            ClienteService.getAll()
        ]);

        // 📌 GUARDAR EN LA CACHE DE ORDENFORM PARA EL FILTRADO EN TIEMPO REAL
        OrdenForm.motocicletasCache = motos;

        const tbody = document.getElementById('tbl-motos');

        if (tbody) tbody.innerHTML = '';

        motos.forEach(m => {
            const placa = m.placa || m.Placa;
            const marca = m.marca || m.Marca;
            const clienteId = m.clienteId || m.ClienteId;

            const clienteObj = clientes.find(c => (c.id || c.Id) === clienteId);
            const nombreCliente = clienteObj ? (clienteObj.nombre || clienteObj.Nombre) : `Cliente #${clienteId}`;

            if (tbody) {
                tbody.innerHTML += `<tr><td><strong>${placa}</strong></td><td>${marca}</td><td>${m.modelo || '-'}</td><td>${nombreCliente}</td></tr>`;
            }
        });
    } catch (e) { 
        console.error('Error cargando motocicletas:', e); 
    }
}

async function loadOrdenes() {
    try {
        const data = await OrdenService.getAll();
        const tbody = document.getElementById('tbl-ordenes');
        if (!tbody) return;

        tbody.innerHTML = '';

        data.forEach(o => {
            const id = o.id || o.Id;
            const mecanico = (o.lineas && o.lineas.length > 0) ? o.lineas[0].nombreMecanico : 'Por Asignar';
            const servicio = (o.lineas && o.lineas.length > 0) ? o.lineas[0].nombreServicio : 'Servicio';
            const estado = o.estado || 'Recibida';
            const total = o.valorTotal ? `$${o.valorTotal.toLocaleString()}` : '$0';

            tbody.innerHTML += `
                <tr>
                    <td><strong>#${id}</strong></td>
                    <td>Moto #${o.motocicletaId}</td>
                    <td>${mecanico}</td>
                    <td>${servicio}</td>
                    <td><span class="badge">${estado} (${total})</span></td>
                </tr>
            `;
        });
    } catch (e) { console.error(e); }
}

async function loadCatalogo() {
    try {
        const [servicios, mecanicos] = await Promise.all([
            CatalogoService.getServicios().catch(() => []),
            CatalogoService.getMecanicos().catch(() => [])
        ]);

        console.log('🔧 Mecánicos devueltos por la API:', mecanicos);

        // Guardar la lista de mecánicos y forzar la actualización del select
        OrdenForm.mecanicosCache = mecanicos;
        OrdenForm.updateMecanicosSelects();

        const tbody = document.getElementById('tbl-catalogo');
        if (tbody) {
            tbody.innerHTML = '';
            servicios.forEach(s => {
                const nombre = s.nombre || s.Nombre || s.descripcion || s.Descripcion;
                const precio = s.precio || s.Precio || s.valor || s.Valor || 0;
                tbody.innerHTML += `<tr><td><span class="badge">Servicio</span></td><td>${nombre}</td><td>$${precio.toLocaleString()}</td></tr>`;
            });
        }
    } catch (e) { 
        console.error('Error al cargar catálogo:', e); 
    }
}