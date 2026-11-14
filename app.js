/**
 * AgroMendoza - PWA Lógica de Navegación y Funcionalidad Campo Offline
 * Diseñado bajo principios de usabilidad para productores agrícolas y tomeros.
 *
 * Módulos integrados:
 * 1. Accesibilidad en Campo: Modo Pleno Sol y Letra Grande (+20%).
 * 2. Ergonomía en Campo: Grabador de Notas de Voz para el Tomero.
 * 3. Calendario del Turnero: Vista Quincenal y Mensual con períodos de corta.
 * 4. Esquema Lineal de la Hijuela: Vista croquis/mapa interactivo de compuertas.
 * 5. Bandeja de Sincronización Visible: Cola de datos offline con sincronización forzada.
 */

// Estado global de la aplicación
const AppState = {
  role: localStorage.getItem('agro_role') || 'productor', // 'productor' | 'tomero'
  currentScreen: 'mi-riego',
  isOnline: navigator.onLine,
  modoSol: localStorage.getItem('agro_modo_sol') === 'true',
  textoGrande: localStorage.getItem('agro_texto_grande') === 'true',
  filtroCalendario: 'quincenal', // 'quincenal' | 'mensual'

  rutStatus: localStorage.getItem('agro_rut_status') || 'pendiente', // 'pendiente' | 'firmado'
  rutData: JSON.parse(localStorage.getItem('agro_rut_data') || JSON.stringify({
    hectareas: '4.5',
    cultivo: 'Vid Malbec',
    malla: 'Malla en Cuartel 1 (2.5 ha)',
    riego: 'Superficial Definitivo',
    finca: 'Finca Los Álamos',
    padronATM: '04-2819-3',
    nomenclatura: '06-99-04-2819-000012-0000-3',
    fechaFirma: null
  })),

  tomeroTurnoIndex: parseInt(localStorage.getItem('agro_tomero_turno_idx') || '1', 10), // 0 to 5 (Turno 2 de 6)
  turnosTomero: [
    { num: 1, finca: 'FINCA LA ESMERALDA', titular: 'Roberto Ortiz', horario: '06:30 a 09:30 hs', padron: '4019', compuerta: '1 - Entrada', estado: 'Entregado' },
    { num: 2, finca: 'FINCA GONZÁLEZ', titular: 'Alberto González', horario: '10:00 a 13:00 hs', padron: '4022', compuerta: '2 - Hijuela Oeste', estado: 'En Curso' },
    { num: 3, finca: 'VIÑEDOS DEL SOL', titular: 'María Elena Rossi', horario: '13:00 a 16:30 hs', padron: '4025', compuerta: '3 - Partidor Norte', estado: 'Pendiente' },
    { num: 4, finca: 'CHACRA DON PEDRO', titular: 'Pedro Martínez', horario: '16:30 a 19:30 hs', padron: '4028', compuerta: '4 - Rama Baja', estado: 'Pendiente' },
    { num: 5, finca: 'EL MANANTIAL', titular: 'Hnos. Benítez', horario: '19:30 a 23:00 hs', padron: '4031', compuerta: '5 - Hijuela Este', estado: 'Pendiente' },
    { num: 6, finca: 'LOS CIRUELOS', titular: 'Estela Giménez', horario: '23:00 a 03:00 hs', padron: '4035', compuerta: '6 - Cola Canal', estado: 'Pendiente' }
  ],

  // Planilla del Calendario del Turnero (Noviembre / Diciembre 2026)
  turnosCalendario: [
    {
      id: 1,
      fechaStr: 'Dom 15 Nov',
      horario: '09:00 a 12:30 hs',
      duracion: '3h 30m',
      tipo: 'riego',
      estado: 'Confirmado Próximo',
      padron: 'Padrón #4022',
      caudal: '120 L/s',
      compuerta: 'Compuerta 4',
      esQuincenaActual: true,
      notas: 'Dotación completa programada para fin de semana.'
    },
    {
      id: 2,
      fechaStr: 'Lun 23 Nov',
      horario: '14:00 a 17:30 hs',
      duracion: '3h 30m',
      tipo: 'riego',
      estado: 'Programado',
      padron: 'Padrón #4022',
      caudal: '120 L/s',
      compuerta: 'Compuerta 4',
      esQuincenaActual: true,
      notas: 'Segundo riego quincenal de primavera.'
    },
    {
      id: 3,
      fechaStr: 'Mié 25 al Vie 27 Nov',
      horario: '72 horas continuas',
      duracion: '3 días',
      tipo: 'corta',
      estado: 'CORTA DE CANAL',
      padron: 'Rama Pasco Completa',
      caudal: '0 L/s',
      compuerta: 'Toma General',
      esQuincenaActual: true,
      notas: 'Limpieza estacional de hijuela y retiro de sedimento en partidores.'
    },
    {
      id: 4,
      fechaStr: 'Mar 01 Dic',
      horario: '08:30 a 12:00 hs',
      duracion: '3h 30m',
      tipo: 'riego',
      estado: 'Programado',
      padron: 'Padrón #4022',
      caudal: '120 L/s',
      compuerta: 'Compuerta 4',
      esQuincenaActual: false,
      notas: 'Inicio del ciclo de riego de cuaje y grano de uva.'
    },
    {
      id: 5,
      fechaStr: 'Mié 09 Dic',
      horario: '15:00 a 18:30 hs',
      duracion: '3h 30m',
      tipo: 'riego',
      estado: 'Programado',
      padron: 'Padrón #4022',
      caudal: '120 L/s',
      compuerta: 'Compuerta 4',
      esQuincenaActual: false,
      notas: 'Turno ordinario quincenal.'
    }
  ],

  // Compuertas de la Hijuela San Martín (Esquema Lineal Aguas Arriba -> Aguas Abajo)
  compuertasHijuela: [
    { km: '0.0', codigo: 'TOMA-0', nombre: 'Toma Principal Río Tunuyán', titular: 'Inspección de Cauce', estado: 'Abierta (100%)', abierta: true, caudal: '1400 L/s', detalle: 'Flujo hídrico estable' },
    { km: '0.8', codigo: 'C-1', nombre: 'Compuerta 1 • La Esmeralda', titular: 'Roberto Ortiz', estado: 'Cerrada', abierta: false, caudal: '0 L/s', detalle: 'Turno 06:30 a 09:30 hs finalizado' },
    { km: '1.6', codigo: 'C-2', nombre: 'Compuerta 2 • Finca González', titular: 'Alberto González', estado: 'ABIERTA (En Riego)', abierta: true, caudal: '120 L/s', detalle: 'Turno en curso: 10:00 a 13:00 hs' },
    { km: '2.4', codigo: 'C-3', nombre: 'Compuerta 3 • Viñedos del Sol', titular: 'María Elena Rossi', estado: 'Cerrada', abierta: false, caudal: '0 L/s', detalle: 'Próximo turno a las 13:00 hs' },
    { km: '3.2', codigo: 'C-4', nombre: 'Compuerta 4 • Hijuela San Martín', titular: 'Don Alberto González (Parcela 12B)', estado: 'Cerrada', abierta: false, caudal: '0 L/s', detalle: 'Próximo turno: Mañana 09:00 hs' },
    { km: '4.1', codigo: 'C-5', nombre: 'Compuerta 5 • El Manantial', titular: 'Hnos. Benítez', estado: 'Cerrada', abierta: false, caudal: '0 L/s', detalle: 'Turno tarde: 19:30 hs' },
    { km: '5.0', codigo: 'C-6', nombre: 'Compuerta 6 • Los Ciruelos', titular: 'Estela Giménez', estado: 'Cerrada', abierta: false, caudal: '0 L/s', detalle: 'Cola de canal • Turno nocturno 23:00 hs' },
    { km: '5.8', codigo: 'DES-1', nombre: 'Partidor y Desagüe Colector', titular: 'Comisaría de Aguas', estado: 'Libre alivio', abierta: false, caudal: '0 L/s', detalle: 'Retorno de sobrantes hacia desagüe general' }
  ],

  // Cola de sincronización fuera de línea
  syncQueue: JSON.parse(localStorage.getItem('agro_sync_queue') || JSON.stringify([
    {
      id: 'sync-1',
      tipo: 'Aviso de Agua',
      icono: 'warning',
      titulo: 'Canal roto o desbordado',
      descripcion: 'Hijuela San Martín • Incluye foto y nota de voz (14s)',
      fecha: 'Hoy, 20:35 hs',
      estado: 'Pendiente de sincronizar'
    },
    {
      id: 'sync-2',
      tipo: 'Turno Tomero',
      icono: 'check_circle',
      titulo: 'Turno 1 - La Esmeralda',
      descripcion: 'Agua entregada a Roberto Ortiz (09:30 hs)',
      fecha: 'Hoy, 09:32 hs',
      estado: 'Pendiente de sincronizar'
    }
  ])),

  incidentesGuardados: JSON.parse(localStorage.getItem('agro_incidentes') || '[]'),

  // Grabador de notas de voz
  isRecording: false,
  mediaRecorder: null,
  audioChunks: [],
  currentAudioBlob: null,
  currentAudioUrl: null,
  currentAudioDuration: 0,
  audioTimerInterval: null,
  activeAudioPlayer: null
};

