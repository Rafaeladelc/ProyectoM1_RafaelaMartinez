/* ============================================
   Colorfly · js/script.js
   ============================================ */

/* ---- Fase 1: lógica de generación de colores aleatorios ---- */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* -- Conversiones de color -- */

// HSL → RGB (extraída de obtenerColorTexto para poder reutilizarla)
function hslARgb(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h * 12) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    r: Math.round(f(0) * 255),
    g: Math.round(f(8) * 255),
    b: Math.round(f(4) * 255)
  };
}

// RGB → HEX (rellena cada canal a 2 dígitos)
function rgbAHex(r, g, b) {
  const rojo = r.toString(16).padStart(2, "0");
  const verde = g.toString(16).padStart(2, "0");
  const azul = b.toString(16).padStart(2, "0");
  return ("#" + rojo + verde + azul).toUpperCase();
}

// HSL → HEX (une las dos conversiones: HSL → RGB → HEX)
function hslAHex(h, s, l) {
  const { r, g, b } = hslARgb(h, s, l);
  return rgbAHex(r, g, b);
}

/* -- Generación -- */

// Genera un color en HSL y guarda también su HEX equivalente
function generarColorHSL() {
  const h = getRandomInt(0, 359);
  const s = getRandomInt(40, 90);
  const l = getRandomInt(35, 65);
  return {
    h,
    s,
    l,
    css: `hsl(${h}, ${s}%, ${l}%)`,
    hex: hslAHex(h, s, l)
  };
}

// Decide si el texto va en negro o blanco según la luminancia del fondo
function obtenerColorTexto(color) {
  const { r, g, b } = hslARgb(color.h, color.s, color.l);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.6 ? "#000000" : "#FFFFFF";
}

// Arma el array de colores (siempre en HSL)
function generarPaleta(tamano) {
  const paleta = [];
  for (let i = 0; i < tamano; i++) {
    paleta.push(generarColorHSL());
  }
  return paleta;
}

/* ---- Fase 4: conexión con el DOM ---- */

const boton = document.getElementById("boton-generar");
const selectorTamano = document.getElementById("selector-tamano");
const selectorFormato = document.getElementById("selector-formato");
const contenedor = document.getElementById("contenedor-paleta");

function generarPaletaEnPantalla() {
  const tamano = Number(selectorTamano.value);
  const formato = selectorFormato.value;

  contenedor.className = "contenedor-paleta contenedor-paleta--" + tamano;

  const paleta = generarPaleta(tamano);

  contenedor.innerHTML = "";

  paleta.forEach(function (color) {
    // Cada franja de color
    const columna = document.createElement("div");
    columna.className = "columna-color";
    columna.style.background = color.css;   // el fondo sale del HSL

    // El texto con el/los código(s)
    const codigo = document.createElement("span");
    codigo.className = "codigo-color";

    if (formato === "hex") {
      // Modo HEX: solo el código HEX
      codigo.textContent = color.hex;
    } else {
      // Modo HSL: el HEX y su equivalente en HSL, en dos líneas
      codigo.append(color.hex, document.createElement("br"), color.css);
    }

    codigo.style.color = obtenerColorTexto(color);

    columna.appendChild(codigo);
    contenedor.appendChild(columna);
  });
}

boton.addEventListener("click", generarPaletaEnPantalla);

generarPaletaEnPantalla();