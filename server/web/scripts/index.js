const section_login = document.querySelector('.body_section_1_login');
const button_send = document.querySelector(".button_send");
const button_register = document.querySelector(".button_register");
let button_get_task;
const username = document.querySelector(".login_user");
const password = document.querySelector(".login_password");

button_register.addEventListener('click', async () => {
    window.location.href = '/cadastro';
});

async function handleLogin() {
    if (username.value.trim() === "" || password.value.trim() === "") {
        alert("Nome de usuário e senha não podem estar em branco.");
        return;
    }

    const dataa = {
        username: username.value,
        password: password.value
    };

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataa)
    });
    
    if (response.status === 401) {
        alert("Usuário ou senha inválidos.");
        return;
    }

    if (response.headers.get('Content-Type') === 'application/json') {
        const user = await response.json();
        console.log("Dados protegidos:", user);
        localStorage.setItem('token', user.access_token);
        // window.location.href = '/dashboard?username=' + user.username + '&office=' + user.office;
        window.location.href = `/dashboard?username=${user.username}&office=${user.office}`;
        // window.location.href = `/dashboard?username=${user.username}&office=${user.office}&token=${localStorage.getItem('token')}`;
    } else if (response.headers.get('Content-Type') === 'text/html') {
        response.text().then(data => {document.body.innerHTML = data; });
    } else {
        response.text().then(data => {document.body.innerHTML = data; });
    }
}
const user = {
    username: username.value,
    password: password.value
};
async function acessarDashboard(user) {
    const token = localStorage.getItem('token'); // Recuperar o token armazenado no localStorage

    if (!token) {
        alert("Token não encontrado. Faça login novamente.");
        window.location.href = '/login';
        return;
    }

    // Fazer requisição à rota protegida com o token no cabeçalho
    const response = await fetch('/dashboard', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Token no cabeçalho
            'Content-Type': 'application/json',
            'username': username.value,
            'password': password.value
        }
    });

    if (response.status === 401) {
        alert("Token inválido ou sessão expirada. Faça login novamente.");
        window.location.href = '/login';
        return;
    }

    if (response.headers.get('Content-Type') === 'text/html') {
        const html = await response.text();
        // Substituir o conteúdo do corpo da página com a resposta do servidor
        document.body.innerHTML = html;
    } else {
        alert("Erro ao carregar a página.");
        console.error(await response.text());
    }
}


button_send.addEventListener('click', acessarDashboard);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleLogin();
    }
});