// Función de vibración háptica suave para confirmación de toques
function triggerHaptic(type = 'light') {
  if (navigator.vibrate) {
    if (type === 'light') navigator.vibrate(35);
    else if (type === 'medium') navigator.vibrate(55);
    else if (type === 'success') navigator.vibrate([40, 60, 40]);
    else if (type === 'warning') navigator.vibrate([80, 50, 80]);
  }
}

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initAccessibilitySettings();
  initNetworkListeners();
  initRouting();
  renderRoleBadge();
  setupEventListeners();
  renderSyncTrayBadge();
  updateOfflineBanners();
});

// ==============================================================
// 1. BANDEJA DE SINCRONIZACIÓN VISIBLE (Resiliencia Fuera de Línea)
// ==============================================================
function renderSyncTrayBadge() {
  const badge = document.getElementById('sync-tray-badge');
  const okLabel = document.getElementById('sync-ok-label');
  const countEl = document.getElementById('sync-pending-count');
  const count = AppState.syncQueue.length;

  if (badge && countEl) {
    if (count > 0) {
      countEl.textContent = `${count} pendiente${count > 1 ? 's' : ''}`;
      badge.classList.remove('hidden');
      if (okLabel) okLabel.classList.add('hidden');
    } else {
      badge.classList.add('hidden');
      if (okLabel) okLabel.classList.remove('hidden');
    }
  }
}

function openSyncTray() {
  triggerHaptic('light');
  const modal = document.getElementById('modal-sync-tray');
  const listContainer = document.getElementById('sync-items-list');

  if (modal && listContainer) {
    if (AppState.syncQueue.length === 0) {
      listContainer.innerHTML = `
        <div class="p-6 text-center text-gray-500 flex flex-col items-center gap-2">
          <span class="material-symbols-outlined text-[36px] text-green-700 fill-icon">cloud_done</span>
          <p class="font-extrabold text-sm text-[#111827]">Todos los datos están sincronizados</p>
          <p class="text-xs text-gray-600">No hay avisos ni turnos pendientes en la memoria del teléfono.</p>
        </div>
      `;
    } else {
      listContainer.innerHTML = AppState.syncQueue.map(item => `
        <div class="p-3 bg-white border border-[#CBD5E1] rounded-xl flex items-start gap-3 shadow-xs">
          <span class="material-symbols-outlined text-[24px] text-[#1B5E20] shrink-0 mt-0.5">${item.icono || 'cached'}</span>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase text-[#1B5E20]">${item.tipo}</span>
              <span class="text-[11px] font-bold text-gray-500">${item.fecha}</span>
            </div>
            <p class="font-extrabold text-sm text-[#111827] leading-snug mt-0.5">${item.titulo}</p>
            <p class="text-xs text-[#374151] leading-snug">${item.descripcion}</p>
            <span class="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
              ⏳ ${item.estado}
            </span>
          </div>
        </div>
      `).join('');
    }

    modal.classList.remove('hidden');
  }
}

function closeSyncTray() {
  triggerHaptic('light');
  const modal = document.getElementById('modal-sync-tray');
  if (modal) modal.classList.add('hidden');
}

function syncAllPending() {
  triggerHaptic('medium');
  const btn = document.getElementById('btn-forzar-sync');
  const originalText = btn ? btn.innerHTML : '';

  if (btn) {
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[20px]">sync</span> Sincronizando con Irrigación...`;
    btn.disabled = true;
  }

  setTimeout(() => {
    AppState.syncQueue = [];
    localStorage.setItem('agro_sync_queue', JSON.stringify([]));
    renderSyncTrayBadge();
    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
    closeSyncTray();
    triggerHaptic('success');
    showToast('✓ ¡Sincronización completa! Todos los avisos y turnos fueron recibidos por la guardia del DGI.');
  }, 1600);
}

// ==============================================================
// 2. CALENDARIO DEL TURNERO (Vista Quincenal y Mensual)
// ==============================================================
function setFiltroCalendario(filtro) {
  triggerHaptic('light');
  AppState.filtroCalendario = filtro;

  const btnQuincenal = document.getElementById('btn-cal-quincenal');
  const btnMensual = document.getElementById('btn-cal-mensual');

  if (filtro === 'quincenal') {
    if (btnQuincenal) {
      btnQuincenal.className = 'flex-1 py-2 rounded-lg font-black text-xs bg-[#1B5E20] text-white transition';
    }
    if (btnMensual) {
      btnMensual.className = 'flex-1 py-2 rounded-lg font-bold text-xs bg-white text-[#111827] border border-[#CBD5E1] transition';
    }
  } else {
    if (btnQuincenal) {
      btnQuincenal.className = 'flex-1 py-2 rounded-lg font-bold text-xs bg-white text-[#111827] border border-[#CBD5E1] transition';
    }
    if (btnMensual) {
      btnMensual.className = 'flex-1 py-2 rounded-lg font-black text-xs bg-[#1B5E20] text-white transition';
    }
  }

  renderCalendarioScreen();
}

