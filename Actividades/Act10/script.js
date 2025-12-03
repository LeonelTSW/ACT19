// Código JavaScript igual que tu ACT 10
// Variables globales
let historialCalculos = [];

// Elementos del DOM
const btnCalcular = document.getElementById('calcular');
const selectTipo = document.getElementById('tipo');
const selectModo = document.getElementById('modo');
const inputA = document.getElementById('valor-a');
const inputB = document.getElementById('valor-b');
const btnLimpiarHistorial = document.getElementById('limpiar-historial');

// Elementos de resultados
const expresionOriginal = document.getElementById('expresion-original');
const formula = document.getElementById('formula');
const desarrollo = document.getElementById('desarrollo');
const expandida = document.getElementById('expandida');
const resultadoNumerico = document.getElementById('resultado-numerico');
const verificacion = document.getElementById('verificacion');
const canvas = document.getElementById('canvas-geometrico');
const descripcionGeometrica = document.getElementById('descripcion-geometrica');
const historial = document.getElementById('historial');

// Event Listeners
btnCalcular.addEventListener('click', calcular);
btnLimpiarHistorial.addEventListener('click', limpiarHistorial);
selectModo.addEventListener('change', actualizarPlaceholders);

// Cargar historial al iniciar
window.addEventListener('load', () => {
    cargarHistorial();
    mostrarHistorial();
});

function actualizarPlaceholders() {
    const modo = selectModo.value;
    if (modo === 'numerico') {
        inputA.placeholder = 'Ej: 3';
        inputB.placeholder = 'Ej: 2';
        inputA.value = '3';
        inputB.value = '2';
    } else {
        inputA.placeholder = 'Ej: 3x';
        inputB.placeholder = 'Ej: 5y';
        inputA.value = '3x';
        inputB.value = '5y';
    }
}

// Función principal de cálculo
function calcular() {
    const tipo = selectTipo.value;
    const modo = selectModo.value;
    const a = inputA.value.trim();
    const b = inputB.value.trim();

    if (!a || !b) {
        alert('Por favor ingresa valores en ambos campos');
        return;
    }

    try {
        let resultado;
        if (modo === 'numerico') resultado = calcularNumerico(tipo, a, b);
        else resultado = calcularAlgebraico(tipo, a, b);

        mostrarResultados(resultado);
        if (modo === 'numerico') dibujarGeometria(tipo, parseFloat(a), parseFloat(b), resultado);
        else limpiarCanvas();

        agregarAlHistorial(resultado);
    } catch (error) {
        alert('Error en el cálculo: ' + error.message);
        console.error(error);
    }
}

// ... (aquí puedes copiar todas las funciones de cálculo de tu ACT 10 sin cambios)
