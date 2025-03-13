async function fetchTasks() {
    const response = await fetch('/all-task-data');
    const data = await response.json();
    const tasks = data.tasks;
    const tbody = document.querySelector("#task-table-body");
    tasks.forEach(task => {
        const row = document.createElement("tr");
        task.forEach((item, index) => {
            const cell = document.createElement("td");
            // Alteração: Coluna "Finalizada"
            if (index === 7) { // Supondo que a coluna "Finalizada" é o índice 7
                cell.textContent = item === "true" ? "✔️" : "❌"; // Define o emoji com base no valor
                cell.classList.add("emoji-cell"); // Adiciona classe para centralização e ajuste do emoji
            } 
            
            // Alteração: Colunas "Inicio" e "Termino"
            else if (index === 8 || index === 9) { // Supondo que "Inicio" é índice 8 e "Termino" é índice 9
                cell.textContent = item === "Null" ? `⏱️` : item; // Adiciona emoji de ampulheta quando for "Null"
                if (item === "Null") cell.classList.add("emoji-cell"); // Adiciona classe apenas se houver emoji
            } 
            // Alteração: Coluna "Profissional"
            else if (index === 6) { // Supondo que "Profissional" é o índice 6
                cell.textContent = item === "aguardando" ? `👻` : item; // Adiciona emoji de ampulheta para "aguardando"
                if (item === "aguardando") cell.classList.add("emoji-cell"); // Adiciona classe apenas se houver emoji
            }  
            else if (index === 10) { // Supondo que "Duracao" é o índice 10
                cell.textContent = item === "00:00:00" ? `🔄` : item;
                if (item === "00:00:00") cell.classList.add("emoji-cell"); // Adiciona classe apenas se houver emoji
            }  
            else if (index === 4) {
                if (item === "Mecânico") {
                    cell.textContent = `👨‍🔧`;
                    cell.classList.add("emoji-cell");
                } else if (item === "T.I.") {
                    cell.textContent = `💻`;
                    cell.classList.add("emoji-cell");
                } else if (item === "Elétrico") {
                    cell.textContent = `⚡`;
                    cell.classList.add("emoji-cell");
                } else {
                    cell.textContent = item; // Caso não seja "Mecânico" ou "T.I."
                }
            }
            
            else {
                cell.textContent = item; // Preenche as demais células normalmente
            }
            // cell.textContent = item;
            row.appendChild(cell);
        });

        // Adicionando os botões de editar e excluir
        const actionCell = document.createElement("td");
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "action-buttons";

        const editButton = document.createElement("button");
        editButton.textContent = "✏️";
        editButton.addEventListener("click", () => editTask(task[0])); // Assumindo que task[0] seja o ID

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️";
        deleteButton.addEventListener("click", () => deleteTask(task[0]));

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        actionCell.appendChild(buttonContainer);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });
}

async function editTask(taskId) {
    try {
        const response = await fetch(`/edit-task/${taskId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId })
        });

        if (response.ok) {
            console.log(`Tarefa com ID ${taskId} editada com sucesso.`);
        } else {
            console.error("Erro ao editar a tarefa:", response.status);
        }
    } catch (error) {
        console.error("Erro na conexão com o servidor ao editar a tarefa:", error);
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`/delete-task/${taskId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId })
        });

        if (response.ok) {
            console.log(`Tarefa com ID ${taskId} excluída com sucesso.`);
            // Remover a linha correspondente da tabela
            const row = document.querySelector(`tr td:first-child[textContent="${taskId}"]`).parentNode;
            row.remove();
        } else {
            console.error("Erro ao excluir a tarefa:", response.status);
        }
    } catch (error) {
        console.error("Erro na conexão com o servidor ao excluir a tarefa:", error);
    }
}

async function logout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`}});

        if (response.ok) {
            console.log("Logout realizado com sucesso.");
  
            localStorage.removeItem('token');
  
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

document.addEventListener("DOMContentLoaded", fetchTasks);
document.querySelector('.logout-button').addEventListener('click', logout);
