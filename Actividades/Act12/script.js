class NumeroComplejo {
    constructor(real, imag = 0) {
        this.real = real;
        this.imag = imag;
    }

    sumar(otro) {
        return new NumeroComplejo(
            this.real + otro.real,
            this.imag + otro.imag
        );
    }

    multiplicar(otro) {
        return new NumeroComplejo(
            this.real * otro.real - this.imag * otro.imag,
            this.real * otro.imag + this.imag * otro.real
        );
    }

    toString() {
        if (this.imag === 0) {
            return this.real.toFixed(4).replace(/\.?0+$/, '');
        }
        
        const realStr = this.real.toFixed(4).replace(/\.?0+$/, '');
        const imagStr = Math.abs(this.imag).toFixed(4).replace(/\.?0+$/, '');
        
        if (this.real === 0) {
            return `${imagStr}i`;
        }
        
        const signo = this.imag >= 0 ? '+' : '-';
        return `${realStr}${signo}${imagStr}i`;
    }

    esReal() {
        return Math.abs(this.imag) < 1e-10;
    }
}

function parsearPolinomio(str) {
    str = str.trim().replace(/\s/g, '');
    const gradoMatch = str.match(/x\^(\d+)/g);
    let gradoMax = 1;
    
    if (gradoMatch) {
        gradoMax = Math.max(...gradoMatch.map(m => parseInt(m.match(/\d+/)[0])));
    } else if (str.includes('x')) {
        gradoMax = 1;
    } else {
        gradoMax = 0;
    }
    
    const coeficientes = new Array(gradoMax + 1).fill(null).map(() => new NumeroComplejo(0));
    str = str.replace(/([+-])\s*x/g, '$1 1x');
    str = str.replace(/^x/, '1x');
    const terminos = str.match(/[+-]?[^+-]+/g) || [];
    
    for (let termino of terminos) {
        termino = termino.trim();
        if (!termino) continue;
        
        let coef, grado;
        
        if (!termino.includes('x')) {
            coef = parsearComplejo(termino);
            grado = 0;
        } else if (termino.includes('x^')) {
            const partes = termino.split('x^');
            coef = partes[0] === '' || partes[0] === '+' ? new NumeroComplejo(1) :
                   partes[0] === '-' ? new NumeroComplejo(-1) :
                   parsearComplejo(partes[0]);
            grado = parseInt(partes[1]);
        } else {
            const partes = termino.split('x');
            coef = partes[0] === '' || partes[0] === '+' ? new NumeroComplejo(1) :
                   partes[0] === '-' ? new NumeroComplejo(-1) :
                   parsearComplejo(partes[0]);
            grado = 1;
        }
        
        const indice = gradoMax - grado;
        coeficientes[indice] = coeficientes[indice].sumar(coef);
    }
    
    return coeficientes;
}

function parsearComplejo(str) {
    str = str.trim().replace(/\s/g, '');
    
    if (!str.includes('i')) {
        return new NumeroComplejo(parseFloat(str));
    }

    str = str.replace(/i/g, '');
    let real = 0;
    let imag = 0;
    const regex = /([+-]?\d*\.?\d+)([+-]\d*\.?\d+)?/;
    const match = str.match(regex);

    if (match) {
        if (str.indexOf('+') > 0 || (str.indexOf('-') > 0 && str.indexOf('-') !== 0)) {
            const partes = str.split(/(?=[+-])/);
            real = parseFloat(partes[0]) || 0;
            imag = parseFloat(partes[1]) || 1;
        } else {
            imag = parseFloat(str) || 1;
        }
    }

    return new NumeroComplejo(real, imag);
}

