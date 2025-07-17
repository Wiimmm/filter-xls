const SPREADSHEET_ID = '1OUWjpw-7f91AdloKeXoW5CBfN9IRMbgJF5s7KiyLhA0';
const API_KEY = 'AIzaSyAA8UQ1TTS7pEQHKcAHyxZVHF074YFDWlU'; // paste your API key here
// Note: Make sure to enable the Google Sheets API and set up your API key in the google cloud console.
// Also, ensure that the Google Sheet is shared with the service account or is public if you're using an API key.
// For more information, refer to the Google Sheets API documentation: https://developers.google.com/sheets/api/quickstart/js

const RANGE = 'Ficheiros';
const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

let originalData = [];
let headers = [];

document.getElementById('filters').onchange = function() {
    const cliente = document.getElementById('clienteFilter').value;
    const pessoa = document.getElementById('pessoaFilter').value;
    const projeto = document.getElementById('projetoFilter').value;

    fetchFilteredData(cliente, pessoa, projeto);
}

function fetchFilteredData(cliente = '', pessoa = '', projeto = '') {
    const apiUrl = 'https://script.google.com/macros/s/AKfycbxPKPsBCdSzl4bUGp9k9pHsErDxwmVhUXaz7NeBa9juiCi62irqBMMt5xbgY4u_L_1_/exec'; // Replace with your actual Google Apps Script URL
    const url = `${apiUrl}?cliente=${encodeURIComponent(cliente)}&pessoa=${encodeURIComponent(pessoa)}&projeto=${encodeURIComponent(projeto)}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            headers = data[0];
            originalData = data.slice(1);
            createFilters(originalData);
            document.getElementById('filters').style.display = 'block';
            renderTable(originalData);
        })
        .catch(err => {
            console.error('Erro ao buscar dados filtrados:', err);
            document.getElementById('sheet-table').innerHTML = '<tr><td>Erro ao carregar dados.</td></tr>';
        });
}

fetchFilteredData();

function setFilter(tipo, valor) {
    const filtro = { cliente: '', pessoa: '', projeto: '' };
    filtro[tipo] = valor;
    fetchFilteredData(filtro.cliente, filtro.pessoa, filtro.projeto);
}


function createFilters(data) {
    const clienteSet = new Set();
    const pessoaSet = new Set();
    const projetoSet = new Set();

    data.forEach(row => {
        clienteSet.add(row[1]);
        projetoSet.add(row[3]);
        if (row[4]) {
            row[4].split(',').forEach(p => pessoaSet.add(p.trim()));
        }
    });

    populateSelect('clienteFilter', clienteSet);
    populateSelect('pessoaFilter', pessoaSet);
    populateSelect('projetoFilter', projetoSet);

    document.getElementById('clienteFilter').onchange = applyFilters;
    document.getElementById('pessoaFilter').onchange = applyFilters;
    document.getElementById('projetoFilter').onchange = applyFilters;
}

function populateSelect(id, values) {
    const select = document.getElementById(id);
    select.innerHTML = '<option value="">Todos</option>';
    Array.from(values).sort().forEach(value => {
        if (value !== undefined && value !== '') {
            select.innerHTML += `<option value="${value}">${value}</option>`;
        }
    });
}

function applyFilters() {
    const cliente = document.getElementById('clienteFilter').value;
    const pessoa = document.getElementById('pessoaFilter').value;
    const projeto = document.getElementById('projetoFilter').value;

    const filtered = originalData.filter(row => {
        const clienteOk = (cliente === '' || row[1] === cliente);
        const projetoOk = (projeto === '' || row[3] === projeto);
        let pessoaOk = true;

        if (pessoa !== '') {
            if (row[4]) {
                const pessoas = row[4].split(',').map(p => p.trim());
                pessoaOk = pessoas.includes(pessoa);
            } else {
                pessoaOk = false;
            }
        }

        return clienteOk && pessoaOk && projetoOk;
    });

    renderTable(filtered);
}

function renderTable(data) {
    const table = document.getElementById('sheet-table');
    let html = '<thead><tr>';
    headers.forEach(h => html += `<th>${h}</th>`);
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        for (let i = 0; i < headers.length; i++) {
            html += `<td>${row[i] !== undefined ? row[i] : ''}</td>`;
        }
        html += '</tr>';
    });

    html += '</tbody>';
    table.innerHTML = html;
}

function setFilter(tipo, valor) {
    const map = {
        cliente: 'clienteFilter',
        pessoa: 'pessoaFilter',
        projeto: 'projetoFilter'
    };
    const selectId = map[tipo];
    if (selectId) {
        const select = document.getElementById(selectId);
        select.value = valor;
        applyFilters();
    }
}

function resetFilters() {
    ['clienteFilter', 'pessoaFilter', 'projetoFilter'].forEach(id => {
        document.getElementById(id).value = '';
    });
    applyFilters();
}