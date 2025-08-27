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


// Função para salvar os dados no Firebase
function salvarCadastroEscolaTecnica(event) {
    event.preventDefault();

    const cnpj = document.getElementById('cnpj').value;
    const razaoSocial = document.getElementById('razaoSocial').value;
    const nomeFantasia = document.getElementById('nomeFantasia').value;
    const endereco = document.getElementById('endereco').value;
    const telefone = document.getElementById('telefone').value;

    const escolaTecnicaId = Date.now().toString(); // Gerar um ID único baseado no timestamp

    set(ref(db, 'cadastrodeescolatecnica/' + escolaTecnicaId), {
        cnpj,
        razaoSocial,
        nomeFantasia,
        endereco,
        telefone
    }).then(() => {
        alert('Cadastro realizado com sucesso!');
        document.getElementById('cadastroEscolaTecnicaForm').reset();
    }).catch((error) => {
        alert('Erro ao cadastrar: ' + error.message);
    });
}

// Função para abrir o modal e carregar as escolas técnicas
function abrirModal() {
    const modal = document.getElementById('escolasModal');
    const escolasList = document.getElementById('escolasList');
    escolasList.innerHTML = ''; // Limpar lista

    const escolasRef = ref(db, 'cadastrodeescolatecnica');
    onValue(escolasRef, (snapshot) => {
        const data = snapshot.val();
        for (const escolaId in data) {
            const li = document.createElement('li');
            li.textContent = data[escolaId].razaoSocial;
            li.addEventListener('click', () => {
                document.getElementById('razaoSocial').value = data[escolaId].razaoSocial;
                modal.style.display = 'none';
            });
            escolasList.appendChild(li);
        }
    });

    modal.style.display = 'block';
}

// Adicionar evento de submit ao formulário
document.getElementById('cadastroEscolaTecnicaForm').addEventListener('submit', salvarCadastroEscolaTecnica);

// Adicionar evento de clique ao campo de razão social para abrir o modal
document.getElementById('razaoSocial').addEventListener('click', abrirModal);

// Fechar o modal quando o usuário clicar no "x"
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('escolasModal').style.display = 'none';
});

// Fechar o modal quando o usuário clicar fora do modal
window.addEventListener('click', (event) => {
    const modal = document.getElementById('escolasModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});