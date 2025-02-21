import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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

// Função para salvar os dados no Firebase
function salvarCadastroCursoTecnico(event) {
    event.preventDefault();

    const nomeCurso = document.getElementById('nomeCurso').value;
    const nomeEscola = document.getElementById('nomeEscola').value;

    const cursoTecnicoId = Date.now().toString(); // Gerar um ID único baseado no timestamp

    set(ref(db, 'cadastrocursotecnico/' + cursoTecnicoId), {
        nomeCurso,
        nomeEscola
    }).then(() => {
        alert('Cadastro realizado com sucesso!');
        document.getElementById('cadastroCursoTecnicoForm').reset();
    }).catch((error) => {
        alert('Erro ao cadastrar: ' + error.message);
    });
}

// Adicionar evento de submit ao formulário
document.getElementById('cadastroCursoTecnicoForm').addEventListener('submit', salvarCadastroCursoTecnico);

const nomeEscolaInput = document.getElementById('nomeEscola');
const modal = document.getElementById('escolasModal');
const pesquisaEscola = document.getElementById('pesquisaEscola');
const listaEscolas = document.getElementById('listaEscolas');
const closeBtn = document.querySelector('.close');

// Abrir modal ao clicar no input
nomeEscolaInput.addEventListener('click', () => {
    carregarEscolas();
    modal.style.display = 'block';
});

// Fechar modal ao clicar no X
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Fechar modal ao clicar fora dele
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Carregar escolas do Firebase
function carregarEscolas() {
    const escolasRef = ref(db, 'cadastrodeescolatecnica');
    onValue(escolasRef, (snapshot) => {
        const escolas = snapshot.val();
        atualizarListaEscolas(escolas);
    });
}

// Atualizar lista de escolas no modal
function atualizarListaEscolas(escolas) {
    listaEscolas.innerHTML = '';
    if (!escolas) return;

    Object.values(escolas)
        .sort((a, b) => a.razaoSocial.localeCompare(b.razaoSocial))
        .forEach(escola => {
            const li = document.createElement('li');
            li.textContent = escola.razaoSocial;
            li.addEventListener('click', () => {
                nomeEscolaInput.value = escola.razaoSocial;
                modal.style.display = 'none';
            });
            listaEscolas.appendChild(li);
        });
}

// Filtrar escolas ao digitar
pesquisaEscola.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    const itens = listaEscolas.getElementsByTagName('li');
    
    Array.from(itens).forEach(item => {
        const texto = item.textContent.toLowerCase();
        item.style.display = texto.includes(termo) ? '' : 'none';
    });
});