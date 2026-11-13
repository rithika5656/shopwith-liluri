import { STORE_CONFIG } from "./config.js";
import { categories, products } from "./products.js";
import { createOrderMessage } from "./whatsapp.js";

const app = document.querySelector("#app");
const cartKey = "liluri-cart-v1";
const wishlistKey = "liluri-wishlist-v1";
let pinterestWidgetScript = null;
const state = {
  cart: readStorage(cartKey, {}),
  wishlist: readStorage(wishlistKey, []),
  category: "All Products",
};

const phoneCharmInspirationPins = [
  { id: "1048494357023778166", title: "Pastel Beaded Charms", tags: "pastel coquette pearls beads" },
  { id: "4604015953866424896", title: "Butterfly Phone Straps", tags: "butterfly floral colorful strap" },
  { id: "1046172188459175488", title: "Strawberry Bead Charms", tags: "strawberry red fruit beads" },
  { id: "845480530091829333", title: "Flower Phone Straps", tags: "flower floral pink bead strap" },
  { id: "1114500239074190493", title: "Kawaii Character Charms", tags: "kawaii bear bunny cat character" },
  { id: "380624606037141033", title: "Colourful Bead Charms", tags: "colorful colourful rainbow smiley beads" },
];

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.warn(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save ${key} to local storage.`, error);
    showToast("Your browser could not save this update.");
  }
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function getRoute() {
  const [path = "home", query = ""] = window.location.hash.slice(1).split("?");
  const params = new URLSearchParams(query);
  return { path: path || "home", category: params.get("category") };
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function buildPinterestWidgets() {
  if (window.PinUtils && typeof window.PinUtils.build === "function") {
    window.PinUtils.build();
    return;
  }
  if (pinterestWidgetScript) return;

  pinterestWidgetScript = document.createElement("script");
  pinterestWidgetScript.src = "https://assets.pinterest.com/js/pinit.js";
  pinterestWidgetScript.async = true;
  pinterestWidgetScript.defer = true;
  pinterestWidgetScript.onload = () => {
    const waitForBuilder = (attempt = 0) => {
      if (window.PinUtils && typeof window.PinUtils.build === "function") {
        return;
      }
      if (attempt >= 40) {
        pinterestWidgetScript = null;
        console.error("Pinterest's Pin builder did not become available.");
        showToast("Pinterest previews could not load. Use the original Pin links instead.");
        return;
      }
      window.setTimeout(() => waitForBuilder(attempt + 1), 100);
    };
    window.setTimeout(() => waitForBuilder(), 100);
  };
  pinterestWidgetScript.onerror = () => {
    pinterestWidgetScript = null;
    console.error("Pinterest's widget script could not be loaded.");
    showToast("Pinterest previews could not load. Use the original Pin links instead.");
  };
  document.body.appendChild(pinterestWidgetScript);
}

function productById(id) {
  return products.find((product) => product.id === id);
}

function iconHeart() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z" /></svg>';
}

function updateHeader() {
  const cartCount = Object.values(state.cart).reduce((total, item) => total + item.quantity, 0);
  document.querySelector("#cart-count").textContent = cartCount;
  document.querySelector("#wishlist-count").textContent = state.wishlist.length;
  document.querySelector("#current-year").textContent = new Date().getFullYear();
}

function productCard(product) {
  const wished = state.wishlist.includes(product.id);
  return `
    <article class="product-card">
      <div class="product-photo-wrap">
        <a class="product-photo" href="#product/${encodeURIComponent(product.id)}" aria-label="View product details">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageDescription)}" loading="lazy" />
        </a>
        <button class="wishlist-button ${wished ? "is-active" : ""}" type="button" data-action="wishlist" data-id="${escapeHtml(product.id)}" aria-label="${wished ? "Remove from" : "Add to"} wishlist" aria-pressed="${wished}">
          ${iconHeart()}
        </button>
      </div>
      <div class="product-meta">
        <span>${escapeHtml(product.category)}</span>
      </div>
      <a class="product-title" href="#product/${encodeURIComponent(product.id)}">${escapeHtml(product.name || "Product name coming soon")}</a>
      <button class="button button-outline add-button" type="button" data-action="add" data-id="${escapeHtml(product.id)}">Add to bag</button>
    </article>
  `;
}

function renderHome() {
  const featureProducts = products.slice(0, 4);
  app.innerHTML = `
    <section class="hero section-shell">
      <div class="hero-copy">
        <span class="eyebrow"><span class="eyebrow-line"></span> A little joy, just for you</span>
        <h1>Little Charms,<br /><em>Big Happiness.</em></h1>
        <p>Discover cute little accessories that bring colour, charm and personality to your everyday.</p>
        <div class="hero-actions">
          <a class="button button-dark" href="#collections">Explore collection <span aria-hidden="true">↗</span></a>
          <a class="button button-text" href="#shop">Shop now <span aria-hidden="true">→</span></a>
        </div>
        <span class="hero-note">Thoughtful little details. Made to feel like you.</span>
      </div>
      <div class="hero-art" aria-label="A little look at LiLuRi">
        <div class="hero-art-frame hero-art-main">
          <img src="/public/images/bracelet-08.jpeg" alt="Peach and black beaded bracelets with cute character charms" />
        </div>
        <div class="hero-art-frame hero-art-small hero-art-top">
          <img src="/public/images/phone-charms-collection.jpg" alt="LiLuRi heart-shaped phone hanging charms in a range of colours" />
        </div>
        <div class="hero-art-frame hero-art-small hero-art-bottom">
          <img src="/public/images/bracelet-13.jpeg" alt="Layered peach and pink beaded bracelets with charms" />
        </div>
        <span class="hero-stamp">little<br />lovely<br />things</span>
        <span class="art-caption">a charm for every day <span>✳</span></span>
      </div>
    </section>

    <section class="intro-strip" aria-label="Brand promise">
      <span>Made for your everyday</span><i></i><span>Little details, lots of love</span><i></i><span>Find your kind of lovely</span>
    </section>

    <section class="section-shell section-block" id="collections">
      <div class="section-heading">
        <div><span class="eyebrow">Find your lovely</span><h2>A little something <em>for you.</em></h2></div>
        <a class="text-link" href="#shop">View all pieces <span aria-hidden="true">→</span></a>
      </div>
      <div class="collection-grid">
        <a class="collection-card" href="#shop?category=Beaded%20Bracelets" data-category="Beaded Bracelets">
          <img src="/public/images/bracelet-04.jpeg" alt="A peach beaded bracelet with a dark butterfly charm" loading="lazy" />
          <span class="collection-overlay"><span>01 / Butterflies &amp; petals</span><strong>Butterfly<br />&amp; Bloom</strong><span class="collection-cta">Explore bracelets <b>↗</b></span></span>
        </a>
        <a class="collection-card collection-phone-image" href="#shop?category=Phone%20Charms" data-category="Phone Charms">
          <img src="/public/images/phone-charms-collection.jpg" alt="LiLuRi phone straps with heart, daisy, rose, panda, swan, butterfly and dolphin charms" loading="lazy" />
          <span class="collection-overlay"><span>02 / Carry a little joy</span><strong>Phone Charm<br />Straps</strong><span class="collection-cta">Explore the collection <b>↗</b></span></span>
        </a>
        <a class="collection-card" href="#shop?category=Beaded%20Bracelets" data-category="Beaded Bracelets">
          <img src="/public/images/bracelet-01.jpeg" alt="Pastel peach and clear beaded bracelets with playful charms" loading="lazy" />
          <span class="collection-overlay"><span>03 / Soft colour stories</span><strong>Pastel Bead<br />Mixes</strong><span class="collection-cta">Explore bracelets <b>↗</b></span></span>
        </a>
        <a class="collection-card" href="#shop?category=Beaded%20Bracelets" data-category="Beaded Bracelets">
          <img src="/public/images/bracelet-05.jpeg" alt="Turquoise and clear beaded bracelet with a whale charm" loading="lazy" />
          <span class="collection-overlay"><span>04 / Ocean-kissed charms</span><strong>Sea Glass<br />&amp; Sky</strong><span class="collection-cta">Explore bracelets <b>↗</b></span></span>
        </a>
        <a class="collection-card" href="#shop?category=Beaded%20Bracelets" data-category="Beaded Bracelets">
          <img src="/public/images/bracelet-10.jpeg" alt="Black, ivory and clear beaded bracelets with crown charms" loading="lazy" />
          <span class="collection-overlay"><span>05 / Little statement pieces</span><strong>Crown Charm<br />Classics</strong><span class="collection-cta">Explore bracelets <b>↗</b></span></span>
        </a>
        <a class="collection-card collection-accessory-set" href="#shop?category=Accessory%20Sets" data-category="Accessory Sets">
          <img src="/public/images/set-01.jpeg" alt="An ivory beaded butterfly bracelet styled with a matching butterfly necklace" loading="lazy" />
          <span class="collection-overlay"><span>06 / Soft ivory keepsakes</span><strong>Ivory Butterfly<br />Pairings</strong><span class="collection-cta">Explore accessory sets <b>↗</b></span></span>
        </a>
        <a class="collection-card collection-accessory-set" href="#shop?category=Accessory%20Sets" data-category="Accessory Sets">
          <img src="/public/images/set-02.jpeg" alt="A blush pink butterfly necklace and matching beaded bracelet" loading="lazy" />
          <span class="collection-overlay"><span>07 / Petal pink details</span><strong>Rosy<br />Daydream</strong><span class="collection-cta">Explore accessory sets <b>↗</b></span></span>
        </a>
        <a class="collection-card collection-accessory-set" href="#shop?category=Accessory%20Sets" data-category="Accessory Sets">
          <img src="/public/images/set-03.jpeg" alt="A black butterfly necklace styled with a matching charm bracelet" loading="lazy" />
          <span class="collection-overlay"><span>08 / A little after-dark charm</span><strong>Midnight<br />Butterfly</strong><span class="collection-cta">Explore accessory sets <b>↗</b></span></span>
        </a>
        <a class="collection-card collection-personalised" href="#shop?category=Personalised%20Accessories" data-category="Personalised Accessories">
          <span class="personalised-art" aria-hidden="true">
            <span class="personalised-art-note">A LITTLE WORD, MADE YOURS</span>
            <span class="personalised-bead-string"><i>Y</i><i>O</i><i>U</i></span>
            <span class="personalised-art-caption">bead by bead</span>
          </span>
          <span class="collection-overlay"><span>09 / A personal touch</span><strong>Personalised<br />Name Beads</strong><span class="collection-cta">Coming soon <b>↗</b></span></span>
        </a>
      </div>
    </section>

    <section class="bestsellers-section section-block">
      <div class="section-shell">
        <div class="section-heading">
          <div><span class="eyebrow">A few little favourites</span><h2>Lovely things, <em>coming soon.</em></h2></div>
          <a class="text-link" href="#shop">Browse the shop <span aria-hidden="true">→</span></a>
        </div>
        <div class="product-grid product-grid-featured">${featureProducts.map(productCard).join("")}</div>
        <p class="catalog-note">Our first little favourites are on their way. Follow us on Instagram for the latest.</p>
      </div>
    </section>

    <section class="coming-soon-section section-shell">
      <div class="coming-art">
        <img src="/public/images/bracelet-15.jpeg" alt="Blush and ivory beaded bracelets with small charms" loading="lazy" />
        <span class="coming-orbit">a little<br />something<br />lovely</span>
      </div>
      <div class="coming-copy">
        <span class="eyebrow">A little note from us</span>
        <h2>Something Lovely<br /><em>Is Coming.</em></h2>
        <p>New little treasures are on their way. Stay tuned for our upcoming collections.</p>
        <a class="button button-outline" href="https://www.instagram.com/shopwith.liluri/" target="_blank" rel="noreferrer">Follow our story <span aria-hidden="true">↗</span></a>
      </div>
    </section>

    <section class="instagram-section section-block">
      <div class="section-shell">
        <div class="section-heading instagram-heading">
          <div><span class="eyebrow">A peek into our little world</span><h2>A Little More <em>LiLuRi.</em></h2></div>
          <a class="text-link" href="https://www.instagram.com/shopwith.liluri/" target="_blank" rel="noreferrer">@shopwith.liluri <span aria-hidden="true">↗</span></a>
        </div>
        <div class="instagram-grid">
          ${["phone-charms-collection.jpg", "set-01.jpeg", "set-02.jpeg", "set-03.jpeg", "set-05.jpeg", "bracelet-10.jpeg"].map((filename, index) => `
            <a href="https://www.instagram.com/shopwith.liluri/" target="_blank" rel="noreferrer" aria-label="See more LiLuRi on Instagram">
              <img src="/public/images/${filename}" alt="LiLuRi accessory photo ${index + 1}" loading="lazy" />
              <span aria-hidden="true">↗</span>
            </a>
          `).join("")}
        </div>
        <a class="button button-dark instagram-follow" href="https://www.instagram.com/shopwith.liluri/" target="_blank" rel="noreferrer">Come say hello on Instagram <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  `;
}

function renderShop(category = "All Products") {
  state.category = categories.includes(category) ? category : "All Products";
  app.innerHTML = `
    <section class="page-intro">
      <div class="section-shell">
        <span class="eyebrow">A lovely little browse</span>
        <h1>Find your <em>favourite.</em></h1>
        <p>Little details to make an ordinary day feel a little more you.</p>
        <span class="page-breadcrumb"><a href="#home">Home</a><span>/</span> Shop</span>
      </div>
    </section>
    <section class="section-shell shop-section">
      <div class="shop-toolbar">
        <div class="category-filters" role="group" aria-label="Filter products by category">
          ${categories.map((name) => `<button class="filter-chip ${state.category === name ? "is-selected" : ""}" type="button" data-category="${escapeHtml(name)}" aria-pressed="${state.category === name}">${escapeHtml(name)}</button>`).join("")}
        </div>
        <div class="shop-controls">
          <label class="search-control"><span class="sr-only">Search products</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg><input id="product-search" type="search" placeholder="Search the little things" /></label>
        </div>
      </div>
      <div class="shop-result-line"><span id="results-count"></span><span>Little finds, thoughtfully collected.</span></div>
      <div class="product-grid" id="shop-product-grid"></div>
    </section>
  `;
  renderShopGrid();

  document.querySelector("#product-search").addEventListener("input", renderShopGrid);
}

function renderShopGrid() {
  const grid = document.querySelector("#shop-product-grid");
  if (!grid) return;
  const query = document.querySelector("#product-search").value.trim().toLowerCase();
  if (state.category === "Phone Charms") {
    const pins = phoneCharmInspirationPins.filter((pin) => `${pin.title} ${pin.tags}`.toLowerCase().includes(query));
    document.querySelector("#results-count").textContent = `${pins.length} Pinterest ${pins.length === 1 ? "idea" : "ideas"}`;
    grid.className = "phone-charm-inspiration";
    grid.innerHTML = `
      <div class="phone-charm-inspiration-heading">
        <span class="eyebrow">Pinterest moodboard</span>
        <h2>Phone Charm Collections</h2>
        <p>These Pins are shared for inspiration only. They belong to their creators and are not LiLuRi products.</p>
      </div>
      ${pins.length
        ? `<div class="pinterest-inspiration-grid">
            ${pins.map((pin) => `
              <article class="pinterest-inspiration-card">
                <div class="pinterest-pin-embed">
                  <a
                    class="pinterest-pin-widget"
                    href="https://www.pinterest.com/pin/${encodeURIComponent(pin.id)}/"
                    data-pin-do="embedPin"
                    aria-label="Pinterest inspiration: ${escapeHtml(pin.title)}"
                  ><span>Open this Pinterest Pin</span></a>
                </div>
                <div class="pinterest-inspiration-caption">
                  <h3>${escapeHtml(pin.title)}</h3>
                  <a href="https://www.pinterest.com/pin/${encodeURIComponent(pin.id)}/" target="_blank" rel="noopener noreferrer">View original Pin <span aria-hidden="true">↗</span></a>
                </div>
              </article>
            `).join("")}
          </div>`
        : `<p class="pinterest-inspiration-empty">No inspiration Pins match that search. Try another charm or colour.</p>`}
    `;
    buildPinterestWidgets();
    return;
  }
  grid.className = "product-grid";
  let visible = products.filter((product) => {
    const categoryMatches = state.category === "All Products" || product.category === state.category;
    const queryMatches = `${product.name} ${product.category} ${product.imageDescription}`.toLowerCase().includes(query);
    return categoryMatches && queryMatches;
  });
  document.querySelector("#results-count").textContent = `${visible.length} ${visible.length === 1 ? "piece" : "pieces"}`;
  grid.innerHTML = visible.length
    ? visible.map(productCard).join("")
    : `<div class="empty-state"><span class="eyebrow">Something lovely, soon</span><h2>This little collection is on its way.</h2><p>We haven't added pieces here yet. Take a peek at the bracelets in the meantime.</p><a class="button button-outline" href="#shop?category=Beaded%20Bracelets">Explore beaded bracelets</a></div>`;
}