function calcularDivision() {
    try {
        const polinomioStr = document.getElementById('polinomio').value;
        const raizStr = document.getElementById('raiz').value;

        if (!polinomioStr || !raizStr) {
            throw new Error('Por favor ingresa todos los datos');
        }

        const coeficientes = parsearPolinomio(polinomioStr);
        const raiz = parsearComplejo(raizStr);

        const resultado = divisionSintetica(coeficientes, raiz);
        mostrarResultado(resultado, coeficientes, raiz, polinomioStr);

    } catch (error) {
        document.getElementById('resultado').innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${error.message}
            </div>
        `;
        document.getElementById('resultado').classList.add('show');
    }
}

function divisionSintetica(coeficientes, raiz) {
    const n = coeficientes.length;
    const proceso = [];
    const resultado = [];

    proceso.push([...coeficientes]);
    proceso.push([new NumeroComplejo(0)]);
    
    resultado.push(coeficientes[0]);
    
    for (let i = 1; i < n; i++) {
        const producto = resultado[i - 1].multiplicar(raiz);
        proceso[1].push(producto);
        resultado.push(coeficientes[i].sumar(producto));
    }

    const cociente = resultado.slice(0, -1);
    const residuo = resultado[resultado.length - 1];

    return {
        proceso: proceso,
        resultado: resultado,
        cociente: cociente,
        residuo: residuo
    };
}

function mostrarResultado(resultado, coeficientes, raiz, polinomioOriginal) {
    let html = '<div class="result-title">Polinomio Original</div>';
    html += '<div style="text-align:center; font-size:1.2em; background:white; padding:12px; border:1px solid #ccc; border-radius:6px; margin-bottom:20px;">';
    html += '<strong>' + polinomioOriginal + '</strong>';
    html += '</div>';

    html += '<div class="result-title">Coeficientes Extraídos</div>';
    html += '<table class="process-table"><tr>';

    for (let i = 0; i < coeficientes.length; i++) {
        const exp = coeficientes.length - 1 - i;
        html += '<td><strong>' + (exp === 0 ? 'Término independiente' : exp === 1 ? 'x' : 'x^' + exp) + '</strong></td>';
    }

    html += '</tr><tr>';
    coeficientes.forEach(c => html += '<td>' + c.toString() + '</td>');
    html += '</tr></table>';

    html += '<div class="result-title">Proceso de División Sintética</div>';
    html += '<table class="process-table">';

    html += '<tr><td class="divisor-cell">Divisor: ' + raiz.toString() + '</td>';
    coeficientes.forEach(c => html += '<td>' + c.toString() + '</td>');
    html += '</tr>';

    html += '<tr><td class="divisor-cell">Multiplicar y bajar</td>';
    resultado.proceso[1].forEach(p => html += '<td>' + p.toString() + '</td>');
    html += '</tr>';

    html += '<tr><td class="divisor-cell">Resultado (sumar)</td>';
    resultado.resultado.forEach(r => html += '<td>' + r.toString() + '</td>');
    html += '</tr>';

    html += '</table>';

    html += '<div class="final-result">';
    html += '<p><strong>Cociente:</strong> ';

    let cocienteStr = '';
    for (let i = 0; i < resultado.cociente.length; i++) {
        const exp = resultado.cociente.length - 1 - i;
        const coef = resultado.cociente[i];
        
        if (coef.real !== 0 || coef.imag !== 0) {
            if (cocienteStr && (coef.real > 0 || coef.imag > 0)) cocienteStr += ' + ';
            cocienteStr += '(' + coef.toString() + ')';
            if (exp > 0) {
                cocienteStr += 'x' + (exp > 1 ? '<sup>' + exp + '</sup>' : '');
            }
        }
    }

    html += cocienteStr || '0';
    html += '</p>';

    html += '<p><strong>Residuo:</strong> ' + resultado.residuo.toString() + '</p>';

    if (resultado.residuo.esReal() && Math.abs(resultado.residuo.real) < 1e-10) {
        html += '<p>✓ La división es exacta (residuo = 0)</p>';
    }

    html += '</div>';

    document.getElementById('resultado').innerHTML = html;
    document.getElementById('resultado').classList.add('show');
}
