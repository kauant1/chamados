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

async function acessardados(){
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
        return null;
    }

    if (response.headers.get('Content-Type') === 'application/json') {
        const user = await response.json();
        const dadosuser = await acessarDashboard(user);
        return };
    return null;
}

async function acessarDashboard(userdados) {

    if (!userdados) {
        alert("Erro ao obter dados do usuário. Faça login novamente.");
        return;
    }
    const username = userdados.username;
    const office = userdados.office;
    const token = userdados.access_token;

    if (!token || !username || !office) {
        alert("Dados insuficientes (token, usuário ou cargo não encontrados).");
        window.location.href = '/';
        return;
    }

    const response = await fetch(`/dashboard?username=${username}&office=${office}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });

    if (response.status === 401 || response.status === 403) {
        alert("Sessão inválida ou expirada. Faça login novamente.");
        window.location.href = '/';
        return;
    }

    if (response.ok) {
        const html = await response.text();
        document.body.innerHTML = html;

        // Carregar o dashboard.js
        const script = document.createElement('script');
        script.src = '/scripts/dashboard.js';
        script.type = 'text/javascript';
        document.body.appendChild(script);

        // Carregar o dashboard.css
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/style/dashboard.css';
        document.head.appendChild(link);
    }

    else {
        console.error("Erro ao acessar o dashboard:", await response.text());
    }
}

button_send.addEventListener('click', acessardados);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleLogin();
    }
});

// const response = await fetch('/dashboard', {
//     method: 'GET',
//     headers: {
//         'Authorization': `Bearer ${token}`, // Token no cabeçalho
//         'Content-Type': 'application/json',
//         'username': username.value,
//         'password': password.value
//     }
// });