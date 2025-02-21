import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7eniB3_IFT8E-Tb1VkfktcWUsfLRRYXw",
    authDomain: "bancoreciclar.firebaseapp.com",
    databaseURL: "https://bancoreciclar-default-rtdb.firebaseio.com",
    projectId: "bancoreciclar",
    storageBucket: "bancoreciclar.firebasestorage.app",
    messagingSenderId: "418801320354",
    appId: "1:418801320354:web:3f854deb9e2dda520732fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById('entradaJovemForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const jovem = {
        nomeJovem: this.nomeCompleto.value,
        escolaTecnica: this.escolaTecnica.value,
        cursoTecnico: this.cursoTecnico.value,
        turma: this.turma.value,
        dataNascimento: this.dataNascimento.value,
        valorCurso: parseFloat(this.valorCurso.value),
        valorDesconto: parseFloat(this.valorDesconto.value), // Novo campo
        numeroParcelas: parseInt(this.numeroParcelas.value),
        vencimentoBoleto: this.vencimentoBoleto.value,
        emailResponsavel: this.emailResponsavel.value,
        status: 'Ativo',
        dataEntrada: new Date().toISOString()
    };

    const jovemId = Date.now().toString();
    try {
        await set(ref(db, 'estoqueJovens/' + jovemId), jovem);
        alert('Jovem cadastrado com sucesso!');
        this.reset();
    } catch (error) {
        console.error('Erro ao cadastrar jovem:', error);
        alert('Erro ao cadastrar jovem. Tente novamente.');
    }
});

async function addJovem(jovem) {
    const jovemId = Date.now().toString();
    try {
        await set(ref(db, 'estoqueJovens/' + jovemId), jovem);
        return true;
    } catch (error) {
        console.error('Erro ao adicionar jovem:', error);
        throw error;
    }
}

// Função para validar dados do jovem
function validarDadosJovem(row, index) {
    const erros = [];
    
    // Validação de campos obrigatórios
    if (!row['Nome Completo']) erros.push('Nome Completo');
    if (!row['Data de Nascimento']) erros.push('Data de Nascimento');
    if (!row['Valor do Curso']) erros.push('Valor do Curso');
    if (!row['Número de Parcelas']) erros.push('Número de Parcelas');
    if (!row['Vencimento do Boleto']) erros.push('Vencimento do Boleto');
    
    if (erros.length > 0) {
        throw new Error(`Linha ${index + 2}: Campos obrigatórios faltando: ${erros.join(', ')}`);
    }
    
    // Validação de tipos de dados
    const valorCurso = parseFloat(row['Valor do Curso']);
    const numeroParcelas = parseInt(row['Número de Parcelas']);
    
    if (isNaN(valorCurso)) throw new Error(`Linha ${index + 2}: Valor do curso inválido`);
    if (isNaN(numeroParcelas) || numeroParcelas <= 0) throw new Error(`Linha ${index + 2}: Número de parcelas inválido`);
    
    return true;
}

// Função auxiliar para tratar strings
function toString(value) {
    return value ? String(value) : '';
}

// Função para formatar a data para exibição
function formatarDataExibicao(data) {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR'); // Exibe no formato dd/mm/yyyy
}

// Modifique o event listener do importExcel
document.getElementById('importExcel').addEventListener('click', async () => {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Por favor, selecione um arquivo Excel primeiro.');
        return;
    }

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                console.log('Dados da planilha:', jsonData); // Debug

                let sucessos = 0;
                let falhas = 0;
                const erros = [];

                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    try {
                        // Valida dados primeiro
                        validarDadosJovem(row, i);

                        const jovem = {
                            nomeJovem: toString(row['Nome Completo']).trim(),
                            escolaTecnica: toString(row['Escola Técnica']).trim(),
                            cursoTecnico: toString(row['Curso Técnico']).trim(),
                            turma: toString(row['Turma']).trim(),
                            dataNascimento: formatarData(row['Data de Nascimento']) || 'Data inválida',
                            valorCurso: parseFloat(row['Valor do Curso']),
                            valorDesconto: parseFloat(row['Valor do Curso com Desconto']) || 0,
                            numeroParcelas: parseInt(row['Número de Parcelas']),
                            vencimentoBoleto: formatarData(row['Vencimento do Boleto']) || 'Data inválida',
                            emailResponsavel: toString(row['Email do Responsável']).trim(),
                            status: 'Ativo',
                            dataEntrada: new Date().toISOString()
                        };

                        // Log para debug
                        console.log(`Processando linha ${i + 2}:`, jovem);

                        await addJovem(jovem);
                        sucessos++;
                    } catch (error) {
                        console.error(`Erro na linha ${i + 2}:`, error);
                        erros.push(error.message);
                        falhas++;
                    }
                }

                // Feedback detalhado
                const mensagem = `Importação concluída!\n\nSucessos: ${sucessos}\nFalhas: ${falhas}\n\n${
                    erros.length > 0 ? 'Erros encontrados:\n' + erros.join('\n') : ''
                }`;

                alert(mensagem);
                fileInput.value = '';
            } catch (error) {
                console.error('Erro ao processar planilha:', error);
                alert('Erro ao processar planilha: ' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        alert('Erro ao processar arquivo. Verifique o formato e tente novamente.');
    }
});

function formatarData(data) {
    if (!data) return null;
    // Tenta converter diferentes formatos de data
    const d = new Date(data);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
    }
    return null;
}
