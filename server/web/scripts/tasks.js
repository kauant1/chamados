// async function openEditChecklist(taskId) {
//     const container = document.getElementById("edit-container");
//     const saveButton = document.getElementById("save-button");
//     const cancelButton = document.getElementById("cancel-button");
//     const newValueInput = document.getElementById("new-value-input");

//     // Exibe o container
//     container.style.display = "block";

//     // Ação ao clicar no botão "Salvar"
//     saveButton.onclick = async () => {
//         const selectedOption = document.getElementById("field-select").value; // Valor do campo selecionado
//         const newValue = newValueInput.value;

//         if (!selectedOption) {
//             alert("Por favor, selecione uma opção para editar.");
//             return;
//         }

//         if (!newValue) {
//             alert("Por favor, insira um novo valor.");
//             return;
//         }

//         try {
//             const response = await fetch(`/edit-task/${taskId}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     field: selectedOption, // Corrigido para enviar diretamente o valor
//                     new_value: newValue
//                 })
//             });

//             if (response.ok) {
//                 alert("Tarefa editada com sucesso!");
//                 fetchTasks(); // Atualiza a lista de tarefas
//             } else {
//                 alert("Erro ao editar a tarefa. Tente novamente.");
//             }
//         } catch (error) {
//             console.error("Erro ao conectar com o servidor:", error);
//         } finally {
//             container.style.display = "none"; // Fecha o container
//         }
//     };

//     // Ação ao clicar no botão "Cancelar"
//     cancelButton.onclick = () => {
//         container.style.display = "none"; // Fecha o container sem salvar
//     };
// }

async function openEditChecklist(taskId) {
    const container = document.getElementById("edit-container");
    const saveButton = document.getElementById("save-button");
    const cancelButton = document.getElementById("cancel-button");
    const newValueInput = document.getElementById("new-value-input");
    const fieldSelect = document.getElementById("field-select");
    const secondarySelectContainer = document.createElement("div");
    const secondarySelect = document.createElement("select");

    // Configuração do segundo select
    secondarySelect.id = "secondary-select";
    secondarySelect.style.display = "none"; // Esconde inicialmente
    secondarySelectContainer.appendChild(secondarySelect);
    container.appendChild(secondarySelectContainer);

    // Exibe o container
    container.style.display = "block";

    // Monitora mudanças no campo principal (field-select)
    fieldSelect.addEventListener("change", () => {
        const selectedOption = fieldSelect.value;

        // Limpa o segundo select
        secondarySelect.innerHTML = "";

        // Exibe opções diferentes com base na escolha
        if (selectedOption === "finalizada") {
            secondarySelect.style.display = "block";
            const trueOption = document.createElement("option");
            trueOption.value = "true";
            trueOption.textContent = "True";

            const falseOption = document.createElement("option");
            falseOption.value = "false";
            falseOption.textContent = "False";

            secondarySelect.appendChild(trueOption);
            secondarySelect.appendChild(falseOption);
            newValueInput.style.display= "none";
        } else if (selectedOption === "area") {
            secondarySelect.style.display = "block";
            const option1 = document.createElement("option");
            option1.value = "T.I.";
            option1.textContent = "T.I.";

            const option2 = document.createElement("option");
            option2.value = "Mecânico";
            option2.textContent = "Mecânico";

            const option3 = document.createElement("option");
            option3.value = "Elétrico";
            option3.textContent = "Elétrico";

            secondarySelect.appendChild(option1);
            secondarySelect.appendChild(option2);
            secondarySelect.appendChild(option3);
            newValueInput.style.display= "none";
        } else {
            secondarySelect.style.display = "none";
            newValueInput.style.display= "block";
        }
    });

    // Ação ao clicar no botão "Salvar"
    saveButton.onclick = async () => {
        const selectedOption = fieldSelect.value;
        const newValue = selectedOption === "finalizada" || selectedOption === "area" 
            ? secondarySelect.value 
            : newValueInput.value;

        if (!selectedOption) {
            alert("Por favor, selecione uma opção para editar.");
            return;
        }

        if (!newValue) {
            alert("Por favor, insira um novo valor.");
            return;
        }

        try {
            const response = await fetch(`/edit-task/${taskId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    field: selectedOption,
                    new_value: newValue
                })
            });

            if (response.ok) {
                alert("Tarefa editada com sucesso!");
                fetchTasks(); // Atualiza a lista de tarefas
            } else {
                alert("Erro ao editar a tarefa. Tente novamente.");
            }
        } catch (error) {
            console.error("Erro ao conectar com o servidor:", error);
        } finally {
            container.style.display = "none"; // Fecha o container
        }
    };

    // Ação ao clicar no botão "Cancelar"
    cancelButton.onclick = () => {
        container.style.display = "none"; // Fecha o container sem salvar
    };
}

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
                // const img = document.createElement("img"); // Cria o elemento de imagem
                // img.src = item === "true" ? "https://cdn-icons-png.flaticon.com/128/6782/6782609.png" : "https://cdn-icons-png.flaticon.com/128/6782/6782613.png"; // Define o caminho da imagem com base no valor
                // img.alt = item === "true" ? "Finalizado" : "Não finalizado"; // Define um texto alternativo descritivo
                // img.classList.add("emoji-cell-img"); // Adiciona uma classe para customizar as imagens
                // cell.appendChild(img);

                const svg = document.createElement("svg");
                svg.innerHTML = item === "true" 
                    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" width="24px" height="24px"><circle cx="12" cy="12" r="10"/></svg>` 
                    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" width="24px" height="24px"><circle cx="12" cy="12" r="10"/></svg>`;
                cell.appendChild(svg);
            }

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
        // editButton.addEventListener("click", () => editTask(task[0]));
        editButton.addEventListener("click", () => openEditChecklist(task[0]));


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
        const newValue = document.getElementById("new-value-input").value; // Ou obtenha o valor corretamente
        const response = await fetch(`/edit-task/${taskId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ new_value: newValue }) // Corrigido aqui
        });

        if (response.ok) {
            console.log(`Tarefa com ID ${taskId} editada com sucesso.`);
            window.location.reload();
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
            
            const rows = document.querySelectorAll("tr");
            let rowToRemove = null;

            rows.forEach(row => {
                const cell = row.querySelector("td:first-child");
                if (cell && cell.textContent === String(taskId)) {
                    rowToRemove = row;
                }
            });

            if (rowToRemove) {
                rowToRemove.remove();
            } else {
                console.warn(`Não foi possível encontrar a linha correspondente à tarefa com ID ${taskId}.`);
            }

            // window.location.reload();
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



// editButton.addEventListener("click", () => openEditChecklist(task[0]));
document.addEventListener("DOMContentLoaded", fetchTasks);
document.querySelector('.logout-button').addEventListener('click', logout);