function renderCalendarioScreen() {
  const container = document.getElementById('calendario-turnos-list');
  if (!container) return;

  const items = AppState.filtroCalendario === 'quincenal'
    ? AppState.turnosCalendario.filter(t => t.esQuincenaActual)
    : AppState.turnosCalendario;

  container.innerHTML = items.map(t => {
    if (t.tipo === 'corta') {
      return `
        <!-- Tarjeta de Corta de Canal -->
        <div class="bg-corta-stripes border-2 border-dashed border-[#64748B] rounded-2xl p-4 flex flex-col gap-1.5 shadow-xs">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 bg-gray-800 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
              <span class="material-symbols-outlined text-[16px]">build</span>
              ${t.estado}
            </span>
            <span class="text-xs font-black text-[#111827]">${t.fechaStr}</span>
          </div>
          <p class="font-extrabold text-base text-[#111827] mt-1">${t.horario}</p>
          <p class="text-xs text-[#374151] font-medium leading-snug">${t.notas}</p>
          <div class="pt-1 flex items-center gap-2 text-xs font-bold text-gray-700">
            <span class="material-symbols-outlined text-[18px]">info</span>
            <span>Caudal: 0 L/s • Sin servicio de agua en toda la hijuela</span>
          </div>
        </div>
      `;
    }

    const isNext = t.id === 1;
    return `
      <!-- Tarjeta de Turno de Riego -->
      <div class="bg-white border-2 ${isNext ? 'border-[#1B5E20] shadow-sm' : 'border-[#CBD5E1] shadow-xs'} rounded-2xl p-3.5 flex flex-col gap-2">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="material-symbols-outlined ${isNext ? 'text-[#1B5E20] fill-icon' : 'text-gray-600'} text-[20px] shrink-0">water_drop</span>
            <span class="font-black text-sm text-[#111827]">${t.fechaStr}</span>
          </div>
          <span class="text-xs font-black px-2.5 py-0.5 rounded-full shrink-0 ${isNext ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]' : 'bg-[#F3F4F6] text-[#374151] border border-[#CBD5E1]'}">
            ${t.estado}
          </span>
        </div>

        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <span class="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">${t.horario}</span>
          <span class="text-xs font-black text-[#1B5E20] bg-green-50 px-2 py-0.5 rounded-md border border-green-200 shrink-0">${t.duracion}</span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs text-[#374151] font-bold bg-[#F8F9FA] p-2.5 rounded-xl border border-gray-200">
          <div><span class="text-gray-500 font-normal">Caudal:</span> ${t.caudal}</div>
          <div><span class="text-gray-500 font-normal">Toma:</span> ${t.compuerta}</div>
        </div>

        <p class="text-xs text-[#4B5563] leading-snug">${t.notas}</p>
      </div>
    `;
  }).join('');
}

// ==============================================================
// 3. ESQUEMA LINEAL DE LA HIJUELA (Vista Mapa / Croquis)
// ==============================================================
function renderEsquemaHijuela() {
  const container = document.getElementById('esquema-compuertas-list');
  if (!container) return;

  const isTomero = AppState.role === 'tomero';
  const btnVolver = document.getElementById('btn-volver-croquis');
  const roleBanner = document.getElementById('croquis-role-banner');

  if (btnVolver) {
    btnVolver.setAttribute('href', isTomero ? '#modo-tomero' : '#mi-riego');
  }
  if (roleBanner) {
    if (isTomero) {
      roleBanner.className = 'mb-3 bg-blue-50 border border-blue-200 rounded-xl p-2.5 flex items-center gap-2 text-xs font-bold text-blue-900';
      roleBanner.innerHTML = `
        <span class="material-symbols-outlined text-[18px] text-blue-700 shrink-0">engineering</span>
        <span>Modo Operativo Tomero: Toque abrir/cerrar en cada compuerta para operar el cauce.</span>
      `;
    } else {
      roleBanner.className = 'mb-3 bg-gray-100 border border-[#CBD5E1] rounded-xl p-2.5 flex items-center gap-2 text-xs font-bold text-[#374151]';
      roleBanner.innerHTML = `
        <span class="material-symbols-outlined text-[18px] text-[#1B5E20] shrink-0">visibility</span>
        <span>Vista de consulta para Regantes (Solo el Tomero puede operar compuertas).</span>
      `;
    }
  }

  container.innerHTML = AppState.compuertasHijuela.map((c, index) => {
    const isCurrentActive = c.abierta && c.codigo !== 'TOMA-0';

    return `
      <!-- Nodo de Compuerta en la Hijuela (Flex limpio sin superposición) -->
      <div class="relative flex items-start gap-3 pb-3.5">
        <!-- Ícono del Nodo alineado con la columna izquierda (36px -> centro en 18px) -->
        <button onclick="toggleCompuertaEstado(${index})" type="button" class="w-9 h-9 shrink-0 rounded-full border-2 ${c.abierta ? 'bg-[#1B5E20] border-white text-white gate-active-glow' : 'bg-white border-[#94A3B8] text-[#64748B]'} flex items-center justify-center z-10 shadow-xs active:scale-95 transition mt-1" aria-label="Compuerta ${c.codigo}">
          <span class="material-symbols-outlined text-[18px] ${c.abierta ? 'fill-icon' : ''}">
            ${c.codigo === 'TOMA-0' ? 'water' : (c.abierta ? 'water_drop' : 'lock')}
          </span>
        </button>

        <!-- Tarjeta de Datos de la Compuerta -->
        <div class="flex-1 min-w-0 p-3 bg-white border ${isCurrentActive ? 'border-2 border-[#1B5E20] bg-[#F0FDF4]' : 'border-[#CBD5E1]'} rounded-xl shadow-xs">
          <div class="flex flex-wrap items-center justify-between gap-1.5">
            <span class="text-xs font-extrabold text-gray-500">KM ${c.km} • ${c.codigo}</span>
            <span class="text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${c.abierta ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]' : 'bg-gray-100 text-gray-700 border border-gray-300'}">
              ${c.estado}
            </span>
          </div>

          <p class="font-extrabold text-sm text-[#111827] mt-1 leading-snug">${c.nombre}</p>
          <p class="text-xs text-[#374151] font-medium leading-snug mt-0.5">${c.detalle}</p>

          <div class="mt-2 pt-1.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs font-bold text-gray-600">
            <span>Titular: <strong>${c.titular}</strong></span>
            <span>Caudal: <strong>${c.caudal}</strong></span>
          </div>

          ${isTomero && c.codigo !== 'TOMA-0' && c.codigo !== 'DES-1' ? `
            <div class="mt-2 pt-2 border-t border-gray-200 flex gap-2">
              <button onclick="toggleCompuertaEstado(${index})" type="button" class="flex-1 py-2 px-3 text-xs font-black rounded-lg ${c.abierta ? 'bg-red-50 text-red-700 border border-red-300' : 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]'}">
                ${c.abierta ? 'Cerrar Compuerta' : 'Abrir para Riego'}
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function toggleCompuertaEstado(index) {
  triggerHaptic('light');
  const compuerta = AppState.compuertasHijuela[index];
  if (!compuerta || compuerta.codigo === 'TOMA-0' || compuerta.codigo === 'DES-1') return;

  if (AppState.role === 'tomero') {
    compuerta.abierta = !compuerta.abierta;
    compuerta.estado = compuerta.abierta ? 'ABIERTA (En Riego)' : 'Cerrada';
    compuerta.caudal = compuerta.abierta ? '120 L/s' : '0 L/s';

    // Registrar en bandeja de sincronización
    AppState.syncQueue.push({
      id: `sync-gate-${Date.now()}`,
      tipo: 'Compuerta Tomero',
      icono: compuerta.abierta ? 'water_drop' : 'lock',
      titulo: `${compuerta.codigo} ${compuerta.abierta ? 'Abierta' : 'Cerrada'}`,
      descripcion: `${compuerta.nombre} • ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`,
      fecha: 'Ahora',
      estado: 'Pendiente de sincronizar'
    });
    localStorage.setItem('agro_sync_queue', JSON.stringify(AppState.syncQueue));
    renderSyncTrayBadge();

    showToast(`Compuerta ${compuerta.codigo}: marcada como ${compuerta.estado}`);
    renderEsquemaHijuela();
  } else {
    showToast(`Compuerta ${compuerta.codigo}: ${compuerta.estado} (${compuerta.detalle})`);
  }
}

// ==============================================================
// 4. ACCESIBILIDAD Y ERGONOMÍA (Luz y Manos)
// ==============================================================
function initAccessibilitySettings() {
  if (AppState.modoSol) {
    document.body.classList.add('modo-sol');
    updateSolButtonUI(true);
  }
  if (AppState.textoGrande) {
    document.body.classList.add('texto-grande');
    updateTextoButtonUI(true);
  }
}

function toggleModoSol() {
  triggerHaptic('medium');
  AppState.modoSol = !AppState.modoSol;
  localStorage.setItem('agro_modo_sol', AppState.modoSol.toString());

  if (AppState.modoSol) {
    document.body.classList.add('modo-sol');
    updateSolButtonUI(true);
    showToast('☀️ Modo Pleno Sol activado: Máximo contraste y cero sombras.');
  } else {
    document.body.classList.remove('modo-sol');
    updateSolButtonUI(false);
    showToast('Modo estándar activado.');
  }
}

function updateSolButtonUI(isActive) {
  const btn = document.getElementById('btn-toggle-sol');
  if (btn) {
    const icon = btn.querySelector('.material-symbols-outlined');
    if (isActive) {
      btn.className = 'h-8 px-2.5 rounded-lg border-2 border-black bg-black text-white flex items-center gap-1 text-xs font-bold active:scale-95 transition shadow-2xs';
      if (icon) icon.textContent = 'wb_sunny';
    } else {
      btn.className = 'h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#111827] flex items-center gap-1 text-xs font-bold active:scale-95 transition shadow-2xs';
      if (icon) icon.textContent = 'light_mode';
    }
  }
}

function toggleTextoGrande() {
  triggerHaptic('medium');
  AppState.textoGrande = !AppState.textoGrande;
  localStorage.setItem('agro_texto_grande', AppState.textoGrande.toString());

  if (AppState.textoGrande) {
    document.body.classList.add('texto-grande');
    updateTextoButtonUI(true);
    showToast('🔍 Letra Grande activada para lectura de campo.');
  } else {
    document.body.classList.remove('texto-grande');
    updateTextoButtonUI(false);
    showToast('Tamaño de letra estándar restablecido.');
  }
}

function updateTextoButtonUI(isActive) {
  const btn = document.getElementById('btn-toggle-texto');
  if (btn) {
    const label = document.getElementById('texto-grande-label');
    if (isActive) {
      btn.className = 'h-8 px-2.5 rounded-lg border-2 border-[#1B5E20] bg-[#1B5E20] text-white flex items-center justify-center font-black text-xs active:scale-95 transition shadow-2xs';
      if (label) label.textContent = 'Letra A-';
    } else {
      btn.className = 'h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white text-[#111827] flex items-center justify-center font-black text-xs active:scale-95 transition shadow-2xs';
      if (label) label.textContent = 'Letra A+';
    }
  }
}

// ==============================================================
// 5. GRABADOR DE NOTAS DE VOZ
// ==============================================================
async function toggleAudioRecording() {
  triggerHaptic('light');

  if (!AppState.isRecording) {
    startAudioRecording();
  } else {
    stopAudioRecording();
  }
}

async function startAudioRecording() {
  AppState.isRecording = true;
  AppState.audioChunks = [];
  AppState.currentAudioDuration = 0;

  const recBtn = document.getElementById('audio-rec-btn');
  const timerEl = document.getElementById('audio-timer');
  const labelEl = document.getElementById('audio-rec-label');
  const iconEl = document.getElementById('audio-rec-icon');

  if (recBtn) recBtn.classList.add('recording-active');
  if (timerEl) {
    timerEl.classList.remove('hidden');
    timerEl.textContent = '00:00';
  }
  if (labelEl) labelEl.textContent = 'Grabando... Toque para finalizar';
  if (iconEl) iconEl.textContent = 'stop_circle';

  AppState.audioTimerInterval = setInterval(() => {
    AppState.currentAudioDuration++;
    const mins = Math.floor(AppState.currentAudioDuration / 60).toString().padStart(2, '0');
    const secs = (AppState.currentAudioDuration % 60).toString().padStart(2, '0');
    if (timerEl) timerEl.textContent = `${mins}:${secs}`;

    if (AppState.currentAudioDuration >= 45) {
      stopAudioRecording();
    }
  }, 1000);

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      AppState.mediaRecorder = new MediaRecorder(stream);
      AppState.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) AppState.audioChunks.push(e.data);
      };
      AppState.mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const blob = new Blob(AppState.audioChunks, { type: 'audio/webm' });
        AppState.currentAudioBlob = blob;
        AppState.currentAudioUrl = URL.createObjectURL(blob);
        showAudioPreview();
      };
      AppState.mediaRecorder.start();
    }
  } catch (err) {
    console.warn('Acceso a micrófono no disponible, usando simulación de audio:', err);
  }
}

