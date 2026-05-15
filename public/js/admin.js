
//const BASE_URL = "https://inscripciones.lidera.cacicus.ec";

const BASE_URL = "http://localhost:3000";

let vistaActual = "dashboard";
let cohortes = [];
let inscripciones = [];

let datosActuales = [];
let paginaActual = 1;
const PER_PAGE = 50;

let TOKEN = '';

// login
async function hacerLogin() {
  const usuario = document.getElementById('inputUsuario').value.trim();
  const password = document.getElementById('inputPassword').value;
  const errBox = document.getElementById('loginError');

  if (!usuario || !password) {
    errBox.textContent = 'Ingresa usuario y contraseña';
    errBox.style.display = 'block';
    return;
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    errBox.textContent = data.message || 'Credenciales incorrectas';
    errBox.style.display = 'block';
    return;
  }

  TOKEN = data.token;
  sessionStorage.setItem('admin_token', TOKEN);
  sessionStorage.setItem('login_time', Date.now());
  sessionStorage.setItem('admin_nombre', data.admin?.nombre || 'Admin');

  mostrarAdmin();
}
// mostrar admin
function mostrarAdmin() {
  document.getElementById('loginScreen').style.display = 'none';

  document.querySelectorAll('.app-screen').forEach(el => {
    el.style.display = el.classList.contains('sidebar') ? 'flex' : 'block';
  });

  document.getElementById('adminNombre').textContent =
    sessionStorage.getItem('admin_nombre') || 'Administrador';

  cargarDashboard();
}

//visualizar contraseña o no en el login
function togglePassword() {

  const input = document.getElementById('inputPassword');

  input.type =
    input.type === 'password'
      ? 'text'
      : 'password';
}

function mostrarVista(vista) {
  vistaActual = vista;

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  const boton = [...document.querySelectorAll(".nav-btn")]
    .find(btn => btn.textContent.toLowerCase().includes(vista));

  if (boton) boton.classList.add("active");

  if (vista === "dashboard") cargarDashboard();
  if (vista === "preinscripciones") cargarVistaPreinscripciones();
  if (vista === "cohortes") cargarVistaCohortes();
  if (vista === "seguimiento") cargarVistaPendiente("Seguimiento de avance");
  if (vista === "correos") cargarVistaPendiente("Correos enviados");
  if (vista === "configuracion") cargarVistaPendiente("Configuración");
}

function setTitulo(titulo, subtitulo) {
  document.getElementById("pageTitle").textContent = titulo;
  document.getElementById("pageSubtitle").textContent = subtitulo;
}

function cargarDashboard() {
  setTitulo("Dashboard", "Resumen general del sistema");

  document.getElementById("viewContainer").innerHTML = `
    <div class="cards-grid">
      <div class="card">
        <span>Preinscripciones</span>
        <strong id="dashInscripciones">0</strong>
      </div>

      <div class="card">
        <span>Cohortes</span>
        <strong id="dashCohortes">0</strong>
      </div>

      <div class="card">
        <span>Estudiantes en cohortes</span>
        <strong id="dashEstudiantes">0</strong>
      </div>

      <div class="card">
        <span>Correos enviados</span>
        <strong id="dashCorreos">0</strong>
      </div>
    </div>

    <div class="panel">
      <div class="toolbar">
        <button class="btn primary" onclick="mostrarVista('preinscripciones')">
          Ver preinscripciones
        </button>

        <button class="btn primary" onclick="mostrarVista('cohortes')">
          Ver cohortes
        </button>
      </div>
    </div>
  `;

  cargarResumenDashboard();
}

async function cargarResumenDashboard() {
  try {
    const insRes = await fetch(`${BASE_URL}/inscripciones/reporte`);
    const insData = await insRes.json();

    document.getElementById("dashInscripciones").textContent =
      insData.personas?.length ?? 0;

    const cohortRes = await fetch(`${BASE_URL}/cohorts/dashboard/summary`);
    const cohortData = await cohortRes.json();


    document.getElementById("dashCohortes").textContent = cohortData.totalCohorts ?? 0;
    document.getElementById("dashEstudiantes").textContent = cohortData.totalStudents ?? 0;
    document.getElementById("dashCorreos").textContent = cohortData.emailsSent ?? 0;
  } catch (error) {
    console.error(error);
  }
}

