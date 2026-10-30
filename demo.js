/* Becher Trader - página "Veja funcionando": conversa com o Atendente Automático de empresas fictícias */
(function () {
  var API_URL = "https://script.google.com/macros/s/AKfycbxoXWTVZGo9GpZccJTdJAehRXo-HloP-RxPTLC6gYHEZ7OrNUl4h88CRkZeohIUGfFaHg/exec";
  var $ = function (id) { return document.getElementById(id); };

  var EMPRESAS = {
    pousada: {
      nome: "Pousada Recanto das Gaivotas",
      saudacao: "Olá! Bem-vindo à Pousada Recanto das Gaivotas. Posso ajudar com reservas, valores e informações da pousada. O que você gostaria de saber?",
      sugestoes: ["Quanto custa a diária de casal em janeiro?", "Vocês aceitam cachorro?", "Quero reservar o Réveillon para 4 pessoas"]
    },
    restaurante: {
      nome: "Restaurante Sabor da Maré",
      saudacao: "Olá! Aqui é do Restaurante Sabor da Maré. Posso passar o cardápio, horários, delivery e reservas. Em que posso ajudar?",
      sugestoes: ["Vocês entregam? Qual a taxa?", "Tem opção vegetariana?", "Quero reservar mesa para 8 pessoas no sábado"]
    },
    imobiliaria: {
      nome: "Imobiliária Horizonte Litoral",
      saudacao: "Olá! Você está falando com a Imobiliária Horizonte Litoral. Posso ajudar com aluguel de temporada, aluguel anual ou compra de imóveis. O que você procura?",
      sugestoes: ["Tem casa com piscina para o Carnaval?", "Quais documentos para alugar por ano?", "Procuro casa de 3 quartos para comprar"]
    },
    loja: {
      nome: "Casa & Praia Utilidades",
      saudacao: "Olá! Bem-vindo à Casa & Praia Utilidades. Posso ajudar com produtos, preços, horários e entregas. O que você está procurando?",
      sugestoes: ["Quanto custa a cadeira de praia?", "Vocês entregam hoje?", "Quero reservar 2 guarda-sóis"]
    },
    pet: {
      nome: "Clínica Veterinária Patas do Litoral",
      saudacao: "Olá! Aqui é da Clínica Veterinária Patas do Litoral. Posso ajudar com consultas, vacinas, banho e tosa e horários. Como posso ajudar você e o seu pet?",
      sugestoes: ["Quanto custa a vacina V10?", "Quero agendar banho e tosa", "Meu gato não come há 2 dias"]
    }
  };

  var log = $("demo-log"), txt = $("demo-txt"), btn = $("demo-enviar"), form = $("demo-form"), sug = $("demo-sug");
  var atual = null, conversas = {}, ocupado = false;

  function add(de, texto) {
    var d = document.createElement("div");
    d.className = "demo-msg " + de;
    d.textContent = texto;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }

  function mostrarSugestoes() {
    sug.innerHTML = "";
    if (!atual) return;
    EMPRESAS[atual].sugestoes.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "demo-sug"; b.textContent = s;
      b.addEventListener("click", function () { if (!ocupado) { txt.value = s; enviar(); } });
      sug.appendChild(b);
    });
  }

  function escolher(emp) {
    atual = emp;
    document.querySelectorAll(".demo-emp").forEach(function (b) {
      b.classList.toggle("ativa", b.getAttribute("data-emp") === emp);
      b.setAttribute("aria-pressed", String(b.getAttribute("data-emp") === emp));
    });
    $("demo-nome").textContent = EMPRESAS[emp].nome;
    $("demo-sub").textContent = "Empresa fictícia · Atendente automático com inteligência artificial";
    if (!conversas[emp]) conversas[emp] = [{ de: "bot", texto: EMPRESAS[emp].saudacao }];
    log.innerHTML = "";
    conversas[emp].forEach(function (m) { add(m.de, m.texto); });
    mostrarSugestoes();
    txt.disabled = false; btn.disabled = false;
    $("conversa").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(function () { txt.focus({ preventScroll: true }); }, 400);
  }

  function enviar() {
    var pergunta = txt.value.trim();
    if (!pergunta || !atual || ocupado) return;
    var emp = atual, hist = conversas[emp];
    add("eu", pergunta);
    txt.value = ""; ocupado = true; btn.disabled = true;
    var espera = add("bot digitando", "Digitando...");
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ tipo: "demo", empresa: emp, pergunta: pergunta, historico: hist.slice(-12) })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var resp = d.resposta || "Não consegui responder agora. Tente de novo em instantes.";
        hist.push({ de: "eu", texto: pergunta }, { de: "bot", texto: resp });
        if (atual === emp) { espera.remove(); add("bot", resp); } else { espera.remove(); }
        var respostas = hist.filter(function (m) { return m.de === "eu"; }).length;
        if (respostas >= 2) $("demo-cta").classList.add("visivel");
      })
      .catch(function () {
        espera.remove();
        add("bot", "Não consegui responder agora. Verifique a sua internet e tente de novo.");
      })
      .then(function () { ocupado = false; btn.disabled = false; txt.focus({ preventScroll: true }); });
  }

  document.querySelectorAll(".demo-emp").forEach(function (b) {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { escolher(b.getAttribute("data-emp")); });
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); enviar(); });
  txt.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } });

  /* Abre direto numa empresa: demonstracao.html?empresa=pet */
  var inicial = new URLSearchParams(location.search).get("empresa");
  if (inicial && EMPRESAS[inicial]) escolher(inicial);
})();
