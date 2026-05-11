
const BASE_URL = "https://inscripciones.lidera.cacicus.ec";
//const BASE_URL = "http://localhost:3000";
const PER_PAGE = 15;
let TOKEN = '';
let datosActuales = [];
let paginaActual = 1;



function togglePassword(btn) {
    const input = document.getElementById('inputPassword');
    const abierto = input.type === 'text';
    input.type = abierto ? 'password' : 'text';
    btn.querySelector('svg').innerHTML = abierto
        ? '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'
        : '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
}

// ══════════════════════════════════════
// 🔐 AUTENTICACIÓN
// ══════════════════════════════════════
async function hacerLogin() {
    const usuario = document.getElementById('inputUsuario').value.trim();
    const password = document.getElementById('inputPassword').value;
    const btnLogin = document.getElementById('btnLogin');
    const errBox = document.getElementById('loginError');

    if (!usuario || !password) {
        mostrarErrorLogin('Ingresa tu usuario y contraseña');
        return;
    }

    btnLogin.disabled = true;
    btnLogin.textContent = 'Verificando...';
    errBox.style.display = 'none';

    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Credenciales incorrectas');

        TOKEN = data.token;
        sessionStorage.setItem('admin_token', TOKEN);
        sessionStorage.setItem('admin_nombre', data.admin?.nombre || data.admin?.usuario || 'Admin');

        mostrarReporte(data.admin?.nombre || data.admin?.usuario);

    } catch (err) {
        mostrarErrorLogin(err.message || 'No se pudo conectar al servidor');
        btnLogin.disabled = false;
        btnLogin.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Ingresar`;
    }
}

function mostrarErrorLogin(msg) {
    const errBox = document.getElementById('loginError');
    errBox.textContent = '❌ ' + msg;
    errBox.style.display = 'block';
}

function mostrarReporte(nombre) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('reporteScreen').style.display = 'block';
    document.getElementById('adminNombre').textContent = nombre || 'Admin';
    cargarReporte();
}

function cerrarSesion() {
    TOKEN = '';
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_nombre');
    datosActuales = [];
    document.getElementById('reporteScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('inputUsuario').value = '';
    document.getElementById('inputPassword').value = '';
    document.getElementById('loginError').style.display = 'none';

    // limpiar imputs y errores, reactivar botón
    const btn = document.getElementById('btnLogin');
    btn.disabled = false;
    btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Ingresar`;
}

