/* Manejadora.js - Completar para el parcial */

var figuritas = [];
var filtradas = [];
var pagina = 1;
var idSeleccionado = null;

/* ===== INICIALIZACION ===== */
document.addEventListener("DOMContentLoaded", () =>{
  cargarTemaGuardado();
  obtenerFiguritas();
});

/* ===== PARTE 1: LISTADO Y ALTA (15 pts) ===== */

async function obtenerFiguritas() {
  try {
    mostrarSpinner();
    const respuesta = await fetch(URL_API);
    const resultado = await respuesta.json();

    if(!respuesta.ok){

      throw new Error("Error al obtener figuritas: " + respuesta.status);
    }
    figuritas = resultado.data;
    console.log(figuritas);
    filtradas = [...figuritas];
    mostrarFiguritas();
    actualizarBadge();
  }

  catch (error) {
    console.error(error);
  }

  finally {
    ocultarSpinner();
  }
}

function mostrarFiguritas() {
  const contenedor = document.getElementById("contenedorFiguritas");
  contenedor.innerHTML = "";

  const totalPaginas = Math.ceil(filtradas.length / ITEMS_POR_PAGINA);

  const inicio = (pagina - 1) * ITEMS_POR_PAGINA;

  const fin = inicio + ITEMS_POR_PAGINA;

  const visibles = filtradas.slice(inicio, fin);

  visibles.forEach(fig => {
    contenedor.innerHTML += crearCard(fig);
  });

  document.getElementById("infoPagina").textContent = `Página ${pagina} de ${totalPaginas || 1}`;

}

function crearCard(fig){
  const urlImagen = fig.imagen
  ? `https://figuritas-api.onrender.com/${fig.imagen}`
  : "./img/copa.jpg";
    console.log(fig.imagen);
    return `
    
    <div class="col">

        <div class="card figurita-card h-100">

            <img
                src="${urlImagen}"
                class="card-img-top"
                alt="${fig.nombre}"
            >

            <div class="card-body">

                <h5 class="card-title">
                    ${fig.nombre}
                </h5>

                <span class="badge bg-primary mb-2">
                    ${fig.pais}
                </span>

                <p class="card-text">

                    <strong>
                        $${fig.precio}
                    </strong>

                </p>

            </div>

            <div class="card-footer d-flex gap-2">

                <button
                    class="btn btn-warning btn-sm"
                    onclick="seleccionar('${fig._id}')"
                >
                    Seleccionar
                </button>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="eliminarDirecto('${fig._id}')"
                >
                    Eliminar
                </button>

            </div>

        </div>

    </div>

    `;
}

async function guardar() {

  if(!validar(true)){
    return;
  }

  try {
    mostrarSpinner();
    const formData = new FormData();
    formData.append("nombre", document.getElementById("txtNombre").value);
    formData.append("pais", document.getElementById("selectPais").value);
    formData.append("precio", document.getElementById("txtPrecio").value);
    const archivo = document.getElementById("fileImagen").files[0];
    formData.append("imagen", archivo);

    const respuesta = await fetch(URL_API, {
      method: "POST",
      body: formData
    });

    if(!respuesta.ok){
      throw new Error("Error HTTP: " + respuesta.status);
    }

    alerta("Figurita creada", "success");

    limpiar();

    obtenerFiguritas();

  }

  catch (error){
    console.error(error);
    alerta("Error al crear figurita", "danger");
  }

  finally {
    ocultarSpinner();
  }
}

/* ===== PARTE 2: MODIFICAR Y ELIMINAR (20 pts) ===== */

function seleccionar(id) {
  const figurita = figuritas.find(fig => fig._id === id);

  if (!figurita) return;

  // limpiar selección visual
  document.querySelectorAll(".figurita-card")
    .forEach(c => c.classList.remove("seleccionada"));

  // marcar la card seleccionada
  const cards = document.querySelectorAll(".figurita-card");
  cards.forEach(card => {
    const nombre = card.querySelector(".card-title")?.textContent;
    if (nombre === figurita.nombre) {
      card.classList.add("seleccionada");
    }
  });

  document.getElementById("txtId").value = figurita._id;
  document.getElementById("txtNombre").value = figurita.nombre;
  document.getElementById("selectPais").value = figurita.pais;
  document.getElementById("txtPrecio").value = figurita.precio;

  document.getElementById("previewImagen").src =
    `https://figuritas-api.onrender.com/${figurita.imagen}`;

  idSeleccionado = figurita._id;

  document.getElementById("badgeModo").textContent = "Modo: Modificación";

  document.getElementById("btnModificar").disabled = false;
  document.getElementById("btnEliminar").disabled = false;

  document.getElementById("requiredImg").style.display = "none";

  const tabFormulario = document.querySelector(
    '[data-bs-target="#tab-formulario"]'
  );

  new bootstrap.Tab(tabFormulario).show();
}

