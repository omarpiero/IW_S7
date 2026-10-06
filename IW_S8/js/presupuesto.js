function calcularSubtotal(destino) {
  return destino.dias * destino.presupuestoDiario;
}

function calcularTotal(destinos) {
  let total = 0;

  destinos.forEach((destino) => {
    total += calcularSubtotal(destino);
  });

  return total;
}

function esValorValido(texto) {
  return texto !== '' && Number(texto) >= 0;
}

function formatearMonto(monto) {
  return 'USD ' + monto.toFixed(2);
}