// Header con token
function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` };
}

// ══════════════════════════════════════
// 📦 CARGAR DATOS
// ══════════════════════════════════════
async function cargarReporte() {
    mostrarCargando();
    try {
        const res = await fetch(`${BASE_URL}/inscripciones/reporte`, { headers: authHeaders() });
        if (res.status === 401) { cerrarSesion(); return; }
        const data = await res.json();
        datosActuales = data.personas || [];
        calcularStats(datosActuales);
        setHeaderCompleto();
        paginaActual = 1;
        renderTabla();
        actualizarCharts
    } catch (err) {
        mostrarError('No se pudo conectar al servidor.');
    }
}

async function verTodos() {
    document.getElementById('inputBusqueda').value = '';
    await cargarReporte();
}

//buscar por provincia
async function buscar() {
    const termino = document.getElementById('inputBusqueda').value.trim();

    if (!termino) {
        await cargarReporte();
        return;
    }

    mostrarCargando();

    try {
        const res = await fetch(
            `${BASE_URL}/inscripciones/reporte/provincia/${encodeURIComponent(termino)}`,
            { headers: authHeaders() }
        );

        if (res.status === 401) {
            cerrarSesion();
            return;
        }

        const data = await res.json();

        datosActuales = data.personas || [];

        calcularStats(datosActuales);
        setHeaderCompleto();

        paginaActual = 1;
        renderTabla();
        actualizarCharts(datosActuales);

    } catch (err) {
        console.error(err);
        mostrarError('Error al buscar.');
    }
}

// ══════════════════════════════════════
// 📊 STATS
// ══════════════════════════════════════
function calcularStats(datos) {
    document.getElementById('statTotal').textContent = datos.length;

    const conDisc = datos.filter(r => {
        const v = r.discapacidad;
        return v === true || v === 'true' || v === 1 || v === '1' || v === 'Sí' || v === 'si' || v === 'Si';
    }).length;
    document.getElementById('statDisc').textContent = conDisc;

    document.getElementById('statFem').textContent = datos.filter(r =>
        ['femenino', 'mujer', 'femenil'].includes((r.genero || '').toLowerCase())).length;
    document.getElementById('statMasc').textContent = datos.filter(r =>
        ['masculino', 'hombre', 'varonil'].includes((r.genero || '').toLowerCase())).length;
}

// ══════════════════════════════════════
// 🖥 RENDER TABLA COMPLETA
// ══════════════════════════════════════
function esSi(v) {
    return v === true || v === 'true' || v === 1 || v === '1' || v === 'Sí' || v === 'Si' || v === 'si';
}

function renderTabla() {
    const tbody = document.getElementById('tbody');
    if (!datosActuales.length) {
        tbody.innerHTML = `<tr><td colspan="18" class="state-msg">No hay resultados.</td></tr>`;
        document.getElementById('countInfo').textContent = 'Sin resultados';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    const total = datosActuales.length;
    const pages = Math.ceil(total / PER_PAGE);
    if (paginaActual > pages) paginaActual = pages;
    const start = (paginaActual - 1) * PER_PAGE;
    const slice = datosActuales.slice(start, start + PER_PAGE);

    tbody.innerHTML = slice.map((p, i) => `
        <tr onclick="verDetalle(${start + i})">
          <td>${p.cedula || 'N/A'}</td>
          <td>${p.nombres || 'N/A'}</td>
          <td>${p.apellidos || 'N/A'}</td>
          <td>${p.correo || 'N/A'}</td>
          <td>${p.celular || 'N/A'}</td>
          <td>${p.fechaNacimiento ? new Date(p.fechaNacimiento).toLocaleDateString('es-EC') : 'N/A'}</td>
          <td>${p.ocupacion || 'N/A'}</td>
          <td>${p.institucion || 'N/A'}</td>
          <td>${p.provincia || 'N/A'}</td>
          <td>${p.canton || 'N/A'}</td>
          <td>${p.parroquia || 'N/A'}</td>
          <td>${p.barrio || 'N/A'}</td>
          <td>${p.genero || 'N/A'}</td>
          <td>${p.orientacionSexual || 'N/A'}</td>
          <td>${p.nacionalidad || 'N/A'}</td>
          <td>${p.autoidentificacion || 'N/A'}</td>
          <td><span class="badge ${esSi(p.discapacidad) ? 'badge-yes' : 'badge-no'}">${esSi(p.discapacidad) ? 'Sí' : 'No'}</span></td>
          <td>${p.tipoDiscapacidad || '—'}</td>
          <td>${p.nivelEducacion || 'N/A'}</td>
        </tr>`).join('');

    document.getElementById('countInfo').textContent =
        `Mostrando ${start + 1}–${Math.min(start + PER_PAGE, total)} de ${total} registros`;
    renderPaginacion(pages);
}

// ══════════════════════════════════════
// 🖥 RENDER TABLA BÚSQUEDA (reducida)
// ══════════════════════════════════════
function renderTablaBusqueda() {
    const tbody = document.getElementById('tbody');
    if (!datosActuales.length) {
        tbody.innerHTML = `<tr><td colspan="3" class="state-msg">No hay resultados para esa búsqueda.</td></tr>`;
        document.getElementById('countInfo').textContent = 'Sin resultados';
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    const total = datosActuales.length;
    const pages = Math.ceil(total / PER_PAGE);
    if (paginaActual > pages) paginaActual = pages;
    const start = (paginaActual - 1) * PER_PAGE;
    const slice = datosActuales.slice(start, start + PER_PAGE);

    tbody.innerHTML = slice.map((p, i) => `
        <tr onclick="verDetalle(${start + i})">
          <td>${p.cedula || 'N/A'}</td>
          <td>${p.nombres || 'N/A'}</td>
          <td>${p.apellidos || 'N/A'}</td>
          <td>${p.correo || 'N/A'}</td>
          <td>${p.celular || 'N/A'}</td>
          <td>${p.fechaNacimiento ? new Date(p.fechaNacimiento).toLocaleDateString('es-EC') : 'N/A'}</td>
          <td>${p.ocupacion || 'N/A'}</td>
          <td>${p.institucion || 'N/A'}</td>
          <td>${p.provincia || 'N/A'}</td>
          <td>${p.canton || 'N/A'}</td>
          <td>${p.parroquia || 'N/A'}</td>
          <td>${p.barrio || 'N/A'}</td>
          <td>${p.genero || 'N/A'}</td>
          <td>${p.orientacionSexual || 'N/A'}</td>
          <td>${p.nacionalidad || 'N/A'}</td>
          <td>${p.autoidentificacion || 'N/A'}</td>
          <td><span class="badge ${esSi(p.discapacidad) ? 'badge-yes' : 'badge-no'}">${esSi(p.discapacidad) ? 'Sí' : 'No'}</span></td>
          <td>${p.tipoDiscapacidad || '—'}</td>
          <td>${p.nivelEducacion || 'N/A'}</td>
        </tr>`).join('');

    document.getElementById('countInfo').textContent =
        `Mostrando ${start + 1}–${Math.min(start + PER_PAGE, total)} de ${total} registros`;
    renderPaginacion(pages);
}

// ══════════════════════════════════════
// PAGINACIÓN
// ══════════════════════════════════════
function renderPaginacion(pages) {
    const pag = document.getElementById('pagination');
    if (pages <= 1) { pag.innerHTML = ''; return; }
    let html = `<button class="page-btn" onclick="irPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>‹</button>`;
    for (let i = 1; i <= pages; i++) {
        if (pages > 7 && Math.abs(i - paginaActual) > 2 && i !== 1 && i !== pages) {
            if (i === 2 || i === pages - 1) html += `<button class="page-btn" disabled style="border:none;background:none;opacity:0.4">…</button>`;
            continue;
        }
        html += `<button class="page-btn ${i === paginaActual ? 'active' : ''}" onclick="irPagina(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" onclick="irPagina(${paginaActual + 1})" ${paginaActual === pages ? 'disabled' : ''}>›</button>`;
    pag.innerHTML = html;
}

