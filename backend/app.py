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

@app.route("/")
def index_route():
    return jsonify({"message": "API de Gestão Financeira está rodando!"}), 200

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
    categoria = data.get("categoria") 
    data_gasto = data.get("data")
    usuario_id = data.get("usuario_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO gastos (valor, descricao, categoria, data, usuario_id) VALUES (%s, %s, %s, %s, %s)",
                   (valor, descricao, categoria, data_gasto, usuario_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Gasto adicionado com sucesso!"}), 201

@app.route("/gastos/<int:id>", methods=["PUT"])
def editar_gasto(id):
    data = request.json
    valor = data.get("valor")
    descricao = data.get("descricao")
    categoria = data.get("categoria") 
    data_gasto = data.get("data")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE gastos SET valor=%s, descricao=%s, categoria=%s, data=%s WHERE id=%s",
                   (valor, descricao, categoria, data_gasto, id))
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

# ---------------- ROTAS DE INVESTIMENTOS ---------------- #
@app.route("/investimentos/<int:usuario_id>", methods=["GET"])
def listar_investimentos(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM investimentos WHERE usuario_id = %s", (usuario_id,))
    investimentos = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(investimentos)

@app.route("/investimentos", methods=["POST"])
def adicionar_investimento():
    data = request.json
    tipo = data.get("tipo")
    valor_aportado = data.get("valor_aportado")
    descricao = data.get("descricao")
    data_aporte = data.get("data_aporte")
    usuario_id = data.get("usuario_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO investimentos (tipo, valor_aportado, descricao, data_aporte, usuario_id) VALUES (%s, %s, %s, %s, %s)",
                   (tipo, valor_aportado, descricao, data_aporte, usuario_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Investimento adicionado com sucesso!"}), 201

@app.route("/investimentos/<int:id>", methods=["PUT"])
def editar_investimento(id):
    data = request.json
    tipo = data.get("tipo")
    valor_aportado = data.get("valor_aportado")
    descricao = data.get("descricao")
    data_aporte = data.get("data_aporte")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE investimentos SET tipo=%s, valor_aportado=%s, descricao=%s, data_aporte=%s WHERE id=%s",
                   (tipo, valor_aportado, descricao, data_aporte, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Investimento atualizado com sucesso!"})

@app.route("/investimentos/<int:id>", methods=["DELETE"])
def deletar_investimento(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM investimentos WHERE id=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Investimento deletado com sucesso!"})

# ---------------- ROTAS DE METAS ---------------- #

@app.route("/metas/<int:usuario_id>", methods=["GET"])
def listar_metas(usuario_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM metas WHERE usuario_id = %s", (usuario_id,))
    metas = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(metas)

@app.route("/metas", methods=["POST"])
def adicionar_meta():
    data = request.json
    nome_meta = data.get("nome_meta")
    valor_objetivo = data.get("valor_objetivo")
    data_limite = data.get("data_limite")
    usuario_id = data.get("usuario_id")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO metas (nome_meta, valor_objetivo, data_limite, usuario_id) VALUES (%s, %s, %s, %s)",
                   (nome_meta, valor_objetivo, data_limite, usuario_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Meta adicionada com sucesso!"}), 201

@app.route("/metas/<int:id>", methods=["PUT"])
def editar_meta(id):
    data = request.json
    nome_meta = data.get("nome_meta")
    valor_objetivo = data.get("valor_objetivo")
    data_limite = data.get("data_limite")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE metas SET nome_meta=%s, valor_objetivo=%s, data_limite=%s WHERE id=%s",
                   (nome_meta, valor_objetivo, data_limite, id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Meta atualizada com sucesso!"})

@app.route("/metas/<int:id>", methods=["DELETE"])
def deletar_meta(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM metas WHERE id=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Meta deletada com sucesso!"})


if __name__ == "__main__":
    app.run(debug=True, port=8080)