async function modificar() {
  if(!idSeleccionado){
    alerta("Seleccione una figurita para cambiar", "warning");
    return;
  }

  if(!validar(false)){
    return;
  }

  try {
    mostrarSpinner();
    const formData = new FormData();
    formData.append("nombre", document.getElementById("txtNombre").value);
    formData.append("pais", document.getElementById("selectPais").value);
    formData.append("precio", document.getElementById("txtPrecio").value);
    const archivo = document.getElementById("fileImagen").files[0];

    if(archivo){
      formData.append("imagen", archivo);
    }

    const respuesta = await fetch(`${URL_API}/${idSeleccionado}`, {
      method: "PUT",
      body: formData
    });

    if(!respuesta.ok){
      throw new Error("Error HTTP: " + respuesta.status);
    }

    alerta("Figurita modificada", "success");

    limpiar();

    obtenerFiguritas();
  }
  catch (error){
    console.error(error);
    alerta("Error al cambiar figurita", "danger");
  }
  finally {
    ocultarSpinner();
  }
}


async function eliminar() {
  if(!idSeleccionado){
    alerta("Seleccione una figurita para eliminar", "warning");
    return;
  }

  if(!confirm("¿Eliminar figurita?")){
    return;
  }

  try {
    mostrarSpinner();
    const respuesta = await fetch(`${URL_API}/${idSeleccionado}`, {
      method: "DELETE"
    });

    if(!respuesta.ok){
      throw new Error("Error HTTP: " + respuesta.status);
    }

    alerta("Figurita eliminada", "success");

    limpiar();

    obtenerFiguritas();
  }
  catch (error){
    console.error(error);
    alerta("Error al eliminar figurita", "danger");
  }
  finally {
    ocultarSpinner();
  }
}

async function eliminarDirecto(id) {
  if(!confirm("Eliminar figurita?")){
    return;
  }

  try {
    mostrarSpinner();
    const respuesta = await fetch(`${URL_API}/${id}`, {
      method: "DELETE"
    });
    
    if(!respuesta.ok){
      throw new Error("Error HTTP: " + respuesta.status);
    }
    alerta("Figurita eliminada", "success");

    limpiar();

    obtenerFiguritas();
  }

  catch(error){
    console.error(error);
    alerta("Error al eliminar figurita", "danger");

  }

  finally {
    ocultarSpinner();
  }
}

/* ===== PARTE 3: VALIDACIONES (15 pts) ===== */

function validar(esAlta) {

  let ok = true;

  const nombre = document.getElementById("txtNombre");
  const pais = document.getElementById("selectPais");
  const precio = document.getElementById("txtPrecio");
  const imagen = document.getElementById("fileImagen");

  // ===== NOMBRE =====

  if (
    nombre.value.length < NOMBRE_MIN ||
    nombre.value.length > NOMBRE_MAX
  ) {
    nombre.classList.add("is-invalid");
    nombre.classList.remove("is-valid");
    ok = false;
  }
  else {
    nombre.classList.remove("is-invalid");
    nombre.classList.add("is-valid");
  }

  // ===== PAIS =====

  if (pais.value === "") {
    pais.classList.add("is-invalid");
    pais.classList.remove("is-valid");
    ok = false;
  }
  else {
    pais.classList.remove("is-invalid");
    pais.classList.add("is-valid");
  }

  // ===== PRECIO =====

  const valorPrecio = Number(precio.value);

  if (
    valorPrecio < PRECIO_MIN ||
    valorPrecio > PRECIO_MAX
  ) {
    precio.classList.add("is-invalid");
    precio.classList.remove("is-valid");
    ok = false;
  }
  else {
    precio.classList.remove("is-invalid");
    precio.classList.add("is-valid");
  }

  // ===== IMAGEN =====

  let errorImagen = false;

  const archivo = imagen.files[0];

  if (esAlta) {

    if (!archivo) {
      errorImagen = true;
      ok = false;
    }
    else {

      if (!FORMATOS_IMAGEN.includes(archivo.type)) {
        errorImagen = true;
        ok = false;
      }

      if (archivo.size > MAX_IMAGEN_SIZE) {
        errorImagen = true;
        ok = false;
      }

    }

    if (errorImagen) {
      imagen.classList.add("is-invalid");
      imagen.classList.remove("is-valid");
    }
    else {
      imagen.classList.remove("is-invalid");
      imagen.classList.add("is-valid");
    }

  }

  return ok;
}

