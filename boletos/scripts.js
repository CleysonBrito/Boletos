// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC7eniB3_IFT8E-Tb1VkfktcWUsfLRRYXw",
    authDomain: "bancoreciclar.firebaseapp.com",
    databaseURL: "https://bancoreciclar-default-rtdb.firebaseio.com",
    projectId: "bancoreciclar",
    storageBucket: "bancoreciclar.firebasestorage.app",
    messagingSenderId: "418801320354",
    appId: "1:418801320354:web:3f854deb9e2dda520732fb"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Função para formatar a data
function formatarData(data) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}-${mes}-${ano}`;
}

// Função para formatar o valor como moeda brasileira
function formatarValor(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

document.addEventListener("DOMContentLoaded", function() {
    const boletosTableBody = document.getElementById("boletos-table").getElementsByTagName("tbody")[0];
    const boletosRef = db.ref("boletos");

    // Função para aplicar filtros
    function aplicarFiltros() {
        const filtroUnificado = document.getElementById("filtro-unificado").value.toLowerCase();
        const vencimentoInicio = document.getElementById("vencimento-inicio").value;
        const vencimentoFim = document.getElementById("vencimento-fim").value;
        const recebimentoInicio = document.getElementById("recebimento-inicio").value;
        const recebimentoFim = document.getElementById("recebimento-fim").value;

        boletosRef.on("value", function(snapshot) {
            boletosTableBody.innerHTML = "";
            if (snapshot.exists()) {
                snapshot.forEach(function(childSnapshot) {
                    const boleto = childSnapshot.val();
                    const dataVencimento = new Date(boleto.dataVencimento);
                    const dataRecebimento = new Date(boleto.dataRecebimento);

                    if (
                        (boleto.nomeJovem.toLowerCase().includes(filtroUnificado) ||
                        boleto.turma.toLowerCase().includes(filtroUnificado) ||
                        boleto.escolaTecnica.toLowerCase().includes(filtroUnificado) ||
                        boleto.cursoTecnico.toLowerCase().includes(filtroUnificado) ||
                        boleto.projeto.toLowerCase().includes(filtroUnificado) ||
                        boleto.emailResponsavel.toLowerCase().includes(filtroUnificado)) &&
                        (!vencimentoInicio || dataVencimento >= new Date(vencimentoInicio)) &&
                        (!vencimentoFim || dataVencimento <= new Date(vencimentoFim)) &&
                        (!recebimentoInicio || dataRecebimento >= new Date(recebimentoInicio)) &&
                        (!recebimentoFim || dataRecebimento <= new Date(recebimentoFim))
                    ) {
                        const row = document.createElement("tr");
                        const valorParcela = boleto.valorParcela !== undefined ? formatarValor(boleto.valorParcela) : "N/A";
                        row.innerHTML = `
                            <td>${boleto.nomeJovem}</td>
                            <td>${boleto.turma}</td>
                            <td>${boleto.escolaTecnica}</td>
                            <td>${boleto.cursoTecnico}</td>
                            <td>${formatarData(boleto.dataNascimento)}</td>
                            <td>${valorParcela}</td>
                            <td>${boleto.totalParcelas}</td>
                            <td>${formatarData(boleto.dataVencimento)}</td>
                            <td>${formatarData(boleto.dataRecebimento)}</td>
                            <td>${boleto.projeto}</td>
                            <td>${boleto.emailResponsavel}</td>
                        `;
                        boletosTableBody.appendChild(row);
                    }
                });
            } else {
                console.log("Snapshot não existe ou não há dados");
            }
        }, function(error) {
            console.error("Erro ao buscar dados:", error);
        });
    }

    // Adiciona evento de mudança ao filtro unificado
    document.getElementById("filtro-unificado").addEventListener("input", aplicarFiltros);
    document.querySelectorAll(".filtro-data").forEach(input => {
        input.addEventListener("input", aplicarFiltros);
    });

    aplicarFiltros(); // Aplica os filtros ao carregar a página

    // Função para exportar dados para Excel
    function exportarParaExcel() {
        const tabela = document.getElementById("boletos-table");
        const wb = XLSX.utils.table_to_book(tabela, { sheet: "Boletos" });
        XLSX.writeFile(wb, "boletos.xlsx");
    }

    // Adiciona evento ao botão de exportação
    document.getElementById("exportar-excel").addEventListener("click", exportarParaExcel);
});