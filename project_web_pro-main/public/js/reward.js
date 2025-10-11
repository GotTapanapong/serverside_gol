// เปิด-ปิด Navbar เมื่อคลิกขีดสามขีด
document.getElementById('menu-toggle').addEventListener('click', function() {
    const navbarMenu = document.querySelector('.navbar-menu');
    navbarMenu.classList.toggle('active');
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

// ตรวจสอบการเลือก Radio Button และกำหนดค่าเริ่มต้น
document.addEventListener('DOMContentLoaded', function () {
   
    // const discountBillRadio = document.getElementById('discount-bill');
    // const discountAmountContainer = document.getElementById('discount-amount-container');
    const discountInput = document.getElementById('discount-amount');

    discountInput.value = 10; // กำหนดค่าเริ่มต้นเป็น 10

    // เมื่อเลือก "ลดราคาต่อบิล"
    // discountBillRadio.addEventListener('change', function () {
    //     if (this.checked) {
    //         discountAmountContainer.style.display = 'block'; // แสดงช่องกรอกตัวเลข
    //     }
    // });



    // จำกัดการกรอกตัวเลขให้อยู่ระหว่าง 10-50
    discountInput.addEventListener('input', function () {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 10) {
            this.value = 10; // ถ้าต่ำกว่า 10 ให้เป็น 10
        } else if (value > 50) {
            this.value = 50; // ถ้ามากกว่า 50 ให้เป็น 50
        }
    });

    // เมื่อกดปุ่มยืนยัน ต้องเลือก Radio ก่อนถึงจะขึ้น Popup
    document.getElementById('btn-confirm').addEventListener('click', function() {
  
            alert("สำเร็จ!"); // ถ้าเลือก Radio Button อย่างใดอย่างหนึ่ง
       
    });
});



document.getElementById("btn-confirm").addEventListener("click", function() {
    const discountAmount = document.getElementById("discount-amount").value;

    // ตรวจสอบว่า discountAmount มีค่า
    if (discountAmount) {
        // ส่งข้อมูลไปที่เซิร์ฟเวอร์เพื่ออัปเดตฐานข้อมูล
        fetch('/update-reward', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                discountAmount: discountAmount
            })
        })
        .then(response => response.text())
        .then(data => {
            alert(data);  // แสดงข้อความตอบกลับจากเซิร์ฟเวอร์
        })
        .catch(error => {
            console.error('Error:', error);
        });
    } else {
        alert("กรุณากรอกจำนวนเงินที่ลด");
    }
});
