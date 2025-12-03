function parseComplex(str) {
    str = str.replace(/\s+/g, "");
    let match = str.match(/^([+-]?\d+)?([+-]\d+)i$/);
    if (!match) return null;

    let real = parseInt(match[1] || "0");
    let imag = parseInt(match[2] || "0");
    return { r: real, i: imag };
}

function calcular() {
    let z1 = parseComplex(document.getElementById("z1").value);
    let z2 = parseComplex(document.getElementById("z2").value);

    if (!z1 || !z2) {
        document.getElementById("resultado").innerHTML = "Ingrese números complejos válidos.";
        return;
    }

    let suma = { r: z1.r + z2.r, i: z1.i + z2.i };
    let resta = { r: z1.r - z2.r, i: z1.i - z2.i };
    let producto = {
        r: (z1.r * z2.r) - (z1.i * z2.i),
        i: (z1.r * z2.i) + (z1.i * z2.r)
    };

    let conj1 = { r: z1.r, i: -z1.i };
    let conj2 = { r: z2.r, i: -z2.i };

    function format(z) {
        let sign = z.i >= 0 ? "+" : "";
        return `${z.r}${sign}${z.i}i`;
    }

    document.getElementById("resultado").innerHTML = `
        <strong>Suma:</strong> ${format(suma)}<br>
        <strong>Resta:</strong> ${format(resta)}<br>
        <strong>Producto:</strong> ${format(producto)}<br><br>
        <strong>Conjugado de Z1:</strong> ${format(conj1)}<br>
        <strong>Conjugado de Z2:</strong> ${format(conj2)}
    `;
}
