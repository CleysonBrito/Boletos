// Importação dos SDKs necessários
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Nova configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBg9fo-7vV7lEGhOBxIz-c8LZ0HqloPJQE",
  authDomain: "bancoreciclar-f3467.firebaseapp.com",
  databaseURL: "https://bancoreciclar-f3467-default-rtdb.firebaseio.com", // Adicionado para Realtime Database
  projectId: "bancoreciclar-f3467",
  storageBucket: "bancoreciclar-f3467.firebasestorage.app",
  messagingSenderId: "776599914729",
  appId: "1:776599914729:web:df7959279132cb8e690878"
};

// Inicialização do Firebase
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