function stopAudioRecording() {
  AppState.isRecording = false;
  if (AppState.audioTimerInterval) {
    clearInterval(AppState.audioTimerInterval);
    AppState.audioTimerInterval = null;
  }

  triggerHaptic('success');

  const recBtn = document.getElementById('audio-rec-btn');
  const timerEl = document.getElementById('audio-timer');
  const labelEl = document.getElementById('audio-rec-label');
  const iconEl = document.getElementById('audio-rec-icon');

  if (recBtn) recBtn.classList.remove('recording-active');
  if (timerEl) timerEl.classList.add('hidden');
  if (labelEl) labelEl.textContent = 'Grabar nota de voz (Opcional)';
  if (iconEl) iconEl.textContent = 'mic';

  if (AppState.mediaRecorder && AppState.mediaRecorder.state !== 'inactive') {
    AppState.mediaRecorder.stop();
  } else {
    AppState.currentAudioUrl = 'simulated';
    showAudioPreview();
  }
}

function showAudioPreview() {
  const preview = document.getElementById('audio-preview-container');
  const durationText = document.getElementById('audio-preview-duration');
  const recBtn = document.getElementById('audio-rec-btn');

  const durationSecs = Math.max(1, AppState.currentAudioDuration);
  const mins = Math.floor(durationSecs / 60);
  const secs = (durationSecs % 60).toString().padStart(2, '0');
  const formatted = `${mins}:${secs}`;

  if (durationText) durationText.textContent = `Nota de voz lista (${formatted})`;
  if (preview) preview.classList.remove('hidden');
  if (recBtn) recBtn.classList.add('hidden');
}

function playRecordedAudio() {
  triggerHaptic('light');
  const playBtnIcon = document.getElementById('audio-play-icon');

  if (AppState.activeAudioPlayer && !AppState.activeAudioPlayer.paused) {
    AppState.activeAudioPlayer.pause();
    if (playBtnIcon) playBtnIcon.textContent = 'play_arrow';
    return;
  }

  if (AppState.currentAudioUrl && AppState.currentAudioUrl !== 'simulated') {
    AppState.activeAudioPlayer = new Audio(AppState.currentAudioUrl);
    AppState.activeAudioPlayer.play();
    if (playBtnIcon) playBtnIcon.textContent = 'pause';
    AppState.activeAudioPlayer.onended = () => {
      if (playBtnIcon) playBtnIcon.textContent = 'play_arrow';
    };
  } else {
    if (playBtnIcon) playBtnIcon.textContent = 'volume_up';
    showToast('▶ Reproduciendo nota de voz para el tomero...');
    setTimeout(() => {
      if (playBtnIcon) playBtnIcon.textContent = 'play_arrow';
    }, 2500);
  }
}

