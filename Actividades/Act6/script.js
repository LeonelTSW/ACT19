function calcular() {
    let a = parseFloat(document.getElementById("a").value);
    let b = parseFloat(document.getElementById("b").value);
    let c = parseFloat(document.getElementById("c").value);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
        document.getElementById("resultado").innerHTML = "Ingrese valores válidos.";
        return;
    }

    let expresion1 = (a + b) ** 2;
    let expresion2 = a ** 2 + 2 * a * b + b ** 2;

    let expresion3 = (a - b) ** 2;
    let expresion4 = a ** 2 - 2 * a * b + b ** 2;

    let expresion5 = (a + b) * (a - b);
    let expresion6 = a ** 2 - b ** 2;

    let fraccion = (a * b) / (c || 1);

    document.getElementById("resultado").innerHTML = `
        <strong>(a + b)²:</strong> ${expresion1}<br>
        <strong>a² + 2ab + b²:</strong> ${expresion2}<br><br>

        <strong>(a - b)²:</strong> ${expresion3}<br>
        <strong>a² - 2ab + b²:</strong> ${expresion4}<br><br>

        <strong>(a + b)(a - b):</strong> ${expresion5}<br>
        <strong>a² - b²:</strong> ${expresion6}<br><br>

        <strong>Expresión a·b / c:</strong> ${fraccion}
    `;
}
