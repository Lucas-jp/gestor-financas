const apiUrl = "http://127.0.0.1:8080";
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
      window.location.href = "dashboard.html"; 
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
    const categoria = document.getElementById("categoria").value;
    const data = document.getElementById("data").value;

    const res = await fetch(`${apiUrl}/gastos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor, descricao, categoria, data, usuario_id: usuarioId }),
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
      <td>${gasto.categoria}</td>
      <td>${gasto.data}</td>
      <td>
        <button onclick="editarGasto(${gasto.id}, '${gasto.valor}', '${gasto.descricao}', '${gasto.categoria}', '${gasto.data}')">Editar</button>
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

async function editarGasto(id, valor, descricao, categoria, data) {
  const novoValor = prompt("Novo valor:", valor);
  const novaDescricao = prompt("Nova descrição:", descricao);
  const novaCategoria = prompt("Nova categoria:", categoria); 
  const novaData = prompt("Nova data (YYYY-MM-DD):", data);

  if (novoValor && novaDescricao && novaCategoria && novaData) { 
    await fetch(`${apiUrl}/gastos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valor: novoValor,
        descricao: novaDescricao,
        categoria: novaCategoria, 
        data: novaData,
      }),
    });
    loadGastos();
  }
}

// ---------------- INVESTIMENTOS ---------------- //
const investimentoForm = document.getElementById("investimentoForm");
if (investimentoForm) {
    investimentoForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const tipo = document.getElementById("tipo").value;
        const valor_aportado = document.getElementById("valor_aportado").value;
        const descricaoInvestimento = document.getElementById("descricao_investimento").value;
        const data_aporte = document.getElementById("data_aporte").value;

        const res = await fetch(`${apiUrl}/investimentos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                tipo, 
                valor_aportado,
                descricao: descricaoInvestimento, 
                data_aporte, 
                usuario_id: usuarioId 
            }),
        });

        if (res.ok) {
            loadInvestimentos();
            investimentoForm.reset();
        } else {
            alert("Erro ao adicionar investimento");
        }
    });
}

async function loadInvestimentos() {
    if (!usuarioId) {
        window.location.href = "index.html";
        return;
    }

    const res = await fetch(`${apiUrl}/investimentos/${usuarioId}`);
    const data = await res.json();
    const tbody = document.querySelector("#investimentosTable tbody");
    tbody.innerHTML = "";

    let total = 0;
    data.forEach((investimento) => {
        total += parseFloat(investimento.valor_aportado);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${investimento.tipo}</td>
            <td>${investimento.descricao}</td>
            <td>R$ ${parseFloat(investimento.valor_aportado).toFixed(2)}</td>
            <td>${investimento.data_aporte}</td>
            <td>
                <button onclick="editarInvestimento(${investimento.id}, '${investimento.tipo}', '${investimento.valor_aportado}', '${investimento.descricao}', '${investimento.data_aporte}')">Editar</button>
                <button onclick="deletarInvestimento(${investimento.id})">Deletar</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById("totalInvestido").textContent = total.toFixed(2);
}

async function deletarInvestimento(id) {
    await fetch(`${apiUrl}/investimentos/${id}`, { method: "DELETE" });
    loadInvestimentos();
}

async function editarInvestimento(id, tipo, valor_aportado, descricao, data_aporte) {
    const novoTipo = prompt("Novo tipo:", tipo);
    const novoValorAportado = prompt("Novo valor aportado:", valor_aportado);
    const novaDescricao = prompt("Nova descrição:", descricao);
    const novaDataAporte = prompt("Nova data (YYYY-MM-DD):", data_aporte);

    if (novoTipo && novoValorAportado && novaDescricao && novaDataAporte) { 
        await fetch(`${apiUrl}/investimentos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: novoTipo,
                valor_aportado: novoValorAportado,
                descricao: novaDescricao,
                data_aporte: novaDataAporte,
            }),
        });
        loadInvestimentos();
    }
}

// ---------------- METAS FINANCEIRAS ---------------- //