function deleteRecordedAudio() {
  triggerHaptic('light');
  if (AppState.activeAudioPlayer) {
    AppState.activeAudioPlayer.pause();
    AppState.activeAudioPlayer = null;
  }
  AppState.currentAudioBlob = null;
  AppState.currentAudioUrl = null;
  AppState.currentAudioDuration = 0;

  const preview = document.getElementById('audio-preview-container');
  const recBtn = document.getElementById('audio-rec-btn');
  if (preview) preview.classList.add('hidden');
  if (recBtn) recBtn.classList.remove('hidden');
  showToast('Nota de voz eliminada.');
}

// ==============================================================
// 6. RUTAS Y NAVEGACIÓN SPA
// ==============================================================
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker de AgroMendoza registrado.'))
      .catch((err) => console.warn('SW no disponible o error:', err));
  }
}

function initNetworkListeners() {
  window.addEventListener('online', () => {
    AppState.isOnline = true;
    updateNetworkStatusUI();
    syncOfflineQueue();
  });
  window.addEventListener('offline', () => {
    AppState.isOnline = false;
    updateNetworkStatusUI();
  });
  updateNetworkStatusUI();
}

function updateNetworkStatusUI() {
  const pills = document.querySelectorAll('.network-status-indicator');
  pills.forEach(pill => {
    if (AppState.isOnline) {
      pill.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-[#2E7D32]"></span>
        <span class="font-bold text-xs text-[#2E7D32] whitespace-nowrap">Conectado</span>
      `;
      pill.className = 'network-status-indicator flex items-center gap-1.5 bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#C8E6C9]';
    } else {
      pill.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span class="font-bold text-xs text-amber-800 whitespace-nowrap">Modo Campo (Sin Señal)</span>
      `;
      pill.className = 'network-status-indicator flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300';
    }
  });
}

function initRouting() {
  applyRoleNavigationUI();
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const defaultScreen = AppState.role === 'tomero' ? 'modo-tomero' : 'mi-riego';
  const rawHash = window.location.hash.replace('#', '') || defaultScreen;
  navigateTo(rawHash);
}

// Separación estricta de vistas según rol (RBAC Etapa 1: Productor vs Tomero)
const ALLOWED_SCREENS_BY_ROLE = {
  productor: ['mi-riego', 'tramites', 'reportar', 'rut', 'calendario', 'esquema-hijuela', 'whatsapp'],
  tomero: ['modo-tomero', 'esquema-hijuela']
};

function applyRoleNavigationUI() {
  const navProductor = document.getElementById('nav-productor');
  const navTomero = document.getElementById('nav-tomero');
  if (AppState.role === 'tomero') {
    if (navProductor) navProductor.classList.add('hidden');
    if (navTomero) navTomero.classList.remove('hidden');
  } else {
    if (navProductor) navProductor.classList.remove('hidden');
    if (navTomero) navTomero.classList.add('hidden');
  }
}

function navigateTo(screenId) {
  triggerHaptic('light');

  // Validar permisos de rol (RBAC)
  const allowed = ALLOWED_SCREENS_BY_ROLE[AppState.role] || ALLOWED_SCREENS_BY_ROLE.productor;
  if (!allowed.includes(screenId)) {
    const fallbackScreen = AppState.role === 'tomero' ? 'modo-tomero' : 'mi-riego';
    if (window.location.hash !== `#${fallbackScreen}`) {
      window.location.hash = fallbackScreen;
      return;
    }
    screenId = fallbackScreen;
  }

  AppState.currentScreen = screenId;
  applyRoleNavigationUI();

  document.querySelectorAll('.app-screen').forEach(el => {
    el.classList.add('hidden');
  });

  const target = document.getElementById(`screen-${screenId}`);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });
  } else {
    const fallback = document.getElementById(AppState.role === 'tomero' ? 'screen-modo-tomero' : 'screen-mi-riego');
    if (fallback) fallback.classList.remove('hidden');
  }

  updateBottomNavActive(screenId);
  renderScreenDynamicData(screenId);
}

function updateBottomNavActive(screenId) {
  document.querySelectorAll('.bottom-nav-link').forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    const icon = link.querySelector('.material-symbols-outlined');
    const isProductorSubroute = AppState.role === 'productor' && (
      (screenId === 'reportar' && href === 'mi-riego') ||
      (screenId === 'rut' && href === 'tramites') ||
      (screenId === 'calendario' && href === 'mi-riego') ||
      (screenId === 'esquema-hijuela' && href === 'mi-riego')
    );

    if (href === screenId || isProductorSubroute) {
      link.classList.remove('bg-white', 'text-gray-800', 'border-gray-300');
      link.classList.add('bg-[#1B5E20]', 'text-white');
      if (icon) icon.style.fontVariationSettings = "'FILL' 1";
    } else {
      link.classList.remove('bg-[#1B5E20]', 'text-white');
      link.classList.add('bg-white', 'text-gray-800', 'border-gray-300');
      if (icon) icon.style.fontVariationSettings = "'FILL' 0";
    }
  });
}

function toggleRole() {
  triggerHaptic('light');
  AppState.role = AppState.role === 'productor' ? 'tomero' : 'productor';
  localStorage.setItem('agro_role', AppState.role);
  renderRoleBadge();
  applyRoleNavigationUI();

  if (AppState.role === 'tomero') {
    showToast('👷 Modo Tomero #884 activado: Solo vistas operativas de cauce.');
    window.location.hash = 'modo-tomero';
  } else {
    showToast('👨‍🌾 Modo Productor (Don Alberto) activado: Vistas de Mi Riego y Trámites.');
    window.location.hash = 'mi-riego';
  }
}

