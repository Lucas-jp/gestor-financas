from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# Configuração do banco
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "Caslu@2026",
    "database": "gestor_financas"
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# ---------------- ROTAS DE AUTENTICAÇÃO ---------------- #
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    nome = data.get("nome")
    email = data.get("email")
    senha = generate_password_hash(data.get("senha"))

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO usuarios (nome, email, senha) VALUES (%s, %s, %s)", 
                       (nome, email, senha))
        conn.commit()
        return jsonify({"message": "Usuário cadastrado com sucesso!"}), 201
    except mysql.connector.IntegrityError:
        return jsonify({"error": "Email já cadastrado"}), 400
    finally:
        cursor.close()
        conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    senha = data.get("senha")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if usuario and check_password_hash(usuario["senha"], senha):
        return jsonify({"message": "Login bem-sucedido", "usuario_id": usuario["id"]})
    else:
        return jsonify({"error": "Credenciais inválidas"}), 401

# ---------------- ROTAS DE GASTOS ---------------- #
@app.route("/gastos/<int:usuario_id>", methods=["GET"])
def listar_gastos(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM gastos WHERE usuario_id = %s", (usuario_id,))
    gastos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(gastos)

@app.route("/gastos", methods=["POST"])
def adicionar_gasto():
    data = request.json
    valor = data.get("valor")
    descricao = data.get("descricao")
    data_gasto = data.get("data")
    usuario_id = data.get("usuario_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO gastos (valor, descricao, data, usuario_id) VALUES (%s, %s, %s, %s)",
                   (valor, descricao, data_gasto, usuario_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Gasto adicionado com sucesso!"}), 201

@app.route("/gastos/<int:id>", methods=["PUT"])
def editar_gasto(id):
    data = request.json
    valor = data.get("valor")
    descricao = data.get("descricao")
    data_gasto = data.get("data")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE gastos SET valor=%s, descricao=%s, data=%s WHERE id=%s",
                   (valor, descricao, data_gasto, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Gasto atualizado com sucesso!"})

@app.route("/gastos/<int:id>", methods=["DELETE"])
def deletar_gasto(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM gastos WHERE id=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Gasto deletado com sucesso!"})

if __name__ == "__main__":
    app.run(debug=True)
