/* Becher Trader - comportamento comum a todas as páginas */
(function () {
  /* Endereço do App da Web no Google Apps Script (projeto Agente Atendimento Cursos) */
  var API_URL = "https://script.google.com/macros/s/AKfycbxoXWTVZGo9GpZccJTdJAehRXo-HloP-RxPTLC6gYHEZ7OrNUl4h88CRkZeohIUGfFaHg/exec";
  var FONE = "5541976075189";
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
          if (r.ok) { registrarCadastro("contato"); mostrar("ok", r.resposta || "Recebemos o seu contato. Vamos responder em breve."); f.reset(); zap.href = textoZap(dados()); }
          else mostrar("erro", r.resposta || "Não foi possível enviar agora. Use o WhatsApp.");
        })
        .catch(function () { mostrar("erro", "Não foi possível enviar agora. Tente de novo ou use o WhatsApp."); })
        .then(function () { enviar.disabled = false; enviar.textContent = "Enviar contato"; });
    });
  }

  /* ---------- Registro de cadastro (Pixel da Meta e Google), 10/11/2026 ----------
     Só registra se o visitante aceitou os cookies; o cadastro vai para a planilha de qualquer forma. */
  var registrarCadastro = function (origem) {
    try { if (window.fbq) window.fbq("track", "Lead", { content_name: origem }); } catch (e) {}
    try { if (window.gtag) window.gtag("event", "generate_lead", { form: origem }); } catch (e) {}
  };

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
          if (r.ok) { registrarCadastro("cursos"); avisar("ok", r.resposta || "Pronto! Você está na lista. Avisaremos quando a turma fechar."); fi.reset(); }
          else avisar("erro", r.resposta || "Não foi possível enviar agora. Fale com a gente pelo WhatsApp (41) 97607-5189.");
        })
        .catch(function () { avisar("erro", "Não foi possível enviar agora. Tente de novo ou fale com a gente pelo WhatsApp."); })
        .then(function () { ienv.disabled = false; ienv.textContent = "Entrar na lista"; });
    });
  }


  /* ---------- Vídeos de demonstração (07/11/2026) ----------
     <div class="video" data-yt="ID_DO_YOUTUBE" data-titulo="..."></div>
     Sem ID: mostra "Vídeo disponível em breve". Com ID: carrega o vídeo
     do youtube-nocookie só quando o visitante clica (página leve no celular). */
  Array.prototype.forEach.call(document.querySelectorAll(".video"), function (v) {
    var id = (v.getAttribute("data-yt") || "").trim(), titulo = v.getAttribute("data-titulo") || "Vídeo";
    if (!id) { v.classList.add("video-breve"); v.innerHTML = '<span class="video-tit">' + titulo + '</span><span class="video-aviso">Vídeo disponível em breve</span>'; return; }
    var b = document.createElement("button");
    b.type = "button"; b.className = "video-capa"; b.setAttribute("aria-label", "Assistir: " + titulo);
    b.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
    b.innerHTML = '<span class="video-play" aria-hidden="true">▶</span><span class="video-tit">' + titulo + '</span>';
    b.addEventListener("click", function () {
      v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + titulo.replace(/"/g, "") + '" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    });
    v.appendChild(b);
  });

  /* ---------- Lista de lançamento: MENTHOR, GUARDIÃO e GUARDIÃO REPLICADOR ---------- */
  var fm = $("f-menthor");
  var marcarPadrao = function () {
    if (!fm) return;
    var padrao = (fm.getAttribute("data-produto-padrao") || "").split(",");
    Array.prototype.forEach.call(fm.querySelectorAll('input[name="produto"]'), function (x) { x.checked = padrao.indexOf(x.value) >= 0; });
  };
  var qsProd = new URLSearchParams(location.search).get("produto");
  if (fm && qsProd) fm.setAttribute("data-produto-padrao", qsProd.toUpperCase());
  marcarPadrao();
  if (fm) {
    var mtel = $("m-tel"), mret = $("m-retorno"), menv = $("m-enviar"); var menvTexto = menv.textContent;
    mtel.addEventListener("input", function () {
      var d = mtel.value.replace(/\D/g, "").slice(0, 11), s = d;
      if (d.length > 2) s = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) s = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(d.length - 4);
      mtel.value = s;
    });
    var qs = new URLSearchParams(location.search);
    var origemLink = qs.get("utm_source") || qs.get("origem") || qs.get("ref") || (document.referrer ? new URL(document.referrer).hostname : "direto");
    /* 14/11/2026: quem vem do anúncio da Meta cai direto no cadastro; evento preenche "Como conheceu" */
    if (qs.get("utm_campaign") === "profit_summit" && $("m-origem")) $("m-origem").value = "Profit Summit";
    if (qs.get("utm_source") === "meta" && $("lista")) {
      var irLista = function () { $("lista").scrollIntoView(); };
      setTimeout(irLista, 60); window.addEventListener("load", function () { setTimeout(irLista, 60); });
    }
    var mMarc = function (n) { return Array.prototype.map.call(fm.querySelectorAll('input[name="' + n + '"]:checked'), function (x) { return x.value; }); };
    var mAvisar = function (tipo, texto) { mret.hidden = false; mret.className = "msg-form " + tipo; mret.textContent = texto; };
    fm.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = {
        tipo: "menthor", nome: $("m-nome").value.trim(), email: $("m-email").value.trim(), telefone: mtel.value.trim(),
        experiencia: (mMarc("experiencia")[0] || ""), plataformas: mMarc("plataforma"), como_conheceu: $("m-origem").value,
        aceite: $("m-aceite").checked ? "Sim" : "", origem: origemLink, site: $("m-site").value,
        produtos: (fm.querySelector('input[name="produto"]') ? mMarc("produto") : ["MENTHOR"])
      };
      if (!d.nome) { mAvisar("erro", "Escreva o seu nome."); $("m-nome").focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) { mAvisar("erro", "Informe um e-mail válido para avisarmos você."); $("m-email").focus(); return; }
      if (!d.produtos.length) { mAvisar("erro", "Marque pelo menos um produto de interesse."); return; }
      if (!d.aceite) { mAvisar("erro", "Marque a autorização para entrar na lista."); $("m-aceite").focus(); return; }
      menv.disabled = true; menv.textContent = "Enviando...";
      fetch(API_URL, { method: "POST", body: JSON.stringify(d) })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (r.ok) { registrarCadastro("lista " + d.produtos.join(",")); mAvisar("ok", r.resposta || "Pronto! Você está na lista de lançamento. Avisaremos você no lançamento."); fm.reset(); marcarPadrao(); }
          else mAvisar("erro", r.resposta || "Não foi possível enviar agora. Tente de novo em instantes.");
        })
        .catch(function () { mAvisar("erro", "Não foi possível enviar agora. Tente de novo em instantes ou escreva para bechertrader@gmail.com."); })
        .then(function () { menv.disabled = false; menv.textContent = menvTexto; });
    });
  }

  /* ---------- Balão de atendimento com IA ---------- */
  var box = $("chat-box"), abrir = $("chat-abrir");
  if (!box || !abrir) return;
  var log = $("chat-log"), form = $("chat-form"), txt = $("chat-txt"), btn = $("chat-enviar"), historico = [], conversa = [];
  /* A conversa fica guardada enquanto a aba estiver aberta: ao visitar um link do site e voltar, ela continua */
  var CHAVE_CONVERSA = "bt_chat_v1", CHAVE_ORIGEM = "bt_chat_origem";
  function lerSessao(k) { try { return sessionStorage.getItem(k); } catch (_) { return null; } }
  function gravarSessao(k, v) { try { sessionStorage.setItem(k, v); } catch (_) {} }
  function apagarSessao(k) { try { sessionStorage.removeItem(k); } catch (_) {} }
  function salvarConversa() { gravarSessao(CHAVE_CONVERSA, JSON.stringify({ m: conversa.slice(-40), h: historico.slice(-6) })); }
  /* Botão "Voltar à conversa" (página de demonstração) */
  var voltarBox = $("voltar-conversa"), origemChat = lerSessao(CHAVE_ORIGEM);
  if (voltarBox && origemChat) { voltarBox.querySelector("a").href = origemChat; voltarBox.hidden = false; }
  var ZAP = "https://wa.me/" + FONE + "?text=" + encodeURIComponent("Olá! Vim pelo atendimento do site da Becher Trader.");
  /* Link com ?chat=1 (saudação do WhatsApp Business): já abre o tira-dúvidas */
  var abrirDireto = new URLSearchParams(location.search).get("chat") === "1";
  /* Nas respostas do assistente, endereços de sites e e-mails viram links clicáveis */
  function escreverComLinks(el, texto) {
    var re = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|(?:https?:\/\/|www\.)[^\s]+|(?:[a-z0-9-]+\.)+(?:com\.br|com|ai)(?![a-z0-9-])(?:[\/#?][^\s]*)?/gi;
    var pos = 0, m;
    while ((m = re.exec(texto))) {
      var alvo = m[0].replace(/[.,;:!?)\]"'»]+$/, "");
      el.appendChild(document.createTextNode(texto.slice(pos, m.index)));
      var a = document.createElement("a");
      a.href = alvo.indexOf("@") > 0 && !/^https?:/i.test(alvo) ? "mailto:" + alvo : (/^https?:/i.test(alvo) ? alvo : "https://" + alvo);
      a.textContent = alvo;
      /* Links do nosso site abrem na mesma aba (a seta Voltar funciona); os demais, em nova aba */
      if (/^(?:https?:\/\/)?(?:www\.)?bechertrader\.com\.br(?:[\/#?]|$)/i.test(alvo)) {
        a.addEventListener("click", function () { gravarSessao(CHAVE_ORIGEM, location.href); });
      } else { a.target = "_blank"; a.rel = "noopener"; }
      el.appendChild(a);
      pos = m.index + alvo.length; re.lastIndex = pos;
    }
    el.appendChild(document.createTextNode(texto.slice(pos)));
  }
  function add(de, texto, humano, naoGuardar) {
    var d = document.createElement("div");
    d.className = "msg " + de + (humano ? " humano" : "");
    if (de === "bot") escreverComLinks(d, texto); else d.textContent = texto;
    if (humano) {
      var a = document.createElement("a"); a.href = ZAP; a.target = "_blank"; a.rel = "noopener"; a.className = "zap"; a.textContent = "Abrir o WhatsApp";
      d.appendChild(document.createElement("br")); d.appendChild(a);
    }
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    if (!naoGuardar) { conversa.push({ de: de, t: texto, h: !!humano }); salvarConversa(); }
    return d;
  }
  function alternar(mostrar) {
    box.hidden = !mostrar; abrir.hidden = mostrar; abrir.setAttribute("aria-expanded", String(mostrar));
    if (mostrar) {
      if (!log.childElementCount) add("bot", "Olá! Sou o assistente virtual da Becher Trader. Posso tirar dúvidas sobre o MENTHOR, o METHODUS, o GUARDIÃO, o GUARDIÃO REPLICADOR, o CONTEXTO, os cursos de Inteligência Artificial e as nossas soluções para empresas. Como posso ajudar?");
      setTimeout(function () { txt.focus(); }, 50);
    } else {
      if (lerSessao(CHAVE_ORIGEM) === location.href) apagarSessao(CHAVE_ORIGEM);
      abrir.focus();
    }
  }
  abrir.addEventListener("click", function () { alternar(true); });
  $("chat-fechar").addEventListener("click", function () { alternar(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) alternar(false); });
  var salva = null;
  try { salva = JSON.parse(lerSessao(CHAVE_CONVERSA) || "null"); } catch (_) {}
  if (salva && salva.m) {
    salva.m.forEach(function (x) { add(x.de, x.t, x.h, true); });
    conversa = salva.m; historico = salva.h || [];
  }
  if (abrirDireto || (lerSessao(CHAVE_ORIGEM) === location.href && conversa.length)) { window.__btChatAuto = true; alternar(true); }
  txt.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var pergunta = txt.value.trim();
    if (!pergunta || btn.disabled) return;
    add("eu", pergunta); txt.value = ""; btn.disabled = true;
    var espera = add("bot", "Digitando...", false, true);
    fetch(API_URL, { method: "POST", body: JSON.stringify({ pergunta: pergunta, historico: historico.slice(-6) }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        espera.remove();
        add("bot", d.resposta || "Não consegui responder agora.", !!d.humano || !d.ok);
        historico.push({ de: "eu", texto: pergunta }, { de: "bot", texto: d.resposta || "" });
        salvarConversa();
      })
      .catch(function () { espera.remove(); add("bot", "Não consegui responder agora. Tente de novo em instantes ou fale com a gente pelo WhatsApp.", true); })
      .then(function () { btn.disabled = false; txt.focus(); });
  });
})();

/* ---------- Cookies (LGPD) e remarketing ----------
   Os rastreadores só carregam DEPOIS que o visitante clica em "Aceitar".
   Para ativar, preencha os IDs abaixo (deixe "" para desligar):
     META_PIXEL_ID  -> número do Pixel da Meta (ex.: "123456789012345")
     GOOGLE_TAG_ID  -> ID do Google Analytics/Ads (ex.: "G-XXXXXXXXXX" ou "AW-XXXXXXXXX")
   Sem nenhum ID preenchido, o aviso de cookies não aparece. */
(function () {
  var META_PIXEL_ID = "";
  var GOOGLE_TAG_ID = "G-7L3DZFTHVD";
  var CHAVE = "bt_cookies_v1";
  if (!META_PIXEL_ID && !GOOGLE_TAG_ID) return;

  function ler() { try { return localStorage.getItem(CHAVE); } catch (_) { return null; } }
  function gravar(v) { try { localStorage.setItem(CHAVE, v); } catch (_) {} }

  function carregar() {
    if (window.__btTags) return; window.__btTags = true;
    if (GOOGLE_TAG_ID) {
      var g = document.createElement("script"); g.async = true;
      g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GOOGLE_TAG_ID);
      document.head.appendChild(g);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", GOOGLE_TAG_ID);
    }
    if (META_PIXEL_ID) {
      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", META_PIXEL_ID); window.fbq("track", "PageView");
    }
  }

  function aviso() {
    if (document.getElementById("cookie-aviso")) return;
    var d = document.createElement("div");
    d.id = "cookie-aviso"; d.className = "cookie-aviso"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "Aviso de cookies");
    /* Quando o Tira-dúvidas abre sozinho: aviso no topo, para não cobrir o campo de digitar */
    if (window.__btChatAuto) { d.style.top = "0"; d.style.bottom = "auto"; }
    var p = document.createElement("p");
    p.textContent = "Usamos cookies para medir as visitas e mostrar anúncios da Becher Trader a quem já conhece o site. Você escolhe se aceita. ";
    var a = document.createElement("a"); a.href = "privacidade.html"; a.textContent = "Saiba mais";
    p.appendChild(a);
    var bx = document.createElement("div"); bx.className = "cookie-btns";
    var ok = document.createElement("button"); ok.type = "button"; ok.className = "btn btn-primary"; ok.textContent = "Aceitar";
    var no = document.createElement("button"); no.type = "button"; no.className = "btn btn-ghost"; no.textContent = "Recusar";
    ok.addEventListener("click", function () { gravar("sim"); d.remove(); carregar(); });
    no.addEventListener("click", function () { gravar("nao"); d.remove(); });
    bx.appendChild(ok); bx.appendChild(no); d.appendChild(p); d.appendChild(bx);
    document.body.appendChild(d);
  }

  var escolha = ler();
  if (escolha === "sim") carregar(); else if (escolha !== "nao") aviso();

  /* Link "Preferências de cookies" na página de privacidade reabre o aviso */
  document.querySelectorAll("[data-cookies]").forEach(function (b) {
    b.addEventListener("click", function (e) { e.preventDefault(); gravar(""); aviso(); });
  });
})();
