let tareas = [];
let siguienteId = 1;
let filtroActual = 'todas';

const formulario = document.querySelector('#formulario-tarea');
const inputTitulo = document.querySelector('#titulo');
const inputCurso = document.querySelector('#curso');
const selectPrioridad = document.querySelector('#prioridad');
const mensajeError = document.querySelector('#mensaje-error');
const listaTareas = document.querySelector('#lista-tareas');
const contadorPendientes = document.querySelector('#contador-pendientes');
const contadorCompletadas = document.querySelector('#contador-completadas');
const botonesFiltro = document.querySelectorAll('.filtro');

formulario.addEventListener('submit', agregarTarea);

botonesFiltro.forEach((boton) => {
  boton.addEventListener('click', () => cambiarFiltro(boton));
});

function agregarTarea(evento) {
  evento.preventDefault();

  const titulo = inputTitulo.value.trim();

  if (titulo === '') {
    mostrarError('El título de la tarea es obligatorio.');
    return;
  }

  ocultarError();

  const tarea = {
    id: siguienteId++,
    titulo: titulo,
    curso: inputCurso.value.trim() || 'Sin curso',
    prioridad: selectPrioridad.value,
    completada: false
  };

  tareas.push(tarea);

  const tarjeta = crearTarjeta(tarea);
  listaTareas.appendChild(tarjeta);

  formulario.reset();
  inputTitulo.focus();

  actualizarContadores();
  aplicarFiltro();
}

function crearTarjeta(tarea) {
  const tarjeta = document.createElement('li');
  tarjeta.classList.add('tarea');

  const titulo = document.createElement('h3');
  titulo.textContent = tarea.titulo;

  const curso = document.createElement('p');
  curso.textContent = 'Curso: ' + tarea.curso;

  const prioridad = document.createElement('span');
  prioridad.classList.add('prioridad', 'prioridad-' + tarea.prioridad.toLowerCase());
  prioridad.textContent = 'Prioridad ' + tarea.prioridad;

  const acciones = document.createElement('div');
  acciones.classList.add('acciones');

  const botonEstado = document.createElement('button');
  botonEstado.classList.add('boton-estado');
  botonEstado.textContent = 'Completar';
  botonEstado.addEventListener('click', () => cambiarEstado(tarea, tarjeta, botonEstado));

  const botonEliminar = document.createElement('button');
  botonEliminar.classList.add('boton-eliminar');
  botonEliminar.textContent = 'Eliminar';
  botonEliminar.addEventListener('click', () => eliminarTarea(tarea, tarjeta));

  acciones.appendChild(botonEstado);
  acciones.appendChild(botonEliminar);

  tarjeta.appendChild(titulo);
  tarjeta.appendChild(curso);
  tarjeta.appendChild(prioridad);
  tarjeta.appendChild(acciones);

  return tarjeta;
}

function cambiarEstado(tarea, tarjeta, botonEstado) {
  tarea.completada = !tarea.completada;
  tarjeta.classList.toggle('completada');

  if (tarea.completada) {
    botonEstado.textContent = 'Marcar pendiente';
  } else {
    botonEstado.textContent = 'Completar';
  }

  actualizarContadores();
  aplicarFiltro();
}

function eliminarTarea(tarea, tarjeta) {
  tareas = tareas.filter((t) => t.id !== tarea.id);
  tarjeta.remove();

  actualizarContadores();
}

function cambiarFiltro(botonSeleccionado) {
  filtroActual = botonSeleccionado.dataset.filtro;

  botonesFiltro.forEach((boton) => boton.classList.remove('activo'));
  botonSeleccionado.classList.add('activo');

  aplicarFiltro();
}

function aplicarFiltro() {
  const tarjetas = document.querySelectorAll('.tarea');

  tarjetas.forEach((tarjeta) => {
    const estaCompletada = tarjeta.classList.contains('completada');
    let mostrar = true;

    if (filtroActual === 'pendientes') {
      mostrar = !estaCompletada;
    } else if (filtroActual === 'completadas') {
      mostrar = estaCompletada;
    }

    tarjeta.classList.toggle('oculta', !mostrar);
  });
}

function actualizarContadores() {
  const completadas = tareas.filter((tarea) => tarea.completada).length;
  const pendientes = tareas.length - completadas;

  contadorPendientes.textContent = pendientes;
  contadorCompletadas.textContent = completadas;
}

function mostrarError(mensaje) {
  mensajeError.textContent = mensaje;
  mensajeError.classList.add('visible');
  inputTitulo.classList.add('input-error');
}

function ocultarError() {
  mensajeError.textContent = '';
  mensajeError.classList.remove('visible');
  inputTitulo.classList.remove('input-error');
}