function irPagina(n) {
    const pages = Math.ceil(datosActuales.length / PER_PAGE);
    if (n < 1 || n > pages) return;
    paginaActual = n;
    // detectar si estamos en modo búsqueda (header reducido)
    const ths = document.querySelectorAll('#thead th');
    if (ths.length <= 3) renderTablaBusqueda();
    else renderTabla();
    document.querySelector('.panel').scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════
// 🔎 MODAL DETALLE
// ══════════════════════════════════════
function verDetalle(idx) {
    const p = datosActuales[idx];
    if (!p) return;
    const campos = [
        ['Cédula', p.cedula],
        ['Nombres', p.nombres],
        ['Apellidos', p.apellidos],
        ['Correo', p.correo],
        ['Celular', p.celular],
        ['Fecha nacimiento', p.fechaNacimiento ? new Date(p.fechaNacimiento).toLocaleDateString('es-EC') : null],
        ['Ocupación', p.ocupacion],
        ['Institución', p.institucion],
        ['Provincia', p.provincia],
        ['Cantón', p.canton],
        ['Parroquia', p.parroquia],
        ['Barrio', p.barrio],
        ['Género', p.genero],
        ['Orientación sexual', p.orientacionSexual],
        ['Nacionalidad', p.nacionalidad],
        ['Autoidentificación', p.autoidentificacion],
        ['Discapacidad', esSi(p.discapacidad) ? 'Sí' : 'No'],
        ['Tipo discapacidad', p.tipoDiscapacidad],
        ['Nivel educación', p.nivelEducacion],
        ['Registrado', p.createdAt ? new Date(p.createdAt).toLocaleString('es-EC') : null],
    ];
    document.getElementById('modalBody').innerHTML = campos.map(([k, v]) => `
        <div class="detail-row">
          <span class="detail-key">${k}</span>
          <span class="detail-val">${v || '—'}</span>
        </div>`).join('');
    document.getElementById('modalOverlay').classList.add('open');
}

function cerrarModal() {
    document.getElementById('modalOverlay').classList.remove('open');
}

//exportar excel solo por provincia
async function exportarPorProvincia() {
    const provinciaInput = document.getElementById('inputBusqueda').value.trim();

    if (!provinciaInput) {
        alert("Escribe una provincia");
        return;
    }

    try {
        const res = await fetch(
            `${BASE_URL}/inscripciones/reporte/provincia/${encodeURIComponent(provinciaInput)}`
        );

        if (!res.ok) {
            throw new Error("Error en la respuesta del servidor");
        }

        const data = await res.json();

        if (!data.personas || data.personas.length === 0) {
            alert("No hay datos para esa provincia");
            return;
        }
        // 🔥 LIMPIAR NOMBRE (muy importante)
        const nombreLimpio = provinciaInput
            .normalize("NFD") // quitar tildes
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
            .toLowerCase();

        const nombreArchivo = `${nombreLimpio}_inscripciones`;

        // 🔥 USAR TU FUNCIÓN PRO
        generarExcel(data.personas, nombreArchivo);

    } catch (error) {
        console.error("Error exportando:", error);
        alert("Error al exportar. Verifica conexión con el backend.");
    }
}



// 📊 EXPORTAR EXCEL (XLSX)
// =======================
function generarExcel(personas, nombreArchivo) {

    if (!personas || !personas.length) {
        alert('No hay datos para exportar');
        return;
    }

    // 🔥 HEADERS DEFINIDOS (ORDEN CONTROLADO)
    const headers = [
        'Cédula', 'Nombres', 'Apellidos', 'Correo', 'Celular', 'Fecha Nacimiento',
        'Ocupación', 'Institución',
        'Provincia', 'Cantón', 'Parroquia', 'Barrio',
        'Género', 'Orientación Sexual', 'Nacionalidad', 'Autoidentificación',
        'Discapacidad', 'Tipo Discapacidad', 'Nivel Educación'
    ];

    // 🔥 FILAS (AOA = Array of Arrays)
    const data = personas.map(p => [
        p.cedula || 'N/A',
        p.nombres || 'N/A',
        p.apellidos || 'N/A',
        p.correo || 'N/A',
        p.celular || 'N/A',
        p.fechaNacimiento
            ? new Date(p.fechaNacimiento).toLocaleDateString('es-EC')
            : 'N/A',

        p.ocupacion || 'N/A',
        p.institucion || 'N/A',

        p.provincia || 'N/A',
        p.canton || 'N/A',
        p.parroquia || 'N/A',
        p.barrio || 'N/A',

        p.genero || 'N/A',
        p.orientacionSexual || 'N/A',
        p.nacionalidad || 'N/A',
        p.autoidentificacion || 'N/A',

        (p.discapacidad === true || p.discapacidad === 'true') ? 'Sí' : 'No',
        p.tipoDiscapacidad || 'N/A',

        p.nivelEducacion || 'N/A',
    ]);

    // 🔥 CREAR HOJA
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // 🔥 AUTO WIDTH (ajuste de columnas)
    const colWidths = headers.map((header, i) => {
        const maxLength = Math.max(
            header.length,
            ...data.map(row => (row[i] ? row[i].toString().length : 0))
        );
        return { wch: maxLength + 2 };
    });

    ws['!cols'] = colWidths;

    // 🔥 CONGELAR HEADER (Excel)
    ws['!freeze'] = { xSplit: 0, ySplit: 1 };

    // 🔥 ESTILOS (limitado pero útil)
    headers.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });

        if (!ws[cellAddress]) return;

        ws[cellAddress].s = {
            font: { bold: true }
        };
    });

    // 🔥 LIBRO
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    // 🔥 NOMBRE ARCHIVO SEGURO
    const nombreFinal = nombreArchivo && nombreArchivo.trim() !== ''
        ? nombreArchivo.replace(/\s+/g, '_').toLowerCase()
        : 'reporte_inscripciones';

    XLSX.writeFile(wb, `${nombreFinal}.xlsx`);
}


