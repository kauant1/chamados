from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi import FastAPI, HTTPException, Request
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel  
import sqlite3
import uvicorn
import datetime
import pytz

app = FastAPI()
templates = Jinja2Templates(directory="web/")

# Conectar ao banco de dados SQLite
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Define a model para a estrutura de dados do usuário
class User(BaseModel):
    username: str
    password: str

class NewUser(BaseModel):
    username: str
    password: str
    confirm_password: str
    profissional: str


def get_current_time():
    current_time_utc = datetime.datetime.utcnow()
    brazil_time = current_time_utc - datetime.timedelta(hours=3)
    horario = brazil_time.strftime('%H:%M:%S')
    return horario

@app.get("/")
async def index():
    return FileResponse("web/index.html")

# Define a rota para login
@app.post("/login")
async def login(request: Request, login:User):
    cursor.execute('SELECT * FROM usuarios WHERE username=? AND password=?', (login.username, login.password))
    user = cursor.fetchone()
    if user:
        area = user[3]
        if area == 'Mecânico': 
            return {"username": user[1]}
        elif area == 'Elétrico':
            return {"username": user[1]}
        elif area == 'T.I.':
            # return RedirectResponse(url="/dashboard", status_code=302)
            return {"username": user[1]}
    else:
        return HTTPException(status_code=401, detail="Usuário ou senha inválidos")

# Define a rota para a página de dashboard
@app.get("/dashboard")
async def dashboard(request: Request, username: str = None):
    if not username:
        return RedirectResponse(url="/")
    return templates.TemplateResponse("dashboard.html", context={"request": request, "username": username}, status_code = 200)


@app.get("/cadastro")
async def login():
    return FileResponse("web/cadastro.html")
    
# Define a rota para cadastrar novos usuários
@app.post("/usuarios")
async def create_user(request:Request, user:NewUser):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não são iguais")
    # Criar um novo usuário
    cursor.execute('INSERT INTO usuarios (username, password, profissional) VALUES (?, ?, ?)', (user.username, user.password, user.profissional))
    conn.commit()
    return {"message": "Usuário criado com sucesso!"}

# Define a rota para obter todos os usuários
@app.get("/usuarios")
async def get_users():
    # Obter todos os usuários
    cursor.execute('SELECT * FROM usuarios')
    users = cursor.fetchall()
    return [{"username": user[1], "password": user[2]} for user in users]

# Define a rota para atualizar um usuário
@app.put("/usuarios/{username}")
async def update_user(username: str, password: str):
    # Atualizar um usuário
    cursor.execute('UPDATE usuarios SET password=? WHERE username=?', (password, username))
    conn.commit()
    return {"message": "Usuário atualizado com sucesso!"}

# Define a rota para deletar um usuário
@app.delete("/usuarios/{username}")
async def delete_user(username: str):
    # Deletar um usuário
    cursor.execute('DELETE FROM usuarios WHERE username=?', (username,))
    conn.commit()
    return {"message": "Usuário deletado com sucesso!"}

# Define uma rota para verificar se o token de autenticação é válido
@app.get("/verify-token")
async def verify_token(token: str):
    # Verificar se o token é válido
    if token == "your_token_here":
        return {"message": "Token válido"}
    else:
        raise HTTPException(status_code=401, detail="Token inválido")

# Define uma rota para criar um novo chamado
@app.post("/chamados")
async def create_chamado(title: str, description: str):
    # Criar um novo chamado
    chamado = {"title": title, "description": description}
    return chamado

@app.get("/chamados")
async def get_chamados(username: str):
    # Conectar ao banco de dados
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    # Procurar na tabela "usuarios" pelo nome do usuário para obter sua área
    cursor.execute("SELECT profissional FROM usuarios WHERE username = ?", (username,))
    resultado_usuario = cursor.fetchone()

    if resultado_usuario:
        area_usuario = resultado_usuario[0]
        
        # Consultar a tabela "tarefas" com a área do usuário
        # cursor.execute("SELECT * FROM tarefas WHERE area = ?", (area_usuario,))
        cursor.execute("SELECT * FROM tarefas WHERE area = ? AND profissional = ?", (area_usuario, "aguardando"))
        chamados = cursor.fetchall()
        
        conn.close()
        if chamados == []:
            return [{"error": "Sem tarefas no momento"}]
        else:return chamados
        
    else:
        # Se o usuário não for encontrado, retornar uma mensagem de erro
        return {"error": "Usuário não encontrado"}

@app.post("/post-task")
async def det_task(dados:dict):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tarefas WHERE id = ?", (dados['id'],))
    registro = cursor.fetchall()
    if not registro:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    else:
        cursor.execute("UPDATE tarefas SET profissional = ? WHERE id = ?", (dados['user'], dados['id']))
        conn.commit()

@app.get("/get-task")
async def get_task(request:Request, user: str):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tarefas WHERE profissional = ? AND termino = ?", (user, 'Null'))
    registro = cursor.fetchall()

    if not registro:
        return {"detail": "no tasks"}
    else:
        conn.commit()
        conn.close()
        return registro

@app.put('/end-task')
async def end_task(request: Request, data:dict):
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM tarefas WHERE id = ?", (data['id'],))
        registro = cursor.fetchone()
        if registro[9] == 'Null':
            cursor.execute("UPDATE tarefas SET finalizada = ?, termino = ? WHERE id = ?",('true', get_current_time(), data['id']))
            conn.commit()
            return registro
        else:
            return None
    except sqlite3.Error as e:
        print("Ocorreu um erro:", e)
        return None

@app.get("/style.css")
async def style():
    return FileResponse("web/style/style.css")

@app.get("/scripts/{file_name}")
async def get_script(file_name: str):
    try:
        file_path = f"web/scripts/{file_name}"
        return FileResponse(file_path)
    except FileNotFoundError:
        return {"error": "Arquivo não encontrado"}
    
if "__main__" == __name__:
        uvicorn.run(
        "main:app",
        host="0.0.0.0",
        # port=35302,
        reload=True,
    )