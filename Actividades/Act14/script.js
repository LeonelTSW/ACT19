function cleanString(str) {
    return str.replace(/\s+/g, '');
}

function resolverEcuacionParseada() {
    const ecuacionStr = document.getElementById('ecuacion').value;
    const resBox = document.getElementById('resDespejeParseado');
    const errorBox = document.getElementById('mensajeError');

    resBox.innerHTML = '';
    errorBox.innerText = '';

    try {
        const partes = ecuacionStr.split('=');
        if (partes.length !== 2) throw new Error("La ecuación debe contener '='");

        const ladoIzq = partes[0].trim();
        const ladoDer = partes[1].trim();

        const ecuacionFormateada = `(${ladoIzq}) - (${ladoDer})`;

        const nodo = math.parse(ecuacionFormateada);
        const simplificado = math.simplify(nodo);

        const coef = extraerCoeficientes(simplificado.toString());
        const solucion = -coef.b / coef.a;

        resBox.innerHTML = `
            <div class="formula-original"><strong>Ecuación Original:</strong> ${ecuacionStr}</div>
            <p><strong>Solución:</strong> x = ${solucion}</p>
            <p><strong>Ecuación Simplificada:</strong> ${simplificado.toString()} = 0</p>
        `;
    } catch (error) {
        errorBox.innerText = `Error: ${error.message}`;
    }
}

function extraerCoeficientes(ecuacion) {
    ecuacion = ecuacion.replace(/\s+/g, '');
    let a = 0;
    let b = 0;

    const regexX = /([+-]?\d*\.?\d*)\*?x/g;
    let match;
    while ((match = regexX.exec(ecuacion)) !== null) {
        let coef = match[1];
        if (coef === '' || coef === '+') coef = '1';
        if (coef === '-') coef = '-1';
        a += parseFloat(coef);
    }

    const sinX = ecuacion.replace(/[+-]?\d*\.?\d*\*?x/g, '');
    if (sinX) {
        try { b = math.evaluate(sinX); } catch { b = 0; }
    }

    return { a, b };
}

function extractVariables(formulaStr) {
    const matches = formulaStr.match(/[a-zA-Z][a-zA-Z0-9]*/g);
    if (!matches) return [];
    return Array.from(new Set(matches));
}

function procesarFormulaLiteral() {
    const formulaStr = document.getElementById('formulaLiteral').value;
    const resBox = document.getElementById('resFormulaLiteral');
    const errorBox = document.getElementById('mensajeErrorFormula');

    resBox.innerHTML = '';
    errorBox.innerText = '';

    try {
        const partes = formulaStr.split('=');
        if (partes.length !== 2) throw new Error("La fórmula debe contener '='");

        const ladoIzq = partes[0].trim();
        const ladoDer = partes[1].trim();

        const variables = extractVariables(formulaStr);
        if (variables.length < 2) throw new Error("Debe haber al menos 2 variables");

        let html = `
            <div class="formula-original"><strong>Fórmula Original:</strong> ${formulaStr}</div>
            <p><strong>Variables detectadas:</strong> ${variables.join(', ')}</p>
            <table>
                <thead>
                    <tr><th>Variable</th><th>Despeje</th></tr>
                </thead>
                <tbody>
        `;

        for (const variable of variables) {
            let despeje = `${variable} = ${despejarVariable(ladoDer, variable, ladoIzq)}`;
            if (ladoIzq === variable) despeje = `${variable} = ${ladoDer}`;

            html += `
                <tr>
                    <td><strong>${variable}</strong></td>
                    <td><pre>${despeje}</pre></td>
                </tr>
            `;
        }

        html += `</tbody></table>`;

        resBox.innerHTML = html;

    } catch (error) {
        errorBox.innerText = `Error: ${error.message}`;
    }
}