// ══════════════════════════════════════
// 🔧 HELPERS
// ══════════════════════════════════════
function setHeaderCompleto() {
    document.getElementById('thead').innerHTML = `<tr>
        <th>Cédula</th><th>Nombres</th><th>Apellidos</th><th>Correo</th>
        <th>Celular</th><th>Fecha Nacimiento</th><th>Ocupación</th><th>Institución</th>
        <th>Provincia</th><th>Cantón</th><th>Parroquia</th><th>Barrio</th>
        <th>Género</th><th>Orient. Sexual</th><th>Nacionalidad</th>
        <th>Autoidentif.</th><th>Discapacidad</th><th>Tipo Discap.</th><th>Nivel Educ.</th>
      </tr>`;
}

function setHeaderBusqueda() {
    document.getElementById('thead').innerHTML = `<tr>
        <th>Cédula</th><th>Nombres</th><th>Apellidos</th><th>Correo</th>
        <th>Celular</th><th>Fecha Nacimiento</th><th>Ocupación</th><th>Institución</th>
        <th>Provincia</th><th>Cantón</th><th>Parroquia</th><th>Barrio</th>
        <th>Género</th><th>Orient. Sexual</th><th>Nacionalidad</th>
        <th>Autoidentif.</th><th>Discapacidad</th><th>Tipo Discap.</th><th>Nivel Educ.</th>
      </tr>`;
}

