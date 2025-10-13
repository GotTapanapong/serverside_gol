// เปิด-ปิด Navbar เมื่อคลิกขีดสามขีด
document.getElementById('menu-toggle').addEventListener('click', function() {
    const navbarMenu = document.querySelector('.navbar-menu');
    navbarMenu.classList.toggle('active');
});

document.addEventListener("DOMContentLoaded", () => {
    // ค้นหาปุ่ม "เพิ่มรูปภาพ" และ input file ที่เกี่ยวข้อง
    const uploadButtons = document.querySelectorAll(".btn-upload");

    uploadButtons.forEach(button => {
        const fileInput = button.nextElementSibling; // input[type=file]
        const previewImg = fileInput.nextElementSibling; // <img> preview

        // เมื่อคลิกปุ่ม ให้เปิด file picker
        button.addEventListener("click", () => {
            fileInput.click();
        });

        // เมื่อผู้ใช้เลือกไฟล์
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    previewImg.src = e.target.result;
                    previewImg.style.display = "block"; // แสดงรูป
                };

                reader.readAsDataURL(file);
            }
        });
    });
});





// ฟังก์ชันแสดง Popup
function showPopup(message) {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    
    // สร้างปุ่มกากบาท
    const closeButton = document.createElement("span");
    closeButton.classList.add("close-btn");
    closeButton.textContent = "×"; // กากบาท
    
    // เพิ่มข้อความและปุ่มกากบาทใน popup
    popup.appendChild(closeButton);
    popup.appendChild(document.createTextNode(message));

    // เพิ่ม popup ใน body
    document.body.appendChild(popup);

    // เมื่อคลิกที่ปุ่มกากบาท ให้ลบ popup
    closeButton.addEventListener('click', () => {
        popup.remove(); // ลบ popup ออก
    });
}



document.addEventListener('DOMContentLoaded', function () {
    // ดึงข้อมูลสินค้าจาก backend
    fetch('/get-products')
        .then(response => response.json())
        .then(products => {
            const tableBody = document.querySelector('#product-table tbody');
            tableBody.innerHTML = '';  // เคลียร์ตารางก่อน

            products.forEach(product => {
                const row = document.createElement('tr');
                const imageUrl = product.image_product ? `data:image/jpeg;base64,${Buffer.from(product.image_product).toString('base64')}` : ''; // แสดงรูปภาพจากฐานข้อมูล
                row.innerHTML = `
                <td class="editable" data-column="product_id" contenteditable="true">${product.product_id}</td>
                <td class="editable" data-column="product_name" contenteditable="true">${product.product_name}</td>
                <td class="editable" data-column="price" contenteditable="true">${product.price}</td>
                <td class="editable" data-column="description" contenteditable="true">${product.description}</td>
                <td class="editable" data-column="stock" contenteditable="true">${product.stock}</td>
                    <td>
                        <img src="${imageUrl}" alt="Product Image" />
                        <input type="file" class="upload-input" data-id="${product.product_id}" />
                    </td>
                    <td><button class="delete-btn" data-id="${product.product_id}">ลบ</button></td>
                `;
                tableBody.appendChild(row);

                // ฟังก์ชันอัปโหลดรูปภาพ
                const uploadInput = row.querySelector('.upload-input');
                uploadInput.addEventListener('change', function (e) {
                    const productId = e.target.getAttribute('data-id');
                    const formData = new FormData();
                    formData.append('image_product', e.target.files[0]);
                    formData.append('product_id', productId);

                    // ส่งข้อมูลไปยัง backend สำหรับอัปโหลด
                    fetch('/upload-image', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        showPopup('อัปโหลดรูปภาพสำเร็จ');
                        // รีเฟรชข้อมูลสินค้าเพื่อแสดงรูปภาพใหม่
                        location.reload();
                    })
                    .catch(error => console.error('Error uploading image:', error));
                });

                // ฟังก์ชันลบสินค้า
                const deleteButton = row.querySelector('.delete-btn');
                deleteButton.addEventListener('click', function () {
                    const productId = this.getAttribute('data-id');

                    deleteProduct(productId, row);
                });
            });
        })
        .catch(error => console.error('Error fetching products:', error));
});