function cargarVistaPendiente(nombre) {
  setTitulo(nombre, "Módulo en construcción");

  document.getElementById("viewContainer").innerHTML = `
    <div class="panel">
      <div style="padding:30px;">
        <h2>${nombre}</h2>
        <p>Este módulo será conectado en la siguiente etapa.</p>
      </div>
    </div>
  `;
}

function cerrarSesion() {

  TOKEN = '';

  sessionStorage.clear();

  // ocultar admin
  document.querySelectorAll('.app-screen').forEach(el => {
    el.style.display = 'none';
  });

  // mostrar login
  document.getElementById('loginScreen').style.display = 'flex';

  // limpiar inputs
  document.getElementById('inputUsuario').value = '';
  document.getElementById('inputPassword').value = '';

  // limpiar errores
  document.getElementById('loginError').style.display = 'none';

  // reset botón
  const btn = document.getElementById('btnLogin');

  if (btn) {
    btn.disabled = false;
  }
}

function authHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

function abrirModal() {
  document.getElementById("modalOverlay").classList.add("open");
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  cargarDashboard();
});

// cargar cohortes 
async function cargarVistaCohortes() {
  setTitulo(
    "Cohortes",
    "Organiza grupos de estudiantes, envía accesos Moodle y controla su avance."
  );

  document.getElementById("viewContainer").innerHTML = `
    <div class="cards-grid">
      <div class="card"><span>Total cohortes</span><strong id="totalCohorts">0</strong></div>
      <div class="card"><span>Estudiantes agrupados</span><strong id="totalStudents">0</strong></div>
      <div class="card"><span>Correos enviados</span><strong id="emailsSent">0</strong></div>
      <div class="card"><span>Pendientes</span><strong id="emailsPending">0</strong></div>
    </div>

    <div class="panel">
      <div class="toolbar">
        <input id="inputBuscarCohorte" placeholder="Buscar cohorte..." />
        <button class="btn" onclick="buscarCohortes()">Buscar</button>
        <button class="btn" onclick="cargarVistaCohortes()">Recargar</button>
        <button class="btn primary" onclick="abrirModalNuevoCohorte()">+ Nuevo cohorte</button>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cohorte</th>
              <th>Curso</th>
              <th>Estudiantes</th>
              <th>Correos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="cohortesTbody">
            <tr><td colspan="6">Cargando cohortes...</td></tr>
          </tbody>
        </table>
        <div style="padding:20px; display:flex; justify-content:space-between; align-items:center;">
    <span id="countInfo"></span>
    <div id="pagination" style="display:flex; gap:8px;"></div>
</div>
      </div>
    </div>
  `;

  await cargarResumenCohortes();
  await cargarCohortes();
}

async function cargarResumenCohortes() {
  const res = await fetch(`${BASE_URL}/cohorts/dashboard/summary`);
  const data = await res.json();

  document.getElementById("totalCohorts").textContent = data.totalCohorts ?? 0;
  document.getElementById("totalStudents").textContent = data.totalStudents ?? 0;
  document.getElementById("emailsSent").textContent = data.emailsSent ?? 0;
  document.getElementById("emailsPending").textContent = data.emailsPending ?? 0;
}

async function cargarCohortes() {
  const res = await fetch(`${BASE_URL}/cohorts`);
  cohortes = await res.json();
  renderCohortes(cohortes);
}

