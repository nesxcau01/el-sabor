const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("navLinks");
const menuToggle = document.getElementById("menuToggle");
const themeBtn = document.getElementById("themeBtn");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const cartBtn = document.getElementById("cartBtn");
const cartBadge = document.getElementById("cartBadge");

/*  Tema claro / escuro  */
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  const light = theme === "light";
  document.body.classList.toggle("light", light);
  themeToggle.checked = light;
  themeBtn.setAttribute("aria-label", light ? "Ativar modo escuro" : "Ativar modo claro");
  themeBtn.setAttribute("title", light ? "Modo escuro" : "Modo claro");
}

let savedTheme = "dark";
try { savedTheme = localStorage.getItem("theme") || "dark"; } catch (err) {}
applyTheme(savedTheme);

themeToggle.addEventListener("change", () => {
  const next = themeToggle.checked ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (err) {}
});

// Teclado: Enter ou Espaço no botão também alternam
themeBtn.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter" || ev.key === " ") {
    ev.preventDefault();
    themeToggle.click();
  }
});

/*  Menu mobile  */
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", open);
});

/*  Link ativo  */
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.querySelectorAll("a").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", false);
  });
});



/*  Busca  */
searchBtn.addEventListener("click", () => {
  const open = searchInput.classList.toggle("open");
  if (open) searchInput.focus();
  else searchInput.value = "";
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && searchInput.value.trim()) {
    alert("Buscando por: " + searchInput.value.trim());
  }
  if (e.key === "Escape") {
    searchInput.classList.remove("open");
    searchInput.value = "";
  }
});

/* Carrinho  */
let cartCount = 0;

function updateCart() {
  cartBadge.textContent = cartCount;
  cartBadge.classList.toggle("show", cartCount > 0);
  cartBadge.classList.remove("bump");
  void cartBadge.offsetWidth; // reinicia a animação
  cartBadge.classList.add("bump");
}

// Cada botão "+" do cardápio adiciona 1 item.
function addToCart() {
  cartCount++;
  updateCart();
}

document.querySelectorAll(".btn-add").forEach((btn) => {
  btn.addEventListener("click", addToCart);
});

// Clicar no carrinho leva até o cardápio
cartBtn.addEventListener("click", () => {
  document.getElementById("cardapio").scrollIntoView({ behavior: "smooth" });
});

/*  Pilha de fotos   */
const stack = document.querySelector(".stack");

if (stack) {
  let busy = false;
  const getPhoto = (n) => stack.querySelector(".photo-" + n);

  stack.addEventListener("click", () => {
    if (busy) return;
    busy = true;

    const front = getPhoto(1);
    const middle = getPhoto(2);
    const back = getPhoto(3);

    // 1) a da frente sai de cena
    front.classList.add("leaving");

    // 2) depois vai para o fundo da pilha e as outras avançam (looping)
    setTimeout(() => {
      front.classList.remove("photo-1", "leaving");
      front.classList.add("photo-3");
      middle.classList.replace("photo-2", "photo-1");
      back.classList.replace("photo-3", "photo-2");
      setTimeout(() => { busy = false; }, 500);
    }, 450);
  });
}
