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

    await loadRegions();
    await loadPostalServices();

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
            region_id: document.getElementById("region").value,
            district_id: document.getElementById("district").value,
            post_office_id: document.getElementById("post_office").value,
            department: document.getElementById("department").value
        };

        console.log("Дані замовлення:", orderData);

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

    document.getElementById("region").addEventListener("change", async (event) => {
        const regionId = event.target.value;
        await loadDistricts(regionId); 
    });
});

async function loadRegions() {
    const response = await fetch("http://localhost:3000/api/regions");
    const regions = await response.json();
    const regionSelect = document.getElementById("region");

    regions.forEach(region => {
        const option = document.createElement("option");
        option.value = region.id;
        option.textContent = region.name;
        regionSelect.appendChild(option);
    });
}

async function loadDistricts(regionId) {
    const response = await fetch(`http://localhost:3000/api/regions/${regionId}/districts`);
    const districts = await response.json();
    const districtSelect = document.getElementById("district"); 

    districtSelect.innerHTML = ""; 
    districts.forEach(district => {
        const option = document.createElement("option");
        option.value = district.id;
        option.textContent = district.name;
        districtSelect.appendChild(option);
    });
}

async function loadPostalServices() {
    const response = await fetch("http://localhost:3000/api/postal_services");
    const postalServices = await response.json();
    const postOfficeSelect = document.getElementById("post_office");

    postalServices.forEach(service => {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = service.name;
        postOfficeSelect.appendChild(option);
    });
}