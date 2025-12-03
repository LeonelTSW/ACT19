/* ---------- DATOS Y ESTADO ---------- */
let patternsData = null;
let conversionHistory = [];
let selectedFile = null;
let stats = {
    totalConversions: 0,
    satisfactoryConversions: 0,
    totalPatterns: 0,
    fileSize: 0,
    lastUpdate: null
};

// Patrones por defecto
const defaultPatterns = {
    "patterns": [
        {
            "id": 1,
            "natural": "La suma de {var1} y {var2}",
            "algebraic": "{var1} + {var2}",
            "category": "operaciones_basicas"
        },
        {
            "id": 2,
            "natural": "La resta de {var1} y {var2}",
            "algebraic": "{var1} - {var2}",
            "category": "operaciones_basicas"
        },
        {
            "id": 3,
            "natural": "El producto de {var1} por {var2}",
            "algebraic": "{var1} × {var2}",
            "category": "operaciones_basicas"
        },
        {
            "id": 4,
            "natural": "El cociente de {var1} sobre {var2}",
            "algebraic": "{var1} ÷ {var2}",
            "category": "operaciones_basicas"
        },
        {
            "id": 5,
            "natural": "La suma de los cuadrados de {var1} y {var2}",
            "algebraic": "{var1}^2 + {var2}^2",
            "category": "combinadas"
        }
    ]
};

/* ---------- INICIALIZACIÓN ---------- */
document.addEventListener('DOMContentLoaded', () => {
    patternsData = JSON.parse(JSON.stringify(defaultPatterns));
    stats.totalPatterns = patternsData.patterns.length;
    updateMetrics();
    setupEventListeners();
});

/* ---------- EVENT LISTENERS ---------- */
function setupEventListeners() {
    document.getElementById('convert-to-algebraic-btn').addEventListener('click', () => {
        convertNaturalToAlgebraic();
    });

    document.getElementById('convert-to-natural-btn').addEventListener('click', () => {
        convertAlgebraicToNatural();
    });

    document.getElementById('natural-satisfactory-btn').addEventListener('click', () => {
        markAsSatisfactory('natural');
    });
    document.getElementById('algebraic-satisfactory-btn').addEventListener('click', () => {
        markAsSatisfactory('algebraic');
    });

    document.getElementById('natural-improve-btn').addEventListener('click', () => {
        markForImprovement('natural');
    });
    document.getElementById('algebraic-improve-btn').addEventListener('click', () => {
        markForImprovement('algebraic');
    });

    document.getElementById('natural-add-pattern-btn').addEventListener('click', () => {
        showAddPatternDialog('natural');
    });
    document.getElementById('algebraic-add-pattern-btn').addEventListener('click', () => {
        showAddPatternDialog('algebraic');
    });

    document.getElementById('json-file-input').addEventListener('change', handleFileSelection);
    document.getElementById('load-json-btn').addEventListener('click', loadJSONFile);
    document.getElementById('reset-json-btn').addEventListener('click', resetToDefault);

    document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
    document.getElementById('export-history-btn').addEventListener('click', exportHistory);
}

/* ---------- UTILIDADES (regex builder y normalizadores) ---------- */

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Construye regex a partir de un patrón con {vars}.
 * Si isAlgebraic = false se permite flexibilidad en espacios (\s+).
 */
function buildRegexFromPattern(pattern, opts = { isAlgebraic: false }) {
    const varNames = [];
    let regex = '';
    let lastIndex = 0;
    const reVar = /\{(\w+)\}/g;
    let m;
    while ((m = reVar.exec(pattern)) !== null) {
        const before = pattern.slice(lastIndex, m.index);
        if (opts.isAlgebraic) {
            regex += escapeRegex(before);
        } else {
            regex += escapeRegex(before).replace(/\s+/g, '\\s+');
        }
        regex += '(.+?)'; // captura no codiciosa
        varNames.push(m[1]);
        lastIndex = reVar.lastIndex;
    }
    const after = pattern.slice(lastIndex);
    if (opts.isAlgebraic) {
        regex += escapeRegex(after);
    } else {
        regex += escapeRegex(after).replace(/\s+/g, '\\s+');
    }
    regex = '^\\s*' + regex + '\\s*$';
    return { regex, varNames };
}

