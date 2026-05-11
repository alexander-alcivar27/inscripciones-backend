
const BASE_URL = "https://inscripciones.lidera.cacicus.ec";
//const BASE_URL = "http://localhost:3000";

let currentStep = 1;
let cedulaValida = false;

//fecha de nacimeinto
flatpickr("#fechaNac", {
    dateFormat: "d/m/Y",
    allowInput: false,
    maxDate: "today"
});

const REQUIRED_IDS = [
    'cedula',
    'nombres',
    'apellidos',
    'correo',
    'celular',
    'fechaNac',
    'ocupacion',
    'institucion',
    'provincia',
    'canton',
    'parroquia',
    'barrio',
    'genero',
    'orientacion',
    'nacionalidad',
    'autoidentificacion',
    'discapacidad',
    'nivelEdu'];

const pasos = [
    'Bienvenida',
    'Datos personales',
    'Ubicación',
    'Perfil',
    'Confirmación'
];

const modulos = [
    {
        titulo: 'Derechos Humanos',
        descripcion:
            'Conoce el origen, los principios y la importancia de los derechos humanos, sus garantías y su aplicación en la vida cotidiana.'
    },
    {
        titulo: 'Participación Ciudadana',
        descripcion:
            'Aprende cómo incidir en tu comunidad, ejercer liderazgo responsable y participar en la transformación de tu entorno.'
    },
    {
        titulo: 'Liderazgo y Organización Social',
        descripcion:
            'Descubre estilos de liderazgo, la importancia de las organizaciones sociales y la toma de decisiones colectivas.'
    },
    {
        titulo: 'Políticas Públicas y Elaboración de Proyectos',
        descripcion:
            'Comprende cómo se diseñan las políticas públicas y cómo convertir ideas en propuestas concretas para tu territorio.'
    }
];

const identidades = [
    'Mestizo/a',
    'Indígena',
    'Cholo/a',
    'Montuvio/a',
    'Afrodescendiente',
    'Blanco/a'
];

const stepsContainer = document.getElementById('steps');
const modulesContainer = document.getElementById('modules-list');
const identityContainer = document.getElementById('identity-chips');

pasos.forEach((paso, index) => {
    const div = document.createElement('div');
    div.className = index === 1 ? 'step active' : 'step';
    div.textContent = `${index + 1}. ${paso}`;
    stepsContainer.appendChild(div);
});

modulos.forEach((modulo, index) => {
    const div = document.createElement('div');
    div.className = 'module-card';

    div.innerHTML = `
    <small>Módulo ${index + 1}</small>
    <h4>${modulo.titulo}</h4>
    <p>${modulo.descripcion}</p>
  `;

    modulesContainer.appendChild(div);
});

identidades.forEach(item => {
    const span = document.createElement('span');
    span.textContent = item;
    identityContainer.appendChild(span);
});

// =======================
// 🌎 PROVINCIAS Y CANTONES
// =======================
const provinciaSelect = document.getElementById('provincia');
const cantonSelect = document.getElementById('canton');
const parroquiaSelect = document.getElementById('parroquia');

async function cargarProvincias() {
    try {
        const res = await fetch(`${BASE_URL}/provincias`);
        const data = await res.json();

        provinciaSelect.innerHTML = '<option value="">Seleccione...</option>';

        data.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nombre;
            provinciaSelect.appendChild(opt);
        });

    } catch {
        console.warn('No se cargaron provincias');
    }
}

async function cargarCantones() {
    const provinciaId = provinciaSelect.value;

    cantonSelect.innerHTML = '<option value="">Seleccione...</option>';
    parroquiaSelect.innerHTML = '<option value="">Seleccione cantón primero</option>';

    if (!provinciaId) return;

    try {
        const res = await fetch(`${BASE_URL}/cantones/${provinciaId}`);
        const data = await res.json();

        data.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.nombre;
            cantonSelect.appendChild(opt);
        });

    } catch {
        console.warn('No se cargaron cantones');
    }
}