function renderRoleBadge() {
  const badges = document.querySelectorAll('.role-switcher-badge');
  badges.forEach(badge => {
    if (AppState.role === 'productor') {
      badge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-[#2E7D32]"></span>
        <span class="font-bold text-xs text-[#2E7D32] whitespace-nowrap">Don Alberto ▾</span>
      `;
      badge.title = 'Rol actual: Productor. Toque para cambiar a Modo Tomero.';
    } else {
      badge.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
        <span class="font-bold text-xs text-blue-800 whitespace-nowrap">Tomero #884 ▾</span>
      `;
      badge.title = 'Rol actual: Tomero Operador. Toque para cambiar a Don Alberto.';
    }
  });
}

function renderScreenDynamicData(screenId) {
  if (screenId === 'rut') {
    renderRutScreen();
  } else if (screenId === 'modo-tomero') {
    renderTomeroScreen();
  } else if (screenId === 'mi-riego') {
    renderMiRiegoScreen();
  } else if (screenId === 'calendario') {
    renderCalendarioScreen();
  } else if (screenId === 'esquema-hijuela') {
    renderEsquemaHijuela();
  }
}

function renderMiRiegoScreen() {
  const incidentBanner = document.getElementById('mi-riego-active-incident');
  if (incidentBanner) {
    if (AppState.incidentesGuardados.length > 0) {
      const last = AppState.incidentesGuardados[AppState.incidentesGuardados.length - 1];
      const audioBadge = last.tieneAudio ? `
        <div class="mt-2 pt-2 border-t border-amber-200 flex items-center justify-between">
          <span class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <span class="material-symbols-outlined text-[18px] text-[#B91C1C]">mic</span>
            Nota de voz adjunta (${last.duracionAudio || '0:14'})
          </span>
          <button onclick="playRecordedAudio()" type="button" class="px-2.5 py-1 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-950 flex items-center gap-1 shadow-2xs">
            <span class="material-symbols-outlined text-[16px]">play_arrow</span> Escuchar
          </button>
        </div>
      ` : '';

      incidentBanner.innerHTML = `
        <div class="bg-amber-50 border-2 border-amber-500 rounded-xl p-3 flex flex-col gap-1 shadow-sm">
          <div class="flex items-start gap-2.5">
            <span class="material-symbols-outlined text-amber-700 text-[24px] shrink-0 mt-0.5">warning</span>
            <div class="flex-1">
              <p class="font-bold text-xs text-amber-900 uppercase">Aviso registrado (${last.fecha})</p>
              <p class="font-bold text-sm text-amber-950">${last.motivoTexto}</p>
              <p class="text-xs text-amber-800 mt-0.5">Guardia de Cauce notificada • Tomero Carlos Gómez al tanto.</p>
            </div>
          </div>
          ${audioBadge}
        </div>
      `;
      incidentBanner.classList.remove('hidden');
    } else {
      incidentBanner.classList.add('hidden');
    }
  }
}

function renderRutScreen() {
  const rutStatusBadge = document.getElementById('rut-status-badge');
  const rutConfirmBtn = document.getElementById('btn-confirmar-rut');
  const rutModifyBtn = document.getElementById('btn-modificar-rut');
  const rutSuccessBox = document.getElementById('rut-success-box');

  const resumenCultivo = document.getElementById('rut-resumen-cultivo');
  const resumenRiego = document.getElementById('rut-resumen-riego');
  const resumenMalla = document.getElementById('rut-resumen-malla');

  const cultivoActual = AppState.rutData.cultivo || 'Vid Malbec';
  const mallaActual = AppState.rutData.malla || 'Malla en Cuartel 1 (2.5 ha)';
  const riegoActual = AppState.rutData.riego || 'Superficial Definitivo';

  if (resumenCultivo) {
    resumenCultivo.textContent = `4.5 ha Totales • 4.0 ha ${cultivoActual}`;
  }
  if (resumenRiego) {
    resumenRiego.textContent = riegoActual;
  }
  if (resumenMalla) {
    resumenMalla.textContent = mallaActual;
  }

  // Actualizar descripciones en el modal de detalle de parcela y certificado
  const c1Desc = document.getElementById('detalle-cuartel-1-desc');
  if (c1Desc) {
    c1Desc.textContent = `Producción declarada: ${cultivoActual} • Protección: ${mallaActual} • Riego: ${riegoActual}.`;
  }
  const certCultivo = document.getElementById('cert-rut-cultivo');
  const certMalla = document.getElementById('cert-rut-malla');
  const certFecha = document.getElementById('cert-rut-fecha');
  if (certCultivo) certCultivo.textContent = `4.5 ha Totales • 4.0 ha ${cultivoActual}`;
  if (certMalla) certMalla.textContent = `${mallaActual} (${riegoActual})`;
  if (certFecha) certFecha.textContent = AppState.rutData.fechaFirma || new Date().toLocaleString('es-AR');

  if (AppState.rutStatus === 'firmado') {
    if (rutStatusBadge) {
      rutStatusBadge.innerHTML = `
        <span class="material-symbols-outlined text-[14px] fill-icon">verified</span>
        <span>RUT 2026 Vigente</span>
      `;
      rutStatusBadge.className = 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9] px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shrink-0';
    }
    if (rutConfirmBtn) rutConfirmBtn.classList.add('hidden');
    if (rutModifyBtn) {
      rutModifyBtn.innerHTML = `
        <span class="material-symbols-outlined text-[20px] text-[#1B5E20] shrink-0">edit_note</span>
        <span>Rectificar datos de cuarteles</span>
      `;
    }
    if (rutSuccessBox) {
      rutSuccessBox.innerHTML = `
        <div class="bg-[#E8F5E9] border-2 border-[#1B5E20] rounded-xl p-3 flex flex-col gap-2.5">
          <div class="flex items-start gap-2.5">
            <span class="material-symbols-outlined text-[#1B5E20] text-[26px] shrink-0 fill-icon mt-0.5">check_circle</span>
            <div class="min-w-0">
              <p class="font-extrabold text-sm text-[#1B5E20]">Declaración Jurada RUT 2026 Firmada</p>
              <p class="text-xs text-gray-800 leading-snug">Constancia Nº 2026-RUT-042819 • Firma Electrónica/Digital Ley 25.506 (${AppState.rutData.fechaFirma || 'Recién validada'}).</p>
            </div>
          </div>
          <button onclick="openConstanciaRUTModal()" type="button" class="w-full min-h-[44px] bg-[#1B5E20] text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer">
            <span class="material-symbols-outlined text-[18px]">badge</span>
            <span>Ver / Descargar Cédula Digital RUT 2026</span>
          </button>
        </div>
      `;
      rutSuccessBox.classList.remove('hidden');
    }
  } else {
    if (rutStatusBadge) {
      rutStatusBadge.innerHTML = `
        <span class="material-symbols-outlined text-[14px]">schedule</span>
        <span>Pendiente Campaña 2026</span>
      `;
      rutStatusBadge.className = 'bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shrink-0';
    }
    if (rutConfirmBtn) rutConfirmBtn.classList.remove('hidden');
    if (rutSuccessBox) rutSuccessBox.classList.add('hidden');
  }
}

function confirmarRUT() {
  triggerHaptic('success');
  AppState.rutStatus = 'firmado';
  AppState.rutData.fechaFirma = new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  localStorage.setItem('agro_rut_status', 'firmado');
  localStorage.setItem('agro_rut_data', JSON.stringify(AppState.rutData));

  // Agregar a la cola de sincronización
  AppState.syncQueue.push({
    id: `sync-rut-${Date.now()}`,
    tipo: 'Declaración RUT (SIA/ATM/DGI)',
    icono: 'verified',
    titulo: 'Renovación RUT 2026 Firmada (Once-Only)',
    descripcion: `Parcela 12B (4.5 ha • ${AppState.rutData.cultivo || 'Vid Malbec'}) • Padrón DGI #4022`,
    fecha: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    estado: 'Pendiente de sincronizar'
  });
  localStorage.setItem('agro_sync_queue', JSON.stringify(AppState.syncQueue));
  renderSyncTrayBadge();

  renderRutScreen();
  showToast('✓ Declaración Jurada RUT 2026 firmada. Cédula Digital habilitada.');
}

function openDetalleParcelaRUT() {
  triggerHaptic('light');
  renderRutScreen();
  const modal = document.getElementById('modal-detalle-parcela-rut');
  if (modal) modal.classList.remove('hidden');
}

function closeDetalleParcelaRUT() {
  triggerHaptic('light');
  const modal = document.getElementById('modal-detalle-parcela-rut');
  if (modal) modal.classList.add('hidden');
}

function openModificarRUTModal() {
  triggerHaptic('light');
  const selCultivo = document.getElementById('select-rut-cultivo');
  const selMalla = document.getElementById('select-rut-malla');
  const selRiego = document.getElementById('select-rut-riego');

  if (selCultivo && AppState.rutData.cultivo) selCultivo.value = AppState.rutData.cultivo;
  if (selMalla && AppState.rutData.malla) selMalla.value = AppState.rutData.malla;
  if (selRiego && AppState.rutData.riego) selRiego.value = AppState.rutData.riego;

  const modal = document.getElementById('modal-modificar-rut');
  if (modal) modal.classList.remove('hidden');
}

function closeModificarRUTModal() {
  triggerHaptic('light');
  const modal = document.getElementById('modal-modificar-rut');
  if (modal) modal.classList.add('hidden');
}

