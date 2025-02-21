// Importação dos módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, onValue, update, get, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Função para calcular a idade em meses
function calcularIdadeMeses(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const diffAnos = hoje.getFullYear() - nascimento.getFullYear();
    let diffMeses = hoje.getMonth() - nascimento.getMonth(); // Mudando para let
    
    // Ajuste para considerar o dia do mês
    if (hoje.getDate() < nascimento.getDate()) {
        diffMeses--;
    }
    
    return (diffAnos * 12) + diffMeses;
}

// Função para determinar o projeto baseado na idade
function determinarProjeto(dataNascimento, dataVencimento) {
    if (!dataNascimento || !dataVencimento) return '-';
    
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const nascimento = new Date(dataNascimento);
    
    // Verifica se a pessoa já completou 18 anos na data atual
    let idadeAtual = hoje.getFullYear() - nascimento.getFullYear(); // Mudado para let
    const mesAtual = hoje.getMonth() - nascimento.getMonth();
    const diaAtual = hoje.getDate() - nascimento.getDate();
    
    // Ajuste para mês atual
    if (mesAtual < 0 || (mesAtual === 0 && diaAtual < 0)) {
        idadeAtual--; // Agora pode ser modificado
    }
    
    // Se já tem 18 anos hoje, todas as parcelas são RECICLAR
    if (idadeAtual >= 18) {
        return 'RECICLAR';
    }
    
    // Verifica a idade na data de vencimento
    let idadeVencimento = vencimento.getFullYear() - nascimento.getFullYear(); // Mudado para let
    const mesVencimento = vencimento.getMonth() - nascimento.getMonth();
    const diaVencimento = vencimento.getDate() - nascimento.getDate();
    
    // Ajuste para mês de vencimento
    if (mesVencimento < 0 || (mesVencimento === 0 && diaVencimento < 0)) {
        idadeVencimento--; // Agora pode ser modificado
    }
    
    // Debug
    console.log(`Data Nascimento: ${nascimento.toLocaleDateString()}`);
    console.log(`Data Vencimento: ${vencimento.toLocaleDateString()}`);
    console.log(`Idade no Vencimento: ${idadeVencimento} anos`);
    
    // Se terá 18 anos ou mais na data de vencimento = RECICLAR
    // Se terá menos de 18 anos na data de vencimento = CONDECA
    return idadeVencimento >= 18 ? 'RECICLAR' : 'CONDECA';
}

function desabilitarCampos(row) {
    const campos = row.querySelectorAll('input, select');
    campos.forEach(campo => {
        if (campo.classList.contains('status-select')) return;
        campo.disabled = true;
    });
}

function habilitarCampos(row) {
    const campos = row.querySelectorAll('input, select');
    campos.forEach(campo => campo.disabled = false);
}

async function atualizarStatusJovem(jovemId, novoStatus) {
    const jovemRef = ref(db, `estoqueJovens/${jovemId}`);
    try {
        await update(jovemRef, { status: novoStatus });
        return true;
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        throw error;
    }
}

function salvarBoleto(parcela, jovemId, index) {
    const boletoId = `${jovemId}_parcela_${parcela.numeroParcela}`;
    const boletoRef = ref(db, `boletos/${boletoId}`);

    const hoje = new Date();
    const vencimento = new Date(parcela.vencimentoBoleto);

    // Se a data atual for antes da data de vencimento, salva o valor com desconto, senão o valor normal
    const valorFinal = hoje <= vencimento ? (parcela.valorDesconto / parcela.numeroParcelas) : (parcela.valorCurso / parcela.numeroParcelas);

    const dadosBoleto = {
        nomeJovem: parcela.nomeJovem,
        turma: parcela.turma,
        escolaTecnica: parcela.escolaTecnica,
        cursoTecnico: parcela.cursoTecnico,
        dataNascimento: parcela.dataNascimento,
        valorParcela: valorFinal, // Aplica a regra do desconto ou valor normal
        numeroParcela: parcela.numeroParcela,
        totalParcelas: parcela.numeroParcelas,
        dataVencimento: parcela.vencimentoBoleto,
        dataRecebimento: new Date().toISOString().split('T')[0],
        status: 'Concluído',
        projeto: determinarProjeto(parcela.dataNascimento, parcela.vencimentoBoleto),
        emailResponsavel: parcela.emailResponsavel,
        dataConclusao: new Date().toISOString(),
        jovemId: jovemId,
        parcelaId: boletoId,
        dataMovimentacao: new Date().toISOString()
    };

    return update(boletoRef, dadosBoleto);
}