async function cargarParroquias() {
    const cantonId = cantonSelect.value;

    parroquiaSelect.innerHTML = '<option value="">Seleccione...</option>';

    if (!cantonId) return;

    try {
        const res = await fetch(`${BASE_URL}/parroquias/${cantonId}`);
        const data = await res.json();

        data.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nombre;
            parroquiaSelect.appendChild(opt);
        });

    } catch {
        console.warn('No se cargaron parroquias');
    }
}

provinciaSelect.addEventListener('change', cargarCantones);
cantonSelect.addEventListener('change', cargarParroquias);
cargarProvincias();

const nacionalidadSelect = document.getElementById('nacionalidad');

async function cargarNacionalidades() {
    try {
        const res = await fetch(`${BASE_URL}/nacionalidades`);
        const data = await res.json();

        nacionalidadSelect.innerHTML = '<option value="">Seleccione...</option>';

        data.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.gentilicio;
            // Ecuador seleccionado por defecto
            if (p.id === 53) {
                opt.selected = true;
            }
            nacionalidadSelect.appendChild(opt);
        });

    } catch {
        console.warn('No se cargaron la nacionalidades');
    }
}

cargarNacionalidades();

// funcion para hacer que los chips se puedan seleccionar
// Seleccionamos todos los grupos de botones
document.querySelectorAll('.group-bottons').forEach(group => {
    const spans = group.querySelectorAll('span');

    spans.forEach(span => {
        span.addEventListener('click', () => {
            // Quitamos la clase 'selected' de todos los hermanos dentro del mismo grupo
            spans.forEach(s => s.classList.remove('selected'));

            // Se la ponemos al que clicamos
            span.classList.add('selected');

            // Aquí puedes capturar el valor para tu backend
            console.log("Valor seleccionado:", span.innerText);
        });
    });
});

// validar cedula ingresada 
const cedulaInput = document.getElementById('cedula');
const cedulaStatus = document.getElementById('cedulaStatus');

cedulaInput.addEventListener('input', async () => {
    let cedula = cedulaInput.value.replace(/\D/g, '');
    cedulaInput.value = cedula;
    cedulaValida = false;

    if (cedula.length === 0) {
        cedulaStatus.textContent = '';
        return;
    }

    if (cedula.length < 10) {
        cedulaStatus.textContent = 'La cédula debe tener 10 dígitos';
        cedulaStatus.style.color = 'orange';
        return;
    }

    try {
        cedulaStatus.textContent = 'Validando... ⏳';

        const res = await fetch(`${BASE_URL}/inscripciones/cedula/${cedula}`);
        const data = await res.json();

        if (data.exists) {
            cedulaStatus.textContent = '❌ Cédula ya registrada';
            cedulaStatus.style.color = 'red';
            cedulaValida = false;
        } else {
            cedulaStatus.textContent = '✅ Cédula válida';
            cedulaStatus.style.color = 'lightgreen';
            cedulaValida = true;
        }

    } catch {
        cedulaStatus.textContent = '⚠️ Error validando cédula';
    }
});


// validar número de teléfono Ecuador
const celularInput = document.getElementById('celular');
const celularStatus = document.getElementById('celularStatus');

let celularValido = false;

celularInput.addEventListener('input', () => {

    // solo números
    let celular = celularInput.value.replace(/\D/g, '');

    // máximo 10 dígitos
    celular = celular.slice(0, 10);

    celularInput.value = celular;

    celularValido = false;

    if (celular.length === 0) {
        celularStatus.textContent = '';
        return;
    }

    // validar que empiece por 09
    if (!celular.startsWith('09')) {
        celularStatus.textContent = 'El número debe iniciar con 09';
        celularStatus.style.color = 'red';
        return;
    }

    // validar longitud
    if (celular.length < 10) {
        celularStatus.textContent = 'El número debe tener 10 dígitos';
        celularStatus.style.color = 'orange';
        return;
    }

    celularStatus.textContent = '✅ Número válido';
    celularStatus.style.color = 'lightgreen';
    celularValido = true;
});

//discapacidad boton
const discapacidadSelect = document.getElementById('discapacidad');
const tipoDiscapacidadContainer = document.getElementById('tipoDiscapacidadContainer');
const tipoDiscapacidadInput = document.getElementById('tipoDiscapacidad');

