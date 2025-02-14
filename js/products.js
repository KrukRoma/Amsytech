document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("product-list");

    try {
        const response = await fetch("http://localhost:3000/api/products");
        const products = await response.json();

        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("grid-item");

            productCard.innerHTML = `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.photo_url}" alt="${product.name}" loading="lazy">
                    </div>

                    <div class="product-info">
                        <h1 class="product-title">${product.name}</h1>
                        <p class="product-description">${product.subtitle}</p>

                        <div class="manufacturer">
                            <p class="manufacturer-label">Виробник:</p>
                            <p>${product.manufacturer}</p>
                        </div>

                        <div class="stock-status">
                            <svg class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>знаходиться на складі</span>
                            ${product.documentation_url ? `
                            <a href="${product.documentation_url}" download="Documentation.pdf" class="pdf-link">
                                <img class="pdf-icon" src="images/icons8-pdf-48.png" alt="PDF" />
                            </a>` : ""}
                        </div>
                    </div>

                    <div class="product-purchase">
                        <div class="price-container">
                            <div class="price">${product.price} ₴</div>
                            <div class="price-note">від: 1 шт.</div>
                        </div>

                        <div class="quantity-selector">
                            <button class="quantity-button decrease">-</button>
                            <input type="number" value="1" min="1" class="quantity-input">
                            <button class="quantity-button increase">+</button>
                        </div>

                        <button class="buy-button">КУПИТИ</button>
                    </div>
                </div>
            `;

            productList.appendChild(productCard);
        });

        // Обробник збільшення та зменшення кількості
        document.querySelectorAll(".quantity-button").forEach(button => {
            button.addEventListener("click", (e) => {
                const input = e.target.closest(".quantity-selector").querySelector(".quantity-input");
                let value = parseInt(input.value);
                
                if (e.target.classList.contains("increase")) {
                    input.value = value + 1;
                } else if (e.target.classList.contains("decrease") && value > 1) {
                    input.value = value - 1;
                }
            });
        });

    } catch (error) {
        console.error("Помилка завантаження продуктів:", error);
    }
});