function guardarCambiosRUT() {
  triggerHaptic('medium');
  const selCultivo = document.getElementById('select-rut-cultivo');
  const selMalla = document.getElementById('select-rut-malla');
  const selRiego = document.getElementById('select-rut-riego');

  if (selCultivo) AppState.rutData.cultivo = selCultivo.value;
  if (selMalla) AppState.rutData.malla = selMalla.value;
  if (selRiego) AppState.rutData.riego = selRiego.value;

  // Si ya estaba firmado, vuelve a pendiente de firma para confirmar la rectificación
  AppState.rutStatus = 'pendiente';
  localStorage.setItem('agro_rut_status', 'pendiente');
  localStorage.setItem('agro_rut_data', JSON.stringify(AppState.rutData));

  closeModificarRUTModal();
  renderRutScreen();
  showToast('✓ Datos de cuarteles actualizados. Presione "CONFIRMAR Y FIRMAR" para validar la declaración.');
}

function openConstanciaRUTModal() {
  triggerHaptic('light');
  renderRutScreen();
  const modal = document.getElementById('modal-constancia-rut');
  if (modal) modal.classList.remove('hidden');
}

function closeConstanciaRUTModal() {
  triggerHaptic('light');
  const modal = document.getElementById('modal-constancia-rut');
  if (modal) modal.classList.add('hidden');
}

function descargarPDFConstanciaRUT() {
  triggerHaptic('success');
  closeConstanciaRUTModal();
  showToast('✓ Cédula RUT 2026 (Constancia Nº 2026-RUT-042819.pdf) guardada en el teléfono para uso sin señal.');
}

function renderTomeroScreen() {
  const currentTurn = AppState.turnosTomero[AppState.tomeroTurnoIndex];
  const turnoNumberEl = document.getElementById('tomero-turno-num');
  const turnoTotalEl = document.getElementById('tomero-turno-total');
  const titularEl = document.getElementById('tomero-finca-titular');
  const fincaNombreEl = document.getElementById('tomero-finca-nombre');
  const horarioEl = document.getElementById('tomero-finca-horario');
  const padronEl = document.getElementById('tomero-finca-padron');
  const compuertaEl = document.getElementById('tomero-finca-compuerta');

  if (currentTurn) {
    if (turnoNumberEl) turnoNumberEl.textContent = `TURNO ACTUAL (${currentTurn.num} DE ${AppState.turnosTomero.length})`;
    if (turnoTotalEl) turnoTotalEl.textContent = `Turno #${currentTurn.num} de ${AppState.turnosTomero.length}`;
    if (titularEl) titularEl.textContent = currentTurn.titular;
    if (fincaNombreEl) fincaNombreEl.textContent = currentTurn.finca;
    if (horarioEl) horarioEl.textContent = currentTurn.horario;
    if (padronEl) padronEl.textContent = `Padrón ${currentTurn.padron} • 3 horas de dotación`;
    if (compuertaEl) compuertaEl.textContent = currentTurn.compuerta;
  }
}

function marcarAguaEntregada() {
  triggerHaptic('success');
  const currentTurn = AppState.turnosTomero[AppState.tomeroTurnoIndex];
  if (currentTurn) {
    currentTurn.estado = 'Entregado';
    currentTurn.fechaRegistro = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    AppState.syncQueue.push({
      id: `sync-turn-${Date.now()}`,
      tipo: 'Turno Entregado',
      icono: 'check_circle',
      titulo: `Turno ${currentTurn.num}: ${currentTurn.finca}`,
      descripcion: `Agua entregada a ${currentTurn.titular} (${currentTurn.horario})`,
      fecha: 'Hoy, ' + currentTurn.fechaRegistro,
      estado: 'Pendiente de sincronizar'
    });
    localStorage.setItem('agro_sync_queue', JSON.stringify(AppState.syncQueue));
    renderSyncTrayBadge();
  }

  if (AppState.tomeroTurnoIndex < AppState.turnosTomero.length - 1) {
    AppState.tomeroTurnoIndex++;
    localStorage.setItem('agro_tomero_turno_idx', AppState.tomeroTurnoIndex.toString());
  }

  showToast('✓ AGUA ENTREGADA: Registrado en memoria local.');
  renderTomeroScreen();
}

function marcarNoRecibio() {
  triggerHaptic('warning');
  const currentTurn = AppState.turnosTomero[AppState.tomeroTurnoIndex];
  if (currentTurn) {
    currentTurn.estado = 'No Recibió / Ausente';
    currentTurn.fechaRegistro = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    AppState.syncQueue.push({
      id: `sync-turn-absent-${Date.now()}`,
      tipo: 'Novedad Tomero',
      icono: 'cancel',
      titulo: `Turno ${currentTurn.num}: ${currentTurn.finca}`,
      descripcion: `Ausente / Compuerta cerrada (${currentTurn.horario})`,
      fecha: 'Hoy, ' + currentTurn.fechaRegistro,
      estado: 'Pendiente de sincronizar'
    });
    localStorage.setItem('agro_sync_queue', JSON.stringify(AppState.syncQueue));
    renderSyncTrayBadge();
  }

  if (AppState.tomeroTurnoIndex < AppState.turnosTomero.length - 1) {
    AppState.tomeroTurnoIndex++;
    localStorage.setItem('agro_tomero_turno_idx', AppState.tomeroTurnoIndex.toString());
  }

  showToast('⚠️ NOVEDAD REGISTRADA: Productor ausente o compuerta cerrada.');
  renderTomeroScreen();
}

// Simulación 1 toque: "Reportar rotura en canal" desde Modo Tomero
function simularReporteRoturaTomero() {
  triggerHaptic('warning');
  const horaActual = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  AppState.syncQueue.push({
    id: `sync-rotura-tomero-${Date.now()}`,
    tipo: 'Rotura en Canal (Tomero)',
    icono: 'report_problem',
    titulo: 'Rotura en Hijuela San Martín (KM 1.9)',
    descripcion: 'Simulación con GPS (-33.5821, -69.0145) y foto adjunta • Reprogramar turnos aguas abajo',
    fecha: 'Hoy, ' + horaActual,
    estado: 'Pendiente de sincronizar'
  });
  localStorage.setItem('agro_sync_queue', JSON.stringify(AppState.syncQueue));
  renderSyncTrayBadge();

  const simBox = document.getElementById('tomero-rotura-simulada-box');
  if (simBox) {
    simBox.innerHTML = `
      <div class="flex items-start gap-2.5">
        <span class="material-symbols-outlined text-[24px] text-[#B91C1C] shrink-0 mt-0.5 fill-icon">warning</span>
        <div class="flex-1">
          <p class="font-black text-xs uppercase text-[#B91C1C]">Alerta de Rotura Simulada (${horaActual} hs)</p>
          <p class="font-extrabold text-sm text-[#111827] mt-0.5">Hijuela San Martín • KM 1.9 (Con foto y GPS)</p>
          <p class="text-xs text-gray-800 mt-0.5 leading-snug">Guardado en Bandeja Offline. Al recuperar señal, Irrigación reprogramará los turnos aguas abajo y avisará por WhatsApp a los regantes.</p>
        </div>
      </div>
    `;
    simBox.classList.remove('hidden');
  }

  showToast('🚨 Simulación: Rotura en canal registrada en Bandeja Offline para reprogramar turnos.');
}