function criarCampoRecebidos(status, jovemId, parcela, index) {
    const select = document.createElement('select');
    select.className = 'status-recebimento';
    select.dataset.parcelaId = `${jovemId}_${parcela.numeroParcela}`;
    
    // Usa o status de recebimento salvo ou 'Pendente' como padrão
    const statusAtual = parcela.statusRecebimento || status || 'Pendente';
    
    const opcoes = ['Pendente', 'Recebido', 'Concluído'];
    opcoes.forEach(opcao => {
        const option = document.createElement('option');
        option.value = opcao;
        option.textContent = opcao;
        option.selected = opcao === statusAtual;
        // Desabilita a opção 'Concluído' se não estiver como 'Recebido'
        if (opcao === 'Concluído' && statusAtual !== 'Recebido') {
            option.disabled = true;
        }
        select.appendChild(option);
    });

    select.addEventListener('change', async (e) => {
        const novoStatus = e.target.value;
        const row = e.target.closest('tr');
        
        if (novoStatus === 'Concluído' && statusAtual !== 'Recebido') {
            alert('A parcela precisa estar como "Recebido" antes de ser concluída.');
            e.target.value = statusAtual;
            return;
        }

        if (novoStatus === 'Recebido') {
            try {
                const dataAtual = new Date().toISOString().split('T')[0];
                
                // Atualiza data de recebimento no campo visual
                const dataRecebimentoCell = row.cells[9]; // índice da coluna de data recebimento
                const inputData = dataRecebimentoCell.querySelector('input');
                if (inputData) {
                    inputData.value = dataAtual;
                }

                // Atualiza no Firebase
                const jovemRef = ref(db, `estoqueJovens/${jovemId}`);
                await update(jovemRef, {
                    [`parcelas/${parcela.numeroParcela}`]: {
                        status: parcela.status,
                        statusRecebimento: novoStatus,
                        dataRecebimento: dataAtual
                    }
                });

                alert(`Status atualizado para Recebido e data de recebimento definida para ${formatarData(dataAtual)}`);
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
                alert('Erro ao atualizar status. Tente novamente.');
                e.target.value = statusAtual;
            }
        } else if (novoStatus === 'Concluído') {
            if (!confirm(`Deseja realmente finalizar a parcela ${parcela.numeroParcela}?\nEsta ação irá mover o registro para a tabela de boletos.`)) {
                e.target.value = status;
                return;
            }
            
            try {
                // 1. Salva na tabela boletos
                await salvarBoleto(parcela, jovemId, index);
                
                // 2. Atualiza o status da parcela no estoqueJovens
                const jovemRef = ref(db, `estoqueJovens/${jovemId}`);
                const snapshot = await get(jovemRef);
                const jovemDados = snapshot.val();

                if (jovemDados) {
                    // Criar estrutura de parcelas se não existir
                    if (!jovemDados.parcelas) {
                        jovemDados.parcelas = {};
                    }

                    // Atualizar status da parcela específica
                    const atualizacao = {
                        [`parcelas/${parcela.numeroParcela}`]: {
                            status: 'Concluído',
                            dataRecebimento: new Date().toISOString().split('T')[0],
                            valorPago: parcela.valorCurso / parcela.numeroParcelas
                        }
                    };

                    // Atualizar contador de parcelas pagas
                    const parcelasPagas = Object.values(jovemDados.parcelas || {})
                        .filter(p => p.status === 'Concluído').length + 1;

                    atualizacao.parcelasPagas = parcelasPagas;

                    // Se todas as parcelas foram pagas, marcar jovem como concluído
                    if (parcelasPagas >= jovemDados.numeroParcelas) {
                        atualizacao.status = 'Concluído';
                    }

                    await update(jovemRef, atualizacao);
                }
                
                // 3. Remove a linha visualmente
                row.remove();
                
                alert(`Parcela ${parcela.numeroParcela} marcada como paga com sucesso!`);
            } catch (error) {
                console.error('Erro ao processar pagamento:', error);
                alert('Erro ao processar pagamento. Tente novamente.');
                e.target.value = status;
            }
        }
    });

    return select;
}

function criarCampoDataRecebimento(dataRecebimento, jovemId) {
    const input = document.createElement('input');
    input.type = 'date';
    input.value = dataRecebimento || '';
    input.className = 'input-data';
    
    input.addEventListener('change', (e) => {
        const novaData = e.target.value;
        atualizarDadosJovem(jovemId, { dataRecebimento: novaData });
    });
    
    return input;
}

function atualizarDadosJovem(jovemId, dados) {
    const jovemRef = ref(db, `estoqueJovens/${jovemId}`);
    update(jovemRef, dados)
        .catch(error => console.error('Erro ao atualizar dados:', error));
}