/* Normaliza expresiones algebraicas para comparación */
function normalizeAlgebraicExpression(expr) {
    if (!expr || typeof expr !== 'string') return '';
    return expr
        .replace(/\s+/g, '')
        .replace(/²/g, '^2')
        .replace(/³/g, '^3')
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .toLowerCase();
}

/* ---------- COINCIDENCIAS Y SUSTITUCIÓN ---------- */

function matchNaturalPattern(input, pattern) {
    // construye regex permitiendo espacios flexibles
    const { regex, varNames } = buildRegexFromPattern(pattern, { isAlgebraic: false });
    const re = new RegExp(regex, 'i'); // insensible a mayúsculas
    const m = input.match(re);
    if (m) {
        const vars = {};
        for (let i = 0; i < varNames.length; i++) {
            vars[varNames[i]] = (m[i + 1] || '').trim();
        }
        return { isMatch: true, variables: vars };
    }
    return { isMatch: false, variables: {} };
}

function matchAlgebraicPattern(input, pattern) {
    // Normalizamos ambas (sin espacios) para que operadores coincidan
    const normalizedInput = normalizeAlgebraicExpression(input);
    const normalizedPattern = normalizeAlgebraicExpression(pattern);

    const { regex, varNames } = buildRegexFromPattern(normalizedPattern, { isAlgebraic: true });
    const re = new RegExp(regex, 'i');
    const m = normalizedInput.match(re);
    if (m) {
        const vars = {};
        for (let i = 0; i < varNames.length; i++) {
            vars[varNames[i]] = (m[i + 1] || '').trim();
        }
        return { isMatch: true, variables: vars };
    }
    return { isMatch: false, variables: {} };
}

function substituteVariables(template, variables) {
    let result = template;
    for (let [k, v] of Object.entries(variables)) {
        const re = new RegExp('\\{' + k + '\\}', 'g');
        result = result.replace(re, v);
    }
    return result;
}

/* ---------- CONVERSIONES (públicas) ---------- */

function processNaturalToAlgebraic(input) {
    if (!patternsData || !patternsData.patterns) return "Error: No hay patrones cargados.";
    const normalizedInput = input.trim();
    for (let pattern of patternsData.patterns) {
        const match = matchNaturalPattern(normalizedInput, pattern.natural);
        if (match.isMatch) {
            return substituteVariables(pattern.algebraic, match.variables);
        }
    }
    return "No se encontró un patrón coincidente. Considera agregar este caso a los patrones.";
}

function processAlgebraicToNatural(input) {
    if (!patternsData || !patternsData.patterns) return "Error: No hay patrones cargados.";
    for (let pattern of patternsData.patterns) {
        const match = matchAlgebraicPattern(input, pattern.algebraic);
        if (match.isMatch) {
            return substituteVariables(pattern.natural, match.variables);
        }
    }
    return "No se encontró un patrón coincidente. Considera agregar este caso a los patrones.";
}

/* ---------- INTERACCIÓN / UI ---------- */

function convertNaturalToAlgebraic() {
    const input = document.getElementById('natural-input').value.trim();
    if (!input) {
        showFeedback('Por favor, ingresa una expresión en lenguaje natural.', 'error');
        return;
    }
    const result = processNaturalToAlgebraic(input);
    displayResult('natural', input, result);
    stats.totalConversions++;
    addToHistory('natural-to-algebraic', input, result);
    updateMetrics();
}

function convertAlgebraicToNatural() {
    const input = document.getElementById('algebraic-input').value.trim();
    if (!input) {
        showFeedback('Por favor, ingresa una expresión algebraica.', 'error');
        return;
    }
    const result = processAlgebraicToNatural(input);
    displayResult('algebraic', input, result);
    stats.totalConversions++;
    addToHistory('algebraic-to-natural', input, result);
    updateMetrics();
}

function displayResult(column, input, result) {
    const resultSection = document.getElementById(`${column}-result`);
    const outputElement = document.getElementById(`${column}-output`);
    outputElement.textContent = result;
    resultSection.style.display = 'block';
}

