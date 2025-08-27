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

// Função para exibir popup
function showPopup(message) {
  const popup = document.getElementById('popup');
  const popupMessage = document.getElementById('popup-message');
  popupMessage.textContent = message;
  popup.style.display = 'block';
}

// Fechar popup
document.querySelector('.close-popup').addEventListener('click', () => {
  document.getElementById('popup').style.display = 'none';
});

// Lógica de envio do formulário
document.getElementById('cadastroForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const dados = {
    nomeJovem: document.getElementById('nomeJovem').value,
    escolaTecnica: document.getElementById('escolaTecnica').value,
    cursoTecnico: document.getElementById('cursoTecnico').value,
    dataNascimento: document.getElementById('dataNascimento').value,
    valorCurso: parseFloat(document.getElementById('valorCurso').value),
    numeroParcelas: parseInt(document.getElementById('numeroParcelas').value),
    vencimentoBoleto: document.getElementById('vencimentoBoleto').value,
    boletosRecebidos: parseInt(document.getElementById('boletosRecebidos').value),
    dataRecebimento: document.getElementById('dataRecebimento').value,
    status: document.getElementById('status').value,
    projeto: document.getElementById('projeto').value,
    emailResponsavel: document.getElementById('emailResponsavel').value
  };

  const novoId = Date.now().toString();
  set(ref(db, 'estoqueJovens/' + novoId), dados)
    .then(() => {
      showPopup('Cadastro realizado com sucesso!');
      this.reset();
    })
    .catch((error) => {
      showPopup('Erro ao cadastrar: ' + error.message);
    });
});