
const BASE_URL = 'http://localhost:3000';

let currentStep = 1;
let cedulaValida = false;

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
            if (p.id === 83) {
                opt.selected = true;
            }
            nacionalidadSelect.appendChild(opt);
        });

    } catch {
        console.warn('No se cargaron la nacionalidades');
    }
}

cargarNacionalidades();