// Simulador de Bot de WhatsApp (Etapa 1: responde únicamente "¿Cuándo me toca el agua?")
function enviarConsultaWhatsApp() {
  triggerHaptic('light');
  const chatBox = document.getElementById('whatsapp-chat-box');
  if (!chatBox) return;

  const horaActual = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  // Mensaje enviado por Don Alberto
  const userMsg = document.createElement('div');
  userMsg.className = 'bg-[#DCF8C6] border border-[#A5D6A7] rounded-2xl rounded-tr-none p-3.5 shadow-2xs max-w-[85%] self-end';
  userMsg.innerHTML = `
    <p class="text-sm font-black text-[#111827]">¿Cuándo me toca el agua?</p>
    <p class="text-[10px] text-gray-600 text-right mt-1 flex items-center justify-end gap-1">${horaActual} hs • ✓✓</p>
  `;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Respuesta automática del Bot de AgroMendoza / DGI
  setTimeout(() => {
    triggerHaptic('success');
    const botMsg = document.createElement('div');
    botMsg.className = 'bg-white border border-gray-300 rounded-2xl rounded-tl-none p-3.5 shadow-2xs max-w-[92%] self-start';
    botMsg.innerHTML = `
      <p class="text-xs font-black text-[#075E54] uppercase mb-1">AgroMendoza • Bot Irrigación</p>
      <p class="text-sm text-[#111827] font-bold leading-snug">
        💧 <strong>Turno Confirmado (Padrón #4022):</strong>
      </p>
      <div class="mt-2 bg-[#F0FDF4] border border-[#C8E6C9] rounded-xl p-2.5 text-xs text-[#111827] space-y-1">
        <p>• <strong>Día y Hora:</strong> Mañana Domingo de <strong>09:00 a 12:30 hs</strong></p>
        <p>• <strong>Duración:</strong> 3 horas 30 minutos</p>
        <p>• <strong>Caudal estimado:</strong> 120 L/s (Dotación completa)</p>
        <p>• <strong>Ubicación:</strong> Hijuela San Martín - Compuerta 4</p>
        <p>• <strong>Tomero a cargo:</strong> Carlos Gómez</p>
      </div>
      <p class="text-xs text-gray-700 mt-2 leading-snug">
        ✅ Estado del cauce: <strong>Agua confirmada en toma</strong>.
      </p>
      <p class="text-[10px] text-gray-500 text-right mt-1">${horaActual} hs</p>
    `;
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 450);
}

function setupEventListeners() {
  const reportForm = document.getElementById('water-report-form');
  if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const selectedRadio = reportForm.querySelector('input[name="incident_type"]:checked');
      if (!selectedRadio) {
        showToast('Por favor, elija qué ocurrió en su hijuela.');
        return;
      }

      let motivoTexto = 'Problema de agua informado';
      if (selectedRadio.value === 'sin_agua') motivoTexto = 'No llegó el agua a la compuerta';
      if (selectedRadio.value === 'canal_roto') motivoTexto = 'Canal roto o desbordado';
      if (selectedRadio.value === 'corte_anticipado') motivoTexto = 'Cortaron el agua antes de hora';

      const photoInput = document.getElementById('photo-input');
      const hasPhoto = photoInput && photoInput.files && photoInput.files.length > 0;
      const hasAudio = AppState.currentAudioUrl !== null;
      const audioDurationSecs = Math.max(1, AppState.currentAudioDuration || 14);
      const mins = Math.floor(audioDurationSecs / 60);
      const secs = (audioDurationSecs % 60).toString().padStart(2, '0');

      const nuevoIncidente = {
        id: Date.now(),
        motivo: selectedRadio.value,
        motivoTexto,
        tieneFoto: hasPhoto,
        tieneAudio: hasAudio,
        duracionAudio: hasAudio ? `${mins}:${secs}` : null,
        fecha: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        estado: 'Guardado local (Pendiente de sinc)'
      };

      AppState.incidentesGuardados.push(nuevoIncidente);
      localStorage.setItem('agro_incidentes', JSON.stringify(AppState.incidentesGuardados));

      // Agregar a la bandeja de sincronización
      AppState.syncQueue.push({
        id: `sync-inc-${Date.now()}`,
        tipo: 'Aviso al Tomero',
        icono: 'warning',
        titulo: motivoTexto,
        descripcion: `Hijuela San Martín${hasAudio ? ` • Audio (${mins}:${secs})` : ''}${hasPhoto ? ' • Con foto' : ''}`,
        fecha: 'Hoy, ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        estado: 'Pendiente de sincronizar'
      });
      localStorage.setItem('agro_sync_queue', JSON.stringify(AppState.syncQueue));
      renderSyncTrayBadge();

      triggerHaptic('success');
      showToast('✓ Aviso guardado en el teléfono. Se notificará a la guardia del tomero.');

      setTimeout(() => {
        window.location.hash = 'mi-riego';
      }, 1200);
    });
  }

  const photoInput = document.getElementById('photo-input');
  const photoBtn = document.getElementById('camera-btn');
  const photoConfirmation = document.getElementById('photo-confirmation');

  if (photoBtn && photoInput) {
    photoBtn.addEventListener('click', () => {
      photoInput.click();
    });

    photoInput.addEventListener('change', () => {
      if (photoInput.files && photoInput.files.length > 0) {
        const file = photoInput.files[0];
        triggerHaptic('light');
        if (photoConfirmation) {
          photoConfirmation.classList.remove('hidden');
          photoConfirmation.textContent = `✓ 1 foto adjunta: ${file.name} (${Math.round(file.size / 1024)} KB)`;
        }
      }
    });
  }
}

function showToast(message) {
  const existing = document.getElementById('agro-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'agro-toast';
  toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[440px] bg-[#111827] text-white font-bold text-sm px-4 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 border-2 border-white/20';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[24px] text-[#A5D6A7]">info</span>
    <span class="flex-1 leading-snug">${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

function showDetallesDotacion() {
  triggerHaptic('light');
  const modal = document.getElementById('modal-detalles-dotacion');
  if (modal) modal.classList.remove('hidden');
}

function hideDetallesDotacion() {
  triggerHaptic('light');
  const modal = document.getElementById('modal-detalles-dotacion');
  if (modal) modal.classList.add('hidden');
}

function showTomeroListaTurnos() {
  triggerHaptic('light');
  const modal = document.getElementById('modal-lista-turnos');
  if (modal) {
    const listContainer = document.getElementById('modal-turnos-list');
    if (listContainer) {
      listContainer.innerHTML = AppState.turnosTomero.map((t, idx) => `
        <div class="p-3 rounded-xl border ${idx === AppState.tomeroTurnoIndex ? 'border-2 border-[#1B5E20] bg-[#E8F5E9]' : 'border-gray-200 bg-white'} flex justify-between items-center">
          <div>
            <p class="font-bold text-sm text-[#111827]">${t.num}. ${t.finca} (${t.titular})</p>
            <p class="text-xs text-gray-600">${t.horario} • ${t.compuerta}</p>
          </div>
          <span class="text-xs font-bold px-2 py-1 rounded-full ${t.estado === 'Entregado' ? 'bg-green-100 text-green-800' : (idx === AppState.tomeroTurnoIndex ? 'bg-[#1B5E20] text-white' : 'bg-gray-100 text-gray-700')}">
            ${t.estado}
          </span>
        </div>
      `).join('');
    }
    modal.classList.remove('hidden');
  }
}

function hideTomeroListaTurnos() {
  triggerHaptic('light');
  const modal = document.getElementById('modal-lista-turnos');
  if (modal) modal.classList.add('hidden');
}

function syncOfflineQueue() {
  if (AppState.syncQueue.length > 0) {
    showToast('📶 Señal de campo detectada. Sincronizando datos automáticamente...');
    setTimeout(() => {
      AppState.syncQueue = [];
      localStorage.setItem('agro_sync_queue', JSON.stringify([]));
      renderSyncTrayBadge();
    }, 2000);
  }
}

function updateOfflineBanners() {
  updateNetworkStatusUI();
}