function renderProduct(productId) {
  const product = productById(decodeURIComponent(productId));
  if (!product) {
    app.innerHTML = `<section class="empty-state page-empty"><span class="eyebrow">A little detour</span><h1>We couldn't find that piece.</h1><a class="button button-dark" href="#shop">Back to the shop</a></section>`;
    return;
  }
  const variations = product.variations || [];
  const wished = state.wishlist.includes(product.id);
  app.innerHTML = `
    <section class="section-shell product-detail-section">
      <div class="page-breadcrumb"><a href="#home">Home</a><span>/</span><a href="#shop">Shop</a><span>/</span>${escapeHtml(product.category)}</div>
      <div class="product-detail">
        <div class="detail-image-wrap"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageDescription)}" /></div>
        <div class="detail-copy">
          <span class="eyebrow">${escapeHtml(product.category)}</span>
          <h1>${escapeHtml(product.name || "Product name coming soon")}</h1>
          <p class="detail-description">${escapeHtml(product.description)}</p>
          <p class="catalog-note">This listing is a placeholder until the product name and description are confirmed.</p>
          ${variations.length ? `<label class="variation-label" for="product-variation">Choose a variation</label><select class="variation-select" id="product-variation">${variations.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}</select>` : ""}
          <form class="detail-buy-form" data-product-form="${escapeHtml(product.id)}">
            <label class="quantity-label" for="detail-quantity">Quantity</label>
            <div class="quantity-control"><button type="button" data-action="detail-quantity" data-change="-1" aria-label="Decrease quantity">−</button><input id="detail-quantity" name="quantity" type="number" value="1" min="1" max="99" inputmode="numeric" /><button type="button" data-action="detail-quantity" data-change="1" aria-label="Increase quantity">+</button></div>
            <button class="button button-dark detail-add" type="submit">Add to bag <span aria-hidden="true">→</span></button>
          </form>
          <button class="button button-outline detail-whatsapp" type="button" data-action="order-product" data-id="${escapeHtml(product.id)}">Order on WhatsApp <span aria-hidden="true">↗</span></button>
          <button class="detail-wishlist ${wished ? "is-active" : ""}" type="button" data-action="wishlist" data-id="${escapeHtml(product.id)}" aria-pressed="${wished}">${iconHeart()} ${wished ? "Saved to wishlist" : "Add to wishlist"}</button>
          <div class="detail-note"><span>♡</span><p>A little piece to make your day feel a little more lovely.</p></div>
        </div>
      </div>
    </section>
  `;
}

