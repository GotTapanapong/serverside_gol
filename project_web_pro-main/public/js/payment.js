document.addEventListener("DOMContentLoaded", async function () {
    // ✅ เปิด-ปิด Navbar
    document.getElementById("menu-toggle").addEventListener("click", function () {
        document.querySelector(".navbar-menu").classList.toggle("active");
    });

    // ✅ 1️⃣ ดึง `order_id` จาก API แทน localStorage
    let orderId = null;
    let userId = localStorage.getItem("user_id") || null;

    try {
        const orderResponse = await fetch("/get-latest-order");
        const orderData = await orderResponse.json();

        if (orderResponse.ok && orderData.success) {
            orderId = orderData.order_id;
            localStorage.setItem("order_id", orderId);
        }
    } catch (error) {
        console.error("Error fetching latest order_id:", error);
    }

    console.log(`🔹 Current order_id: ${orderId}, User ID: ${userId}`);

    // ✅ 2️⃣ อัปเดตที่อยู่ที่เลือกไว้
    const addressInput = document.getElementById("addressInput");
    const selectedAddress = document.getElementById("selectedAddress");

    if (localStorage.getItem("selectedAddress")) {
        selectedAddress.innerText = localStorage.getItem("selectedAddress");
    }

    addressInput.addEventListener("click", function () {
        window.location.href = "/select_address"; // ไปยังหน้าเลือกที่อยู่
    });

    // ✅ 3️⃣ อัปโหลดและแสดงตัวอย่างรูปใบเสร็จ
    const imageUpload = document.getElementById("imageUpload");
    const imagePreview = document.getElementById("imagePreview");
    const submitButton = document.getElementById("submitButton");

    imageUpload.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Receipt Preview" style="max-width: 300px; border-radius: 8px;">`;
                imagePreview.style.display = "block";
                submitButton.disabled = false; // ปลดล็อกปุ่มดำเนินการต่อ
            };
            reader.readAsDataURL(file);
        }
    });

    // ✅ 4️⃣ อัปโหลดใบเสร็จ
    document.getElementById("uploadForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const file = imageUpload.files[0];
        if (!file) {
            alert("กรุณาเลือกไฟล์ก่อน");
            return;
        }

        // ✅ สร้าง FormData และแนบข้อมูล
        const formData = new FormData();
        formData.append("receipt", file);
        formData.append("user_id", "1");
        formData.append("order_id", orderId);
        formData.append("payment_method", "e-wallet");

        try {
            const response = await fetch("/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            console.log("Response data:", data);

            if (response.ok) {
                alert("✅ อัปโหลดใบเสร็จสำเร็จ! กำลังนำทางไปยังใบเสร็จ...");
                if (data.payment_id) {
                    window.location.href = "/num_point";
                } else {
                    alert("❌ ไม่พบ payment_id กรุณาลองใหม่");
                }
            } else {
                alert("❌ เกิดข้อผิดพลาด: " + data.message);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
        }
    });
});