function renderCohortes(lista) {
  const tbody = document.getElementById("cohortesTbody");

  if (!lista.length) {
    tbody.innerHTML = `<tr><td colspan="6">No hay cohortes.</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map(c => `
  <tr>

    <td>
      <strong>${c.name}</strong><br>
      <small>${c.description || ""}</small>
    </td>

    <td>${c.courseName || "—"}</td>

    <td>
      <span class="badge badge-info">
        ${c.totalStudents}
      </span>
    </td>

    <td>
      <span class="badge badge-success">
        ${c.emailsSent} enviados
      </span>

      <br><br>

      <span class="badge badge-warning">
        ${c.emailsPending} pendientes
      </span>
    </td>

    <td>
      <span class="badge badge-info">
        ${c.status}
      </span>
    </td>

    <td>
      <button class="btn primary"
        onclick="verCohorte(${c.id})">
        Ver cohorte
      </button>
    </td>

  </tr>
`).join("");
}

function buscarCohortes() {
  const q = document.getElementById("inputBuscarCohorte").value.toLowerCase();

  const filtrados = cohortes.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.courseName || "").toLowerCase().includes(q)
  );

  renderCohortes(filtrados);
}
function abrirModalNuevoCohorte() {
  document.getElementById("modalTitle").textContent = "Nuevo cohorte";

  document.getElementById("modalBody").innerHTML = `
    <div class="field">
      <label>Nombre del cohorte</label>
      <input type="text" id="cohortName" placeholder="Ej: Mayo 2026 - Grupo 3">
    </div>

    <div class="field">
      <label>Descripción</label>
      <input type="text" id="cohortDescription" placeholder="Descripción breve">
    </div>

    <div class="field">
      <label>Curso</label>
      <input type="text" id="cohortCourseName" value="Liderazgo y Participación Ciudadana">
    </div>

    <div class="field">
      <label>URL Moodle</label>
      <input type="text" id="cohortMoodleUrl" placeholder="https://moodle.elize.com.ec">
    </div>

    <button class="btn primary" onclick="crearCohorte()">
      Guardar cohorte
    </button>
  `;

  abrirModal();
}

async function crearCohorte() {
  const name = document.getElementById("cohortName").value.trim();
  const description = document.getElementById("cohortDescription").value.trim();
  const courseName = document.getElementById("cohortCourseName").value.trim();
  const moodleUrl = document.getElementById("cohortMoodleUrl").value.trim();

  if (!name) {
    showToast("El nombre del cohorte es obligatorio");
    return;
  }
  showLoader(
    'Creando cohorte',
    'Guardando información del cohorte'
  );
  try {
    const res = await fetch(`${BASE_URL}/cohorts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, courseName, moodleUrl }),
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.message || "No se pudo crear el cohorte");
      return;
    }
    hideLoader();

    showToast("✔ Cohorte creado", "success");

    cerrarModal();
    await cargarVistaCohortes();
  } catch (error) {
    showToast("❌ Error creando cohorte", "error");

  } finally {

    hideLoader();
  }

  // funcionalidades
  function buscarCohortes() {
    const input = document.getElementById("inputBuscarCohorte");
    const q = input.value.trim().toLowerCase();

    if (!q) {
      renderCohortes(cohortes);
      return;
    }

    const filtrados = cohortes.filter(c =>
      String(c.name || "").toLowerCase().includes(q) ||
      String(c.description || "").toLowerCase().includes(q) ||
      String(c.courseName || "").toLowerCase().includes(q) ||
      String(c.status || "").toLowerCase().includes(q)
    );

    renderCohortes(filtrados);
  }
}