function mostrarCargando() {
    const cols = document.querySelectorAll('#thead th').length || 18;
    document.getElementById('tbody').innerHTML =
        `<tr><td colspan="${cols}" class="state-msg">Cargando datos... ⏳</td></tr>`;
    document.getElementById('countInfo').textContent = '';
    document.getElementById('pagination').innerHTML = '';
}

function mostrarError(msg) {
    const cols = document.querySelectorAll('#thead th').length || 18;
    document.getElementById('tbody').innerHTML =
        `<tr><td colspan="${cols}" class="state-msg">❌ ${msg}</td></tr>`;
}

// ══════════════════════════════════════
// INIT — revisar si hay sesión activa
// ══════════════════════════════════════
const tokenGuardado = sessionStorage.getItem('admin_token');
if (tokenGuardado) {
    TOKEN = tokenGuardado;
    const nombre = sessionStorage.getItem('admin_nombre') || 'Admin';
    mostrarReporte(nombre);
}

let chartsBuilt = false;
let chartGeneroInst = null, chartCantonesInst = null;
let chartEducacionInst = null, chartAutoidentInst = null;

function toggleCharts() {
    const section = document.getElementById('chartsSection');
    const arrow = document.getElementById('chartsArrow');
    const isOpen = section.classList.toggle('open');
    arrow.classList.toggle('open', isOpen);
    if (isOpen && !chartsBuilt && datosActuales.length) {
        buildCharts(datosActuales);
        chartsBuilt = true;
    }
}