function mostrarTipoDiscapacidad() {
    const valor = discapacidadSelect.value.trim().toLowerCase();

    if (valor === 'si' || valor === 'sí') {
        tipoDiscapacidadContainer.style.display = 'block';
        tipoDiscapacidadInput.required = true;
    } else {
        tipoDiscapacidadContainer.style.display = 'none';
        tipoDiscapacidadInput.required = false;
        tipoDiscapacidadInput.value = '';
    }
}

discapacidadSelect.addEventListener('change', mostrarTipoDiscapacidad);

// por si ya viene seleccionado en Sí al cargar
mostrarTipoDiscapacidad();


//mandar formulario al backend
// 1. Control del botón y términos
const checkTerminos = document.getElementById("aceptoTerminos");
const btnContinuar = document.querySelector(".primary");

// Estado inicial
btnContinuar.disabled = true;
btnContinuar.style.opacity = "0.5";
btnContinuar.style.cursor = "not-allowed";

checkTerminos.addEventListener("change", (e) => {
    btnContinuar.disabled = !e.target.checked;
    btnContinuar.style.opacity = e.target.checked ? "1" : "0.5";
    btnContinuar.style.cursor = e.target.checked ? "pointer" : "not-allowed";
});

// 2. Función de envío (UNA SOLA VEZ)
btnContinuar.addEventListener("click", async (e) => {
    e.preventDefault();

    // Helpers para extraer datos
    const val = (id) => document.getElementById(id)?.value?.trim() || "";
    const chipVal = (id) => document.querySelector(`${id} .selected`)?.innerText || "";

    const data = {
        cedula: val("cedula"),
        nombres: val("nombres"),
        apellidos: val("apellidos"),
        correo: val("correo"),
        celular: val("celular"),
        fechaNacimiento: val("fechaNac").split("/").reverse().join("-"),
        ocupacion: chipVal("#ocupacion-chips"),
        institucion: val("institucion"),
        parroquiaId: parseInt(val("parroquia")) || 0,
        barrio: val("barrio"),
        genero: val("genero"),
        orientacionSexual: val("orientacionSexual"),
        nacionalidadId: parseInt(val("nacionalidad")) || 0,
        autoidentificacion: chipVal("#identity-chips"),
        discapacidad: val("discapacidad") === "Si",
        tipoDiscapacidad: val("discapacidad") === "Si" ? val("tipoDiscapacidad") : null,
        nivelEducacion: val("nivelEducacion")
    };

    if (!data.cedula || !data.correo) {
        return alert("Por favor, complete los campos obligatorios (*)");
    }

    if (data.discapacidad && !data.tipoDiscapacidad) {

        tipoDiscapacidadStatus.textContent = 'Debe escribir el tipo de discapacidad';
        tipoDiscapacidadStatus.style.color = 'red';

        document.getElementById('tipoDiscapacidad').focus();

        return;
    }
    try {
        btnContinuar.disabled = true;
        btnContinuar.innerText = "Enviando...";

        const response = await fetch(`${BASE_URL}/inscripciones`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        let result = {};

        try {
            result = await response.json();
        } catch {
            result = {};
        }

        if (response.ok) {
            document.querySelectorAll(".content > .section")
                .forEach(section => section.style.display = "none");

            document.querySelector(".form-card").style.display = "block";
            document.querySelector(".consent-text").style.display = "none";
            document.querySelector(".checkbox-line").style.display = "none";
            document.querySelector(".actions").style.display = "none";
            document.querySelector(".form-card > h2").style.display = "none";

            document.getElementById("successCard").style.display = "block";

            document.getElementById("successCard").scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        } else {
            alert(result.message || "No se pudo guardar la inscripción.");
            btnContinuar.disabled = false;
            btnContinuar.innerText = "Continuar";
        }

    } catch {
        alert("No se pudo completar el registro. Intente nuevamente.");
        btnContinuar.disabled = false;
        btnContinuar.innerText = "Continuar";
    }
});

