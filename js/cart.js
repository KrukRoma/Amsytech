document.addEventListener("DOMContentLoaded", async () => {
    const cartContainer = document.getElementById("cart-container");

    const user = JSON.parse(localStorage.getItem("amsytech_auth_user"));
    if (!user) {
        cartContainer.innerHTML = "<p>Будь ласка, увійдіть, щоб переглянути кошик.</p>";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/cart/${user.id}`);
        if (!response.ok) throw new Error("Помилка завантаження кошика");

        const cartItems = await response.json();
        if (cartItems.length === 0) {
            cartContainer.innerHTML = "<p>Ваш кошик порожній.</p>";
            return;
        }

        let totalPrice = 0;
        cartContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Фото</th>
                        <th>Назва</th>
                        <th>Ціна</th>
                        <th>Кількість</th>
                        <th>Видалити</th>
                    </tr>
                </thead>
                <tbody id="cart-table-body"></tbody>
            </table>
            <p id="total-price"></p>
        `;

        const cartTableBody = document.getElementById("cart-table-body");

        cartItems.forEach(item => {
            totalPrice += item.price * item.quantity;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><img src="${item.photo_url}" alt="${item.name}" width="50"></td>
                <td>${item.name}</td>
                <td>${item.price} ₴</td>
                <td>
                    <button class="decrease" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase" data-id="${item.id}">+</button>
                </td>
                <td><button class="remove" data-id="${item.id}">❌</button></td>
            `;
            cartTableBody.appendChild(row);
        });

        document.getElementById("total-price").textContent = `Загальна сума: ${totalPrice} ₴`;

        // Зміна кількості
        document.querySelectorAll(".increase").forEach(button => {
            button.addEventListener("click", async (e) => {
                await updateQuantity(e.target.dataset.id, "increase");
            });
        });

        document.querySelectorAll(".decrease").forEach(button => {
            button.addEventListener("click", async (e) => {
                await updateQuantity(e.target.dataset.id, "decrease");
            });
        });

        // Видалення товару
        document.querySelectorAll(".remove").forEach(button => {
            button.addEventListener("click", async (e) => {
                await removeFromCart(e.target.dataset.id);
            });
        });

    } catch (error) {
        console.error("Помилка завантаження кошика:", error);
        cartContainer.innerHTML = "<p>Не вдалося завантажити кошик.</p>";
    }
});

// Оновлення кількості
async function updateQuantity(productId, action) {
    try {
        const response = await fetch(`http://localhost:3000/api/cart/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: productId, action })
        });

        if (!response.ok) throw new Error("Не вдалося оновити кількість");

        // Оновлюємо таблицю без перезавантаження сторінки
        const cartContainer = document.getElementById("cart-container");
        cartContainer.innerHTML = "<p>Оновлено кількість товару!</p>"; // Покажемо повідомлення
        setTimeout(() => {
            window.location.reload(); // Перезавантажуємо сторінку після деякої затримки
        }, 1000); // Відкладаємо перезавантаження на секунду
    } catch (error) {
        console.error("Помилка оновлення:", error);
    }
}

// Видалення товару
async function removeFromCart(cartId) {
    try {
        const user = JSON.parse(localStorage.getItem("amsytech_auth_user"));
        if (!user) throw new Error("Користувача не знайдено");

        // Перевірка, чи дійсно cartId не є undefined
        if (!cartId) {
            throw new Error("ID товару не знайдено");
        }

        const response = await fetch(`http://localhost:3000/api/cart/delete/${cartId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id }) // передати user_id в тілі запиту
        });

        if (response.status === 404) {
            throw new Error("Товар не знайдено");
        }

        if (!response.ok) throw new Error("Не вдалося видалити товар");

        alert("Товар видалено з кошика!");
        window.location.reload();
    } catch (error) {
        console.error("Помилка видалення:", error);
        alert(error.message);
    }
}
