const barraTopo = document.querySelector(".barra-topo");
const menuLinks = document.querySelector(".menu-links");
const botaoMenu = document.querySelector(".botao-menu");
const interruptorTema = document.querySelector("#interruptor-tema");
const contador = document.querySelector(".contador");
const pilha = document.querySelector(".pilha");

// Guarda e lê valores no navegador (tema e carrinho continuam ao trocar de página)
function lerSalvo(chave) {
  try {
    return localStorage.getItem(chave);
  } catch (erro) {
    return null;
  }
}

function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, valor);
  } catch (erro) {}
}

// Tema claro / escuro (as cores são trocadas pelo CSS, aqui só guardamos a escolha)
if (interruptorTema) {
  interruptorTema.checked = lerSalvo("tema") === "claro";

  interruptorTema.addEventListener("change", () => {
    salvar("tema", interruptorTema.checked ? "claro" : "escuro");
  });
}

// Menu do celular
if (botaoMenu) {
  botaoMenu.addEventListener("click", () => {
    menuLinks.classList.toggle("aberto");
    botaoMenu.classList.toggle("aberto");
  });
}

// Link ativo do menu
document.querySelectorAll(".menu-links a").forEach((link) => {
  link.addEventListener("click", () => {
    const ativo = document.querySelector(".menu-links .ativo");
    if (ativo) ativo.classList.remove("ativo");
    link.classList.add("ativo");
    menuLinks.classList.remove("aberto");
    if (botaoMenu) botaoMenu.classList.remove("aberto");
  });
});

// Sombra na barra ao rolar a página
if (barraTopo) {
  window.addEventListener("scroll", () => {
    barraTopo.classList.toggle("rolado", window.scrollY > 20);
  });
}

// Carrinho (fica guardado no navegador como uma lista de pratos)
function lerCarrinho() {
  try {
    const itens = JSON.parse(lerSalvo("carrinho"));
    return Array.isArray(itens) ? itens : [];
  } catch (erro) {
    return [];
  }
}

function mostrarCarrinho() {
  if (!contador) return;
  const total = lerCarrinho().reduce((soma, item) => soma + item.quantidade, 0);
  contador.textContent = total;
  contador.classList.toggle("visivel", total > 0);
}

function salvarCarrinho(itens) {
  salvar("carrinho", JSON.stringify(itens));
  mostrarCarrinho();
}

mostrarCarrinho();

document.querySelectorAll(".botao-adicionar").forEach((botao) => {
  botao.addEventListener("click", () => {
    const prato = botao.closest(".prato");
    const nome = prato.querySelector("h3").textContent;
    const preco = Number(prato.querySelector(".preco").textContent.replace(/[^\d,]/g, "").replace(",", "."));

    const itens = lerCarrinho();
    const item = itens.find((i) => i.nome === nome);

    if (item) {
      item.quantidade++;
    } else {
      itens.push({ nome, preco, quantidade: 1 });
    }

    salvarCarrinho(itens);
  });
});

// Fotos da página inicial: clicar na da frente passa para a próxima
let trocandoFoto = false;

if (pilha) {
  pilha.addEventListener("click", () => {
    if (trocandoFoto) return;
    trocandoFoto = true;

    const frente = pilha.querySelector(".foto-1");
    const meio = pilha.querySelector(".foto-2");
    const fundo = pilha.querySelector(".foto-3");

    frente.classList.add("saindo");

    setTimeout(() => {
      frente.classList.remove("foto-1", "saindo");
      frente.classList.add("foto-3");
      meio.classList.replace("foto-2", "foto-1");
      fundo.classList.replace("foto-3", "foto-2");
      trocandoFoto = false;
    }, 450);
  });
}

// Busca e filtros da página do cardápio
const campoBusca = document.querySelector(".busca-cardapio input");