function gerarParcelas(jovem, key) {
    const parcelas = [];
    const dataBase = new Date(jovem.vencimentoBoleto);
    
    for(let i = 0; i < jovem.numeroParcelas; i++) {
        const dataParcela = new Date(dataBase);
        dataParcela.setMonth(dataBase.getMonth() + i);
        
        // Verifica se a parcela já está concluída
        const parcelaStatus = jovem.parcelas?.[i + 1]?.status;
        const parcelaRecebida = jovem.parcelas?.[i + 1]?.statusRecebimento || 'Pendente';
        const dataRecebimento = jovem.parcelas?.[i + 1]?.dataRecebimento || '';
        
        if (parcelaStatus === 'Concluído') {
            continue; // Pula parcelas já concluídas
        }
        
        parcelas.push({
            ...jovem,
            vencimentoBoleto: dataParcela.toISOString().split('T')[0],
            numeroParcela: i + 1,
            status: parcelaStatus || 'Pendente',
            statusRecebimento: parcelaRecebida,
            dataRecebimento: dataRecebimento
        });
    }
    
    return parcelas;
}

// Função para verificar se está próximo do vencimento (5 dias)
function isProximoVencimento(dataVencimento) {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffDias = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
    return diffDias <= 5 && diffDias >= 0;
}

// Função para carregar os dados do Firebase
function carregarDados() {
    console.log('Iniciando carregamento de dados...');
    const tableBody = document.getElementById('table-body');
    
    if (!tableBody) {
        console.error('Elemento table-body não encontrado');
        return;
    }

    const jovensRef = ref(db, 'estoqueJovens');

    onValue(jovensRef, (snapshot) => {
        try {
            console.log('Dados recebidos do Firebase');
            tableBody.innerHTML = '';
            
            const dados = snapshot.val();

            if (!dados) {
                console.log('Nenhum dado encontrado');
                const row = tableBody.insertRow();
                const cell = row.insertCell();
                cell.colSpan = 13;
                cell.textContent = 'Nenhum dado encontrado';
                return;
            }

            // Converte dados em array e ordena por nome
            const jovensOrdenados = Object.entries(dados)
                .map(([key, jovem]) => ({key, ...jovem}))
                .sort((a, b) => (a.nomeJovem || '').localeCompare(b.nomeJovem || '', 'pt-BR'));

            // Processa os jovens já ordenados
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
            console.error('Erro detalhado:', erro);
            tableBody.innerHTML = `<tr><td colspan="13">Erro ao processar dados: ${erro.message}</td></tr>`;
        }
    });
}

function criarSeletorStatus(status, jovemId) {
    const select = document.createElement('select');
    select.className = 'status-select';
    
    // Trata caso status seja undefined ou null
    const statusAtual = status || 'Ativo';
    
    const opcoes = ['Ativo', 'Não Ativo'];
    opcoes.forEach(opcao => {
        const option = document.createElement('option');
        option.value = opcao;
        option.textContent = opcao;
        option.selected = opcao === statusAtual;
        select.appendChild(option);
    });

    select.addEventListener('change', async (e) => { // Adicionado async
        try {
            const novoStatus = e.target.value;
            const row = e.target.closest('tr');
            
            if (novoStatus === 'Não Ativo') {
                row.classList.add('inativo');
                desabilitarCampos(row);
            } else {
                row.classList.remove('inativo');
                habilitarCampos(row);
            }
            
            await atualizarStatusJovem(jovemId, novoStatus); // Aguarda atualização
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            e.target.value = statusAtual; // Reverte para status anterior em caso de erro
            alert('Erro ao atualizar status. Tente novamente.');
        }
    });

    return select;
}

function formatarData(data) {
    if (!data) return '-';
    const dataObj = new Date(data + 'T00:00:00'); // Adicionando tempo para evitar discrepâncias de fuso horário
    return dataObj.toLocaleDateString('pt-BR');
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

// Inicializa quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('Iniciando aplicação...');
    carregarDados();
    
    // Adiciona evento para o filtro
    const filtroInput = document.getElementById('filtroGlobal');
    filtroInput.addEventListener('input', () => {
        aplicarFiltroGlobal();
    });
    
    // Adiciona tecla Esc para limpar filtro
    filtroInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            filtroInput.value = '';
            aplicarFiltroGlobal();
        }
    });

    // Adiciona eventos para os botões de exportar
    const btnExportarFiltrado = document.getElementById('exportarExcelFiltrado');
    const btnExportarTudo = document.getElementById('exportarExcelTudo');

    if (btnExportarFiltrado) {
        btnExportarFiltrado.addEventListener('click', () => exportarParaExcel(true));
    }

    if (btnExportarTudo) {
        btnExportarTudo.addEventListener('click', () => exportarParaExcel(false));
    }
});

