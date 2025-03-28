document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const initialQuantity = urlParams.get('quantity') || 1;

    if (!productId) {
        alert("ID продукту не знайдено в URL.");
        return;
    }

    const productPhoto = document.getElementById("product-photo");
    const productName = document.getElementById("product-name");
    const productPrice = document.getElementById("product-price");
    const productQuantity = document.getElementById("product-quantity");
    const totalAmount = document.getElementById("total-amount");

    productQuantity.value = Math.max(initialQuantity, 1);

    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        if (!response.ok) {
            throw new Error("Помилка завантаження продукту");
        }
        const product = await response.json();
        productPhoto.src = product.photo_url;
        productName.textContent = product.name;
        productPrice.textContent = `${product.price} ₴`;
        totalAmount.textContent = `Загальна сума: ${product.price * productQuantity.value} ₴`;

        productQuantity.addEventListener("input", () => {
            productQuantity.value = Math.max(productQuantity.value, 1);
            totalAmount.textContent = `Загальна сума: ${product.price * productQuantity.value} ₴`;
        });

    } catch (error) {
        console.error("Помилка завантаження продукту:", error);
        alert("Не вдалося завантажити продукт. Спробуйте ще раз пізніше.");
    }

    document.getElementById("order-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        const orderData = {
            product_id: productId,
            product_name: productName.textContent,
            quantity: productQuantity.value,
            total_amount: productPrice.textContent.split(' ')[0] * productQuantity.value,
            user_firstname: document.getElementById("user-firstname").value,
            user_lastname: document.getElementById("user-lastname").value,
            user_email: document.getElementById("user-email").value,
            user_phone: document.getElementById("user-phone").value,
            user_city: document.getElementById("user-city").value
        };

        try {
            const response = await fetch("http://localhost:3000/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            if (response.ok) {
                alert("Замовлення успішно оформлене!");
                window.location.href = "index.html";
            } else {
                throw new Error(data.error || "Не вдалося оформити замовлення.");
            }
        } catch (error) {
            console.error("Помилка оформлення замовлення:", error);
            alert(error.message);
        }
    });
});