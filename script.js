const barraTopo = document.querySelector(".barra-topo");
const menuLinks = document.querySelector(".menu-links");
const botaoMenu = document.querySelector(".botao-menu");
const interruptorTema = document.querySelector("#interruptor-tema");
const botaoCarrinho = document.querySelector(".botao-carrinho");
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
interruptorTema.checked = lerSalvo("tema") === "claro";

interruptorTema.addEventListener("change", () => {
  salvar("tema", interruptorTema.checked ? "claro" : "escuro");
});

// Menu do celular
botaoMenu.addEventListener("click", () => {
  menuLinks.classList.toggle("aberto");
  botaoMenu.classList.toggle("aberto");
});

// Link ativo do menu
document.querySelectorAll(".menu-links a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".menu-links .ativo").classList.remove("ativo");
    link.classList.add("ativo");
    menuLinks.classList.remove("aberto");
    botaoMenu.classList.remove("aberto");
  });
});

// Sombra na barra ao rolar a página
window.addEventListener("scroll", () => {
  barraTopo.classList.toggle("rolado", window.scrollY > 20);
});

// Carrinho
let itensNoCarrinho = Number(lerSalvo("carrinho")) || 0;

function mostrarCarrinho() {
  contador.textContent = itensNoCarrinho;
  contador.classList.toggle("visivel", itensNoCarrinho > 0);
}

mostrarCarrinho();

document.querySelectorAll(".botao-adicionar").forEach((botao) => {
  botao.addEventListener("click", () => {
    itensNoCarrinho++;
    salvar("carrinho", itensNoCarrinho);
    mostrarCarrinho();
  });
});

botaoCarrinho.addEventListener("click", () => {
  document.getElementById("cardapio").scrollIntoView({ behavior: "smooth" });
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
