const navbar = document.getElementById("navbar");
const navLinks = document.getElementById("navLinks");
const menuToggle = document.getElementById("menuToggle");
const themeBtn = document.getElementById("themeBtn");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const cartBtn = document.getElementById("cartBtn");
const cartBadge = document.getElementById("cartBadge");

/* ---------- Menu mobile ---------- */
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", open);
});

/* ---------- Link ativo ---------- */
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.querySelectorAll("a").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    navLinks.classList.remove("open");
    menuToggle.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", false);
  });
});

/* ---------- Sombra ao rolar ---------- */
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
});

/* ---------- Tema claro / escuro ---------- */
function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
}

let savedTheme = "dark";
try { savedTheme = localStorage.getItem("theme") || "dark"; } catch (e) {}
applyTheme(savedTheme);

themeBtn.addEventListener("click", () => {
  const next = document.body.classList.contains("light") ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

/* ---------- Busca ---------- */
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

/* ---------- Carrinho ---------- */
let cartCount = 0;

function updateCart() {
  cartBadge.textContent = cartCount;
  cartBadge.classList.toggle("show", cartCount > 0);
  cartBadge.classList.remove("bump");
  void cartBadge.offsetWidth; // reinicia a animação
  cartBadge.classList.add("bump");
}

// Clique no carrinho de teste: adiciona 1 item.
// Na versão real, chame addToCart() ao clicar em "adicionar" no cardápio.
function addToCart() {
  cartCount++;
  updateCart();
}

cartBtn.addEventListener("click", addToCart);

// Mostra o ponto laranja inicial como na imagem
cartCount = 1;
updateCart();