if (campoBusca) {
  const filtros = document.querySelectorAll(".filtro");
  const pratos = document.querySelectorAll(".prato");
  const semResultado = document.querySelector(".sem-resultado");
  let categoriaAtual = "todos";

  function limpar(texto) {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function filtrarPratos() {
    const busca = limpar(campoBusca.value.trim());
    let encontrados = 0;

    pratos.forEach((prato) => {
      const conteudo = limpar(prato.textContent + " " + prato.dataset.categoria);
      const daCategoria = categoriaAtual === "todos" || prato.dataset.categoria === categoriaAtual;
      const mostrar = daCategoria && conteudo.includes(busca);

      prato.hidden = !mostrar;
      if (mostrar) encontrados++;
    });

    semResultado.hidden = encontrados > 0;
  }

  filtros.forEach((filtro) => {
    filtro.addEventListener("click", () => {
      document.querySelector(".filtro.ativo").classList.remove("ativo");
      filtro.classList.add("ativo");
      categoriaAtual = filtro.dataset.categoria;
      filtrarPratos();
    });
  });

  campoBusca.addEventListener("input", filtrarPratos);
}

// Página do carrinho
const listaItens = document.querySelector(".lista-itens");

if (listaItens) {
  const carrinhoVazio = document.querySelector(".carrinho-vazio");
  const valorSubtotal = document.querySelector(".valor-subtotal");
  const valorEntrega = document.querySelector(".valor-entrega");
  const valorDesconto = document.querySelector(".valor-desconto");
  const valorTotal = document.querySelector(".valor-total");
  const formularioCupom = document.querySelector(".cupom");
  const campoCupom = document.querySelector(".cupom input");
  const avisoCupom = document.querySelector(".cupom-aviso");
  const botaoFinalizar = document.querySelector(".botao-finalizar");

  const taxaEntrega = 0;
  const cupomValido = "SAGRADO10";
  const descontoDoCupom = 0.1;
  let cupomAplicado = false;

  function emReais(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function criar(tag, classe, texto) {
    const elemento = document.createElement(tag);
    elemento.className = classe;
    if (texto !== undefined) elemento.textContent = texto;
    return elemento;
  }

  function mudarQuantidade(nome, mudanca) {
    const itens = lerCarrinho();
    const item = itens.find((i) => i.nome === nome);
    item.quantidade += mudanca;
    salvarCarrinho(itens.filter((i) => i.quantidade > 0));
    desenharCarrinho();
  }

  function desenharCarrinho() {
    const itens = lerCarrinho();
    listaItens.innerHTML = "";
    carrinhoVazio.hidden = itens.length > 0;

    itens.forEach((item) => {
      const linha = criar("li", "item");

      const dados = criar("div", "item-dados");
      dados.append(criar("strong", "item-nome", item.nome), criar("span", "item-preco", emReais(item.preco)));

      const menos = criar("button", "", "−");
      const mais = criar("button", "", "+");
      menos.setAttribute("aria-label", "Diminuir " + item.nome);
      mais.setAttribute("aria-label", "Aumentar " + item.nome);
      menos.addEventListener("click", () => mudarQuantidade(item.nome, -1));
      mais.addEventListener("click", () => mudarQuantidade(item.nome, 1));

      const quantidade = criar("div", "item-quantidade");
      quantidade.append(menos, criar("span", "", item.quantidade), mais);

      linha.append(dados, quantidade, criar("strong", "item-total", emReais(item.preco * item.quantidade)));
      listaItens.append(linha);
    });

    const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
    const entrega = itens.length > 0 ? taxaEntrega : 0;
    const desconto = cupomAplicado ? subtotal * descontoDoCupom : 0;

    valorSubtotal.textContent = emReais(subtotal);
    valorEntrega.textContent = emReais(entrega);
    valorDesconto.textContent = "- " + emReais(desconto);
    valorTotal.textContent = emReais(subtotal + entrega - desconto);
    botaoFinalizar.disabled = itens.length === 0;
  }

  formularioCupom.addEventListener("submit", (evento) => {
    evento.preventDefault();
    cupomAplicado = campoCupom.value.trim().toUpperCase() === cupomValido;
    avisoCupom.textContent = cupomAplicado ? "Cupom aplicado: 10% de desconto." : "Cupom inválido.";
    desenharCarrinho();
  });

  botaoFinalizar.addEventListener("click", () => {
    alert("Pedido finalizado! Obrigado pela preferência.");
    salvarCarrinho([]);
    desenharCarrinho();
  });

  desenharCarrinho();
}
