// ==========================
// Variables principales
// ==========================
let history = [];

// ==========================
// Función para convertir texto (ejemplo simple)
// ==========================
function convertText() {
    const input = document.getElementById("inputText").value.trim();
    if (!input) {
        alert("Por favor ingresa un texto para convertir.");
        return;
    }

    // Ejemplo de conversión: texto en mayúsculas
    const converted = input.toUpperCase();

    // Mostrar resultado
    document.getElementById("resultOutput").textContent = converted;

    // Agregar al historial
    addToHistory(input, converted);
}

// ==========================
// Función para agregar al historial
// ==========================
function addToHistory(original, result) {
    const timestamp = new Date().toLocaleString();
    const entry = { original, result, timestamp };
    history.unshift(entry); // agregar al inicio

    // Actualizar interfaz
    updateHistoryUI();
}

// ==========================
// Función para actualizar historial en el DOM
// ==========================
function updateHistoryUI() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    if (history.length === 0) {
        const li = document.createElement("li");
        li.className = "no-history";
        li.textContent = "No hay historial todavía.";
        historyList.appendChild(li);
        return;
    }

    history.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "history-item";
        li.innerHTML = `<strong>${item.original}</strong> → ${item.result} <span style="font-size:0.75rem; color:#6b7280;">(${item.timestamp})</span>`;
        historyList.appendChild(li);
    });
}

// ==========================
// Botones de evaluación
// ==========================
function markSatisfactory() {
    alert("Marcado como satisfactorio ✅");
}
function markImprove() {
    alert("Marcado para mejorar ⚠️");
}
function addPattern() {
    alert("Nuevo patrón agregado 🟢");
}

// ==========================
// Funciones de manejo de JSON
// ==========================
function loadJSON() {
    const fileInput = document.getElementById("jsonFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Selecciona un archivo JSON primero.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            console.log("JSON cargado:", data);
            alert("Archivo JSON cargado correctamente ✅");
        } catch (err) {
            alert("Error al leer el archivo JSON ❌");
        }
    };
    reader.readAsText(file);
}

// ==========================
// Funciones de historial
// ==========================
function clearHistory() {
    if (confirm("¿Seguro que quieres borrar todo el historial?")) {
        history = [];
        updateHistoryUI();
    }
}

function exportHistory() {
    if (history.length === 0) {
        alert("No hay historial para exportar.");
        return;
    }

    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "history.json";
    a.click();
    URL.revokeObjectURL(url);
}

// ==========================
// Reset del textarea
// ==========================
function resetInput() {
    document.getElementById("inputText").value = "";
    document.getElementById("resultOutput").textContent = "";
}

// ==========================
// Event listeners
// ==========================
document.getElementById("convertButton").addEventListener("click", convertText);
document.getElementById("satisfactoryBtn").addEventListener("click", markSatisfactory);
document.getElementById("improveBtn").addEventListener("click", markImprove);
document.getElementById("addPatternBtn").addEventListener("click", addPattern);
document.getElementById("loadButton").addEventListener("click", loadJSON);
document.getElementById("clearButton").addEventListener("click", clearHistory);
document.getElementById("exportButton").addEventListener("click", exportHistory);
document.getElementById("resetButton").addEventListener("click", resetInput);

// Inicializar historial vacío
updateHistoryUI();

