const button_send_new_data = document.querySelector(".button_register")
const username = document.querySelector("#username")
const password = document.querySelector("#password")
const confirm_password = document.querySelector("#confirm_password")
const select_area = document.querySelector(".body_section_escolha1_select1");

button_send_new_data.addEventListener('click', async () => {
  const dataa = {
    username: username.value,
    password: password.value,
    confirm_password: confirm_password.value,
    profissional: select_area.value
  };
  console.log(dataa);

  const response = await fetch('/usuarios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataa)
  });

  const data = await response.json();

  if (data.message) {
      alert(data.message);
      window.location.href = "/";
  } else {
      alert(data.error);
  }
  })