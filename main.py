from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials, OAuth2PasswordBearer
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel  
import datetime
import uvicorn
import sqlite3

app = FastAPI()
templates = Jinja2Templates(directory="server/web/")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class User(BaseModel):
    username: str
    password: str

class NewUser(BaseModel):
    username: str
    password: str
    confirm_password: str
    profissional: str

class New_Tasks(BaseModel):
    Serviço: str
    Setor: str
    Problema: str
    Username: str
    Office: str

def get_current_time():
    current_time_utc = datetime.datetime.utcnow()
    brazil_time = current_time_utc - datetime.timedelta(hours=3)
    horario = brazil_time.strftime('%H:%M:%S')
    return horario

def calculate_service_duration(inicio, termino):
    try:
        hora_inicio = datetime.datetime.strptime(inicio, "%H:%M:%S")
        hora_termino = datetime.datetime.strptime(termino, "%H:%M:%S")
    except ValueError:
        raise ValueError("Formatos de hora inválidos.")
    duracao = hora_termino - hora_inicio
    duracao = datetime.timedelta(
        hours=max(0, duracao.seconds // 3600),
        minutes=max(0, (duracao.seconds % 3600) // 60),
        seconds=max(0, duracao.seconds % 60)
    )
    horas = duracao.seconds // 3600
    minutos = (duracao.seconds % 3600) // 60
    segundos = duracao.seconds % 60
    return f"{horas}:{minutos}:{segundos}"

@app.get("/")
async def index():
    return FileResponse("server/web/index.html")

@app.get("/new_task")
async def index():
    return FileResponse("server/web/abrir_tarefa.html")

@app.post("/login")
async def login(request: Request, login:User):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios WHERE username=? AND password=?', (login.username, login.password))
    user = cursor.fetchone()
    if user:
        area = user[3]
        if area == 'Mecânico': 
            return {"username": user[1], "office": user[3]}
        elif area == 'Elétrico':
            return {"username": user[1], "office": user[3]}
        elif area == 'T.I.':
            return {"username": user[1], "office": user[3]}
        elif area == 'Superior':
            return {"username": user[1], "office": user[3]}
            # return templates.TemplateResponse("dashboard.html", context={"request": request, "username": login.username}, status_code = 200)
            # return RedirectResponse(url="/", status_code=302)
            # return FileResponse("server/web/abrir_tarefa.html")
    else:
        return HTTPException(status_code=401, detail="Usuário ou senha inválidos")

# Define a rota para a página de dashboard
@app.get("/dashboard")
async def dashboard(request: Request, username: str = None, office: str = None):
    if not username or username == "undefined":
        return RedirectResponse(url="/")
    if office == 'Superior':
        return templates.TemplateResponse("dashboard_adm.html", context={"request": request, "username": username, "office": office}, status_code = 200)
    else: return templates.TemplateResponse("dashboard.html", context={"request": request, "username": username, "office": office}, status_code = 200)

@app.get("/cadastro")
async def login():
    return FileResponse("server/web/cadastro.html")
    
# Define a rota para cadastrar novos usuários
@app.post("/usuarios")
async def create_user(request:Request, user:NewUser):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não são iguais")
    # Criar um novo usuário
    cursor.execute('INSERT INTO usuarios (username, password, profissional) VALUES (?, ?, ?)', (user.username, user.password, user.profissional))
    conn.commit()
    return {"message": "Usuário criado com sucesso!"}

# Define a rota para obter todos os usuários
@app.get("/usuarios")
async def get_users():
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios')
    users = cursor.fetchall()
    return [{"username": user[1], "password": user[2]} for user in users]

# Define a rota para atualizar um usuário
@app.put("/usuarios/{username}")
async def update_user(username: str, password: str):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute('UPDATE usuarios SET password=? WHERE username=?', (password, username))
    conn.commit()
    return {"message": "Usuário atualizado com sucesso!"}

# Define a rota para deletar um usuário
@app.delete("/usuarios/{username}")
async def delete_user(username: str):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM usuarios WHERE username=?', (username,))
    conn.commit()
    return {"message": "Usuário deletado com sucesso!"}

@app.get("/chamados")
async def get_chamados(username: str):
    # Conectar ao banco de dados
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT profissional FROM usuarios WHERE username = ?", (username,))
    resultado_usuario = cursor.fetchone()

    if resultado_usuario:
        area_usuario = resultado_usuario[0]
        cursor.execute("SELECT * FROM tarefas WHERE area = ? AND profissional = ?", (area_usuario, "aguardando"))
        chamados = cursor.fetchall()
        
        conn.close()
        if chamados == []:
            return {'message' : "Sem tarefas no monento"}

        else:return chamados
        
    else:
        # Se o usuário não for encontrado, retornar uma mensagem de erro
        return {"error": "Usuário não encontrado"}

@app.post('/rota_new_task')
async def new_task(dados:New_Tasks):
    if dados:
        conn = sqlite3.connect('server/database.db')
        cursor = conn.cursor()
        dados_tarefa = (dados.Username, dados.Setor, get_current_time(), dados.Serviço, dados.Problema)
        cursor.execute('''
            INSERT INTO tarefas (responsavel, setor, horario, area, problema)
            VALUES (?, ?, ?, ?, ?)
        ''', dados_tarefa)
        conn.commit()
        return {'message':'Tarefa cadastrada com sucesso!'}
    else: return {'erro':'Erro ao cadastrar a tarefa'}

@app.post("/post-task")
async def det_task(dados:dict):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tarefas WHERE id = ?", (dados['id'],))
    registro = cursor.fetchall()
    if not registro:
        return {'message' : "Tarefa não encontrada"}
    else:
        cursor.execute("UPDATE tarefas SET profissional = ?, inicio = ? WHERE id = ?", (dados['user'], get_current_time(), dados['id']))
        conn.commit()
        return {'message' : "Tarefa adicionada ao seu Dashboard"}

@app.get("/get-task")
async def get_task(request:Request, user: str):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tarefas WHERE profissional = ? AND termino = ?", (user, 'Null'))
    registro = cursor.fetchall()

    if not registro:
        return {"erro": "Sem Tarefas"}
    else:
        conn.commit()
        conn.close()
        return {'data': registro}

@app.put('/end-task')
async def end_task(request: Request, data:dict):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM tarefas WHERE id = ?", (data['id'],))
        registro = cursor.fetchone()
        if registro[9] == 'Null':
            inicio = registro[8]
            termino = get_current_time()
            cursor.execute("UPDATE tarefas SET finalizada = ?, termino = ?, duracao = ? WHERE id = ?",('true', termino, calculate_service_duration(inicio, termino),data['id']))
            conn.commit()
            return {'message': 'Tarefa finalizada com sucesso!'}
        else:
            return  {'message': 'erro!'}
    except sqlite3.Error as e:
        print("Ocorreu um erro:", e)
        return {'message': f'erro {e}'}

@app.get("/all-task")
async def get_task(request: Request):
    return templates.TemplateResponse("tasks.html", {"request": request})

@app.get("/all-task-data")
async def get_task_data():
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tarefas")
    registro = cursor.fetchall()
    conn.commit()
    conn.close()
    return {"tasks": registro}

@app.put('/task-finished')
async def task_finished(request: Request, task:dict):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tarefas WHERE profissional = ? AND finalizada = ?", (task['user'], 'true'))
    registro = cursor.fetchall()
    if registro == []:
        return {'message': 'Sem tarefas finalizadas!'}
    else: return registro

@app.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    # Lógica para invalidar o token (por exemplo, removê-lo do banco de dados ou cache)
    return {"message": "Logout realizado com sucesso"}

@app.get("/style/{file_name}")
async def get_script(file_name: str):
    try:
        file_path = f"server/web/style/{file_name}"
        return FileResponse(file_path)
    except FileNotFoundError:
        return {"error": "Arquivo não encontrado"}

@app.get("/scripts/{file_name}")
async def get_script(file_name: str):
    try:
        file_path = f"server/web/scripts/{file_name}"
        return FileResponse(file_path)
    except FileNotFoundError:
        return {"error": "Arquivo não encontrado"}

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return FileResponse("server/web/static/favicon.ico")

if "__main__" == __name__:
        uvicorn.run(
        "main:app",
        host="192.168.20.119",
        # port=35302,
        reload=True,
    )