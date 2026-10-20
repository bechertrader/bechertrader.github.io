/* Becher Trader - comportamento comum a todas as páginas */
(function () {
  /* Endereço do App da Web no Google Apps Script (projeto Agente Atendimento Cursos) */
  var API_URL = "https://script.google.com/macros/s/AKfycbxoXWTVZGo9GpZccJTdJAehRXo-HloP-RxPTLC6gYHEZ7OrNUl4h88CRkZeohIUGfFaHg/exec";
  var FONE = "5541988927722";
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Menu no celular ---------- */
  var mb = $("menu-btn"), menu = $("menu");
  if (mb && menu) {
    mb.addEventListener("click", function () {
      var aberto = menu.classList.toggle("aberto");
      mb.setAttribute("aria-expanded", String(aberto));
    });
  }

  /* ---------- Botões Copiar ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var txt = b.getAttribute("data-copy"), orig = b.textContent;
      function avisar(t) { b.textContent = t; setTimeout(function () { b.textContent = orig; }, 1800); }
      try { navigator.clipboard.writeText(txt).then(function () { avisar("Copiado"); }, function () { avisar("Copie: " + txt); }); }
      catch (_) { avisar("Copie: " + txt); }
    });
  });

  /* ---------- Formulário de contato ---------- */
  var f = $("f-contato");
  if (f) {
    var tel = $("c-tel"), msgBox = $("c-retorno"), enviar = $("c-enviar"), zap = $("c-zap");
    var params = new URLSearchParams(location.search), assunto = params.get("assunto");
    if (assunto) {
      var sel = $("c-interesse");
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].getAttribute("data-k") === assunto) { sel.selectedIndex = i; break; }
      }
    }
    /* Máscara de telefone: (41) 99999-9999 */
    tel.addEventListener("input", function () {
      var d = tel.value.replace(/\D/g, "").slice(0, 11), s = d;
      if (d.length > 2) s = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) s = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(d.length - 4);
      tel.value = s;
    });
    function dados() {
      return {
        tipo: "contato", nome: $("c-nome").value.trim(), telefone: tel.value.trim(), email: $("c-email").value.trim(),
        empresa: $("c-empresa").value.trim(), segmento: $("c-segmento").value.trim(), interesse: $("c-interesse").value,
        mensagem: $("c-msg").value.trim(), site: $("c-site").value, pagina: "contato"
      };
    }
    function textoZap(d) {
      var l = ["Olá, Becher! Vim pelo site da Becher Trader."];
      if (d.nome) l.push("Nome: " + d.nome);
      if (d.empresa) l.push("Empresa: " + d.empresa);
      if (d.segmento) l.push("Segmento: " + d.segmento);
      l.push("Interesse: " + d.interesse);
      if (d.mensagem) l.push("Mensagem: " + d.mensagem);
      return "https://wa.me/" + FONE + "?text=" + encodeURIComponent(l.join("\n"));
    }
    function mostrar(tipo, texto) { msgBox.hidden = false; msgBox.className = "msg-form " + tipo; msgBox.textContent = texto; }
    f.addEventListener("input", function () { zap.href = textoZap(dados()); });
    zap.href = textoZap(dados());
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = dados();
      if (!d.nome) { mostrar("erro", "Escreva o seu nome."); $("c-nome").focus(); return; }
      if (!d.telefone && !d.email) { mostrar("erro", "Informe um telefone ou um e-mail para retornarmos."); tel.focus(); return; }
      if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) { mostrar("erro", "Confira o e-mail informado."); $("c-email").focus(); return; }
      enviar.disabled = true; enviar.textContent = "Enviando...";
      fetch(API_URL, { method: "POST", body: JSON.stringify(d) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (r.ok) { mostrar("ok", r.resposta || "Recebemos o seu contato. Vamos responder em breve."); f.reset(); zap.href = textoZap(dados()); }
          else mostrar("erro", r.resposta || "Não foi possível enviar agora. Use o WhatsApp.");
        })
        .catch(function () { mostrar("erro", "Não foi possível enviar agora. Tente de novo ou use o WhatsApp."); })
        .then(function () { enviar.disabled = false; enviar.textContent = "Enviar contato"; });
    });
  }

  /* ---------- Lista de interessados (página Cursos) ---------- */
  var fi = $("f-interesse");
  if (fi) {
    var itel = $("i-tel"), iret = $("i-retorno"), ienv = $("i-enviar");
    itel.addEventListener("input", function () {
      var d = itel.value.replace(/\D/g, "").slice(0, 11), s = d;
      if (d.length > 2) s = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) s = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(d.length - 4);
      itel.value = s;
    });
    var marcados = function (n) { return Array.prototype.map.call(fi.querySelectorAll('input[name="' + n + '"]:checked'), function (x) { return x.value; }); };
    var avisar = function (tipo, texto) { iret.hidden = false; iret.className = "msg-form " + tipo; iret.textContent = texto; };
    fi.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = {
        tipo: "interesse", nome: $("i-nome").value.trim(), telefone: itel.value.trim(), email: $("i-email").value.trim(),
        cursos: marcados("curso"), periodos: marcados("periodo"), empresa: $("i-empresa").value.trim(),
        segmento: $("i-segmento").value.trim(), aciapar: (marcados("aciapar")[0] || ""), site: $("i-site").value
      };
      if (!d.nome) { avisar("erro", "Escreva o seu nome."); $("i-nome").focus(); return; }
      if (!d.telefone && !d.email) { avisar("erro", "Informe um WhatsApp ou um e-mail para avisarmos você."); itel.focus(); return; }
      if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) { avisar("erro", "Confira o e-mail informado."); $("i-email").focus(); return; }
      if (!d.cursos.length) { avisar("erro", "Marque pelo menos um curso de interesse."); return; }
      ienv.disabled = true; ienv.textContent = "Enviando...";
      fetch(API_URL, { method: "POST", body: JSON.stringify(d) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (r.ok) { avisar("ok", r.resposta || "Pronto! Você está na lista. Avisaremos quando a turma fechar."); fi.reset(); }
          else avisar("erro", r.resposta || "Não foi possível enviar agora. Fale com a gente pelo WhatsApp (41) 98892-7722.");
        })
        .catch(function () { avisar("erro", "Não foi possível enviar agora. Tente de novo ou fale com a gente pelo WhatsApp."); })
        .then(function () { ienv.disabled = false; ienv.textContent = "Entrar na lista"; });
    });
  }

  /* ---------- Balão de atendimento com IA ---------- */
  var box = $("chat-box"), abrir = $("chat-abrir");
  if (!box || !abrir) return;
  var log = $("chat-log"), form = $("chat-form"), txt = $("chat-txt"), btn = $("chat-enviar"), historico = [];
  var ZAP = "https://wa.me/" + FONE + "?text=" + encodeURIComponent("Olá! Vim pelo atendimento do site da Becher Trader.");
  function add(de, texto, humano) {
    var d = document.createElement("div");
    d.className = "msg " + de + (humano ? " humano" : "");
    d.textContent = texto;
    if (humano) {
      var a = document.createElement("a"); a.href = ZAP; a.target = "_blank"; a.rel = "noopener"; a.className = "zap"; a.textContent = "Abrir o WhatsApp";
      d.appendChild(document.createElement("br")); d.appendChild(a);
    }
    log.appendChild(d); log.scrollTop = log.scrollHeight; return d;
  }
  function alternar(mostrar) {
    box.hidden = !mostrar; abrir.hidden = mostrar; abrir.setAttribute("aria-expanded", String(mostrar));
    if (mostrar) {
      if (!log.childElementCount) add("bot", "Olá! Sou o assistente virtual da Becher Trader. Posso tirar dúvidas sobre o Curso de Inteligência Artificial: datas, valores, o que levar e a instalação dos aplicativos. Como posso ajudar?");
      setTimeout(function () { txt.focus(); }, 50);
    } else abrir.focus();
  }
  abrir.addEventListener("click", function () { alternar(true); });
  $("chat-fechar").addEventListener("click", function () { alternar(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) alternar(false); });
  txt.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var pergunta = txt.value.trim();
    if (!pergunta || btn.disabled) return;
    add("eu", pergunta); txt.value = ""; btn.disabled = true;
    var espera = add("bot", "Digitando...");
    fetch(API_URL, { method: "POST", body: JSON.stringify({ pergunta: pergunta, historico: historico.slice(-6) }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        espera.remove();
        add("bot", d.resposta || "Não consegui responder agora.", !!d.humano || !d.ok);
        historico.push({ de: "eu", texto: pergunta }, { de: "bot", texto: d.resposta || "" });
      })
      .catch(function () { espera.remove(); add("bot", "Não consegui responder agora. Tente de novo em instantes ou fale com a gente pelo WhatsApp.", true); })
      .then(function () { btn.disabled = false; txt.focus(); });
  });
})();
