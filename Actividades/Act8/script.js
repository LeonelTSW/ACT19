class Calculator {
    constructor() {
        this.variablesInput = document.getElementById('variables');
        this.equationsInput = document.getElementById('equations');
        this.calculateButton = document.getElementById('calculate-btn');
        this.resultDiv = document.getElementById('result');
        
        this.init();
    }
    
    init() {
        this.calculateButton.addEventListener('click', () => this.calculate());
        this.variablesInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.calculate();
        });
        this.equationsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.calculate();
        });
    }
    
    parseVariables(variablesText) {
        const variables = {};
        const lines = variablesText.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            const parts = trimmedLine.split(',');
            
            for (const part of parts) {
                const trimmedPart = part.trim();
                if (!trimmedPart) continue;
                
                const assignmentMatch = trimmedPart.match(/^(\w+)\s*=\s*(.+)$/);
                if (assignmentMatch) {
                    const [, varName, value] = assignmentMatch;
                    try {
                        variables[varName.trim()] = this.evaluateExpression(value.trim(), variables);
                    } catch (error) {
                        throw new Error(`Error al evaluar la variable "${varName}": ${error.message}`);
                    }
                } else {
                    const varName = trimmedPart.trim();
                    if (varName && !variables.hasOwnProperty(varName)) variables[varName] = 0;
                }
            }
        }
        
        return variables;
    }
    
    evaluateExpression(expression, variables) {
        if (!/^[a-zA-Z0-9+\-*/().\s^]+$/.test(expression)) {
            throw new Error(`Expresión contiene caracteres no válidos: ${expression}`);
        }
        
        let processedExpression = expression.replace(/\^/g, '**');
        
        for (const [varName, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            processedExpression = processedExpression.replace(regex, value);
        }
        
        if (/[a-zA-Z]/.test(processedExpression)) {
            const undefinedVars = processedExpression.match(/[a-zA-Z]+/g);
            throw new Error(`Variables sin definir: ${undefinedVars.join(', ')}`);
        }
        
        try {
            return Function(`"use strict"; return (${processedExpression})`)();
        } catch (error) {
            throw new Error(`Error al evaluar: ${processedExpression}`);
        }
    }
    
    calculate() {
        try {
            const variablesText = this.variablesInput.value.trim();
            const equationsText = this.equationsInput.value.trim();
            
            if (!variablesText && !equationsText) {
                this.showResult('Por favor ingresa las variables y ecuaciones', 'error');
                return;
            }
            
            const variables = this.parseVariables(variablesText);
            
            const equations = equationsText.split('\n').filter(line => line.trim());
            const results = [];
            
            for (const equation of equations) {
                const trimmedEquation = equation.trim();
                if (!trimmedEquation) continue;
                
                const equationMatch = trimmedEquation.match(/^(\w+)\s*=\s*(.+)$/);
                if (equationMatch) {
                    const [, resultVar, expression] = equationMatch;
                    try {
                        const result = this.evaluateExpression(expression, variables);
                        variables[resultVar] = result;
                        results.push(`${resultVar} = ${result}`);
                    } catch (error) {
                        throw new Error(`Error en ecuación "${trimmedEquation}": ${error.message}`);
                    }
                } else {
                    try {
                        const result = this.evaluateExpression(trimmedEquation, variables);
                        results.push(`${trimmedEquation} = ${result}`);
                    } catch (error) {
                        throw new Error(`Error al evaluar "${trimmedEquation}": ${error.message}`);
                    }
                }
            }
            
            if (results.length === 0) {
                this.showResult('No se encontraron ecuaciones válidas para calcular', 'warning');
            } else {
                this.showResult(results.join('\n'), 'success');
            }
            
        } catch (error) {
            this.showResult(`Error: ${error.message}`, 'error');
        }
    }
    
    showResult(message, type = 'success') {
        this.resultDiv.textContent = message;
        this.resultDiv.classList.remove('result-success', 'result-error', 'result-warning');
        if (type !== 'success') this.resultDiv.classList.add(`result-${type}`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});
