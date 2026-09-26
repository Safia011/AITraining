const products = [
  { id: "mango", name: "Sunny mango", note: "Sweet, chewy & golden", weight: "45 g", price: 7, tag: "Best seller", color: "#efd276", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=85", alt: "Ripe mango cut into bright golden pieces" },
  { id: "banana", name: "Banana bites", note: "Little crunch, big smile", weight: "40 g", price: 6, tag: "Just banana", color: "#e9d596", image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=85", alt: "Fresh yellow bananas" },
  { id: "apple", name: "Apple rings", note: "A crisp little classic", weight: "45 g", price: 6, tag: "Orchard pick", color: "#e6a18c", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=85", alt: "Fresh red and green apples" },
  { id: "pineapple", name: "Pineapple pops", note: "Tart, sunny & tropical", weight: "45 g", price: 7, tag: "Tropical", color: "#ecd36e", image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=900&q=85", alt: "Fresh pineapple with green crown" }
];

const grid = document.querySelector("#product-grid");
const drawer = document.querySelector(".cart-drawer");
const scrim = document.querySelector(".drawer-scrim");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const drawerFooter = document.querySelector(".drawer-footer");
const toast = document.querySelector(".toast");
let cart = loadCart();
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("sunfold-cart") || "{}");
    return Object.fromEntries(Object.entries(saved).filter(([id, quantity]) => products.some((product) => product.id === id) && Number.isInteger(quantity) && quantity > 0));
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem("sunfold-cart", JSON.stringify(cart));
}

function money(amount) {
  return `$${amount.toFixed(2)}`;
}

function renderProducts() {
  grid.innerHTML = products.map((product, index) => `
    <article class="product-card" style="animation-delay:${index * 80}ms">
      <div class="product-image" style="background:${product.color}">
        <img src="${product.image}" alt="${product.alt}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
        <button class="add-button" type="button" data-add="${product.id}" aria-label="Add ${product.name} to basket">+</button>
      </div>
      <div class="product-info">
        <div><h3>${product.name}</h3><p>${product.note} · ${product.weight}</p></div>
        <span class="product-price">${money(product.price)}</span>
      </div>
    </article>`).join("");
}

function renderCart() {
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const count = entries.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = entries.reduce((sum, [id, quantity]) => sum + products.find((product) => product.id === id).price * quantity, 0);
  document.querySelectorAll(".basket-count").forEach((element) => { element.textContent = count; });
  document.querySelector(".drawer-count").textContent = `(${count})`;
  cartEmpty.hidden = count > 0;
  drawerFooter.hidden = count === 0;
  cartItems.innerHTML = entries.map(([id, quantity]) => {
    const product = products.find((item) => item.id === id);
    return `<article class="cart-row">
      <img src="${product.image}" alt="" loading="lazy">
      <div><h3>${product.name}</h3><p>${money(product.price)} · ${product.weight}</p>
        <div class="quantity-control" aria-label="Quantity for ${product.name}">
          <button type="button" data-quantity="-1" data-id="${id}" aria-label="Remove one ${product.name}">−</button><span>${quantity}</span>
          <button type="button" data-quantity="1" data-id="${id}" aria-label="Add one ${product.name}">+</button>
        </div>
      </div><span class="cart-row-price">${money(product.price * quantity)}</span>
    </article>`;
  }).join("");
  document.querySelector(".subtotal strong").textContent = money(total);
  const order = entries.map(([id, quantity]) => `${quantity} x ${products.find((product) => product.id === id).name}`).join(", ");
  const subject = encodeURIComponent("Sunfold fruit order request");
  const body = encodeURIComponent(`Hello Sunfold! I'd like to request: ${order}. Subtotal: ${money(total)}.\n\nName:\nDelivery address:\n`);
  document.querySelector(".checkout-link").href = `mailto:hello@sunfoldfruit.com?subject=${subject}&body=${body}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function setDrawerOpen(open) {
  drawer.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  drawer.inert = !open;
  scrim.hidden = !open;
  document.body.classList.toggle("no-scroll", open);
  if (open) drawer.querySelector(".close-drawer").focus();
}

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  const product = products.find((item) => item.id === button.dataset.add);
  cart[product.id] = (cart[product.id] || 0) + 1;
  saveCart();
  renderCart();
  showToast(`${product.name} added to your basket`);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-quantity]");
  if (!button) return;
  const id = button.dataset.id;
  cart[id] = (cart[id] || 0) + Number(button.dataset.quantity);
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
});

document.querySelector(".basket-button").addEventListener("click", () => setDrawerOpen(true));
document.querySelector(".close-drawer").addEventListener("click", () => setDrawerOpen(false));
scrim.addEventListener("click", () => setDrawerOpen(false));
drawer.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setDrawerOpen(false);
});
drawer.addEventListener("click", (event) => {
  if (event.target.closest("a[href^='#']")) setDrawerOpen(false);
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mainNav.classList.toggle("is-open", open);
});
mainNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    mainNav.classList.remove("is-open");
  }
});

document.querySelector("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();