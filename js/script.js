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

const botonGuardar = document.getElementById("boton-guardar");
const boton = document.getElementById("boton-generar");
const selectorTamano = document.getElementById("selector-tamano");
const selectorFormato = document.getElementById("selector-formato");
const contenedor = document.getElementById("contenedor-paleta");
const notificacion = document.getElementById("notificacion");
const mensajeRecordatorio = document.getElementById("mensaje-recordatorio");
const botonLimpiar = document.getElementById("boton-limpiar");

let temporizadorNotificacion;   // guarda el temporizador activo
let paletaActual = [];   // guarda la última paleta generada, accesible desde afuera

// Muestra la notificación y la oculta sola tras 2 segundos (microfeedback)
function mostrarNotificacion(mensaje) {
  notificacion.textContent = mensaje;   // cambia el texto según la acción
  notificacion.hidden = false;

  clearTimeout(temporizadorNotificacion);
  temporizadorNotificacion = setTimeout(function () {
    notificacion.hidden = true;
  }, 2000);
}

// Muestra el recordatorio cuando hay un cambio sin aplicar
function mostrarRecordatorio() {
  mensajeRecordatorio.hidden = false;
}

// Oculta el recordatorio (cuando ya se generó la paleta)
function ocultarRecordatorio() {
  mensajeRecordatorio.hidden = true;
}

function generarPaletaEnPantalla() {
  ocultarRecordatorio();   // al generar, ya no hay cambios pendientes

  const tamano = Number(selectorTamano.value);
  const formato = selectorFormato.value;

  contenedor.className = "contenedor-paleta contenedor-paleta--" + tamano;

   paletaActual = generarPaleta(tamano);

  contenedor.innerHTML = "";

  paletaActual.forEach(function (color) {
    // Cada franja de color
    const columna = document.createElement("div");
    columna.className = "columna-color";
    columna.style.background = color.css;   // el fondo sale del HSL

    // Al hacer clic, copia el HEX y muestra la notificación
    columna.addEventListener("click", function () {
      navigator.clipboard.writeText(color.hex);
      mostrarNotificacion("Color copiado al portapapeles");
    });

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

// Guarda la paleta actual en el historial de localStorage
function guardarPaleta() {
  // 1. Recuperar las paletas ya guardadas (o un array vacío si no hay ninguna)
  const guardadasTexto = localStorage.getItem("paletasGuardadas");
  const guardadas = guardadasTexto ? JSON.parse(guardadasTexto) : [];

  // 2. Armar el registro nuevo: los colores + la fecha
  const registro = {
    colores: paletaActual,
    fecha: new Date().toLocaleString()
  };

  // 3. Agregarlo al array y volver a guardar todo como texto
  guardadas.push(registro);
  localStorage.setItem("paletasGuardadas", JSON.stringify(guardadas));

  mostrarPaletasGuardadas();
  mostrarNotificacion("Paleta guardada");   // NUEVO: aviso flotante al guardar
}

// Lee las paletas guardadas y las dibuja en pantalla
function mostrarPaletasGuardadas() {
  const listaGuardadas = document.getElementById("lista-guardadas");

  // Recuperar del localStorage (o array vacío si no hay nada)
  const guardadasTexto = localStorage.getItem("paletasGuardadas");
  const guardadas = guardadasTexto ? JSON.parse(guardadasTexto) : [];

  // Limpiar antes de redibujar
  listaGuardadas.innerHTML = "";

  // Por cada paleta guardada, armar su fila
  guardadas.forEach(function (registro) {
    // Contenedor de esta paleta
    const paletaDiv = document.createElement("div");
    paletaDiv.className = "paleta-guardada";

    // Fila de cuadraditos de color
    const filaMiniaturas = document.createElement("div");
    filaMiniaturas.className = "fila-miniaturas";

    registro.colores.forEach(function (color) {
      const miniatura = document.createElement("div");
      miniatura.className = "miniatura";
      miniatura.style.background = color.css;
      filaMiniaturas.appendChild(miniatura);
    });

    // La fecha
    const fecha = document.createElement("p");
    fecha.className = "fecha-guardada";
    fecha.textContent = "Guardada el " + registro.fecha;

    // Armar todo
    paletaDiv.appendChild(filaMiniaturas);
    paletaDiv.appendChild(fecha);
    listaGuardadas.appendChild(paletaDiv);

  });
}

// Borra todas las paletas guardadas de localStorage
function limpiarGuardadas() {
  const confirmar = confirm("¿Seguro que querés borrar todas las paletas guardadas?");
  if (!confirmar) return;   // si dice que no, no hace nada

  localStorage.removeItem("paletasGuardadas");   // borra la clave del localStorage
  mostrarPaletasGuardadas();                      // redibuja (ahora vacío)
}

// Al cambiar un selector, aparece el recordatorio de generar
selectorTamano.addEventListener("change", mostrarRecordatorio);
selectorFormato.addEventListener("change", mostrarRecordatorio);
botonGuardar.addEventListener("click", guardarPaleta);
botonLimpiar.addEventListener("click", limpiarGuardadas);

// Al hacer clic en el botón, redibuja la paleta
boton.addEventListener("click", generarPaletaEnPantalla);

// Y una vez al cargar, para que la pantalla no arranque vacía
generarPaletaEnPantalla();

mostrarPaletasGuardadas();   // muestra las guardadas al cargar