const metaForm = document.getElementById("metaForm");
if (metaForm) {
  metaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const nome_meta = document.getElementById("nome_meta").value;
    const valor_objetivo = document.getElementById("valor_objetivo").value;
    const data_limite = document.getElementById("data_limite").value || null; // Permite data nula

    const res = await fetch(`${apiUrl}/metas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        nome_meta, 
        valor_objetivo, 
        data_limite, 
        usuario_id: usuarioId 
      }),
    });

    if (res.ok) {
      loadMetas();
      metaForm.reset();
    } else {
      alert("Erro ao adicionar meta");
    }
  });
}

async function loadMetas() {
  if (!usuarioId) {
    window.location.href = "index.html";
    return;
  }

  const res = await fetch(`${apiUrl}/metas/${usuarioId}`);
  const data = await res.json();
  const tbody = document.querySelector("#metasTable tbody");
  tbody.innerHTML = "";

  let total = 0;
  data.forEach((meta) => {
    total += parseFloat(meta.valor_objetivo);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${meta.nome_meta}</td>
      <td>R$ ${parseFloat(meta.valor_objetivo).toFixed(2)}</td>
      <td>${meta.data_limite || 'Sem data'}</td>
      <td>
        <button onclick="editarMeta(${meta.id}, '${meta.nome_meta}', '${meta.valor_objetivo}', '${meta.data_limite || ''}')">Editar</button>
        <button onclick="deletarMeta(${meta.id})">Deletar</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("totalMetas").textContent = total.toFixed(2);
}

async function deletarMeta(id) {
  await fetch(`${apiUrl}/metas/${id}`, { method: "DELETE" });
  loadMetas();
}

async function editarMeta(id, nome_meta, valor_objetivo, data_limite) {
  const novoNomeMeta = prompt("Novo nome da meta:", nome_meta);
  const novoValorObjetivo = prompt("Novo valor objetivo:", valor_objetivo);
  const novaDataLimite = prompt("Nova data limite (YYYY-MM-DD):", data_limite);

  if (novoNomeMeta && novoValorObjetivo) { 
    await fetch(`${apiUrl}/metas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_meta: novoNomeMeta,
        valor_objetivo: novoValorObjetivo,
        data_limite: novaDataLimite || null,
      }),
    });
    loadMetas();
  }
}

// -------- DASHBOARD / RESUMO --------

async function loadDashboard() {
    if (!usuarioId) {
        window.location.href = "index.html";
        return;
    }

    let dataGastos = [];
    try {
        const resGastos = await fetch(`${apiUrl}/gastos/${usuarioId}`);
        dataGastos = await resGastos.json();
    } catch (e) {
        console.error("Erro ao carregar Gastos: A API pode estar indisponível ou retornou JSON inválido.", e);
    }
    
    let totalGastosMes = 0;
    
    const mesAnoAtual = new Date().toISOString().substring(0, 7); 
    
    const gastosPorCategoria = {}; 
    
    dataGastos.forEach(gasto => {
        const dataDoGasto = new Date(gasto.data);
        const mesAnoGasto = dataDoGasto.toISOString().substring(0, 7);

        if (mesAnoGasto === mesAnoAtual) { 
            const valor = parseFloat(gasto.valor);
            totalGastosMes += valor;
            
            if (gastosPorCategoria[gasto.categoria]) {
                gastosPorCategoria[gasto.categoria] += valor;
            } else {
                gastosPorCategoria[gasto.categoria] = valor;
            }
        }
    });


    let dataInvest = [];
    try {
        const resInvest = await fetch(`${apiUrl}/investimentos/${usuarioId}`);
        dataInvest = await resInvest.json();
    } catch (e) {
        console.error("Erro ao carregar Investimentos.");
    }

    let totalAportado = 0;
    dataInvest.forEach(invest => {
        totalAportado += parseFloat(invest.valor_aportado);
    });

    try {
        const resMetas = await fetch(`${apiUrl}/metas/${usuarioId}`);
        await resMetas.json(); 
    } catch (e) {
        console.error("Erro ao carregar Metas.");
    }
    let progressoMedio = 0;
    
    document.getElementById("totalGastosMes").textContent = `R$ ${totalGastosMes.toFixed(2)}`;
    document.getElementById("totalAportado").textContent = `R$ ${totalAportado.toFixed(2)}`;
    document.getElementById("progressoMetas").textContent = `${progressoMedio.toFixed(0)}%`;
    

    
    if (totalGastosMes > 0) {
        drawChart();
        
        function drawChart() {
            const dadosGrafico = [['Categoria', 'Valor Total']];
            for (const categoria in gastosPorCategoria) {
                dadosGrafico.push([categoria, gastosPorCategoria[categoria]]);
            }

            const data = google.visualization.arrayToDataTable(dadosGrafico);

            const options = {
                title: 'Distribuição de Gastos do Mês',
                is3D: true,
                chartArea: { left: 10, top: 30, width: '95%', height: '85%' }
            };

            const chart = new google.visualization.PieChart(document.getElementById('graficoCategorias'));
            chart.draw(data, options);
        }
    } else {
         document.getElementById('graficoCategorias').innerHTML = '<p style="text-align: center; color: #666;">Nenhum gasto registrado neste mês.</p>';
    }
}

// ---------------- INICIALIZAÇÃO E LOGOUT ---------------- //

function logout() {
    localStorage.removeItem("usuario_id");
    window.location.href = "index.html";
}


if (document.querySelector(".summary-cards")) {

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(loadDashboard);
}


if (document.querySelector("#gastosTable")) {
    loadGastos();
}


if (document.querySelector("#investimentosTable")) {
    loadInvestimentos();
}


if (document.querySelector("#metasTable")) {
    loadMetas();
}
