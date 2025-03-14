async function fetchTasks() {
    const response = await fetch('/all-task-data');
    const data = await response.json();
    const tasks = data.tasks;
    const tbody = document.querySelector("#task-table-body");
    tasks.forEach(task => {
        const row = document.createElement("tr");
        task.forEach((item, index) => {
            const cell = document.createElement("td");
            // if (index === 7) {
            //     cell.textContent = item === "true" ? "✅" : "❎";
            //     cell.classList.add("emoji-cell");
            // } funcionando 
            if (index === 7) { // Supondo que a coluna "Finalizada" é o índice 7
                const img = document.createElement("img"); // Cria o elemento de imagem
                img.src = item === "true" ? "https://cdn-icons-png.flaticon.com/128/6782/6782609.png" : "https://cdn-icons-png.flaticon.com/128/6782/6782613.png"; // Define o caminho da imagem com base no valor
                img.alt = item === "true" ? "Finalizado" : "Não finalizado"; // Define um texto alternativo descritivo
                img.classList.add("emoji-cell-img"); // Adiciona uma classe para customizar as imagens
                cell.appendChild(img); // Adiciona o elemento de imagem à célula
            }

            // Alteração: Colunas "Inicio" e "Termino"
            // else if (index === 8 || index === 9) {
            //     cell.textContent = item === "Null" ? `⏱️` : item;
            //     if (item === "Null") cell.classList.add("emoji-cell");
            // }
            else if (index === 8 || index === 9) {
                if (item === "Null") {
                    const img = document.createElement("img");
                    img.src = "https://cdn-icons-png.flaticon.com/512/6782/6782783.png";
                    img.alt = "Null Image";
                    cell.appendChild(img);
                    img.classList.add("emoji-cell-img");
                } else {
                    cell.textContent = item; // Exibe o texto caso não seja "Null"
                }
            }
            
            // Alteração: Coluna "Profissional"
            else if (index === 6) { // Supondo que "Profissional" é o índice 6
                if (item === "aguardando") {
                    const img = document.createElement("img");
                    img.src = "https://cdn-icons-png.flaticon.com/512/6782/6782783.png";
                    img.alt = "Null Image";
                    cell.appendChild(img);
                    img.classList.add("emoji-cell-img");
                } else {
                    cell.textContent = item; // Exibe o texto caso não seja "Null"
                }
            }

            else if (index === 10) { // Supondo que "Duracao" é o índice 10
                if (item === "00:00:00") {
                    const img = document.createElement("img");
                    img.src = "https://cdn-icons-png.flaticon.com/128/5293/5293489.png";
                    img.alt = "Ícone";
                    img.classList.add("emoji-cell"); // Adiciona a classe ao elemento de imagem
                    cell.textContent = ""; // Limpa o conteúdo anterior
                    cell.appendChild(img); // Adiciona o elemento de imagem à célula
                    img.classList.add("emoji-cell-img");
                } else {
                    cell.textContent = item; // Exibe o valor do texto normalmente
                }
            }
            
            else if (index === 4) {
                if (item === "Mecânico") {
                    if (item === "Mecânico") {
                        const img = document.createElement("img");
                        img.src = "https://cdn-icons-png.flaticon.com/128/2494/2494496.png";
                        img.alt = "Null Image";
                        cell.appendChild(img);
                        img.classList.add("emoji-cell-img");
                    } else {
                        cell.textContent = item; // Exibe o texto caso não seja "Null"
                    }
                } else if (item === "T.I.") {
                    if (item === "T.I.") {
                        const img = document.createElement("img");
                        img.src = "https://cdn-icons-png.flaticon.com/128/874/874890.png";
                        img.alt = "Null Image";
                        cell.appendChild(img);
                        img.classList.add("emoji-cell-img");
                    } else {
                        cell.textContent = item; // Exibe o texto caso não seja "Null"
                    }
                } else if (item === "Elétrico") {
                    if (item === "Elétrico") {
                        const img = document.createElement("img");
                        img.src = "https://cdn-icons-png.flaticon.com/128/5556/5556061.png";
                        img.alt = "Null Image";
                        cell.appendChild(img);
                        img.classList.add("emoji-cell-img");
                    } else {
                        cell.textContent = item; // Exibe o texto caso não seja "Null"
                    }
                } else {
                    cell.textContent = item; // Caso não seja "Mecânico" ou "T.I."
                }
            }
            else {
                cell.textContent = item; // Preenche as demais células normalmente
            }

            // cell.textContent = item;
            row.appendChild(cell);
            row.className = "color-row";
        });

        // Adicionando os botões de editar e excluir
        const actionCell = document.createElement("td");
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "action-buttons";

        const editButton = document.createElement("button");
        const img = document.createElement("img");
        img.src = "https://cdn-icons-png.flaticon.com/128/84/84380.png";
        img.classList.add("emoji-cell-img");
        // editButton.textContent = "✏️";
        editButton.appendChild(img);
        editButton.addEventListener("click", () => editTask(task[0]));


        const deleteButton = document.createElement("button");
        const img1 = document.createElement("img");
        img1.src = "https://cdn-icons-png.flaticon.com/128/54/54324.png";
        img1.classList.add("emoji-cell-img");
        // deleteButton.textContent = "🗑️";
        deleteButton.appendChild(img1)
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