function lineItems() {
  return Object.entries(state.cart)
    .map(([id, entry]) => ({ key: id, product: productById(entry.productId || id), ...entry }))
    .filter((entry) => entry.product);
}

function renderCart() {
  const items = lineItems();
  app.innerHTML = `
    <section class="page-intro page-intro-short">
      <div class="section-shell">
        <span class="eyebrow">Your little selection</span><h1>The shopping <em>bag.</em></h1>
        <span class="page-breadcrumb"><a href="#home">Home</a><span>/</span> Your bag</span>
      </div>
    </section>
    <section class="section-shell cart-section">
      ${items.length ? `
        <div class="cart-layout">
          <div class="cart-items">
            <div class="cart-table-heading"><span>Your pieces (${items.reduce((sum, item) => sum + item.quantity, 0)})</span><span>Quantity</span></div>
            ${items.map(({ key, product, quantity, variation }) => `
              <article class="cart-item">
                <a class="cart-item-image" href="#product/${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageDescription)}" /></a>
                <div class="cart-item-info">
                  <span class="eyebrow">${escapeHtml(product.category)}</span>
                  <a href="#product/${encodeURIComponent(product.id)}">${escapeHtml(product.name || "Product name coming soon")}</a>
                  ${variation ? `<span class="cart-variation">${escapeHtml(variation)}</span>` : ""}
                  <button class="remove-link" type="button" data-action="remove" data-id="${escapeHtml(key)}">Remove</button>
                </div>
                <div class="quantity-control cart-quantity"><button type="button" data-action="cart-quantity" data-id="${escapeHtml(key)}" data-change="-1" aria-label="Decrease quantity">−</button><span>${quantity}</span><button type="button" data-action="cart-quantity" data-id="${escapeHtml(key)}" data-change="1" aria-label="Increase quantity">+</button></div>
              </article>
            `).join("")}
          </div>
          <aside class="order-summary">
            <span class="eyebrow">A little order overview</span><h2>Order summary</h2>
            <p>We'll confirm your selected designs and the next steps with you.</p>
            <button class="button button-dark checkout-button" type="button" data-action="checkout">Order on WhatsApp <span aria-hidden="true">↗</span></button>
            <span class="summary-footnote">No payment is taken on this website.</span>
            <a class="continue-link" href="#shop">Continue browsing <span aria-hidden="true">→</span></a>
          </aside>
        </div>
      ` : `<div class="empty-state"><span class="eyebrow">Your bag is waiting</span><h2>A little room for something lovely.</h2><p>Nothing in your bag just yet. Explore the collection and find a favourite.</p><a class="button button-dark" href="#shop">Explore the shop <span aria-hidden="true">→</span></a></div>`}
    </section>
  `;
}

