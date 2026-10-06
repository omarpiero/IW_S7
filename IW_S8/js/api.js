const URL_BASE = 'https://api.restcountries.com/countries/v5';
const CAMPOS_PAIS = 'names.common,names.translations.spa.common,codes.alpha_3,capitals,region,population,currencies,flag.url_png,flag.description,borders';
const CAMPOS_VECINO = 'names.common,names.translations.spa.common,flag.url_png';

const MENSAJES_ERROR = {
  401: 'La API key no es válida. Revisa el archivo js/config.js.',
  403: 'Acceso denegado: se agotó el límite mensual o este dominio no está permitido en la API key.',
  429: 'Demasiadas búsquedas seguidas. Espera unos segundos e inténtalo de nuevo.'
};

function pedirDatos(url) {
  const opciones = {
    headers: { Authorization: 'Bearer ' + API_KEY }
  };

  return fetch(url, opciones)
    .catch(() => {
      throw new Error('No se pudo conectar con la API. Revisa tu conexión a internet.');
    })
    .then((respuesta) => {
      if (!respuesta.ok) {
        const mensaje = MENSAJES_ERROR[respuesta.status] || 'La API respondió con un error (código ' + respuesta.status + ').';
        throw new Error(mensaje);
      }

      return respuesta.json();
    })
    .then((datos) => datos.data.objects);
}

function buscarPais(nombre) {
  const url = `${URL_BASE}/names.translations?q=${encodeURIComponent(nombre)}&response_fields=${CAMPOS_PAIS}`;

  return pedirDatos(url).then((paises) => {
    if (paises.length === 0) {
      throw new Error('No se encontró ningún país con el nombre "' + nombre + '".');
    }

    return convertirPais(elegirPais(paises, nombre));
  });
}

function buscarVecinos(pais) {
  if (pais.fronteras.length === 0) {
    return Promise.resolve([]);
  }

  const url = `${URL_BASE}/borders/${pais.codigo}?response_fields=${CAMPOS_VECINO}`;

  return pedirDatos(url).then((vecinos) =>
    vecinos.map((vecino) => ({
      nombre: obtenerNombre(vecino),
      bandera: vecino.flag.url_png
    }))
  );
}

function elegirPais(paises, nombre) {
  const buscado = nombre.toLowerCase();

  const coincidenciaExacta = paises.find(
    (pais) => obtenerNombre(pais).toLowerCase() === buscado || pais.names.common.toLowerCase() === buscado
  );

  return coincidenciaExacta || paises[0];
}

function convertirPais(datos) {
  return {
    codigo: datos.codes.alpha_3,
    nombre: obtenerNombre(datos),
    capital: datos.capitals && datos.capitals.length > 0 ? datos.capitals[0].name : 'Sin capital',
    region: datos.region || 'Sin región',
    poblacion: datos.population,
    moneda: obtenerMoneda(datos.currencies),
    bandera: datos.flag.url_png,
    descripcionBandera: datos.flag.description,
    fronteras: datos.borders || []
  };
}

function obtenerNombre(datos) {
  if (datos.names.translations && datos.names.translations.spa) {
    return datos.names.translations.spa.common;
  }

  return datos.names.common;
}

function obtenerMoneda(monedas) {
  if (!monedas || monedas.length === 0) {
    return 'Sin moneda';
  }

  return monedas[0].name + ' (' + monedas[0].code + ')';
}
