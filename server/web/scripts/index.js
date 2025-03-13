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
        window.location.href = '/dashboard?username=' + user.username + '&office=' + user.office;
    } else if (response.headers.get('Content-Type') === 'text/html') {
        response.text().then(data => {document.body.innerHTML = data; });
    } else {
        response.text().then(data => {document.body.innerHTML = data; });
    }
}

button_send.addEventListener('click', handleLogin);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleLogin();
    }
});