function renderWishlist() {
  const saved = state.wishlist.map(productById).filter(Boolean);
  app.innerHTML = `
    <section class="page-intro page-intro-short"><div class="section-shell"><span class="eyebrow">Saved with love</span><h1>Your <em>wishlist.</em></h1><span class="page-breadcrumb"><a href="#home">Home</a><span>/</span> Wishlist</span></div></section>
    <section class="section-shell wishlist-section">
      ${saved.length ? `<div class="product-grid">${saved.map(productCard).join("")}</div>` : `<div class="empty-state"><span class="eyebrow">A little place for favourites</span><h2>Save the pieces you love.</h2><p>Your wishlist is ready for all the little things you adore.</p><a class="button button-dark" href="#shop">Find a favourite <span aria-hidden="true">→</span></a></div>`}
    </section>
  `;
}

function renderAbout() {
  app.innerHTML = `
    <section class="page-intro">
      <div class="section-shell"><span class="eyebrow">A little about us</span><h1>Made for the little <em>moments.</em></h1><p>A small accessories boutique with a big love for the details.</p><span class="page-breadcrumb"><a href="#home">Home</a><span>/</span> Our story</span></div>
    </section>
    <section class="section-shell about-story">
      <div class="about-image"><img src="/public/images/set-05.jpeg" alt="LiLuRi butterfly jewellery pieces" loading="lazy" /><span class="image-note">a little love in every detail</span></div>
      <div class="about-copy"><span class="eyebrow">Hello, lovely</span><h2>A little something<br /><em>that feels like you.</em></h2><p>LiLuRi is a little corner for everyday accessories that make you smile. We believe the smallest details can carry the biggest joy — a favourite colour, a charm that feels like yours, a thoughtful finishing touch.</p><p>Our collection is growing, with beaded bracelets and charming little finds at its heart. We can't wait to share more pieces, personal touches and lovely surprises with you.</p><p>Thank you for being here and supporting our small business. We're so happy to have you along for the story.</p><a class="button button-dark" href="#shop">Explore LiLuRi <span aria-hidden="true">→</span></a></div>
    </section>
    <section class="about-signoff"><span>With a little love,</span><strong>LiLuRi</strong><span>Little Charms, Big Happiness.</span></section>
  `;
}

