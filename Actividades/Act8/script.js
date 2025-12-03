function calcular() {
    let a = parseFloat(document.getElementById("a").value);
    let b = parseFloat(document.getElementById("b").value);
    let operacion = document.getElementById("operacion").value;

    if (isNaN(a)) {
        document.getElementById("resultado").innerHTML = "Ingrese valores válidos.";
        return;
    }

    let r;

    if (operacion === "suma") r = a + b;
    if (operacion === "resta") r = a - b;
    if (operacion === "producto") r = a * b;
    if (operacion === "division") r = b === 0 ? "No se puede dividir entre 0" : a / b;
    if (operacion === "cuadrado") r = a ** 2;
    if (operacion === "cubica") r = a ** 3;

    document.getElementById("resultado").innerHTML = "Resultado: " + r;
}
