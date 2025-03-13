const progress_bar = document.querySelector("#progress");
const select1 = document.querySelector(".body_section_escolha1_select1")
const text1 = document.querySelector(".body_section_escolha1_title1")
const text2 = document.querySelector(".body_section_escolha1_title2")
const text3 = document.querySelector(".body_section_escolha2_title1")
const select2 = document.querySelector(".body_section_escolha1_select2")
const input1 = document.querySelector(".body_section_escolha2_input")
const button1 = document.querySelector(".body_section_escolha3_button_1")
const button2 = document.querySelector(".body_section_escolha3_button_2")

function createButton(button, text, margem) {
  button.textContent = `${text}`;
  button.classList.add('button_get_task');
  button.classList.add('button_reload_task')
  document.getElementById('ContainerTasksButtons').appendChild(button);
  return button;
};

const button_reload = document.createElement('button')
const button_query_task = document.createElement('button')
const view_my_tasks = document.createElement('button')

button_reload.addEventListener('click', () => getChamados());

async function getChamados() {
  const urlParams = new URLSearchParams(window.location.search);
  const username = urlParams.get('username');
  const office = urlParams.get('office');
  window.location.href = '/dashboard?username=' + username + '&office=' + office;
};

function all_clear () {
    select2.selectedIndex = 0;
    select1.selectedIndex = 0;
    input1.value = '';
    select2.setAttribute('disabled', 'true');
    input1.setAttribute('disabled', 'true');
    button1.setAttribute('disabled', 'true');
    progress_bar.setAttribute('value', 0);
    text1.style.color = '';
    text2.style.color = '';
    text3.style.color = '';
}

select1.addEventListener('change', () =>{
    progress_bar.setAttribute('value', 33)
    if (select1.value !== "") {
        select2.removeAttribute('disabled');
        text1.style.color = 'green';
      } else {
        select2.setAttribute('disabled', 'true');
        text1.style.color = 'red';
      }
});

select2.addEventListener('change', () =>{
    progress_bar.setAttribute('value', 66)
    if (select2.value !== "") {
        input1.removeAttribute('disabled');
        text2.style.color = 'green';
      } else {
        input1.setAttribute('disabled', 'true');
        text2.style.color = 'red';
      }
});

input1.addEventListener('click', () => {
    if (input1.value !== '') {
      progress_bar.setAttribute('value', 100);
      text3.style.color = 'green';
    }
    if (input1.value !== "") {
        button1.removeAttribute('disabled'); // Use removeAttribute for enabling
      } else {
        button1.setAttribute('disabled', 'true'); // Re-disable if select1 is empty
      }
});

button1.addEventListener ('click', async () =>{
    const select1Value = select1.value;
    const select2Value = select2.value;
    const input1Value = input1.value;

    const urlParams = new URLSearchParams(window.location.search);
    const Username = urlParams.get('username');
    const Office = urlParams.get('office');

    const dataa = {
      Serviço: select1Value,
      Setor: select2Value,
      Problema: input1Value,
      Username: Username,
      Office: Office
    };

    const response = await fetch('/rota_new_task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataa)
    });
    if (response.headers.get('Content-Type') === 'application/json') {
        const user = await response.json();
        if (user.message) {
          alert(user.message);
        }else if (user.erro) {
          alert(user.erro)
          return
        }
   
    }

    all_clear();
} );

button2.addEventListener('click', all_clear);

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
