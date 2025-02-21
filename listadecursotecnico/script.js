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
    const jovensRef = ref(db, 'cadastrodejovens');
    onValue(jovensRef, (snapshot) => {
        const data = snapshot.val();
        const tableBody = document.getElementById('jovensTableBody');
        tableBody.innerHTML = ''; // Limpar tabela

        // Converter os dados em um array e ordenar por nomeCompleto
        const dataArray = Object.keys(data).map(userId => ({ userId, ...data[userId] }));
        dataArray.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));

        dataArray.forEach((item) => {
            const row = document.createElement('tr');
            const fields = [
                'nomeCompleto',
                'rg',
                'cpf',
                'endereco',
                'dataNascimento',
                'responsavelFinanceiro',
                'emailJovem',
                'emailResponsavel'
            ];

            fields.forEach((field) => {
                const cell = document.createElement('td');
                let cellValue = item[field];

                // Ajustar a formatação da data
                if (field === 'dataNascimento') {
                    const date = new Date(cellValue);
                    cellValue = date.toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                }

                cell.textContent = cellValue;
                cell.setAttribute('contenteditable', 'true');
                cell.addEventListener('dblclick', () => {
                    cell.setAttribute('contenteditable', 'true');
                    cell.focus();
                });
                cell.addEventListener('blur', () => {
                    cell.setAttribute('contenteditable', 'false');
                    const updatedValue = cell.textContent;
                    update(ref(db, `cadastrodejovens/${item.userId}`), {
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
                remove(ref(db, `cadastrodejovens/${item.userId}`));
                loadTableData(); // Recarregar a tabela após exclusão
            });
            deleteCell.appendChild(deleteButton);
            row.appendChild(deleteCell);

            tableBody.appendChild(row);
        });
    });

    const cursosRef = ref(db, 'cadastrocursotecnico');
    onValue(cursosRef, (snapshot) => {
        const data = snapshot.val();
        const tableBody = document.getElementById('cursosTableBody');
        tableBody.innerHTML = ''; // Limpar tabela

        // Converter os dados em um array e ordenar por nomeCurso
        const dataArray = Object.keys(data).map(cursoId => ({ cursoId, ...data[cursoId] }));
        dataArray.sort((a, b) => a.nomeCurso.localeCompare(b.nomeCurso));

        dataArray.forEach((item) => {
            const row = document.createElement('tr');
            const fields = [
                'nomeCurso',
                'nomeEscola'
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
                    update(ref(db, `cadastrocursotecnico/${item.cursoId}`), {
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
                remove(ref(db, `cadastrocursotecnico/${item.cursoId}`));
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

    const tableBody = document.getElementById('jovensTableBody');
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        const nomeCompleto = cells[0].textContent.toLowerCase();
        const rg = cells[1].textContent.toLowerCase();
        const cpf = cells[2].textContent.toLowerCase();

        if (
            nomeCompleto.includes(filterValue) ||
            rg.includes(filterValue) ||
            cpf.includes(filterValue)
        ) {
            rows[i].style.display = '';
        } else {
            rows[i].style.display = 'none';
        }
    }

    const cursosTableBody = document.getElementById('cursosTableBody');
    const cursosRows = cursosTableBody.getElementsByTagName('tr');

    for (let i = 0; i < cursosRows.length; i++) {
        const cells = cursosRows[i].getElementsByTagName('td');
        const nomeCurso = cells[0].textContent.toLowerCase();
        const nomeEscola = cells[1].textContent.toLowerCase();

        if (
            nomeCurso.includes(filterValue) ||
            nomeEscola.includes(filterValue)
        ) {
            cursosRows[i].style.display = '';
        } else {
            cursosRows[i].style.display = 'none';
        }
    }
}

// Função para exportar a tabela para Excel
function exportTableToExcel() {
    const jovensTable = document.getElementById('jovensTable');
    const jovensWb = XLSX.utils.table_to_book(jovensTable, { sheet: "Sheet1" });
    XLSX.writeFile(jovensWb, 'Lista_de_Jovens.xlsx');

    const cursosTable = document.getElementById('cursosTable');
    const cursosWb = XLSX.utils.table_to_book(cursosTable, { sheet: "Sheet1" });
    XLSX.writeFile(cursosWb, 'Lista_de_Cursos_Tecnicos.xlsx');
}

// Adicionar evento de input para o filtro
document.getElementById('filterInput').addEventListener('input', filterTable);

// Carregar dados da tabela ao iniciar
loadTableData();

// Tornar a função exportTableToExcel global
window.exportTableToExcel = exportTableToExcel;
