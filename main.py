from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials, OAuth2PasswordBearer
from fastapi import FastAPI, HTTPException, Request, Depends, Header
from fastapi.templating import Jinja2Templates
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from pydantic import BaseModel  
from jose import JWTError, jwt
from typing import Optional
import uvicorn
import sqlite3
import json

INVALID_TOKENS_FILE = "invalid_tokens.json"
CHAVE_SECRETA = "minha_chave_teste"
TOKENS_FILE = "tokens.json"
ALGORITMO = "HS256"

app = FastAPI()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
templates = Jinja2Templates(directory="server/web/")

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

class Token(BaseModel):
    access_token: str
    token_type: str

class UserInDB(User):
    hashed_password: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def get_current_time():
    current_time_utc = datetime.now()
    brazil_time = current_time_utc - timedelta(hours=3)
    horario = brazil_time.strftime('%H:%M:%S')
    return horario

def calculate_service_duration(inicio, termino):
    try:
        hora_inicio = datetime.strptime(inicio, "%H:%M:%S")
        hora_termino = datetime.strptime(termino, "%H:%M:%S")
    except ValueError:
        raise ValueError("Formatos de hora inválidos.")
    duracao = hora_termino - hora_inicio
    duracao = timedelta(
        hours=max(0, duracao.seconds // 3600),
        minutes=max(0, (duracao.seconds % 3600) // 60),
        seconds=max(0, duracao.seconds % 60)
    )
    horas = duracao.seconds // 3600
    minutos = (duracao.seconds % 3600) // 60
    segundos = duracao.seconds % 60
    return f"{horas}:{minutos}:{segundos}"

def criar_token_acesso(dados: dict):
    payload = {
        "sub": dados['sub'],
        "exp": datetime.utcnow() + timedelta(minutes=10)
    }   
    token = jwt.encode(payload, CHAVE_SECRETA, algorithm=ALGORITMO)
    return token

def validar_token(token: str):
    try:
        decoded_payload = jwt.decode(token, CHAVE_SECRETA, algorithms=[ALGORITMO])
        username = decoded_payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        exp = decoded_payload.get("exp")
        if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(tz=timezone.utc):
            raise HTTPException(status_code=401, detail="Token expirado")
        
        return username
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token inválido ou expirado: {str(e)}")

def load_tokens():
    try:
        with open(TOKENS_FILE, "r") as file:
            sessoes = json.load(file)
            return sessoes
    except FileNotFoundError:
        return {}

def save_tokens(tokens):
    with open(TOKENS_FILE, "w") as file:
        json.dump(tokens, file, indent=4)

def load_invalid_tokens():
    try:
        with open(INVALID_TOKENS_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return []

def save_invalid_tokens(invalid_tokens):
    with open(INVALID_TOKENS_FILE, "w") as file:
        json.dump(invalid_tokens, file, indent=4)

def is_token_valid(token):
    invalid_tokens = load_invalid_tokens()
    if token in invalid_tokens:
        return False  # Token inválido
    return True  # Token válido


@app.middleware("http")
async def limitador_de_taxa(request: Request, call_next):
    ip = request.client.host
    horario_atual = datetime.utcnow()
    # Aqui você pode integrar um rastreamento mais robusto usando Redis ou outro banco de dados
    resposta = await call_next(request)
    return resposta

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
    cursor.execute('SELECT username, password, profissional FROM usuarios WHERE username=?', (login.username,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
    
    stored_hash = user[1]  # Hash armazenado no banco
    if not verify_password(login.password, stored_hash):
        raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")
    
    token_acesso = criar_token_acesso(dados={"sub": user[0]})
    tokens = load_tokens()
    ip = request.client.host
    tokens[ip] = token_acesso
    if ip in tokens:
        if tokens[ip] != token_acesso:
            tokens[ip] = token_acesso
    else:
        tokens[ip] = token_acesso

    save_tokens(tokens)

    if user[2]:
        return {"username": user[0], "office": user[2], "access_token": token_acesso, "token_type": "bearer"}
    else:
        return HTTPException(status_code=401, detail="Usuário ou senha inválidos")

@app.get("/dashboard")
async def dashboard(request: Request, username: str = None, office: str = None, token: str = Depends(oauth2_scheme)):
    username = request.query_params.get('username')
    office = request.query_params.get('office')
    
    if not token:
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    if token in load_invalid_tokens():
        raise HTTPException(status_code=401, detail="Token fornecido vencido ou revogado")
        
    username_from_token = validar_token(token)
    if not username_from_token or username_from_token != username:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    if office == 'Superior':
        return templates.TemplateResponse("dashboard_adm.html", context={"request": request, "username": username, "office": office}, status_code = 200)
    else:
        return templates.TemplateResponse("dashboard.html", context={"request": request, "username": username, "office": office}, status_code = 200)

@app.get("/cadastro")
async def login():
    return FileResponse("server/web/cadastro.html")

@app.post("/usuarios")
async def create_user(request:Request, user:NewUser):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="As senhas não são iguais")
    hashed_password = hash_password(user.password)
    try:
        cursor.execute('INSERT INTO usuarios (username, password, profissional) VALUES (?, ?, ?)', (user.username, hashed_password, user.profissional))
    except:
        cursor.close()
        conn.close()
        return {"message": "Erro!"}
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Usuário criado com sucesso!"}

@app.get("/usuarios")
async def get_users():
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios')
    users = cursor.fetchall()
    return [{"username": user[1], "password": user[2]} for user in users]

@app.put("/usuarios/{username}")
async def update_user(username: str, password: str):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute('UPDATE usuarios SET password=? WHERE username=?', (password, username))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Usuário atualizado com sucesso!"}

@app.delete("/usuarios/{username}")
async def delete_user(username: str):
    conn = sqlite3.connect('server/database.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM usuarios WHERE username=?', (username,))
    conn.commit()
    cursor.close()
    conn.close()
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
        cursor.close()
        conn.close()
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
        cursor.close()
        conn.close()
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
        cursor.close()
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
            cursor.close()
            conn.close()
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
    cursor.close()
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
async def logout(request: Request, authorization: Optional[str] = Header(None)):
    ip = request.client.host
    tokens = load_tokens()
    invalid_tokens = load_invalid_tokens()

    if not authorization:
        raise HTTPException(status_code=400, detail="Token não fornecido")

    try:
        token = authorization.split(" ")[1]  # Extrai o token do cabeçalho Authorization
    except IndexError:
        return HTTPException(status_code=400, detail="Formato do token inválido")

    if ip in tokens and tokens[ip]:# == token:
        invalid_tokens.append(tokens[ip])
        del tokens[ip]  # Remove o token vinculado ao IP
        save_tokens(tokens)  # Salva o estado atualizado no arquivo JSON
        save_invalid_tokens(invalid_tokens)
        return {"message": "Logout realizado com sucesso"}
    else:
        # Retorna erro caso o IP não esteja registrado ou o token seja inválido
        return HTTPException(status_code=404, detail="Token não encontrado ou já inválido")

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