function renderRoute() {
  const { path, category } = getRoute();
  document.querySelector(".main-nav").classList.remove("is-open");
  document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
  document.querySelector(".menu-toggle").setAttribute("aria-label", "Open navigation");
  if (path === "contact" || path === "collections") {
    if (path === "collections" && !document.querySelector("#collections")) renderHome();
    updateHeader();
    window.setTimeout(() => document.getElementById(path)?.scrollIntoView({ behavior: "smooth" }), 0);
    return;
  }
  if (path === "shop") renderShop(category || "All Products");
  else if (path.startsWith("product/")) renderProduct(path.slice("product/".length));
  else if (path === "cart") renderCart();
  else if (path === "wishlist") renderWishlist();
  else if (path === "about") renderAbout();
  else renderHome();
  updateHeader();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function addToCart(id, quantity = 1, variation = "") {
  const product = productById(id);
  if (!product) {
    showToast("This piece is not available.");
    return;
  }
  const key = variation ? `${id}::${variation}` : id;
  const existing = state.cart[key];
  if (existing) existing.quantity = Math.min(99, existing.quantity + quantity);
  else state.cart[key] = { productId: id, quantity, variation };
  saveStorage(cartKey, state.cart);
  updateHeader();
  showToast("Added to your little bag.");
}

function toggleWishlist(id) {
  if (state.wishlist.includes(id)) {
    state.wishlist = state.wishlist.filter((savedId) => savedId !== id);
    showToast("Removed from your wishlist.");
  } else {
    state.wishlist = [...state.wishlist, id];
    showToast("Saved to your wishlist.");
  }
  saveStorage(wishlistKey, state.wishlist);
  if (getRoute().path === "wishlist") renderWishlist();
  else if (getRoute().path === "shop") renderShopGrid();
  else if (getRoute().path.startsWith("product/")) renderProduct(getRoute().path.slice("product/".length));
  else if (getRoute().path === "home") renderHome();
  updateHeader();
}

function updateCartQuantity(id, amount) {
  const item = state.cart[id];
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) delete state.cart[id];
  else item.quantity = Math.min(99, item.quantity);
  saveStorage(cartKey, state.cart);
  renderCart();
  updateHeader();
}

