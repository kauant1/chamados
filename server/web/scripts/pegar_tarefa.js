const section_login = document.querySelector('.body_section_1_login');
const button_send = document.querySelector(".button_send")
const button_register = document.querySelector(".button_register")
const username = document.querySelector(".login_user")
const password = document.querySelector(".login_password")

button_register.addEventListener ('click', async () => {
  window.location.href = '/cadastro';
});

button_send.addEventListener('click', async () => {

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

    // const data = await response.json();

    // Se a solicitação de login for bem-sucedida, obtemos o nome de usuário
    if (response.ok) {
        const userData = await response.json();
        
        // Agora, usamos o nome de usuário para fazer a solicitação para a rota /chamados
        const chamadosResponse = await fetch(`/chamados?username=${userData.username}`);

        // Verificamos se a solicitação de chamados foi bem-sucedida
        if (chamadosResponse.ok) {
            const chamadosData = await chamadosResponse.json();
            console.log(chamadosData); // Aqui você pode lidar com os dados dos chamados recebidos
            displayData(chamadosData);
        } else {
            console.error('Erro ao obter chamados:', chamadosResponse.status);
        }
    } else {
        console.error('Erro no login:', response.status);
    }
});


function displayData(data) {
    section_login.remove();
    const container = document.getElementById('dataContainer');

    container.innerHTML = ''; // Limpa o conteúdo anterior
    let i = 0; // Variável para controlar a iteração

    const button_reload = document.createElement('button')
    button_reload.textContent = 'Atualizar'
    button_reload.classList.add('button_reload_task')
    button_reload.classList.add('button_get_task')
    button_reload.style.marginTop = '4px'
    container.appendChild(button_reload);

    data.forEach((item, index) => {

        const section = document.createElement('section');
        section.classList.add('section_task');
        // Título da tarefa

        const h2 = document.createElement('h2');

        h2.textContent = `Tarefa: ${index + 1}`;

        section.appendChild(h2);

        // Detalhes da tarefa

        const ul = document.createElement('ul');
        ul.style.listStyleType = 'none';

        const liId = document.createElement('li');
        liId.textContent = `Id: ${item[i]}`;
        liId.style.marginTop = '9px'
        ul.appendChild(liId);

        const liSolicitante = document.createElement('li');
        liSolicitante.textContent = `Solicitante: ${item[i + 1]}`;
        ul.appendChild(liSolicitante);

        const liSetor = document.createElement('li');
        liSetor.textContent = `Setor: ${item[i + 2]}`;
        ul.appendChild(liSetor);

        const liHorario = document.createElement('li');
        liHorario.textContent = `Horário: ${item[i + 3]}`;
        ul.appendChild(liHorario);

        const liAréa = document.createElement('li');
        liAréa.textContent = `Aréa: ${item[i + 4]}`;
        ul.appendChild(liAréa);

        const liProblema = document.createElement('li');
        liProblema.textContent = `Problema: ${item[i + 5]}`;
        ul.appendChild(liProblema);

        section.appendChild(ul);


        const button = document.createElement('button')
        button.textContent = 'Pegar Tarefa'
        button.classList.add('button_get_task')
        button.style.marginTop = '10px'
        section.appendChild(button);

        container.appendChild(section);
        i = 0;
    });
    const button_get_task = document.querySelector(".button_get_task")
    
}


// Função para realizar logout
async function logout() {
    try {
        // Enviar requisição para o servidor para invalidar o token
        const response = await fetch('/logout', {
            method: 'POST', // Método POST para informar o logout
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Passa o token no cabeçalho
            }
        });

        // Verifica se a resposta foi bem-sucedida
        if (response.ok) {
            console.log("Logout realizado com sucesso.");

            // Remove o token do armazenamento local
            localStorage.removeItem('token');

            // Redireciona o usuário para a página inicial
            window.location.href = '/';
        } else {
            console.error("Erro ao realizar logout: ", response.status);
            alert("Não foi possível sair. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro ao se conectar ao servidor: ", error);
        alert("Erro de conexão. Tente novamente.");
        window.location.href = '/';
    }
}

// Adicione um evento de clique ao botão "Sair"
document.querySelector('.logout-button').addEventListener('click', logout);
