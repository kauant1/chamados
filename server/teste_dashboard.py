from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi import FastAPI, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel  
import sqlite3
import uvicorn


app = FastAPI()
# app.mount("/static", StaticFiles(directory="web"), name="static")
templates = Jinja2Templates(directory="web")

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

@app.get("/")
async def index():
    return FileResponse("index_teste.html")

# Define a rota para login
@app.post("/login")
async def login(request: Request, login:User):
    cursor.execute('SELECT * FROM usuarios WHERE username=? AND password=?', (login.username, login.password))
    user = cursor.fetchone()
    if user:
        # response = RedirectResponse(url=f"/dashboard?username={user[1]}")
        # response.set_cookie(
        #     key="session_id", value=f"your_session_token", httponly=True, secure=True
        # )
        return {"username":user[1]}
    else:
        return HTTPException(status_code=401, detail="Usuário ou senha inválidos")

# Define a rota para a página de dashboard
@app.get("/dashboard")
async def dashboard(request: Request, username: str = None):
    if not username:
        return RedirectResponse(url="/")
    return templates.TemplateResponse("dashboard.html", context={"request": request, "username": username}, status_code = 200)

@app.get("/style.css")
async def style():
    return FileResponse("web/style/style.css")

@app.get("/scripts/{file_name}")
async def get_script(file_name: str):
    try:
        file_path = f"{file_name}"
        return FileResponse(file_path)
    except FileNotFoundError:
        return {"error": "Arquivo não encontrado"}
    
if "__main__" == __name__:
        uvicorn.run(
        "teste_dashboard:app",
        host="0.0.0.0",
        # port=35302,
        reload=True,
    )
        
