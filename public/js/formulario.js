
const BASE_URL = 'http://127.0.0.1:3000';

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

// =======================
// 🔥 VALIDACIÓN CÉDULA
// =======================
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

// =======================
// 🔁 DISCAPACIDAD
// =======================
function toggleDiscapacidad() {
    const val = document.getElementById('discapacidad').value;
    const wrap = document.getElementById('tipoDiscapacidadWrap');

    if (val === 'true') {
        wrap.style.display = 'block';
    } else {
        wrap.style.display = 'none';
    }
}

// =======================
// 🌎 PROVINCIAS Y CANTONES
// =======================
const provinciaSelect = document.getElementById('provincia');
const cantonSelect = document.getElementById('canton');

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

provinciaSelect.addEventListener('change', cargarCantones);
cargarProvincias();

// =======================
// 🛠 UTILIDADES
// =======================
function getVal(id) {
    return (document.getElementById(id)?.value || '').trim();
}

function clearErrors() {
    REQUIRED_IDS.forEach(id => {
        document.getElementById(id)?.classList.remove('error');
    });
}

function validate() {
    if (!cedulaValida) {
        document.getElementById('cedula').classList.add('error');
        return false;
    }

    let first = null;

    REQUIRED_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el && !getVal(id)) {
            el.classList.add('error');
            if (!first) first = el;
        }
    });

    if (first) {
        first.focus();
        return false;
    }

    return true;
}

// =======================
// 🧾 RESUMEN
// =======================
function buildResumen() {
    const discval = getVal('discapacidad');
    const tipoDisc = discval === 'true' ? getVal('tipoDiscapacidad') || 'Sí' : 'No';

    const data = [
        ['Cédula', getVal('cedula')],
        ['Nombres', getVal('nombres')],
        ['Apellidos', getVal('apellidos')],
        ['Correo', getVal('correo')],
        ['Celular', getVal('celular')],
        ['Fecha', getVal('fechaNac')],
        ['Ocupación', getVal('ocupacion')],
        ['Institución', getVal('institucion')],
        ['Provincia', provinciaSelect.options[provinciaSelect.selectedIndex]?.text],
        ['Cantón', cantonSelect.options[cantonSelect.selectedIndex]?.text],
        ['Parroquia', getVal('parroquia')],
        ['Barrio', getVal('barrio')],
        ['Género', getVal('genero')],
        ['Orientación Sexual', getVal('orientacion')],
        ['Nacionalidad', getVal('nacionalidad')],
        ['Discapacidad', tipoDisc],
        ['Nivel educación', getVal('nivelEdu')]
    ];

    document.getElementById('resumen').innerHTML =
        data.map(([k, v]) => `
      <div class="review-row">
        <span class="review-key">${k}</span>
        <span class="review-val">${v || '-'}</span>
      </div>
    `).join('');
}

// =======================
// ➡️ PASOS
// =======================
function goNext() {
    if (currentStep === 1) {
        clearErrors();
        if (!validate()) return;
        currentStep = 2;
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        document.getElementById('tab1').className = 'step-tab done';
        document.getElementById('tab2').className = 'step-tab active';
        document.getElementById('btnBack').style.display = '';
        document.getElementById('btnNext').innerHTML = `Confirmar y enviar <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        document.getElementById('progText').textContent = 'Paso 2 de 2';
        buildResumen();
    } else if (currentStep === 2) {
        enviarFormulario();
    }
}

// =======================
// 📩 ENVÍO
// =======================
async function enviarFormulario() {
    const btnNext = document.getElementById('btnNext');
    btnNext.disabled = true;
    btnNext.textContent = 'Enviando...';

    const discapacidadVal = getVal('discapacidad');
    const tipo = getVal('tipoDiscapacidad');

    const payload = {
        cedula: getVal('cedula'),
        nombres: getVal('nombres'),
        apellidos: getVal('apellidos'),
        correo: getVal('correo'),
        celular: getVal('celular'),
        fechaNacimiento: new Date(getVal('fechaNac')).toISOString(),
        ocupacion: getVal('ocupacion'),
        institucion: getVal('institucion'),
        provinciaId: Number(provinciaSelect.value),
        cantonId: Number(cantonSelect.value),
        parroquia: getVal('parroquia'),
        barrio: getVal('barrio'),
        genero: getVal('genero'),
        orientacionSexual: getVal('orientacion'),
        nacionalidad: getVal('nacionalidad'),
        autoidentificacion: getVal('autoidentificacion'),
        discapacidad: discapacidadVal === 'true',
        tipoDiscapacidad: discapacidadVal === 'true' ? tipo.trim() : null,
        nivelEducacion: getVal('nivelEdu'),
    };

    try {
        console.log('PAYLOAD QUE SE ENVÍA:', payload);
        const res = await fetch(`${BASE_URL}/inscripciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Error del servidor');

        currentStep = 3;
        document.getElementById('step2').style.display = 'none';
        document.getElementById('tab2').className = 'step-tab done';
        document.getElementById('tab3').className = 'step-tab active';
        document.getElementById('footerBar').style.display = 'none';
        const folio = result.folio || result.id || ('PRE-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000));
        document.getElementById('folioNum').textContent = folio;
        document.getElementById('step3').style.display = 'flex';

    } catch (error) {
        btnNext.disabled = false;
        btnNext.innerHTML = `Confirmar y enviar <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        let errBox = document.getElementById('submitError');
        if (!errBox) {
            errBox = document.createElement('div');
            errBox.id = 'submitError';
            errBox.style.cssText = 'background:rgba(255,100,100,0.15);border:1px solid rgba(255,100,100,0.4);border-radius:10px;padding:0.75rem 1rem;font-size:0.83rem;color:rgba(255,180,180,1);margin-bottom:1rem';
            document.getElementById('resumen').before(errBox);
        }
        errBox.textContent = '❌ ' + (error.message || 'Error al guardar. Intente de nuevo.');
    }
}


// =======================
// ⬅️ REGRESAR
// =======================
function goBack() {
    if (currentStep === 2) {
        currentStep = 1;
        const errBox = document.getElementById('submitError');
        if (errBox) errBox.remove();
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step1').style.display = 'block';
        document.getElementById('tab1').className = 'step-tab active';
        document.getElementById('tab2').className = 'step-tab';
        document.getElementById('btnBack').style.display = 'none';
        document.getElementById('btnNext').innerHTML = `Continuar <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
        document.getElementById('progText').textContent = 'Paso 1 de 2';
    }
}

// Quitar error al escribir
REQUIRED_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => el.classList.remove('error'));
});

// =======================
// 🔄 NUEVA INSCRIPCIÓN
// =======================
function nuevaInscripcion() {
    // Resetear todos los campos
    REQUIRED_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ''; el.classList.remove('error'); }
    });
    document.getElementById('barrio').value = '';
    document.getElementById('tipoDiscapacidad').value = '';
    document.getElementById('tipoDiscapacidadWrap').style.display = 'none';
    document.getElementById('cedulaStatus').textContent = '';
    cedulaValida = false;
    currentStep = 1;

    // Volver al paso 1
    document.getElementById('step3').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    document.getElementById('tab1').className = 'step-tab active';
    document.getElementById('tab2').className = 'step-tab';
    document.getElementById('tab3').className = 'step-tab';
    document.getElementById('footerBar').style.display = 'flex';
    document.getElementById('btnBack').style.display = 'none';
    document.getElementById('btnNext').innerHTML = `Continuar <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
    document.getElementById('progText').textContent = 'Paso 1 de 2';

    // Recargar provincias
    cargarProvincias();

}
