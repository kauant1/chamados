const nome = document.querySelector('.Name').textContent;
const office = document.querySelector('.Office').textContent;
const container = document.getElementById('dataContainer');


function createButton(button, text, margem) {
    button.textContent = `${text}`;
    button.classList.add('button_get_task');
    button.classList.add('button_reload_task')
    document.getElementById('ContainerTasksButtons').appendChild(button);
    return button;
};

// function createButton(button, imgSrc, margem) {
//     const img = document.createElement("img");
//     img.src = imgSrc; // URL da imagem
//     img.classList.add("emoji-cell-img");
//     button.appendChild(img); // Adiciona a imagem ao botão
//     button.classList.add('button_get_task');
//     button.classList.add('button_get_task');
//     document.getElementById('ContainerTasksButtons').appendChild(button);
//     return button;
// };


if (office === 'Superior') {
    const button_newTask = document.createElement('button')
    const button_viewalltask = document.createElement('button')
    
    // Adiciona imagens diferentes para cada botão
    // createButton(button_newTask, 'https://cdn-icons-png.flaticon.com/512/1091/1091916.png', '8px'); // URL da imagem do botão "Nova Tarefa"
    // createButton(button_viewalltask, 'https://cdn-icons-png.flaticon.com/512/1092/1092162.png ', '8px'); // URL da imagem do botão "Ver Chamados"

    
    createButton(button_newTask, 'Nova Tarefa', '8px')
    createButton(button_viewalltask, 'Ver Chamados', '8px')

    button_newTask.addEventListener ('click', () => {
        window.location.href = '/new_task?username=' + nome + '&office=' + office;
    })

    button_viewalltask.addEventListener ('click', () => {
        window.location.href = '/all-task';
    })
} else{
    const button_reload = document.createElement('button')
    const button_query_task = document.createElement('button')
    const view_my_tasks = document.createElement('button')
    createButton(button_reload, 'Ver Todas', '8px')
    createButton(button_query_task, 'Minhas Tarefas', '4px')
    createButton(view_my_tasks, 'Tarefas Finalizadas', '4px')

    async function getChamados() {
        const nome = document.querySelector('.Name').textContent;
        const response = await fetch(`/chamados?username=${nome}`);
        const chamadosData = await response.json();
        if (chamadosData.message) {
            alert(chamadosData.message);
            button_reload.disabled = true;
            return
        }
        if (response.ok) {
        console.log(chamadosData); // Aqui você pode lidar com os dados dos chamados recebidos
        displayData(chamadosData);
        } else {
            alert('Erro ao obter chamados:', response.status);
        }
    };
    getChamados();

    async function getTasks() {
        const user = nome;
        const response = await fetch(`/get-task?user=${user}`);
        const retorno = await response.json();
        if (retorno.erro) {
            alert(retorno.erro)
            button_reload.disabled = false;
            return
        }
        // window.location.href = `/get-task?user=${user}`;
    };

    async function displayData(data) {
        button_query_task.disabled = false;
        button_reload.disabled = true;
        view_my_tasks.disabled = false;
        container.innerHTML = ''; // Limpa o conteúdo anterior
        let i = 0;
        data.forEach((item, index) => {
            const section = document.createElement('section');
            section.classList.add('section_task');
            const h2 = document.createElement('h2');
            h2.textContent = `Tarefa: ${index + 1}`;
            section.appendChild(h2);
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
            let button_get_task = document.createElement('button')
            section.appendChild(editButton(button_get_task, item[0], "Pegar Tarefa"));
            container.appendChild(section);
            i = 0;
            button_get_task.addEventListener('click', async () => {
                const data_task = {
                    id: item[0],
                    user: nome
                };
                const response = await fetch('/post-task', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data_task)
                });
                const taskpost = await response.json();
                if (taskpost.message) {
                    alert(taskpost.message);
                    getChamados()
                }
            });
            
        });
    };

    function editButton(button, id, text) {
        button.textContent = `${text} ${id}`;
        button.classList.add('button-group');
        button.style.marginTop = '10px';
        return button;
    };

    button_reload.addEventListener('click', () => getChamados());

    button_query_task.addEventListener('click', async () => {
        button_query_task.disabled = true;
        button_reload.disabled = false;
        view_my_tasks.disabled = false;
        const user = nome;
        const response = await fetch(`/get-task?user=${user}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        container.innerHTML = '';
        let i = 0;
        const TaskData = await response.json();
        if (TaskData.erro) {
            alert(TaskData.erro);
            return
        };
        TaskData.data.forEach((item, index) => {
            const section = document.createElement('section');
            section.classList.add('section_task');
            const h2 = document.createElement('h2');
            h2.textContent = `Tarefa: ${index + 1}`;
            section.appendChild(h2);
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
            const liProfissional = document.createElement('li');
            liProfissional.textContent = `Ativa para: ${item[i + 6]}`;
            ul.appendChild(liProfissional);
            const liHoraInicio = document.createElement('li');
            liHoraInicio.textContent = `Iniciada ás: ${item[i + 8]}`;
            ul.appendChild(liHoraInicio);
            container.appendChild(section);
            let button_end_task = document.createElement('button')
            section.appendChild(editButton(button_end_task, item[0], "Finalizar Tarefa"));
            container.appendChild(section);

            button_end_task.addEventListener('click', async () => {
                const data_task = {
                    id: item[0],
                    user: nome
                };
                const response = await fetch('/end-task', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data_task)
                });
                const taskpost = await response.json();
                if (taskpost.message) {
                    alert(taskpost.message);
                    getTasks()
                }
            });
        });
    });

    view_my_tasks.addEventListener('click', async () => {
        const data_task = {
            user: nome
        };
        const task_finished  = await fetch('/task-finished', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data_task)
        });
        const TaskData = await task_finished.json();
        if (TaskData.message) {
            alert(TaskData.message);
            view_my_tasks.disabled = true;
            button_reload.disabled = false;
            return
        }
        container.innerHTML = '';
        let i = 0;
        TaskData.forEach((item, index) => {
            const section = document.createElement('section');
            section.classList.add('section_task');
            const h2 = document.createElement('h2');
            h2.textContent = `Tarefa: ${index + 1}`;
            section.appendChild(h2);
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
            const liProfissional = document.createElement('li');
            liProfissional.textContent = `Ativa para: ${item[i + 6]}`;
            ul.appendChild(liProfissional);
            const liFinalizada = document.createElement('li');
            liFinalizada.textContent = `Finalizada: ${item[i + 7]}`;
            ul.appendChild(liFinalizada);
            const liHoraInicio = document.createElement('li');
            liHoraInicio.textContent = `Iniciada ás: ${item[i + 8]}`;
            ul.appendChild(liHoraInicio);
            const liHoraFinal = document.createElement('li');
            liHoraFinal.textContent = `Finalizada ás: ${item[i + 9]}`;
            ul.appendChild(liHoraFinal);
            const liDuração = document.createElement('li');
            liDuração.textContent = `Duração do Serviço: ${item[i + 10]}`;
            ul.appendChild(liDuração);
            container.appendChild(section);
        });
        button_query_task.disabled = false;
        button_reload.disabled = false;
        view_my_tasks.disabled = true;
    });
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
