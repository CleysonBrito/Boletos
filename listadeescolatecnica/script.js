import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import * as XLSX from 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js';

const firebaseConfig = {
    apiKey: "AIzaSyC7eniB3_IFT8E-Tb1VkfktcWUsfLRRYXw",
    authDomain: "bancoreciclar.firebaseapp.com",
    databaseURL: "https://bancoreciclar-default-rtdb.firebaseio.com",
    projectId: "bancoreciclar",
    storageBucket: "bancoreciclar.firebasestorage.app",
    messagingSenderId: "418801320354",
    appId: "1:418801320354:web:3f854deb9e2dda520732fb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function loadTableData() {
    const escolasRef = ref(db, 'cadastrodeescolatecnica');
    onValue(escolasRef, (snapshot) => {
        const data = snapshot.val();
        const tableBody = document.getElementById('escolasTableBody');
        tableBody.innerHTML = ''; // Limpar tabela

        // Converter os dados em um array e ordenar por razaoSocial
        const dataArray = Object.keys(data).map(escolaId => ({ escolaId, ...data[escolaId] }));
        dataArray.sort((a, b) => a.razaoSocial.localeCompare(b.razaoSocial));

        dataArray.forEach((item) => {
            const row = document.createElement('tr');
            const fields = [
                'cnpj',
                'razaoSocial',
                'nomeFantasia',
                'endereco',
                'telefone'
            ];

            fields.forEach((field) => {
                const cell = document.createElement('td');
                cell.textContent = item[field];
                cell.setAttribute('contenteditable', 'true');
                cell.addEventListener('dblclick', () => {
                    cell.setAttribute('contenteditable', 'true');
                    cell.focus();
                });
                cell.addEventListener('blur', () => {
                    cell.setAttribute('contenteditable', 'false');
                    const updatedValue = cell.textContent;
                    update(ref(db, `cadastrodeescolatecnica/${item.escolaId}`), {
                        [field]: updatedValue
                    });
                });
                row.appendChild(cell);
            });

            // Adicionar botão de excluir
            const deleteCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.addEventListener('click', () => {
                remove(ref(db, `cadastrodeescolatecnica/${item.escolaId}`));
                loadTableData(); // Recarregar a tabela após exclusão
            });
            deleteCell.appendChild(deleteButton);
            row.appendChild(deleteCell);

            tableBody.appendChild(row);
        });
    });
}

// Função para filtrar os dados da tabela
function filterTable() {
    const filterValue = document.getElementById('filterInput').value.toLowerCase();

    const tableBody = document.getElementById('escolasTableBody');
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const cnpj = cells[0].textContent.toLowerCase();
        const razaoSocial = cells[1].textContent.toLowerCase();
        const nomeFantasia = cells[2].textContent.toLowerCase();

        if (
            cnpj.includes(filterValue) ||
            razaoSocial.includes(filterValue) ||
            nomeFantasia.includes(filterValue)
        ) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }
}

// Função para exportar a tabela para Excel
function exportTableToExcel() {
    const table = document.getElementById('jovensTable');
    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, 'Lista_de_Jovens.xlsx');
}

// Adicionar evento de input para o filtro
document.getElementById('filterInput').addEventListener('input', filterTable);

// Carregar dados da tabela ao iniciar
loadTableData();

// Tornar a função exportTableToExcel global
window.exportTableToExcel = exportTableToExcel;
