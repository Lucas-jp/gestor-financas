const apiUrl = "http://127.0.0.1:5000";
let usuarioId = localStorage.getItem("usuario_id");

// -------- LOGIN --------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const res = await fetch(`${apiUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("usuario_id", data.usuario_id);
      window.location.href = "gastos.html";
    } else {
      alert(data.error);
    }
  });
}

// -------- CADASTRO --------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const res = await fetch(`${apiUrl}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Cadastro realizado! Faça login.");
      window.location.href = "index.html";
    } else {
      alert(data.error);
    }
  });
}

// -------- GASTOS --------
const gastoForm = document.getElementById("gastoForm");
if (gastoForm) {
  gastoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valor = document.getElementById("valor").value;
    const descricao = document.getElementById("descricao").value;
    const data = document.getElementById("data").value;

    const res = await fetch(`${apiUrl}/gastos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor, descricao, data, usuario_id: usuarioId }),
    });

    if (res.ok) {
      loadGastos();
      gastoForm.reset();
    } else {
      alert("Erro ao adicionar gasto");
    }
  });
}

async function loadGastos() {
  if (!usuarioId) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch(`${apiUrl}/gastos/${usuarioId}`);
  const data = await res.json();
  const tbody = document.querySelector("#gastosTable tbody");
  tbody.innerHTML = "";

  let total = 0;
  data.forEach((gasto) => {
    total += parseFloat(gasto.valor);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>R$ ${parseFloat(gasto.valor).toFixed(2)}</td>
      <td>${gasto.descricao}</td>
      <td>${gasto.data}</td>
      <td>
        <button onclick="editarGasto(${gasto.id}, '${gasto.valor}', '${gasto.descricao}', '${gasto.data}')">Editar</button>
        <button onclick="deletarGasto(${gasto.id})">Deletar</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("total").textContent = total.toFixed(2);
}

async function deletarGasto(id) {
  await fetch(`${apiUrl}/gastos/${id}`, { method: "DELETE" });
  loadGastos();
}

async function editarGasto(id, valor, descricao, data) {
  const novoValor = prompt("Novo valor:", valor);
  const novaDescricao = prompt("Nova descrição:", descricao);
  const novaData = prompt("Nova data (YYYY-MM-DD):", data);

  if (novoValor && novaDescricao && novaData) {
    await fetch(`${apiUrl}/gastos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valor: novoValor,
        descricao: novaDescricao,
        data: novaData,
      }),
    });
    loadGastos();
  }
}

function logout() {
  localStorage.removeItem("usuario_id");
  window.location.href = "index.html";
}

// carregar gastos ao abrir gastos.html
if (document.querySelector("#gastosTable")) {
  loadGastos();
}