function buildCharts(datos) {
    const gridColor = 'rgba(255,255,255,0.08)';
    const tickColor = 'rgba(255,255,255,0.55)';
    const colores = ['#90CAF9', '#6EE7B7', '#FCD34D', '#F9A8D4', '#A5B4FC', '#F87171', '#67E8F9'];

    // Género
    const generoCount = {};
    datos.forEach(p => { const g = p.genero || 'No especificado'; generoCount[g] = (generoCount[g] || 0) + 1; });
    const genLabels = Object.keys(generoCount), genData = Object.values(generoCount);
    document.getElementById('legendGenero').innerHTML = genLabels.map((l, i) => `
        <span class="chart-legend-item"><span class="chart-legend-dot" style="background:${colores[i % colores.length]}"></span>${l} (${genData[i]})</span>`).join('');
    if (chartGeneroInst) chartGeneroInst.destroy();
    chartGeneroInst = new Chart(document.getElementById('chartGenero'), {
        type: 'doughnut',
        data: { labels: genLabels, datasets: [{ data: genData, backgroundColor: colores.slice(0, genLabels.length), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Top 5 cantones
    const cantonCount = {};
    datos.forEach(p => { const c = p.canton || 'No especificado'; cantonCount[c] = (cantonCount[c] || 0) + 1; });
    const cantonSorted = Object.entries(cantonCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (chartCantonesInst) chartCantonesInst.destroy();
    chartCantonesInst = new Chart(document.getElementById('chartCantones'), {
        type: 'bar',
        data: { labels: cantonSorted.map(c => c[0]), datasets: [{ data: cantonSorted.map(c => c[1]), backgroundColor: 'rgba(144,202,249,0.7)', borderRadius: 5, borderSkipped: false }] },
        options: {
            indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 }, stepSize: 1 } }, y: { grid: { display: false }, ticks: { color: tickColor, font: { size: 10 } } } }
        }
    });

    // Nivel educación
    const nivelCount = {};
    datos.forEach(p => { const n = p.nivelEducacion || 'No especificado'; nivelCount[n] = (nivelCount[n] || 0) + 1; });
    const nivelOrden = ['Básica', 'Bachillerato', 'Tercer nivel', 'Carto nivel','Sin estudios'];
    const nivelLabels = nivelOrden.filter(n => nivelCount[n]);
    if (chartEducacionInst) chartEducacionInst.destroy();
    chartEducacionInst = new Chart(document.getElementById('chartEducacion'), {
        type: 'bar',
        data: { labels: nivelLabels, datasets: [{ data: nivelLabels.map(n => nivelCount[n] || 0), backgroundColor: 'rgba(110,231,183,0.7)', borderRadius: 5 }] },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 9 }, maxRotation: 30 } }, y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 }, stepSize: 1 } } }
        }
    });

    // Autoidentificación
    const autoCount = {};
    datos.forEach(p => { const a = p.autoidentificacion || 'No especificado'; autoCount[a] = (autoCount[a] || 0) + 1; });
    const autoLabels = Object.keys(autoCount), autoData = Object.values(autoCount);
    const autoColores = ['#FCD34D', '#F9A8D4', '#A5B4FC', '#6EE7B7', '#F87171', '#67E8F9', '#90CAF9'];
    document.getElementById('legendAutoident').innerHTML = autoLabels.map((l, i) => `
        <span class="chart-legend-item"><span class="chart-legend-dot" style="background:${autoColores[i % autoColores.length]}"></span>${l} (${autoData[i]})</span>`).join('');
    if (chartAutoidentInst) chartAutoidentInst.destroy();
    chartAutoidentInst = new Chart(document.getElementById('chartAutoident'), {
        type: 'doughnut',
        data: { labels: autoLabels, datasets: [{ data: autoData, backgroundColor: autoColores.slice(0, autoLabels.length), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}


function actualizarCharts(datos) {
    if (chartsBuilt && document.getElementById('chartsSection').classList.contains('open')) {
        buildCharts(datos);
    } else {
        chartsBuilt = false;
    }
}