function orderOnWhatsApp(items) {
  if (!items.length) {
    showToast("Add a little something to your bag first.");
    return;
  }
  if (items.some(({ product }) => !product?.name?.trim())) {
    showToast("Add product names in src/products.js before enabling customer orders.");
    return;
  }
  const number = STORE_CONFIG.whatsappBusinessNumber.replace(/\D/g, "");
  if (!number) {
    showToast("Add your WhatsApp business number in src/config.js to enable orders.");
    return;
  }
  const url = `https://wa.me/${number}?text=${encodeURIComponent(createOrderMessage(items))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action], [data-category]");
  if (!target) return;
  if (target.matches("[data-category]")) {
    const category = target.dataset.category;
    if (getRoute().path === "shop" && !target.matches("a")) {
      state.category = category;
      document.querySelectorAll(".filter-chip").forEach((chip) => {
        const selected = chip.dataset.category === category;
        chip.classList.toggle("is-selected", selected);
        chip.setAttribute("aria-pressed", selected);
      });
      renderShopGrid();
      return;
    }
    if (target.matches("a")) {
      event.preventDefault();
      window.location.hash = `shop?category=${encodeURIComponent(category)}`;
      return;
    }
  }
  const { action, id, change } = target.dataset;
  if (action === "wishlist") toggleWishlist(id);
  else if (action === "add") addToCart(id);
  else if (action === "remove") {
    delete state.cart[id];
    saveStorage(cartKey, state.cart);
    renderCart();
    updateHeader();
    showToast("Removed from your bag.");
  } else if (action === "cart-quantity") updateCartQuantity(id, Number(change));
  else if (action === "detail-quantity") {
    const input = document.querySelector("#detail-quantity");
    input.value = Math.max(1, Math.min(99, Number(input.value || 1) + Number(change)));
  } else if (action === "checkout") orderOnWhatsApp(lineItems());
  else if (action === "order-product") {
    const product = productById(id);
    const variation = document.querySelector("#product-variation")?.value || "";
    const quantity = Math.max(1, Number(document.querySelector("#detail-quantity")?.value || 1));
    orderOnWhatsApp([{ product, quantity, variation }]);
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-product-form]");
  if (!form) return;
  event.preventDefault();
  const quantity = Math.max(1, Math.min(99, Number(form.elements.quantity.value) || 1));
  const variation = document.querySelector("#product-variation")?.value || "";
  addToCart(form.dataset.productForm, quantity, variation);
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const menu = document.querySelector(".main-nav");
  const isOpen = menu.classList.toggle("is-open");
  event.currentTarget.setAttribute("aria-expanded", isOpen);
  event.currentTarget.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

window.addEventListener("hashchange", renderRoute);
renderRoute();