function limpiar() {
  document.getElementById("formFigurita").reset();

  document.getElementById("txtId").value = "";

  document.getElementById("previewImagen").src = "./img/copa.jpg";

  document.getElementById("badgeModo").textContent = "Modo: Alta";

  document.getElementById("requiredImg").style.display = "inline";

  document.getElementById("btnModificar").disabled = true;

  document.getElementById("btnEliminar").disabled = true;

  idSeleccionado = null;
}

function preview() {
  const archivo = document.getElementById("fileImagen").files[0];

  if(!archivo){
    return;
  }

  const lector = new FileReader();

  lector.onload = function(e){
    document.getElementById("previewImagen").src = e.target.result;
  }

  lector.readAsDataURL(archivo);
}

/* ===== PARTE 4: FILTROS Y PAGINACION (15 pts) ===== */

function mostrarSpinner() {
  document.getElementById("spinner").style.display = "flex";
}

function ocultarSpinner() {
  document.getElementById("spinner").style.display = "none";
}

function filtrar() {
  const texto = document.getElementById("txtBuscar").value.toLowerCase();

  const pais = document.getElementById("filtroPais").value;

  filtradas = figuritas.filter(fig => {
    const coincideNombre = fig.nombre.toLowerCase().includes(texto);

    const coincidePais = pais === "todos" || fig.pais === pais;

    return coincideNombre && coincidePais;
  });

  pagina = 1;

  mostrarFiguritas();

}

function limpiarFiltros() {
  document.getElementById("txtBuscar").value = "";

  document.getElementById("filtroPais").value = "todos";

  filtradas = [...figuritas];

  pagina = 1;

  mostrarFiguritas();
}

function ordenar() {
  filtradas.sort((a, b) => a.precio - b.precio);

  pagina = 1;

  mostrarFiguritas();
}

function promedio() {
  if(filtradas.length === 0){
    return;
  }

  let suma = 0;

  for(const fig of filtradas){
    suma += Number(fig.precio);
  }

  const promedio = suma / filtradas.length;

  alert(`Promedio de precios: $${promedio.toFixed(2)}`);
}

function cambiarPagina(dir) {
  const totalPaginas = Math.ceil(filtradas.length / ITEMS_POR_PAGINA);

  const nuevaPagina = pagina + dir;

  if(nuevaPagina < 1 || nuevaPagina > totalPaginas){
    return;
  }


pagina = nuevaPagina;

mostrarFiguritas();
}
/* ===== PARTE 5: ALERTAS ===== */

function alerta(mensaje, tipo) {
  const contenedor = document.getElementById("alertas");

  const div = document.createElement("div");

  div.className = `alert alert-${tipo} alert-dismissible fade show`;

  div.innerHTML =  `
    ${mensaje}
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="alert">
    </button>
  `;

  contenedor.appendChild(div);

  setTimeout(()=> {
    div.remove();
  }, 4000);
}

function actualizarBadge() {
  document.getElementById("badgeTotal").textContent = `${figuritas.length} figuritas`;
}

/* ===== PARTE 6: ESTADISTICAS, CSV, MODO OSCURO (15 pts) ===== */

function estadisticas() {
  if(figuritas.length === 0){
    return; 
  }

  const total = figuritas.length;

  let suma = 0;

  let mayorPrecio = 0;

  const contadorPaises = {};

  for(const fig of figuritas){
    suma += Number(fig.precio);

    if(fig.precio > mayorPrecio){
      mayorPrecio = fig.precio;
    }

    if(contadorPaises[fig.pais]){
      contadorPaises[fig.pais]++;
    }
    else {
      contadorPaises[fig.pais] = 1;
    }
  }

  let paisMasComun = "";
  let maxCantidad = 0;

  for(const pais in contadorPaises){
    if(contadorPaises[pais] > maxCantidad){
      maxCantidad = contadorPaises[pais];
      paisMasComun = pais;
    }
  }

  const promedio = suma / total;
  
  document.getElementById("statTotal").textContent = total;
  document.getElementById("statPais").textContent = paisMasComun;
  document.getElementById("statMax").textContent = `$${mayorPrecio}`;
  document.getElementById("statProm").textContent = `$${promedio.toFixed(2)}`;
}

function exportarCSV() {
  if (filtradas.length === 0) return;

  let csv = "Nombre,Pais,Precio,ID\n";

  filtradas.forEach(fig => {
    csv += `${fig.nombre},${fig.pais},${fig.precio},${fig._id}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "figuritas.csv";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function toggleTema() {
  const html = document.documentElement;

  const actual = html.getAttribute("data-bs-theme");

  const nuevo = actual === "dark" ? "light" : "dark";

  html.setAttribute("data-bs-theme", nuevo);

  localStorage.setItem("tema", nuevo);
}

function cargarTemaGuardado() {
  const tema = localStorage.getItem("tema") || "light";

  document.documentElement.setAttribute("data-bs-theme", tema);
}

