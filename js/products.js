document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("product-list");

    try {
        const response = await fetch("http://localhost:3000/api/products");
        if (!response.ok) {
            throw new Error("Помилка завантаження продуктів");
        }
        const products = await response.json();

        // Отримання користувача з localStorage
        const user = JSON.parse(localStorage.getItem("amsytech_auth_user"));

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

                        <div class="actions">
                            <button class="buy-button" data-id="${product.id}">КУПИТИ</button>
                            <button class="add-to-cart" data-id="${product.id}">
                                <img src="images/5425129490188725192.jpg" alt="Додати в кошик">
                            </button>
                            ${user && user.role === 'admin' ? `
                            <button class="edit-product" data-id="${product.id}">Редагувати</button>
                            <button class="delete-product" data-id="${product.id}">Видалити</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            productList.appendChild(productCard);
        });

        // Додавання товару в кошик
        document.addEventListener("click", async (event) => {
            const button = event.target.closest(".add-to-cart");
            if (!button) return;

            const productId = button.dataset.id;
            const quantityInput = button.closest(".product-purchase").querySelector(".quantity-input");
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

            if (!user) {
                alert("Ви не авторизовані. Будь ласка, увійдіть у свій акаунт.");
                return;
            }

            const requestData = {
                user_id: user.id,
                product_id: productId,
                quantity: quantity
            };

            try {
                const response = await fetch("http://localhost:3000/api/cart/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(requestData)
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                } else {
                    throw new Error(data.error || "Не вдалося додати товар у кошик.");
                }
            } catch (error) {
                console.error("Помилка додавання:", error);
                alert(error.message);
            }
        });

        // Обробка кнопок +/- для зміни кількості товару
        document.addEventListener("click", (event) => {
            const button = event.target.closest(".quantity-button");
            if (!button) return;

            const input = button.closest(".quantity-selector").querySelector(".quantity-input");
            let value = parseInt(input.value);

            if (button.classList.contains("increase")) {
                input.value = value + 1;
            } else if (button.classList.contains("decrease") && value > 1) {
                input.value = value - 1;
            }
        });

        // Обробка редагування продукту
        document.addEventListener("click", (event) => {
            const button = event.target.closest(".edit-product");
            if (!button) return;

            const productId = button.dataset.id;
            window.location.href = `editProduct.html?id=${productId}`;
        });

        // Обробка видалення продукту
        document.addEventListener("click", async (event) => {
            const button = event.target.closest(".delete-product");
            if (!button) return;

            const productId = button.dataset.id;

            try {
                const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                    method: "DELETE"
                });

                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                    button.closest(".product-card").remove();
                } else {
                    throw new Error(data.error || "Не вдалося видалити продукт.");
                }
            } catch (error) {
                console.error("Помилка видалення продукту:", error);
                alert(error.message);
            }
        });

        // Обробка переходу на order.html при натисканні кнопки "Купити"
        document.addEventListener("click", (event) => {
            const button = event.target.closest(".buy-button");
            if (!button) return;

            const productId = button.dataset.id;
            const quantityInput = button.closest(".product-purchase").querySelector(".quantity-input");
            const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
            window.location.href = `order.html?id=${productId}&quantity=${quantity}`;
        });

    } catch (error) {
        console.error("Помилка завантаження продуктів:", error);
        alert("Не вдалося завантажити продукти. Спробуйте ще раз пізніше.");
    }
});