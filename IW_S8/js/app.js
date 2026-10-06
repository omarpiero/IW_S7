let paisActual = null;
let destinos = [];

const formularioBusqueda = document.querySelector('#formulario-busqueda');
const inputPais = document.querySelector('#input-pais');
const mensajeEstado = document.querySelector('#mensaje-estado');

const seccionResultado = document.querySelector('#resultado');
const banderaPais = document.querySelector('#bandera-pais');
const nombrePais = document.querySelector('#nombre-pais');
const capitalPais = document.querySelector('#capital-pais');
const regionPais = document.querySelector('#region-pais');
const poblacionPais = document.querySelector('#poblacion-pais');
const monedaPais = document.querySelector('#moneda-pais');
const botonAgregar = document.querySelector('#boton-agregar');
const listaVecinos = document.querySelector('#lista-vecinos');

const mensajePlanVacio = document.querySelector('#plan-vacio');
const listaDestinos = document.querySelector('#lista-destinos');
const cantidadDestinos = document.querySelector('#cantidad-destinos');
const presupuestoTotal = document.querySelector('#presupuesto-total');

formularioBusqueda.addEventListener('submit', manejarBusqueda);
botonAgregar.addEventListener('click', agregarDestino);

function manejarBusqueda(evento) {
  evento.preventDefault();

  const nombre = inputPais.value.trim();

  if (nombre === '') {
    mostrarEstado('Escribe el nombre de un país para buscar.', 'error');
    return;
  }

  seccionResultado.classList.add('oculto');
  mostrarEstado('Buscando "' + nombre + '"...', 'cargando');

  buscarPais(nombre)
    .then((pais) => {
      paisActual = pais;
      mostrarPais(pais);
      ocultarEstado();
      return buscarVecinos(pais);
    })
    .then((vecinos) => {
      mostrarVecinos(vecinos);
    })
    .catch((error) => {
      mostrarEstado(error.message, 'error');
    });
}

function mostrarPais(pais) {
  banderaPais.src = pais.bandera;
  banderaPais.alt = pais.descripcionBandera || 'Bandera de ' + pais.nombre;
  nombrePais.textContent = pais.nombre;
  capitalPais.textContent = pais.capital;
  regionPais.textContent = pais.region;
  poblacionPais.textContent = pais.poblacion.toLocaleString('es-PE') + ' habitantes';
  monedaPais.textContent = pais.moneda;

  listaVecinos.innerHTML = '';
  seccionResultado.classList.remove('oculto');
}

function mostrarVecinos(vecinos) {
  if (vecinos.length === 0) {
    listaVecinos.appendChild(crearElemento('li', '', 'No tiene países limítrofes.'));
    return;
  }

  vecinos.forEach((vecino) => {
    const item = document.createElement('li');

    const bandera = document.createElement('img');
    bandera.src = vecino.bandera;
    bandera.alt = '';

    item.appendChild(bandera);
    item.appendChild(crearElemento('span', '', vecino.nombre));
    listaVecinos.appendChild(item);
  });
}

function agregarDestino() {
  const yaExiste = destinos.some((destino) => destino.nombre === paisActual.nombre);

  if (yaExiste) {
    mostrarEstado(paisActual.nombre + ' ya está en tu plan de destinos.', 'error');
    return;
  }

  const destino = {
    nombre: paisActual.nombre,
    bandera: paisActual.bandera,
    dias: 1,
    presupuestoDiario: 0
  };

  destinos.push(destino);
  listaDestinos.appendChild(crearTarjetaDestino(destino));

  ocultarEstado();
  actualizarResumen();
}

function crearTarjetaDestino(destino) {
  const tarjeta = crearElemento('li', 'destino');

  const bandera = document.createElement('img');
  bandera.src = destino.bandera;
  bandera.alt = 'Bandera de ' + destino.nombre;

  const nombre = crearElemento('h3', '', destino.nombre);
  const inputDias = crearInputNumero(destino.dias);
  const inputPresupuesto = crearInputNumero(destino.presupuestoDiario);
  const subtotal = crearElemento('p', 'subtotal');
  const botonEliminar = crearElemento('button', 'boton-eliminar', 'Eliminar');

  inputDias.addEventListener('input', () => {
    destino.dias = leerValor(inputDias);
    actualizarSubtotal(destino, subtotal);
  });

  inputPresupuesto.addEventListener('input', () => {
    destino.presupuestoDiario = leerValor(inputPresupuesto);
    actualizarSubtotal(destino, subtotal);
  });

  botonEliminar.addEventListener('click', () => eliminarDestino(destino, tarjeta));

  tarjeta.appendChild(bandera);
  tarjeta.appendChild(nombre);
  tarjeta.appendChild(crearEtiqueta('Días de viaje', inputDias));
  tarjeta.appendChild(crearEtiqueta('Presupuesto diario (USD)', inputPresupuesto));
  tarjeta.appendChild(subtotal);
  tarjeta.appendChild(botonEliminar);

  actualizarSubtotal(destino, subtotal);

  return tarjeta;
}

function eliminarDestino(destino, tarjeta) {
  destinos = destinos.filter((item) => item.nombre !== destino.nombre);
  tarjeta.remove();

  actualizarResumen();
}

function leerValor(input) {
  const valido = esValorValido(input.value);
  input.classList.toggle('input-error', !valido);

  if (valido) {
    return Number(input.value);
  }

  return 0;
}

function actualizarSubtotal(destino, elementoSubtotal) {
  elementoSubtotal.textContent = 'Subtotal: ' + formatearMonto(calcularSubtotal(destino));
  actualizarResumen();
}

function actualizarResumen() {
  cantidadDestinos.textContent = destinos.length;
  presupuestoTotal.textContent = formatearMonto(calcularTotal(destinos));
  mensajePlanVacio.classList.toggle('oculto', destinos.length > 0);
}

function mostrarEstado(texto, tipo) {
  mensajeEstado.textContent = texto;
  mensajeEstado.className = 'estado estado-' + tipo;
}

function ocultarEstado() {
  mensajeEstado.textContent = '';
  mensajeEstado.className = 'estado oculto';
}

function crearElemento(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);

  if (clase) {
    elemento.className = clase;
  }

  if (texto) {
    elemento.textContent = texto;
  }

  return elemento;
}

function crearInputNumero(valor) {
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.value = valor;
  return input;
}

function crearEtiqueta(texto, input) {
  const etiqueta = crearElemento('label', '', texto);
  etiqueta.appendChild(input);
  return etiqueta;
}