//ver cohorte
async function verCohorte(id) {
  try {
    const res = await fetch(`${BASE_URL}/cohorts/${id}`);
    const cohort = await res.json();

    if (!res.ok) {
      throw new Error(cohort.message || "No se pudo cargar el cohorte");
    }

    document.getElementById("modalTitle").textContent = cohort.name;

    document.getElementById("modalBody").innerHTML = `
  <div class="cards-grid">
    <div class="card">
      <span>Estudiantes</span>
      <strong>${cohort.summary?.totalStudents ?? 0}</strong>
    </div>

    <div class="card">
      <span>Correos enviados</span>
      <strong>${cohort.summary?.emailsSent ?? 0}</strong>
    </div>

    <div class="card">
      <span>Pendientes</span>
      <strong>${cohort.summary?.emailsPending ?? 0}</strong>
    </div>
  </div>

  <div class="detail-row">
    <span class="detail-key">Curso</span>
    <span class="detail-val">${cohort.courseName || "—"}</span>
  </div>

  <div class="detail-row">
    <span class="detail-key">URL Moodle</span>
    <span class="detail-val">${cohort.moodleUrl || "—"}</span>
  </div>

  <div style="display:flex; gap:10px; flex-wrap:wrap; margin:20px 0;">
    <button class="btn primary btn-sm" onclick="abrirImportarExcel(${cohort.id})">
      Importar estudiantes
    </button>

    <button class="btn primary btn-sm" onclick="enviarCorreosCohorte(${cohort.id})">
      Enviar correos pendientes
    </button>

    <button class="btn primary btn-sm" onclick="exportarMoodleDesdeCohorte(${cohort.id})">
      Exportar Moodle
    </button>
  </div>

  <div class="toolbar" style="padding-left:0;">
    <input
      id="buscarEstudianteCohorte"
      placeholder="Buscar estudiante..."
      oninput="filtrarEstudiantesCohorte()"
    >
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Cédula</th>
          <th>Nombre completo</th>
          <th>Correo</th>
          <th>Usuario Moodle</th>
          <th>Estado correo</th>
        </tr>
      </thead>

      <tbody id="tbodyEstudiantesCohorte">
        ${renderEstudiantesCohorte(cohort.students || [])}
      </tbody>
    </table>
  </div>
`;

    window.estudiantesCohorteActual = cohort.students || [];

    abrirModal();

  } catch (error) {
    showToast(error.message || "Error cargando cohorte");
  }
}
// renderizar cohorte
function renderEstudiantesCohorte(students) {
  if (!students.length) {
    return `<tr><td colspan="5">No hay estudiantes en este cohorte.</td></tr>`;
  }

  return students.map(s => `
    <tr>
      <td>${s.cedula || "—"}</td>
      <td><strong>${s.nombres || ""} ${s.apellidos || ""}</strong></td>
      <td>${s.correo || "—"}</td>
      <td>${s.moodleUsername || "—"}</td>
      <td>
        <span class="badge ${s.emailSent ? "badge-success" : "badge-warning"}">
          ${s.emailSent ? "Enviado" : "Pendiente"}
        </span>
      </td>
    </tr>
  `).join("");
}

function filtrarEstudiantesCohorte() {
  const q = document.getElementById("buscarEstudianteCohorte").value.toLowerCase();

  const filtrados = (window.estudiantesCohorteActual || []).filter(s =>
    String(s.cedula || "").toLowerCase().includes(q) ||
    String(s.nombres || "").toLowerCase().includes(q) ||
    String(s.apellidos || "").toLowerCase().includes(q) ||
    String(s.correo || "").toLowerCase().includes(q)
  );

  document.getElementById("tbodyEstudiantesCohorte").innerHTML =
    renderEstudiantesCohorte(filtrados);
}

function abrirImportarExcel(cohortId) {
  document.getElementById("modalTitle").textContent = "Importar estudiantes";

  document.getElementById("modalBody").innerHTML = `
    <p>El Excel debe tener estas columnas:</p>
    <p><strong>cedula, nombres, apellidos, correo</strong></p>

    <div class="field">
      <label>Archivo Excel</label>
      <input type="file" id="excelFile" accept=".xlsx,.xls,.csv">
    </div>

    <button class="btn primary" onclick="importarEstudiantes(${cohortId})">
      Importar
    </button>

    <div id="importResult" style="margin-top:15px;"></div>
  `;

  abrirModal();
}

