
// Importação dos SDKs necessários
import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { 
    getDatabase, 
    ref, 
    set, 
    update,   // <--- ADICIONADO
    get,      // <--- ADICIONADO
    onValue   // <--- ADICIONADO
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBg9fo-7vV7lEGhOBxIz-c8LZ0HqloPJQE",
  authDomain: "bancoreciclar-f3467.firebaseapp.com",
  databaseURL: "https://bancoreciclar-f3467-default-rtdb.firebaseio.com", 
  projectId: "bancoreciclar-f3467",
  storageBucket: "bancoreciclar-f3467.firebasestorage.app",
  messagingSenderId: "776599914729",
  appId: "1:776599914729:web:df7959279132cb8e690878"
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// -----------------------------
// Função para carregar os dados
// -----------------------------
function carregarDados() {
    console.log('Iniciando carregamento de dados...');
    const tableBody = document.getElementById('table-body');
    
    if (!tableBody) {
        console.error('Elemento #table-body não encontrado no HTML.');
        return;
    }

    const jovensRef = ref(db, 'estoqueJovens');

    onValue(jovensRef, (snapshot) => {
        try {
            console.log('Dados recebidos do Firebase:', snapshot.val());
            tableBody.innerHTML = '';
            
            const dados = snapshot.val();

            if (!dados) {
                console.warn('Nenhum dado encontrado no nó estoqueJovens');
                const row = tableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 13;
                cell.textContent = 'Nenhum dado encontrado no Firebase';
                return;
            }

            // Converte dados em array e ordena por nome
            const jovensOrdenados = Object.entries(dados)
                .map(([key, jovem]) => ({ key, ...jovem }))
                .sort((a, b) => (a.nomeJovem || '').localeCompare(b.nomeJovem || '', 'pt-BR'));

            // Renderiza
            jovensOrdenados.forEach(jovem => {
                const parcelas = gerarParcelas(jovem, jovem.key);
                
                parcelas.forEach((parcela, index) => {
                    const row = tableBody.insertRow();
                    
                    if (isProximoVencimento(parcela.vencimentoBoleto)) {
                        row.classList.add('proximo-vencimento');
                    }
                    
                    if (parcela.status === 'Não Ativo') {
                        row.classList.add('inativo');
                    }

                    const cellData = [
                        parcela.nomeJovem || '-',
                        parcela.turma || '-',
                        parcela.escolaTecnica || '-',
                        parcela.cursoTecnico || '-',
                        formatarData(parcela.dataNascimento),
                        criarCampoValor(parcela.valorCurso / parcela.numeroParcelas, jovem.key, parcela, false),
                        criarCampoValor(parcela.valorDesconto / parcela.numeroParcelas, jovem.key, parcela, true),
                        `${parcela.numeroParcela}/${parcela.numeroParcelas}`,
                        formatarData(parcela.vencimentoBoleto),
                        criarCampoRecebidos(parcela.boletosRecebidos, jovem.key, parcela, parcela.numeroParcela - 1),
                        criarCampoDataRecebimento(parcela.dataRecebimento, `${jovem.key}_${index}`),
                        criarSeletorStatus(parcela.status, jovem.key),
                        determinarProjeto(parcela.dataNascimento, parcela.vencimentoBoleto),
                        parcela.emailResponsavel || '-'
                    ];

                    cellData.forEach(value => {
                        const cell = row.insertCell();
                        if (typeof value === 'object' && value !== null) {
                            cell.appendChild(value);
                        } else {
                            cell.textContent = value;
                        }
                    });
                });
            });
        } catch (erro) {
            console.error('Erro ao processar dados:', erro);
            tableBody.innerHTML = `<tr><td colspan="13">Erro ao processar dados: ${erro.message}</td></tr>`;
        }
    }, (error) => {
        console.error("Erro ao buscar dados do Firebase:", error);
    });
}

// -----------------------------
// Inicialização
// -----------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicação iniciada...');
    carregarDados();
});
