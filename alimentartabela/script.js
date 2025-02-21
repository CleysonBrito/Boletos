import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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

function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.style.display = 'block';
}

document.querySelector('.close-popup').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'none';
});

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