function calculateAPY() {
  const principal = parseFloat(document.getElementById('principal').value);
  const apy = parseFloat(document.getElementById('apy').value);
  const result = principal * (1 + apy / 100);
  document.getElementById('result').innerHTML = `$${result.toFixed(2)} after 1 year`;
}