function toggleRow(id) {
  const row = document.getElementById(id+'_file');
  row.classList.toggle('open');
  const rowExpand = document.getElementById(id+'_details');
  rowExpand.style.display = (rowExpand.style.display === 'none') ? 'table-row' : 'none';
  const cell = document.getElementById(id+'_sign');
  cell.innerHTML = (cell.innerHTML === '-') ? '+' : '-';
}
