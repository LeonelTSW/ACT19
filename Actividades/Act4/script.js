let isUpdating = false;

function parseNumber(input) {
    if (!input) return 0;
    let expr = (''+input).trim()
        .replace(/sqrt\s*\(/gi, 'Math.sqrt(')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/(\d+)\s*π/gi, '$1*Math.PI');
    try { return Function('"use strict";return('+expr+')')(); } catch { return 0; }
}

function normalizeAngle(a){
    while(a>Math.PI)a-=2*Math.PI;
    while(a<=-Math.PI)a+=2*Math.PI;
    return a;
}

function formatNumber(num){
    if (Math.abs(num) < 1e-10) return "0";

    const special = [
        {v: Math.sqrt(2), s:"√2"}, {v: Math.sqrt(3), s:"√3"},
        {v: Math.sqrt(5), s:"√5"}, {v: 1/2, s:"1/2"},
        {v: 1/3, s:"1/3"}, {v: 2/3, s:"2/3"},
        {v: 3/4, s:"3/4"}, {v: Math.sqrt(2)/2, s:"√2/2"},
        {v: Math.sqrt(3)/2, s:"√3/2"}
    ];
    for (let x of special){ if(Math.abs(num-x.v)<1e-8) return x.s; }
    if (Math.abs(num - Math.round(num)) < 1e-8) return Math.round(num).toString();
    return parseFloat(num.toFixed(6)).toString();
}

function angleToPI(angle){
    if (Math.abs(angle) < 1e-10) return "0";
    const multiples = [
        {v: Math.PI, s:"π"}, {v: Math.PI/2, s:"π/2"},
        {v: Math.PI/3, s:"π/3"}, {v: Math.PI/4, s:"π/4"},
        {v: Math.PI/6, s:"π/6"}, {v: 2*Math.PI/3, s:"2π/3"},
        {v: 3*Math.PI/4, s:"3π/4"}, {v: 5*Math.PI/6, s:"5π/6"},
        {v: -Math.PI/2, s:"-π/2"}, {v: -Math.PI/3, s:"-π/3"},
        {v: -Math.PI/4, s:"-π/4"}, {v: -Math.PI/6, s:"-π/6"}
    ];
    for (let m of multiples){ if (Math.abs(angle-m.v)<1e-8) return m.s; }
    const ratio = angle/Math.PI;
    if (Math.abs(ratio - Math.round(ratio))<1e-8){
        const k=Math.round(ratio); return (k===1?"π":k+"π");
    }
    return angle.toFixed(6);
}

function updateResults(r,i,m,a){
    let cart = formatNumber(r);
    if (i>0) cart += " + " + (Math.abs(i-1)<1e-8?"i":formatNumber(i)+"i");
    else if (i<0) cart += " - " + (Math.abs(i+1)<1e-8?"i":formatNumber(-i)+"i");
    document.getElementById('cartesian-result').textContent="z = "+cart;

    document.getElementById('polar-result').textContent=
        "z = "+formatNumber(m)+"(cos("+angleToPI(a)+") + i sin("+angleToPI(a)+"))";

    document.getElementById('exponential-result').textContent=
        "z = "+formatNumber(m)+" e^(i"+angleToPI(a)+")";
}

function updateFromCartesian(){
    if(isUpdating)return;isUpdating=true;
    const r=parseNumber(document.getElementById('real').value);
    const i=parseNumber(document.getElementById('imag').value);
    const m=Math.sqrt(r*r+i*i); 
    let a=normalizeAngle(Math.atan2(i,r));
    document.getElementById('modulus').value=formatNumber(m);
    document.getElementById('angle').value=angleToPI(a);
    document.getElementById('angle2').value=angleToPI(a);
    document.getElementById('exp-modulus').value=formatNumber(m);
    document.getElementById('exp-angle').value=angleToPI(a);
    updateResults(r,i,m,a); 
    isUpdating=false;
}

function updateFromPolar(){
    if(isUpdating)return;isUpdating=true;
    const m=parseNumber(document.getElementById('modulus').value);
    const a=normalizeAngle(parseNumber(document.getElementById('angle').value));
    const r=m*Math.cos(a),i=m*Math.sin(a);
    document.getElementById('real').value=formatNumber(r);
    document.getElementById('imag').value=formatNumber(i);
    document.getElementById('angle2').value=angleToPI(a);
    document.getElementById('exp-modulus').value=formatNumber(m);
    document.getElementById('exp-angle').value=angleToPI(a);
    updateResults(r,i,m,a); 
    isUpdating=false;
}

function updateFromExponential(){
    if(isUpdating)return;isUpdating=true;
    const m=parseNumber(document.getElementById('exp-modulus').value);
    const a=normalizeAngle(parseNumber(document.getElementById('exp-angle').value));
    const r=m*Math.cos(a),i=m*Math.sin(a);
    document.getElementById('real').value=formatNumber(r);
    document.getElementById('imag').value=formatNumber(i);
    document.getElementById('modulus').value=formatNumber(m);
    document.getElementById('angle').value=angleToPI(a);
    document.getElementById('angle2').value=angleToPI(a);
    updateResults(r,i,m,a); 
    isUpdating=false;
}

function clearAll(){
    document.querySelectorAll('input[type="text"]').forEach(i=>{
        if(!i.readOnly)i.value='';
    });
    document.querySelectorAll('.result').forEach(r=>{
        r.textContent='Ingresa los valores arriba';
    });
}

document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('real').addEventListener('input',updateFromCartesian);
    document.getElementById('imag').addEventListener('input',updateFromCartesian);
    document.getElementById('modulus').addEventListener('input',updateFromPolar);
    document.getElementById('angle').addEventListener('input',updateFromPolar);
    document.getElementById('exp-modulus').addEventListener('input',updateFromExponential);
    document.getElementById('exp-angle').addEventListener('input',updateFromExponential);
});