//inportar estudiantes a un cohorte
async function importarEstudiantes(cohortId) {

  const input = document.getElementById("excelFile");

  if (!input.files || !input.files[0]) {

    showToast(
      "Selecciona un archivo Excel",
      "error"
    );

    return;
  }

  const formData = new FormData();

  formData.append("file", input.files[0]);

  showLoader(
    'Importando estudiantes',
    'Procesando archivo Excel'
  );

  try {

    const res = await fetch(
      `${BASE_URL}/cohorts/${cohortId}/import-students`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {

      showToast(
        data.message || "No se pudo importar",
        "error"
      );

      return;
    }
    //mensajes de importacion
    const mensajeImportacion =
      data.creados > 0
        ? `Se agregaron correctamente ${data.creados} estudiante(s) nuevo(s) al cohorte.`
        : data.duplicados > 0 && data.errores === 0
          ? `No se agregaron nuevos estudiantes porque todos ya pertenecen a este cohorte.`
          : data.errores > 0
            ? `La importación terminó con errores. Revisa el archivo o los datos duplicados.`
            : `No se detectaron estudiantes nuevos para importar.`;
    // colores de mensajes 
    const mensajeClase =
      data.creados > 0
        ? "success"
        : data.duplicados > 0 && data.errores === 0
          ? "warning"
          : data.errores > 0
            ? "error"
            : "info";

    document.getElementById("importResult").innerHTML = `
  <div class="import-summary-grid">

    <div class="import-summary-card">
      <span>Total filas</span>
      <strong>${data.totalFilas}</strong>
    </div>

    <div class="import-summary-card success">
      <span>Creados</span>
      <strong>${data.creados}</strong>
    </div>

    <div class="import-summary-card warning">
      <span>Duplicados</span>
      <strong>${data.duplicados}</strong>
    </div>

    <div class="import-summary-card error">
      <span>Errores</span>
      <strong>${data.errores}</strong>
    </div>

  </div>

  <div class="import-message ${mensajeClase} ">
    ${mensajeImportacion}
  </div>
`;
    hideLoader();

    if (data.creados > 0) {
      showToast(
        `✔ ${data.creados} estudiante(s) importado(s) correctamente`,
        "success"
      );
    } else if (data.duplicados > 0 && data.errores === 0) {
      showToast(
        "ℹ Todos los estudiantes ya existían en este cohorte",
        "info"
      );
    } else if (data.errores > 0) {
      showToast(
        `⚠ Importación finalizada con ${data.errores} error(es)`,
        "error"
      );
    } else {
      showToast(
        "ℹ No se importaron nuevos estudiantes",
        "info"
      );
    }
    await cargarVistaCohortes();

  } catch (error) {

    showToast(
      error.message || "Error importando estudiantes",
      "error"
    );

  } finally {

    hideLoader();
  }
}

//enviar correos a estudiantes dentro del cohorte
async function enviarCorreosCohorte(cohortId) {
  const ok = await showConfirm(
    "¿Enviar correos pendientes?",
    "Los estudiantes pendientes recibirán sus credenciales de acceso Moodle."
  );
  if (!ok) return;

  try {
    const res = await fetch(`${BASE_URL}/cohorts/${cohortId}/send-welcome-emails`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "No se pudieron enviar los correos");
    }

    showToast(`Proceso terminado:\nEnviados: ${data.enviados}\nErrores: ${data.errores}`);

    await cargarVistaCohortes();

  } catch (error) {
    showToast(error.message || "Error enviando correos");
  }
}

//presincripcion
async function cargarVistaPreinscripciones() {
  setTitulo(
    "Preinscripciones",
    "Consulta inscritos, filtra por provincia y exporta estudiantes para cohortes."
  );

  document.getElementById("viewContainer").innerHTML = `
  <div class="cards-grid">
    <div class="card"><span>Total inscritos</span><strong id="statTotal">0</strong></div>
    <div class="card"><span>Con discapacidad</span><strong id="statDisc">0</strong></div>
    <div class="card"><span>Género femenino</span><strong id="statFem">0</strong></div>
    <div class="card"><span>Género masculino</span><strong id="statMasc">0</strong></div>
  </div>

  <div class="panel">

    <div class="toolbar">
      <input id="inputBusqueda" placeholder="Buscar por provincia..." />
      
      <button class="btn" onclick="buscar()">
        Buscar
      </button>

      <button class="btn" onclick="cargarReporte()">
        Recargar
      </button>

      <button class="btn primary"
        onclick="generarExcel(datosActuales, 'reporte_completo')">
        Exportar Excel
      </button>
      
      <button class="btn primary" onclick="abrirModalAgregarSeleccionadosACohorte()">
       Agregar seleccionados a cohorte
     </button>

    </div>

    <div class="table-wrap">

      <table>

        <thead id="thead"></thead>

        <tbody id="tbody">
          <tr>
            <td>Cargando datos...</td>
          </tr>
        </tbody>

      </table>

    </div>

    <div class="table-footer">
    <span id="countInfo"></span>
    <div id="pagination" class="pagination"></div>
    </div>
  </div>
`;

  await cargarReporte();
}

// cargar reporte inscripciones
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
  } catch (err) {
    mostrarError('No se pudo conectar al servidor.');
  }
}

// buscar por provincia
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
    setHeaderBusqueda();

    paginaActual = 1;
    renderTablaBusqueda();
    //actualizarCharts(datosActuales);

  } catch (err) {
    console.error(err);
    mostrarError('Error al buscar.');
  }
}

