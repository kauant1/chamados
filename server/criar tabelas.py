import sqlite3
conn = sqlite3.connect('server/database.db')
cursor = conn.cursor()

# Criar tabela de usuários
# cursor.execute('''
#     CREATE TABLE "usuarios" (
# 	id	INTEGER NOT NULL UNIQUE,
# 	username	TEXT NOT NULL,
# 	password	TEXT NOT NULL,
# 	profissional	TEXT NOT NULL UNIQUE,
# 	cargo	TEXT NOT NULL DEFAULT 'Null',
# 	PRIMARY KEY(id AUTOINCREMENT)
#     )
    
# ''')
# conn.commit()

cursor.execute('''
    CREATE TABLE "tarefas" (
		id	INTEGER NOT NULL DEFAULT '***' UNIQUE,
		responsavel	TEXT NOT NULL DEFAULT 'None',
		setor	TEXT NOT NULL DEFAULT 'None',
		horario	TEXT NOT NULL DEFAULT 'None',
		area	TEXT NOT NULL DEFAULT 'None',
		problema	TEXT NOT NULL DEFAULT 'None',
		profissional	TEXT NOT NULL DEFAULT 'aguardando',
		finalizada	BLOB NOT NULL DEFAULT 'false',
		inicio	TEXT NOT NULL DEFAULT 'Null',
		termino	TEXT NOT NULL DEFAULT 'Null',
		duracao	TEXT NOT NULL DEFAULT '00:00:00',
		PRIMARY KEY(id AUTOINCREMENT)
		)

''')
conn.commit()

# Adicionar coluna "problema" à tabela "tarefas"
# cursor.execute('''
#     ALTER TABLE tarefas
#     ADD COLUMN profissional TEXT NOT NULL;
# ''')
# conn.commit()


# Dados para inserir
dados_tarefa = ('Cristina', 'Lenço', '15:20', 'Mecânico', 'Problema no pistão')

# Inserir dados na tabela
# cursor.execute('''
#     INSERT INTO tarefas (responsavel, setor, horario, area, problema)
#     VALUES (?, ?, ?, ?, ?)
# ''', dados_tarefa)

# # Salvar as alterações
# conn.commit()


# cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
# tables = cursor.fetchall()
# print("Tabelas no banco de dados:")
# for table in tables:
#     table_name = table[0]
#     print(f"Tabela: {table_name}")

#     cursor.execute(f"PRAGMA table_info({table_name});")
#     columns = cursor.fetchall()
#     print(f"Colunas da tabela '{table_name}':")
#     for column in columns:
#         print(column[1])

#     # Selecionar registros da tabela
#     cursor.execute(f"SELECT * FROM {table_name};")
#     records = cursor.fetchall()
#     print("Registros da tabela:")
#     for record in records:
#         print(record)


# # Fechando a conexão
# conn.close()



# CREATE TABLE "tarefas" (
# 	"id"	INTEGER NOT NULL UNIQUE,
# 	"responsavel"	TEXT NOT NULL,
# 	"setor"	TEXT NOT NULL,
# 	"horario"	TEXT NOT NULL,
# 	"area"	TEXT NOT NULL,
# 	"problema"	TEXT NOT NULL,
# 	"profissional"	TEXT NOT NULL DEFAULT 'aguardando',
# 	PRIMARY KEY("id" AUTOINCREMENT)
# );


# CREATE TABLE "tarefas" (
# 	"id"	INTEGER NOT NULL UNIQUE,
# 	"responsavel"	TEXT NOT NULL,
# 	"setor"	TEXT NOT NULL,
# 	"horario"	TEXT NOT NULL,
# 	"area"	TEXT NOT NULL,
# 	"problema"	TEXT NOT NULL,
# 	"profissional"	TEXT NOT NULL DEFAULT 'aguardando',
# 	"finalizada"	BLOB NOT NULL DEFAULT 'false',
# 	"inicio"	TEXT NOT NULL DEFAULT 'Null',
# 	"termino"	TEXT NOT NULL DEFAULT 'Null',
# 	PRIMARY KEY("id" AUTOINCREMENT)
# )