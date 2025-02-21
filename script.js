document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.querySelector('input[name="email"]').value;
    const senha = document.querySelector('input[name="senha"]').value;
    
    const EMAIL_CORRETO = 'cleyson@reciclar.org.br';
    const SENHA_CORRETA = "@123abc@";
    
    if (email === EMAIL_CORRETO && senha === SENHA_CORRETA) {
        window.location.href = 'home.html';
    } else {
        alert('E-mail ou senha inválidos. Por favor, tente novamente.');
        document.querySelector('input[name="senha"]').value = ''; // Limpa o campo senha
    }
});
