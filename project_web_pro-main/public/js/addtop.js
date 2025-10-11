// เปิด-ปิด Navbar เมื่อคลิกขีดสามขีด
document.getElementById('menu-toggle').addEventListener('click', function() {
    const navbarMenu = document.querySelector('.navbar-menu');
    navbarMenu.classList.toggle('active');
});

document.getElementById('add-topping-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const topping_name = document.getElementById('topping_name').value;
    const price = document.getElementById('price').value;
    const stock = document.getElementById('stock').value;

    // ส่งข้อมูลไปยังเซิร์ฟเวอร์เพื่อบันทึกในฐานข้อมูล
    fetch('/add-topping', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topping_name: topping_name,
            price: price,
            stock: stock
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('เพิ่ม Topping สำเร็จ!');
            
            location.reload(); // รีโหลดหน้าตารางสินค้า
        } else {
            alert('เกิดข้อผิดพลาดในการเพิ่ม Topping');
        }
    })
    .catch(error => {
        console.error('เกิดข้อผิดพลาด:', error);
    });
});

// ฟังก์ชันโหลดข้อมูล Topping
function loadToppings() {
    fetch('/get-toppings')
    .then(response => response.json())
    .then(data => {
        const tableBody = document.querySelector('#topping-table tbody');
        tableBody.innerHTML = ''; // ลบข้อมูลเก่าออก

        data.toppings.forEach(topping => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${topping.topping_id}</td>
                <td>${topping.topping_name}</td>
                <td>${topping.price}</td>
                <td>${topping.stock}</td>
                <td><button class="delete-btn" onclick="deleteTopping(${topping.topping_id})">ลบ</button></td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('ไม่สามารถโหลดข้อมูล Topping ได้:', error);
    });
}

// ฟังก์ชันลบ Topping
function deleteTopping(toppingId) {
    
        fetch(`/delete-topping/${toppingId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('ลบ Topping สำเร็จ');
                loadToppings(); // โหลดข้อมูลใหม่
            } else {
                alert('เกิดข้อผิดพลาดในการลบ Topping');
            }
        })
        .catch(error => {
            console.error('เกิดข้อผิดพลาด:', error);
        });
    
}

// โหลดข้อมูล Topping เมื่อโหลดหน้า
loadToppings();
