function calcular() {
    let a = parseFloat(document.getElementById("a").value);
    let b = parseFloat(document.getElementById("b").value);
    let tipo = document.getElementById("tipo").value;

    if (isNaN(a) || isNaN(b)) {
        document.getElementById("resultado").innerHTML = "Ingrese valores válidos.";
        return;
    }

    let pasos = "";
    let resultado = "";

    if (tipo === "cuadradoBinomio") {
        pasos = `(a + b)² = a² + 2ab + b²<br><br>`;
        pasos += `${a}² + 2(${a})(${b}) + ${b}²`;

        resultado = (a*a + 2*a*b + b*b);
    }

    if (tipo === "productoSumaResta") {
        pasos = `(a + b)(a - b) = a² - b²<br><br>`;
        pasos += `${a}² - ${b}²`;

        resultado = (a*a - b*b);
    }

    if (tipo === "binomioConjugado") {
        pasos = `(a - b)² = a² - 2ab + b²<br><br>`;
        pasos += `${a}² - 2(${a})(${b}) + ${b}²`;

        resultado = (a*a - 2*a*b + b*b);
    }

    document.getElementById("pasos").innerHTML = pasos;
    document.getElementById("resultado").innerHTML = "Resultado: " + resultado;
}