//calcular stats
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

// renderizar tabla 
function esSi(v) {
  return v === true || v === 'true' || v === 1 || v === '1' || v === 'Sí' || v === 'Si' || v === 'si';
}

function renderTabla() {
  const tbody = document.getElementById('tbody');

  if (!datosActuales.length) {
    tbody.innerHTML = `<tr><td colspan="8">No hay resultados.</td></tr>`;
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
    <tr>
      <td>
        <input type="checkbox" class="select-inscription" value="${start + i}">
      </td>
      <td>${p.cedula || 'N/A'}</td>
      <td><strong>${p.nombres || ''} ${p.apellidos || ''}</strong></td>
      <td>${p.correo || 'N/A'}</td>
      <td>${p.celular || 'N/A'}</td>
      <td>${p.provincia || 'N/A'}</td>
      <td>${p.canton || 'N/A'}</td>
      <td>
        <button class="btn" onclick="verDetalle(${start + i})">Ver</button>
      </td>
    </tr>
  `).join('');

  document.getElementById('countInfo').textContent =
    `Mostrando ${start + 1}–${Math.min(start + PER_PAGE, total)} de ${total} registros`;

  renderPaginacion(pages);
}

//accion ver modal elegante
function verDetalle(index) {

  const p = datosActuales[index];

  document.getElementById("modalTitle").textContent =
    `${p.nombres || ''} ${p.apellidos || ''}`;

  document.getElementById("modalBody").innerHTML = `

    <div class="detail-row">
      <span class="detail-key">Cédula</span>
      <span class="detail-val">${p.cedula || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Correo</span>
      <span class="detail-val">${p.correo || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Celular</span>
      <span class="detail-val">${p.celular || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Fecha nacimiento</span>
      <span class="detail-val">${p.fechaNacimiento || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Género</span>
      <span class="detail-val">${p.genero || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Provincia</span>
      <span class="detail-val">${p.provincia || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Cantón</span>
      <span class="detail-val">${p.canton || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Parroquia</span>
      <span class="detail-val">${p.parroquia || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Ocupación</span>
      <span class="detail-val">${p.ocupacion || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Institución</span>
      <span class="detail-val">${p.institucion || 'N/A'}</span>
    </div>

    <div class="detail-row">
      <span class="detail-key">Discapacidad</span>
      <span class="detail-val">
        ${p.discapacidad ? 'Sí' : 'No'}
      </span>
    </div>

  `;

  abrirModal();
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
        </tr>`).join('');

  document.getElementById('countInfo').textContent =
    `Mostrando ${start + 1}–${Math.min(start + PER_PAGE, total)} de ${total} registros`;
  renderPaginacion(pages);
}


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
  renderTabla();
  document.querySelector('.panel').scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════
// 🔧 HELPERS
// ══════════════════════════════════════
function setHeaderCompleto() {
  document.getElementById('thead').innerHTML = `
    <tr>
      <th>
      <input
        type="checkbox"
        id="selectAllInscriptions"
        onclick="toggleSeleccionarTodos(this)">
      </th>
      <th>Cédula</th>
      <th>Nombre completo</th>
      <th>Correo</th>
      <th>Celular</th>
      <th>Provincia</th>
      <th>Cantón</th>
      <th>Acciones</th>
    </tr>
  `;
}
function setHeaderBusqueda() {
  document.getElementById('thead').innerHTML = `<tr>
        <th>Cédula</th><th>Nombres</th><th>Apellidos</th><th>Correo</th>
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


//exportaciones de excel
//exportar excel solo por provincia
async function exportarPorProvincia() {
  const provinciaInput = document.getElementById('inputBusqueda').value.trim();

  if (!provinciaInput) {
    showToast("Escribe una provincia");
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
      showToast("No hay datos para esa provincia");
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
    excel(data.personas, nombreArchivo);

  } catch (error) {
    console.error("Error exportando:", error);
    showToast("Error al exportar. Verifica conexión con el backend.");

  }
}
// generar excel buscar
function excel(personas, nombreArchivo) {

  if (!personas || !personas.length) {

    showToast("No hay datos para exportar ");
    return;
  }

  // 🔥 HEADERS DEFINIDOS (ORDEN CONTROLADO)
  const headers = [
    'cedula', 'nombres', 'apellidos', 'correo'
  ];

  // 🔥 FILAS (AOA = Array of Arrays)
  const data = personas.map(p => [
    p.cedula || 'N/A',
    p.nombres || 'N/A',
    p.apellidos || 'N/A',
    p.correo || 'N/A',
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

// 📊 EXPORTAR EXCEL (XLSX)
// =======================
async function generarExcel(personas, nombreArchivo) {
  const ok = await showConfirm(
    "¿Deseas exportar el archivo excel completo?",
    "Se descargará el reporte general de preinscripciones."
  );

  if (!ok) return;

  if (!personas || !personas.length) {
    showToast("No hay datos para exportar", "error");
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

//mandar estudiantes a cohortes
function obtenerInscripcionesSeleccionadas() {
  const checks = document.querySelectorAll('.select-inscription:checked');

  return Array.from(checks).map(chk => {
    const index = Number(chk.value);
    return datosActuales[index];
  });
}

async function abrirModalAgregarSeleccionadosACohorte() {
  const seleccionados = obtenerInscripcionesSeleccionadas();

  if (!seleccionados.length) {
    showToast('Selecciona al menos un estudiante.');
    return;
  }

  const res = await fetch(`${BASE_URL}/cohorts`);
  const listaCohortes = await res.json();

  document.getElementById("modalTitle").textContent = "Agregar a cohorte";

  document.getElementById("modalBody").innerHTML = `
    <p>Estudiantes seleccionados: <strong>${seleccionados.length}</strong></p>

    <div class="field">
      <label>Selecciona el cohorte</label>
      <select id="selectCohorteDestino">
        ${listaCohortes.map(c => `
          <option value="${c.id}">
            ${c.name} - ${c.courseName || ''}
          </option>
        `).join('')}
      </select>
    </div>

    <button class="btn primary" onclick="agregarSeleccionadosACohorte()">
      Agregar estudiantes
    </button>

    <div id="resultadoAgregarCohorte" style="margin-top:15px;"></div>
  `;

  abrirModal();
}

// agregar estudiantes seleccionados a un cohorte
async function agregarSeleccionadosACohorte() {
  const seleccionados = obtenerInscripcionesSeleccionadas();
  const cohortId = document.getElementById('selectCohorteDestino').value;

  if (!seleccionados.length) {
    showToast('Selecciona al menos un estudiante.', 'error');
    return;
  }

  const ok = await showConfirm(
    `¿Deseas agregar ${seleccionados.length} estudiante(s) al cohorte seleccionado?`
  );

  if (!ok) return;

  showLoader(
    'Agregando estudiantes',
    'Registrando seleccionados en el cohorte'
  );

  let creados = 0;
  let errores = 0;

  try {
    for (const p of seleccionados) {
      const res = await fetch(`${BASE_URL}/cohorts/${cohortId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: p.cedula,
          nombres: p.nombres,
          apellidos: p.apellidos,
          correo: p.correo,
          moodleUsername: p.cedula,
          moodlePassword: p.cedula,
        }),
      });

      if (res.ok) creados++;
      else errores++;
    }

    hideLoader();
    cerrarModal();

    showToast(
      `✔ ${creados} estudiante(s) agregado(s). ${errores} error(es)/duplicado(s).`,
      errores ? 'info' : 'success'
    );

    await cargarReporte();

  } catch (error) {
    hideLoader();
    showToast('❌ Error agregando estudiantes al cohorte', 'error');
  }
}

//token guardado
document.addEventListener("DOMContentLoaded", () => {

  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await hacerLogin();
    });
  }

  const tokenGuardado = sessionStorage.getItem('admin_token');
  const loginTime = sessionStorage.getItem('login_time');

  if (!tokenGuardado || !loginTime) {
    return;
  }

  const ahora = Date.now();
  const DOS_HORAS = 2 * 60 * 60 * 1000;

  if (ahora - Number(loginTime) > DOS_HORAS) {
    sessionStorage.clear();
    return;
  }

  TOKEN = tokenGuardado;
  mostrarAdmin();
});



//exportar excel compatible con moodle
async function exportarMoodleDesdeCohorte(cohortId) {
  const ok = await showConfirm(
    "¿Deseas exportar el archivo compatible con Moodle?",
    "Se generará el archivo del cohorte seleccionado."
  );

  if (!ok) return;
  const res = await fetch(`${BASE_URL}/cohorts/${cohortId}`);
  const cohort = await res.json();

  const students = cohort.students || [];

  if (!students.length) {
    showToast("Este cohorte no tiene estudiantes.");
    return;
  }

  const headers = [
    "username",
    "password",
    "firstname",
    "lastname",
    "email",
    "phone1",
    "country",
    "timezone",
    "lang",
    "cohort1"
  ];

  const cohortMoodleName = (cohort.name || "cohorte")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();

  const data = students.map(s => [
    s.cedula || "",
    s.cedula || "",
    s.nombres || "",
    s.apellidos || "",
    s.correo || "",
    s.celular || "",
    "EC",
    "America/Guayaquil",
    "es",
    cohortMoodleName
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "moodle_users");

  XLSX.writeFile(wb, `${cohortMoodleName}_moodle.xlsx`);
}
// funcion para selecionar todos
function toggleSeleccionarTodos(masterCheckbox) {

  const checks = document.querySelectorAll('.select-inscription');

  checks.forEach(chk => {
    chk.checked = masterCheckbox.checked;
  });
}
//exportar estudiantes dentro de un cohorte
async function exportarEstudiantesCohorte(cohortId) {
  const res = await fetch(`${BASE_URL}/cohorts/${cohortId}`);
  const cohort = await res.json();

  const students = cohort.students || [];

  if (!students.length) {
    showToast("Este cohorte no tiene estudiantes para exportar.");
    return;
  }

  const headers = [
    "cedula",
    "nombres",
    "apellidos",
    "correo",
    "moodleUsername",
    "emailSent",
    "emailSentAt"
  ];

  const data = students.map(s => [
    s.cedula || "",
    s.nombres || "",
    s.apellidos || "",
    s.correo || "",
    s.moodleUsername || "",
    s.emailSent ? "ENVIADO" : "PENDIENTE",
    s.emailSentAt || ""
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "cohorte");

  const nombreArchivo = (cohort.name || "cohorte")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();

  XLSX.writeFile(wb, `${nombreArchivo}_estudiantes.xlsx`);
}
// funcion de mensajes bonitos
function showToast(message, type = 'success') {

  const container = document.getElementById('toastContainer');

  const toast = document.createElement('div');

  toast.className = `toast toast-${type}`;

  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// funcion de mensajes de espera
function showLoader(
  title = 'Procesando...',
  message = 'Espera un momento'
) {

  document.getElementById('loaderTitle').textContent = title;

  document.getElementById('loaderMessage').textContent = message;

  document
    .getElementById('globalLoader')
    .classList.add('show');
}

function hideLoader() {

  document
    .getElementById('globalLoader')
    .classList.remove('show');
}

// funcion de mensajes de confirmacion

function showConfirm(message, description = '') {

  return new Promise((resolve) => {

    document.getElementById("modalTitle").textContent =
      "Confirmar acción";

    document.getElementById("modalBody").innerHTML = `
      <div style="display:flex; gap:16px; align-items:flex-start;">

        <div style="
          width:46px;
          height:46px;
          border-radius:14px;
          background:#fef3c7;
          color:#92400e;
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:24px;
          flex-shrink:0;
        ">
          ⚠
        </div>

        <div>
          <p style="font-size:1.05rem; margin-bottom:8px;">
            ${message}
          </p>

          ${description
        ? `<p style="color:#64748b; margin:0;">${description}</p>`
        : ''
      }
        </div>

      </div>

      <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:28px;">

        <button class="btn" onclick="cerrarConfirm(false)">
          Cancelar
        </button>

        <button class="btn primary" onclick="cerrarConfirm(true)">
          Sí, continuar
        </button>

      </div>
    `;

    window.confirmResolver = resolve;

    abrirModal();
  });
}

function cerrarConfirm(result) {

  cerrarModal();

  if (window.confirmResolver) {
    window.confirmResolver(result);
  }
}