function markAsSatisfactory(column) {
    stats.satisfactoryConversions++;
    updateMetrics();
    showFeedback('Marcado como satisfactorio', 'success');
    setTimeout(() => {
        document.getElementById(`${column}-result`).style.display = 'none';
    }, 1200);
}

function markForImprovement(column) {
    showFeedback('Marcado para mejora. Considera agregar un nuevo patrón.', 'warning');
}

function showAddPatternDialog(column) {
    // column === 'natural'  => user wrote natural, result is algebraic
    // column === 'algebraic' => user wrote algebraic, result is natural
    const inputFieldId = column === 'natural' ? 'natural-input' : 'algebraic-input';
    const inputValue = document.getElementById(inputFieldId).value.trim();
    const outputValue = document.getElementById(`${column}-output`).textContent.trim();

    const defaultNatural = column === 'natural' ? inputValue : outputValue;
    const defaultAlgebraic = column === 'natural' ? outputValue : inputValue;

    const newNatural = prompt('Expresión en lenguaje natural (con marcadores {var}):', defaultNatural || '');
    if (!newNatural) return;
    const newAlgebraic = prompt('Expresión algebraica (con marcadores {var}):', newNatural.includes('{var') ? defaultAlgebraic : '');
    if (!newAlgebraic) return;
    const category = prompt('Categoría (opcional):', 'personalizado') || 'personalizado';

    addNewPattern(newNatural, newAlgebraic, category);
}

function addNewPattern(natural, algebraic, category) {
    if (!patternsData) patternsData = { patterns: [] };
    const ids = patternsData.patterns.map(p => p.id || 0);
    const newId = ids.length ? Math.max(...ids) + 1 : 1;
    const newPattern = { id: newId, natural: natural.trim(), algebraic: algebraic.trim(), category: category || 'personalizado' };
    patternsData.patterns.push(newPattern);
    stats.lastUpdate = new Date().toLocaleString();
    stats.totalPatterns = patternsData.patterns.length;
    updateMetrics();
    showFeedback('Patrón agregado correctamente', 'success');
}