// ฟังก์ชันลบสินค้า
function deleteProduct(productId, row) {
    fetch(`/delete-product/${productId}`, {
        method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => {
        
        row.remove();  // ลบแถวจากตาราง
    })
    .catch(error => console.error('Error deleting product:', error));
}







document.addEventListener('DOMContentLoaded', function () {
    // ดึงข้อมูลสินค้าจาก backend
    fetch('/get-products')
        .then(response => response.json())
        .then(products => {
            const tableBody = document.querySelector('#product-table tbody');
            tableBody.innerHTML = ''; // เคลียร์ตารางก่อน

            products.forEach(product => {
                // แปลง base64 ของรูปภาพ
                const imageUrl = product.image_product ? `data:image/jpeg;base64,${product.image_product}` : ''; // แสดงรูปภาพจากฐานข้อมูล
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="editable" data-column="product_id" contenteditable="true">${product.product_id}</td>
                    <td class="editable" data-column="product_name" contenteditable="true">${product.product_name}</td>
                    <td class="editable" data-column="price" contenteditable="true">${product.price}</td>
                    <td class="editable" data-column="description" contenteditable="true">${product.description}</td>
                    <td class="editable" data-column="stock" contenteditable="true">${product.stock}</td>
                    <td>
                        <img src="${imageUrl}" alt="Product Images" width="100" height="100" class="product-image" data-id="${product.product_id}">
                        <input type="file" class="upload-input" data-id="${product.product_id}" style="display:none" enctype="multipart/form-data" />
                    </td>
                    <td><button class="delete-btn" data-id="${product.product_id}">ลบ</button></td>
                `;
                tableBody.appendChild(row);
            });

            // ฟังก์ชันแก้ไขข้อมูล
            document.querySelectorAll('.editable').forEach(cell => {
                cell.addEventListener('blur', function () {
                    const productId = this.closest('tr').querySelector('.delete-btn').getAttribute('data-id');
                    const column = this.getAttribute('data-column');
                    const newValue = this.textContent;
                    updateProduct(productId, column, newValue);
                });
            });

            // ฟังก์ชันลบข้อมูล
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function () {
                    const productId = this.getAttribute('data-id');
                    const row = this.closest('tr');  // แก้ไขให้ลบแถวที่คลิก
                    deleteProduct(productId, row);
                });
            });

            // ฟังก์ชันอัปโหลดรูปภาพ
            document.querySelectorAll('.product-image').forEach(img => {
                img.addEventListener('click', function () {
                    const productId = this.getAttribute('data-id');
                    const input = this.closest('tr').querySelector('.upload-input');
                    input.style.display = 'block';
                });
            });

            // ฟังก์ชันอัปโหลดรูปภาพใหม่
            document.querySelectorAll('.upload-input').forEach(input => {
                input.addEventListener('change', function (e) {
                    const productId = e.target.getAttribute('data-id');
                    const formData = new FormData();
                    formData.append('image_product', e.target.files[0]);
                    formData.append('product_id', productId);
                    
                    // ส่งข้อมูลไปยัง backend สำหรับอัปโหลดรูปภาพ
                    fetch('/upload-image', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        alert('อัปโหลดรูปภาพสำเร็จ');
                        // รีเฟรชข้อมูลสินค้าเพื่อแสดงรูปภาพใหม่
                        location.reload();
                    })
                    
                    .catch(error => console.error('Error uploading image:', error));
                });
            });
        })
        
        .catch(error => console.error('Error fetching products:', error));
});

// ฟังก์ชันอัปเดตข้อมูลสินค้า
function updateProduct(productId, column, newValue) {
    const data = { productId, column, newValue };

    fetch('/update-product', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error updating product:', error));
}

// ฟังก์ชันลบสินค้า
function deleteProduct(productId, row) {
    fetch(`/delete-product/${productId}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            alert("ลบสินค้าสำเร็จ!")
            console.log(data.message);
            row.remove(); // ลบแถวจากตารางหลังจากลบข้อมูลจากฐานข้อมูล
        })
        .catch(error => console.error('Error deleting product:', error));
}

document.getElementById('add-product-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // ตรวจสอบว่าองค์ประกอบมีอยู่ใน DOM ก่อนเข้าถึงค่า
    const productNameElement = document.getElementById('product_name');
    const priceElement = document.getElementById('price');
    const descriptionElement = document.getElementById('description');
    const stockElement = document.getElementById('stock');
    const imageProductElement = document.getElementById('image_product');

    

    if (!productNameElement || !priceElement || !descriptionElement || !stockElement || !imageProductElement) {
        console.error("บางองค์ประกอบไม่ถูกต้องใน DOM");
        return;
    }


    // รับค่าจากฟอร์ม
    const productName = productNameElement.value;
    const price = priceElement.value;
    const description = descriptionElement.value;
    const stock = stockElement.value;
    const imageProduct = imageProductElement.files[0];

    // ตรวจสอบข้อมูลก่อนส่ง
    if (!productName || !price || !description || !stock) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วนก่อนอัปโหลดรูปภาพ!");
        return;
    }

    if (!imageProduct) {
        alert("กรุณาอัปโหลดรูปภาพหลังจากกรอกข้อมูลทั้งหมด!");
        return;
    }

    // ส่งข้อมูลไปยังเซิร์ฟเวอร์
    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('stock', stock);
    formData.append('image_product', imageProduct);

    // ส่งข้อมูลไปยังเซิร์ฟเวอร์
    fetch('/add-product', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        
        if (data.success) {
            alert("เพิ่มสินค้าสำเร็จ!");
            location.reload(); // รีโหลดหน้าตารางสินค้า
        } else {
            alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า!");
        }
    })
    .catch(error => {
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อ!");
    });
});