async function atualizarEstoqueJovens(jovemId, parcela, parcelasPagas) {
    const jovemRef = ref(db, `estoqueJovens/${jovemId}`);
    
    const atualizacao = {
        parcelasPagas: parcelasPagas,
        [`parcelas_pagas/${parcela.numeroParcela}`]: {
            data: new Date().toISOString(),
            valor: parcela.valorCurso / parcela.numeroParcelas
        }
    };

    await update(jovemRef, atualizacao);
}

function criarCampoValor(valor, jovemId, parcela, isDesconto = false) {
    const input = document.createElement('input');
    input.type = 'text'; // Mudado para texto para aceitar formatação
    input.className = 'input-valor';
    input.value = formatarMoeda(valor);

    // Função auxiliar para converter string em número
    const converteMoedaParaNumero = (valor) => {
        return Number(valor.replace(/[^0-9,-]/g, '').replace(',', '.'));
    };

    input.addEventListener('focus', (e) => {
        // Remove formatação ao focar
        e.target.value = valor.toFixed(2);
    });

    input.addEventListener('blur', (e) => {
        // Formata o valor ao perder o foco
        const numero = parseFloat(e.target.value);
        if (!isNaN(numero)) {
            e.target.value = formatarMoeda(numero);
        }
    });

    input.addEventListener('change', async (e) => {
        const novoValor = converteMoedaParaNumero(e.target.value);
        const campo = isDesconto ? 'valorDesconto' : 'valorCurso';
        
        try {
            const jovemRef = ref(db, `estoqueJovens/${jovemId}`);
            await update(jovemRef, {
                [campo]: novoValor * parcela.numeroParcelas
            });
            
            // Atualiza o valor visualmente com formatação
            e.target.value = formatarMoeda(novoValor);
            alert(`${isDesconto ? 'Valor com desconto' : 'Valor'} atualizado com sucesso!`);
        } catch (error) {
            console.error('Erro ao atualizar valor:', error);
            alert('Erro ao atualizar valor. Tente novamente.');
            e.target.value = formatarMoeda(valor);
        }
    });

    return input;
}

function aplicarFiltroGlobal() {
    const filtro = document.getElementById('filtroGlobal').value.toLowerCase();
    const rows = document.querySelectorAll('#table-body tr');
    
    rows.forEach(row => {
        const nome = row.cells[0].textContent.toLowerCase();
        const status = row.cells[9].querySelector('select')?.value.toLowerCase() || '';
        const projeto = row.cells[12].textContent.toLowerCase();
        
        
        const match = 
            nome.includes(filtro) || 
            status.includes(filtro) || 
            projeto.includes(filtro);
        
        row.style.display = match ? '' : 'none';
    });
}

function exportarParaExcel(apenasVisiveis = false) {
    const tabela = document.querySelector('table');
    const cabecalho = Array.from(tabela.querySelectorAll('thead tr'))[0];
    const todasLinhas = Array.from(tabela.querySelectorAll('tbody tr'));
    
    // Filtra as linhas baseado no parâmetro
    const linhasParaExportar = apenasVisiveis 
        ? todasLinhas.filter(row => row.style.display !== 'none')
        : todasLinhas;
    
    // Se não houver linhas, alerta o usuário
    if (linhasParaExportar.length === 0) {
        alert('Não há dados para exportar.');
        return;
    }

    // Cria uma matriz com os dados, começando com o cabeçalho
    const dados = [
        Array.from(cabecalho.cells).map(cell => cell.textContent)
    ];

    // Adiciona as linhas selecionadas
    linhasParaExportar.forEach(row => {
        const rowData = Array.from(row.cells).map(cell => {
            const input = cell.querySelector('input');
            const select = cell.querySelector('select');
            
            if (input) return input.value;
            if (select) return select.value;
            return cell.textContent;
        });
        dados.push(rowData);
    });

    // Cria uma planilha
    const ws = XLSX.utils.aoa_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jovens");

    // Gera o arquivo Excel com nome apropriado
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const filtro = document.getElementById('filtroGlobal').value;
    const nomeArquivo = apenasVisiveis && filtro
        ? `Jovens_Filtrado_${filtro}_${dataAtual}.xlsx`
        : `Jovens_Completo_${dataAtual}.xlsx`;

    XLSX.writeFile(wb, nomeArquivo);
}