function showFeedback(message, type) {
    const toast = document.getElementById('feedback-toast');
    toast.textContent = message;
    toast.style.display = 'block';
    
    // Configura el color de fondo basado en el tipo
    if (type === 'success') {
        toast.style.backgroundColor = 'rgba(16, 185, 129, 0.8)'; // verde
    } else if (type === 'warning') {
        toast.style.backgroundColor = 'rgba(234, 179, 8, 0.8)'; // amarillo
    } else if (type === 'error') {
        toast.style.backgroundColor = 'rgba(220, 38, 38, 0.8)'; // rojo maldicion
    } else {
        toast.style.backgroundColor = 'rgba(75, 85, 99, 0.8)'; // gris
    }

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

/* ---------- HISTORIAL y METRICAS ---------- */

function addToHistory(type, input, output) {
    const entry = {
        id: Date.now(),
        type,
        input,
        output,
        timestamp: new Date().toLocaleString()
    };
    conversionHistory.unshift(entry); // último primero
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('conversion-history');
    container.innerHTML = '';
    if (!conversionHistory.length) {
        const p = document.createElement('p');
        p.className = 'no-history';
        p.textContent = 'No hay conversiones realizadas aún';
        container.appendChild(p);
        return;
    }
    for (let item of conversionHistory) {
        const div = document.createElement('div');
        div.style.borderBottom = '1px solid var(--gris-medio)';
        div.style.padding = '0.5rem 0';
        const title = document.createElement('div');
        title.style.fontSize = '0.95rem';
        title.style.color = 'var(--morado-claro)';
        title.style.marginBottom = '0.25rem';
        title.textContent = `${item.type.replace('-', ' → ')} • ${item.timestamp}`;
        const inp = document.createElement('div');
        inp.style.fontFamily = 'monospace';
        inp.style.fontSize = '0.9rem';
        inp.style.color = 'var(--blanco-hechizo)';
        inp.textContent = `Entrada: ${item.input}`;
        const out = document.createElement('div');
        out.style.fontFamily = 'monospace';
        out.style.fontSize = '0.95rem';
        out.style.color = 'var(--rojo-maldicion)';
        out.textContent = `Resultado: ${item.output}`;
        div.appendChild(title);
        div.appendChild(inp);
        div.appendChild(out);
        container.appendChild(div);
    }
}

function clearHistory() {
    if (!confirm('¿Seguro que quieres limpiar el historial?')) return;
    conversionHistory = [];
    renderHistory();
    showFeedback('Historial limpiado', 'success');
}

function exportHistory() {
    if (!conversionHistory.length) {
        showFeedback('No hay historial para exportar.', 'warning');
        return;
    }
    const dataStr = JSON.stringify(conversionHistory, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversion_history_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showFeedback('Historial exportado', 'success');
}

function updateMetrics() {
    document.getElementById('total-patterns').textContent = (patternsData && patternsData.patterns) ? patternsData.patterns.length : 0;
    document.getElementById('conversions-count').textContent = stats.totalConversions;
    const rate = stats.totalConversions ? Math.round((stats.satisfactoryConversions / stats.totalConversions) * 100) : 0;
    document.getElementById('satisfaction-rate').textContent = `${rate}%`;
    document.getElementById('last-update').textContent = stats.lastUpdate || '--';
    
    // Manejo de tamaño del archivo (solo si se cargó uno)
    document.getElementById('file-size').textContent = stats.fileSize ? `${(stats.fileSize / 1024).toFixed(2)} KB` : '0 KB';

    // avg complexity: promedio de palabras en la parte natural
    if (patternsData && patternsData.patterns && patternsData.patterns.length) {
        const totals = patternsData.patterns.reduce((acc, p) => {
            const cleaned = (p.natural || '').replace(/\{[^}]+\}/g, '').trim();
            const words = cleaned ? cleaned.split(/\s+/).filter(w => w.length > 0).length : 0;
            return acc + words;
        }, 0);
        const avg = (totals / patternsData.patterns.length).toFixed(1);
        document.getElementById('avg-complexity').textContent = avg;
    } else {
        document.getElementById('avg-complexity').textContent = 0;
    }
}

/* ---------- CARGA / RESET DE JSON ---------- */

function handleFileSelection(event) {
    const file = event.target.files[0];
    const fileNameElement = document.getElementById('file-name');
    const loadBtn = document.getElementById('load-json-btn');
    
    if (file) {
        selectedFile = file;
        fileNameElement.textContent = file.name;
        loadBtn.disabled = false;
        stats.fileSize = file.size;
    } else {
        selectedFile = null;
        fileNameElement.textContent = 'Ningún archivo seleccionado';
        loadBtn.disabled = true;
        stats.fileSize = 0;
    }
    updateMetrics();
}

function loadJSONFile() {
    if (!selectedFile) {
        showFeedback('Por favor, selecciona un archivo JSON.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedData = JSON.parse(e.target.result);
            if (!loadedData.patterns || !Array.isArray(loadedData.patterns)) {
                throw new Error("El archivo JSON no tiene la estructura de 'patterns' correcta.");
            }
            patternsData = loadedData;
            stats.totalPatterns = patternsData.patterns.length;
            stats.lastUpdate = new Date().toLocaleString();
            updateMetrics();
            showFeedback(`¡Patrones cargados! Total: ${stats.totalPatterns}`, 'success');
        } catch (error) {
            showFeedback(`Error al procesar el archivo: ${error.message}`, 'error');
        }
    };
    reader.onerror = () => {
        showFeedback('Error al leer el archivo.', 'error');
    };

    reader.readAsText(selectedFile);
}

function resetToDefault() {
    if (!confirm('¿Estás seguro de que quieres restablecer la base de datos a los patrones por defecto?')) return;
    
    patternsData = JSON.parse(JSON.stringify(defaultPatterns));
    stats.totalPatterns = patternsData.patterns.length;
    stats.fileSize = 0;
    stats.lastUpdate = new Date().toLocaleString();
    
    // Limpiar selección de archivo en la UI
    document.getElementById('json-file-input').value = '';
    document.getElementById('file-name').textContent = 'Ningún archivo seleccionado';
    document.getElementById('load-json-btn').disabled = true;
    selectedFile = null;
    
    updateMetrics();
    showFeedback('Patrones restablecidos a la configuración por defecto.', 'success');
}