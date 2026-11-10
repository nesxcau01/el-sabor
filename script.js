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

// Clicar no carrinho abre a página do carrinho
const botaoCarrinho = document.querySelector(".botao-carrinho");

if (botaoCarrinho) {
  botaoCarrinho.addEventListener("click", (evento) => {
    evento.preventDefault();
    window.location.href = "carrinho.html";
  });
}

let aviso = null;
let tempoAviso = null;

function mostrarAviso(texto) {
  if (!aviso) {
    aviso = document.createElement("div");
    aviso.className = "aviso";
    document.body.appendChild(aviso);
  }

  aviso.innerHTML = '<span class="aviso-icone">✓</span>';
  aviso.append(texto);
  aviso.classList.add("visivel");

  clearTimeout(tempoAviso);
  tempoAviso = setTimeout(() => aviso.classList.remove("visivel"), 2500);
}

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
    mostrarAviso(nome + " foi adicionado ao seu carrinho.");
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
  const botaoEsvaziar = document.querySelector(".botao-esvaziar");
  const formularioPedido = document.querySelector("#dados-pedido");

  const taxaEntrega = 0;
  const cupons = {
    SAGRADO10: 0.1,
    DAVI10: 0.1,
    NESXCAU10: 0.1,
    MARIAOFF: 0.5,
  };
  let descontoDoCupom = 0;

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
    const desconto = subtotal * descontoDoCupom;

    valorSubtotal.textContent = emReais(subtotal);
    valorEntrega.textContent = emReais(entrega);
    valorDesconto.textContent = "- " + emReais(desconto);
    valorTotal.textContent = emReais(subtotal + entrega - desconto);
    botaoFinalizar.disabled = itens.length === 0;
    botaoEsvaziar.disabled = itens.length === 0;
    if (formularioPedido) formularioPedido.hidden = itens.length === 0;
  }

  formularioCupom.addEventListener("submit", (evento) => {
    evento.preventDefault();
    descontoDoCupom = cupons[campoCupom.value.trim().toUpperCase()] || 0;
    avisoCupom.textContent = descontoDoCupom > 0 ? "Cupom aplicado: " + descontoDoCupom * 100 + "% de desconto." : "Cupom inválido.";
    desenharCarrinho();
  });

  function mostrarModal() {
    const fundo = document.createElement("div");
    fundo.className = "modal-fundo";
    fundo.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <span class="modal-icone">✓</span>
        <h2>Pedido finalizado!</h2>
        <p>Obrigado pela preferência. Seu pedido foi enviado e já estamos preparando tudo.</p>
        <a href="cardapio.html" class="botao-principal">Voltar ao cardápio</a>
        <button type="button" class="modal-baixar">Baixar pedidos (.json)</button>
        <button type="button" class="modal-fechar">Fechar</button>
      </div>`;
    document.body.appendChild(fundo);

    function fechar() {
      fundo.remove();
    }

    fundo.querySelector(".modal-baixar").addEventListener("click", baixarPedidos);
    fundo.querySelector(".modal-fechar").addEventListener("click", fechar);
    fundo.addEventListener("click", (evento) => {
      if (evento.target === fundo) fechar();
    });
  }

  botaoEsvaziar.addEventListener("click", () => {
    salvarCarrinho([]);
    desenharCarrinho();
  });

  if (formularioPedido) {
    const campoTelefone = formularioPedido.elements.telefone;

    function telefoneValido(numeros) {
      const ddd = Number(numeros.slice(0, 2));
      if (ddd < 11 || ddd > 99) return false;
      if (numeros.length === 11) return numeros[2] === "9";
      return numeros.length === 10 && numeros[2] !== "0";
    }

    campoTelefone.addEventListener("input", () => {
      const numeros = campoTelefone.value.replace(/\D/g, "").slice(0, 11);
      let texto = numeros;

      if (numeros.length > 10) {
        texto = "(" + numeros.slice(0, 2) + ") " + numeros.slice(2, 7) + "-" + numeros.slice(7);
      } else if (numeros.length > 6) {
        texto = "(" + numeros.slice(0, 2) + ") " + numeros.slice(2, 6) + "-" + numeros.slice(6);
      } else if (numeros.length > 2) {
        texto = "(" + numeros.slice(0, 2) + ") " + numeros.slice(2);
      }

      campoTelefone.value = texto;
      campoTelefone.setCustomValidity(telefoneValido(numeros) ? "" : "Telefone inválido. Digite o DDD e o número.");
      campoTelefone.classList.toggle("invalido", numeros.length >= 10 && !telefoneValido(numeros));
    });

    const campoCep = formularioPedido.elements.cep;
    const campoCpf = formularioPedido.elements.cpf;

    function cpfValido(cpf) {
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

      for (let tamanho = 9; tamanho <= 10; tamanho++) {
        let soma = 0;
        for (let i = 0; i < tamanho; i++) {
          soma += Number(cpf[i]) * (tamanho + 1 - i);
        }
        const digito = ((soma * 10) % 11) % 10;
        if (digito !== Number(cpf[tamanho])) return false;
      }

      return true;
    }

    campoCpf.addEventListener("input", () => {
      const numeros = campoCpf.value.replace(/\D/g, "").slice(0, 11);
      campoCpf.value = numeros
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1-$2");

      campoCpf.setCustomValidity(cpfValido(numeros) ? "" : "CPF inválido");

      if (cpfValido(numeros)) {
        const anterior = lerPedidos().reverse().find((pedido) => pedido.cliente.cpf === numeros);

        if (anterior) {
          formularioPedido.elements.nome.value = anterior.cliente.nome;
          formularioPedido.elements.email.value = anterior.cliente.email;
          formularioPedido.elements.telefone.value = anterior.cliente.telefone;
          formularioPedido.elements.telefone.dispatchEvent(new Event("input"));
        }
      }
      campoCpf.classList.toggle("invalido", numeros.length === 11 && !cpfValido(numeros));
    });

    campoCep.addEventListener("input", () => {
      const numeros = campoCep.value.replace(/\D/g, "").slice(0, 8);
      campoCep.value = numeros.length > 5 ? numeros.slice(0, 5) + "-" + numeros.slice(5) : numeros;

      if (numeros.length === 8) buscarCep(numeros);
    });

    async function buscarCep(cep) {
      try {
        const resposta = await fetch("https://viacep.com.br/ws/" + cep + "/json/");
        const dados = await resposta.json();

        if (dados.erro) {
          mostrarAviso("CEP não encontrado. Preencha o endereço manualmente.");
          return;
        }

        formularioPedido.elements.endereco.value = dados.logradouro;
        formularioPedido.elements.bairro.value = dados.bairro;
        formularioPedido.elements.cidade.value = dados.localidade;
        formularioPedido.elements.numero.focus();
      } catch (erro) {
        mostrarAviso("Não foi possível buscar o CEP. Preencha o endereço manualmente.");
      }
    }

    botaoFinalizar.addEventListener("click", () => {
      if (!formularioPedido.checkValidity()) {
        const campoInvalido = formularioPedido.querySelector(":invalid");
        const cpfErrado = campoInvalido === campoCpf && campoCpf.value !== "";
        const telefoneErrado = campoInvalido === campoTelefone && campoTelefone.value !== "";
        let mensagem = "Preencha seus dados e o endereço de entrega para finalizar.";
        if (cpfErrado) mensagem = "CPF inválido. Confira os números digitados.";
        if (telefoneErrado) mensagem = "Telefone inválido. Digite o DDD e o número.";
        mostrarAviso(mensagem);
        campoInvalido.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    formularioPedido.addEventListener("submit", (evento) => {
      evento.preventDefault();

      try {
        const itens = lerCarrinho();
        const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
        const desconto = subtotal * descontoDoCupom;

        guardarPedido(formularioPedido, itens, subtotal + taxaEntrega - desconto);
        formularioPedido.reset();
        salvarCarrinho([]);
        desenharCarrinho();
        mostrarModal();
      } catch (erro) {
        mostrarAviso("Erro ao finalizar: " + erro.message);
      }
    });
  }

  desenharCarrinho();
}

document.querySelectorAll("input[data-tipo]").forEach((campo) => {
  campo.addEventListener("focus", () => {
    campo.type = campo.dataset.tipo;
    if (campo.showPicker) {
      try {
        campo.showPicker();
      } catch (erro) {}
    }
  });

  campo.addEventListener("blur", () => {
    if (campo.value === "") campo.type = "text";
  });
});

const idsDosProdutos = {
  "Tacos": 1,
  "Burrito Azteca": 2,
  "Guacamole Sagrado": 3,
  "Quesadilla Mexicana": 4,
  "Nachos Fiesta": 5,
  "Margarita Clássica": 6,
  "Taco Vegano": 7,
  "Churros Mexicanos": 8,
  "Burrito Vegano": 9,
  "Paloma Mexicana": 10,
  "Taco Pastor": 11,
  "Tres Leches": 12,
};

function lerPedidos() {
  try {
    return JSON.parse(lerSalvo("pedidos")) || [];
  } catch (erro) {
    return [];
  }
}

function doisDigitos(numero) {
  return String(numero).padStart(2, "0");
}

function dataParaMysql(data) {
  return (
    data.getFullYear() + "-" + doisDigitos(data.getMonth() + 1) + "-" + doisDigitos(data.getDate()) +
    " " + doisDigitos(data.getHours()) + ":" + doisDigitos(data.getMinutes()) + ":" + doisDigitos(data.getSeconds())
  );
}

function guardarPedido(formulario, itens, valorTotal) {
  const dados = new FormData(formulario);
  const pedidos = lerPedidos();
  const numero = pedidos.length + 1;

  pedidos.push({
    cliente: {
      nome: dados.get("nome").trim(),
      cpf: dados.get("cpf").replace(/\D/g, ""),
      telefone: dados.get("telefone").replace(/\D/g, ""),
      email: dados.get("email").trim().toLowerCase(),
    },
    pedido: {
      numero_pedido: "PED" + String(numero).padStart(4, "0"),
      data_pedido: dataParaMysql(new Date()),
      valor_total: Math.round(valorTotal * 100) / 100,
      status: "Preparando",
    },
    itens_pedido: itens.map((item) => ({
      id_produto: idsDosProdutos[item.nome] || null,
      nome: item.nome,
      quantidade: item.quantidade,
      preco_unitario: item.preco,
      observacao: null,
    })),
    entrega: {
      endereco_entrega: dados.get("endereco").trim(),
      numero: dados.get("numero").trim(),
      complemento: dados.get("complemento").trim() || null,
      bairro: dados.get("bairro").trim(),
      cidade: dados.get("cidade").trim(),
      cep: dados.get("cep").trim(),
      status_entrega: "A caminho",
    },
    pagamento: {
      forma_pagamento: dados.get("pagamento"),
      valor: Math.round(valorTotal * 100) / 100,
      status: "Pendente",
      codigo_pix: null,
    },
  });

  salvar("pedidos", JSON.stringify(pedidos));
}

function baixarPedidos() {
  const arquivo = new Blob([JSON.stringify(lerPedidos(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(arquivo);
  link.download = "pedidos.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function lerUsuarios() {
  try {
    return JSON.parse(lerSalvo("usuarios")) || [];
  } catch (erro) {
    return [];
  }
}

const emailLogado = lerSalvo("usuarioLogado");
const usuarioLogado = lerUsuarios().find((usuario) => usuario.email === emailLogado);

if (usuarioLogado) {
  const primeiroNome = usuarioLogado.nome.split(" ")[0];

  document.querySelectorAll('.acoes a[href="login.html"]').forEach((link) => {
    link.textContent = "Olá, " + primeiroNome;
    link.removeAttribute("href");
  });

  document.querySelectorAll('.acoes a[href="login.html#cadastro"]').forEach((link) => {
    link.textContent = "Sair";
    link.href = "#";
    link.addEventListener("click", (evento) => {
      evento.preventDefault();
      salvar("usuarioLogado", "");
      window.location.reload();
    });
  });

  const campoNome = document.querySelector("#dados-pedido [name=nome]");
  const campoEmail = document.querySelector("#dados-pedido [name=email]");

  if (campoNome) {
    campoNome.value = usuarioLogado.nome;
    campoEmail.value = usuarioLogado.email;
  }
}

const abasLogin = document.querySelectorAll(".login-aba");

if (abasLogin.length > 0) {
  const formularioEntrar = document.querySelector("#formulario-entrar");
  const formularioCadastrar = document.querySelector("#formulario-cadastrar");

  function mostrarAba(nomeAba) {
    const entrar = nomeAba === "entrar";
    abasLogin.forEach((aba) => aba.classList.toggle("ativo", aba.dataset.aba === nomeAba));
    formularioEntrar.classList.toggle("ativo", entrar);
    formularioCadastrar.classList.toggle("ativo", !entrar);
  }

  abasLogin.forEach((aba) => {
    aba.addEventListener("click", () => mostrarAba(aba.dataset.aba));
  });

  if (window.location.hash === "#cadastro") mostrarAba("cadastrar");

  formularioCadastrar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const dados = new FormData(formularioCadastrar);
    const mensagem = formularioCadastrar.querySelector(".login-mensagem");
    const email = dados.get("email").trim().toLowerCase();
    const usuarios = lerUsuarios();

    if (dados.get("senha") !== dados.get("confirmar")) {
      mensagem.textContent = "As senhas não são iguais.";
      return;
    }

    if (usuarios.some((usuario) => usuario.email === email)) {
      mensagem.textContent = "Já existe uma conta com esse e-mail. Clique em Entrar.";
      return;
    }

    usuarios.push({ nome: dados.get("nome").trim(), email, senha: dados.get("senha") });
    salvar("usuarios", JSON.stringify(usuarios));
    salvar("usuarioLogado", email);
    window.location.href = "index.html";
  });

  formularioEntrar.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const dados = new FormData(formularioEntrar);
    const mensagem = formularioEntrar.querySelector(".login-mensagem");
    const email = dados.get("email").trim().toLowerCase();
    const usuario = lerUsuarios().find((u) => u.email === email && u.senha === dados.get("senha"));

    if (!usuario) {
      mensagem.textContent = "E-mail ou senha incorretos. Se ainda não tem conta, clique em Cadastrar.";
      return;
    }

    salvar("usuarioLogado", email);
    window.location.href = "index.html";
  });
}