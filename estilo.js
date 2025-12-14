// Variables de estado
let algoritmoActual = '';
let tipoDatoActual = '';
let listaEntrada;
let retroalimentacion;
let resultadoDiv;
let pasosDiv;
let intervaloPasos = null;

// Inicializar referencias al DOM
document.addEventListener('DOMContentLoaded', () => {
    listaEntrada = document.getElementById('lista-entrada');
    retroalimentacion = document.getElementById('retroalimentacion-entrada');
    resultadoDiv = document.getElementById('resultado-ordenado');
    pasosDiv = document.getElementById('pasos-ordenamiento');
    mostrarSeccion('menu-principal');
});

// Función para cambiar de sección
function mostrarSeccion(idSeccion) {
    document.querySelectorAll('main > section').forEach(seccion => {
        seccion.classList.add('hidden');
    });
    document.getElementById(idSeccion).classList.remove('hidden');
}

// 1. Selecciona el Algoritmo
function seleccionarAlgoritmo(alg) {
    algoritmoActual = alg;
    document.getElementById('nombre-algoritmo').textContent = alg.charAt(0).toUpperCase() + alg.slice(1);
    mostrarSeccion('seleccion-tipo-dato');
}

// 2. Selecciona el Tipo de Dato
function seleccionarTipoDato(tipo) {
    tipoDatoActual = tipo;
    document.getElementById('nombre-alg-interfaz').textContent = algoritmoActual.charAt(0).toUpperCase() + algoritmoActual.slice(1);
    document.getElementById('nombre-tipo').textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1);

    listaEntrada.value = '';
    retroalimentacion.textContent = '';
    resultadoDiv.textContent = 'Esperando entrada...';
    pasosDiv.textContent = 'Esperando pasos...';

    mostrarSeccion('interfaz-ordenamiento');
}

// Restringe la entrada según el tipo de dato
function restringirEntrada(evento) {
    if (!tipoDatoActual) return;

    const textarea = evento.target;
    let valor = textarea.value;
    let nuevoValor = '';
    const patronNumerico = /[0-9,\s-]/;
    const patronAlfabetico = /[a-zA-ZáéíóúÁÉÍÓÚñÑ,\s]/;

    for (let i = 0; i < valor.length; i++) {
        const caracter = valor[i];
        let esValido = tipoDatoActual === 'numerico' ?
            patronNumerico.test(caracter) :
            patronAlfabetico.test(caracter);

        if (esValido) {
            nuevoValor += caracter;
        }
    }

    textarea.value = nuevoValor;
}

// Maneja las teclas presionadas
function manejarTecla(evento) {
    if (!tipoDatoActual) return;

    const tecla = evento.key;
    const esTeclaControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(tecla) || evento.ctrlKey || evento.metaKey;

    if (esTeclaControl || tecla === ',' || tecla === ' ') return;

    let esValido = false;
    if (tipoDatoActual === 'numerico') {
        esValido = /[0-9-]/.test(tecla);
    } else if (tipoDatoActual === 'alfabetico') {
        esValido = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(tecla);
    }

    if (!esValido) {
        evento.preventDefault();
    }
}

// Función de comparación genérica
function comparar(a, b, orden) {
    const esAlfabetico = typeof a === 'string' && typeof b === 'string';
    if (esAlfabetico) {
        const cmp = a.localeCompare(b, 'es', { sensitivity: 'variant', caseFirst: 'upper' });
        return orden === 'ascendente' ? cmp > 0 : cmp < 0;
    }
    return orden === 'ascendente' ? a > b : a < b;
}

// Renderiza los pasos del algoritmo de forma animada
function renderizarPasosAnimados(pasos) {
    if (intervaloPasos) {
        clearInterval(intervaloPasos);
        intervaloPasos = null;
    }
    pasosDiv.innerHTML = '';

    if (!pasos || pasos.length === 0) {
        pasosDiv.textContent = 'Sin pasos disponibles.';
        return;
    }

    const fragment = document.createDocumentFragment();
    pasos.forEach(texto => {
        const linea = document.createElement('div');
        linea.className = 'paso-item';
        linea.textContent = texto;
        fragment.appendChild(linea);
    });
    pasosDiv.appendChild(fragment);

    const items = Array.from(pasosDiv.querySelectorAll('.paso-item'));
    let idx = 0;

    intervaloPasos = setInterval(() => {
        const prev = pasosDiv.querySelector('.paso-item.destacado');
        if (prev) prev.classList.remove('destacado');

        if (idx < items.length) {
            const item = items[idx];
            item.classList.add('mostrar', 'destacado');
            pasosDiv.scrollTop = pasosDiv.scrollHeight;
            idx++;
        } else {
            clearInterval(intervaloPasos);
            intervaloPasos = null;
        }
    }, 450);
}

