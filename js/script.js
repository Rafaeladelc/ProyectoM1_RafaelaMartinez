/* ============================================
   Colorfly · js/script.js
   ============================================ */

/* ---- Fase 1: lógica de generación (ya la tenías) ---- */

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generarColorHSL() {
  const h = getRandomInt(0, 359);
  const s = getRandomInt(40, 90);
  const l = getRandomInt(35, 65);
  return { h, s, l, css: `hsl(${h}, ${s}%, ${l}%)` };
}

function generarColorHEX() {
  let hex = "#";
  const caracteres = "0123456789ABCDEF";
  for (let i = 0; i < 6; i++) {
    hex += caracteres[getRandomInt(0, 15)];
  }
  return { hex, css: hex };
}

function obtenerColorTexto(colorObj, formato) {
  let r, g, b;
  if (formato === "hex") {
    r = parseInt(colorObj.hex.slice(1, 3), 16);
    g = parseInt(colorObj.hex.slice(3, 5), 16);
    b = parseInt(colorObj.hex.slice(5, 7), 16);
  } else {
    const h = colorObj.h / 360, s = colorObj.s / 100, l = colorObj.l / 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h * 12) % 12;
      return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    };
    r = Math.round(f(0) * 255);
    g = Math.round(f(8) * 255);
    b = Math.round(f(4) * 255);
  }
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminancia > 0.6 ? "#000000" : "#FFFFFF";
}

function generarPaleta(formato, tamano) {
  const paleta = [];
  for (let i = 0; i < tamano; i++) {
    const color = formato === "hex" ? generarColorHEX() : generarColorHSL();
    paleta.push(color);
  }
  return paleta;
}

/* ---- Fase 4: conexión con el DOM ---- */

// Tomamos los elementos del HTML una sola vez, por su id
const boton = document.getElementById("boton-generar");
const selectorTamano = document.getElementById("selector-tamano");
const selectorFormato = document.getElementById("selector-formato");
const contenedor = document.getElementById("contenedor-paleta");

// Dibuja una paleta nueva en pantalla
function generarPaletaEnPantalla() {
  const tamano = Number(selectorTamano.value);   // "6" -> 6
  const formato = selectorFormato.value;

  // Aplica la clase que fija la cantidad de columnas del grid
  contenedor.className = "contenedor-paleta contenedor-paleta--" + tamano;

  const paleta = generarPaleta(formato, tamano);

  contenedor.innerHTML = "";   // limpia lo anterior antes de redibujar

  paleta.forEach(function (color) {
    // Cada franja de color
    const columna = document.createElement("div");
    columna.className = "columna-color";
    columna.style.background = color.css;

    // El texto con el código de color
    const codigo = document.createElement("span");
    codigo.className = "codigo-color";
    codigo.textContent = formato === "hex" ? color.hex : color.css;
    codigo.style.color = obtenerColorTexto(color, formato);

    columna.appendChild(codigo);      // el texto va dentro de la franja
    contenedor.appendChild(columna);  // la franja va dentro del contenedor
  });
}

// Cuando el usuario hace clic, redibuja
boton.addEventListener("click", generarPaletaEnPantalla);

// Y una vez al cargar, para que la pantalla no arranque vacía
generarPaletaEnPantalla();