// Ordena la lista según el algoritmo y orden seleccionados
function ordenarLista(orden) {
    const entrada = listaEntrada.value.trim();
    let elementos = entrada.split(',').map(item => item.trim()).filter(item => item.length > 0);
    let resultadoFinal = [];
    let pasos = [];

    if (elementos.length === 0) {
        resultadoDiv.textContent = 'Error: Por favor, ingresa elementos.';
        return;
    }

    let arr = [];
    if (tipoDatoActual === 'numerico') {
        const numeros = elementos.map(Number);
        if (numeros.some(n => isNaN(n))) {
            resultadoDiv.textContent = 'Error: ¡Asegúrate de ingresar solo números válidos!';
            return;
        }
        arr = numeros;
    } else if (tipoDatoActual === 'alfabetico') {
        arr = elementos;
    }

    switch (algoritmoActual) {
        case 'seleccion':
            ({ resultado: resultadoFinal, pasos } = ordenamientoSeleccion(arr, orden));
            break;
        case 'burbuja':
            ({ resultado: resultadoFinal, pasos } = ordenamientoBurbuja(arr, orden));
            break;
        case 'insercion':
            ({ resultado: resultadoFinal, pasos } = ordenamientoInsercion(arr, orden));
            break;
    }

    resultadoDiv.textContent = resultadoFinal.join(', ');
    renderizarPasosAnimados(pasos);
}

// Algoritmo de ordenamiento por selección
function ordenamientoSeleccion(arr, orden) {
    const n = arr.length;
    const nuevoArr = [...arr];
    const pasos = [];
    pasos.push(`Estado inicial: [${nuevoArr.join(', ')}]`);

    for (let i = 0; i < n - 1; i++) {
        let indiceExtremo = i;
        for (let j = i + 1; j < n; j++) {
            if (comparar(nuevoArr[indiceExtremo], nuevoArr[j], orden)) {
                indiceExtremo = j;
            }
        }

        if (indiceExtremo !== i) {
            [nuevoArr[i], nuevoArr[indiceExtremo]] = [nuevoArr[indiceExtremo], nuevoArr[i]];
            pasos.push(`Intercambio en posición ${i} y ${indiceExtremo}: [${nuevoArr.join(', ')}]`);
        }
    }
    pasos.push(`Resultado final: [${nuevoArr.join(', ')}]`);
    return { resultado: nuevoArr, pasos };
}

// Algoritmo de ordenamiento burbuja
function ordenamientoBurbuja(arr, orden) {
    const n = arr.length;
    const nuevoArr = [...arr];
    let intercambiado;
    const pasos = [];
    pasos.push(`Estado inicial: [${nuevoArr.join(', ')}]`);

    for (let i = 0; i < n - 1; i++) {
        intercambiado = false;
        for (let j = 0; j < n - 1 - i; j++) {
            if (comparar(nuevoArr[j], nuevoArr[j + 1], orden)) {
                [nuevoArr[j], nuevoArr[j + 1]] = [nuevoArr[j + 1], nuevoArr[j]];
                intercambiado = true;
                pasos.push(`Intercambio en posiciones ${j} y ${j + 1}: [${nuevoArr.join(', ')}]`);
            }
        }
        if (!intercambiado) break;
    }
    pasos.push(`Resultado final: [${nuevoArr.join(', ')}]`);
    return { resultado: nuevoArr, pasos };
}

// Algoritmo de ordenamiento por inserción
function ordenamientoInsercion(arr, orden) {
    const n = arr.length;
    const nuevoArr = [...arr];
    const pasos = [];
    pasos.push(`Estado inicial: [${nuevoArr.join(', ')}]`);

    for (let i = 1; i < n; i++) {
        let actual = nuevoArr[i];
        let j = i - 1;

        while (j >= 0 && comparar(nuevoArr[j], actual, orden)) {
            nuevoArr[j + 1] = nuevoArr[j];
            j--;
        }

        nuevoArr[j + 1] = actual;
        pasos.push(`Inserta ${actual} en posición ${j + 1}: [${nuevoArr.join(', ')}]`);
    }
    pasos.push(`Resultado final: [${nuevoArr.join(', ')}]`);
    return { resultado: nuevoArr, pasos };
}

