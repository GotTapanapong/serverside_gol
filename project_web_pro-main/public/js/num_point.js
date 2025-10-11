// เปิด-ปิด Navbar เมื่อคลิกขีดสามขีด
document.getElementById('menu-toggle').addEventListener('click', function() {
    const navbarMenu = document.querySelector('.navbar-menu');
    navbarMenu.classList.toggle('active');
});

// กำหนดตัวแปรเก็บหมายเลขที่กรอก
let phoneNumber = "";

// ดึงปุ่มทั้งหมดที่มี class 'num-btn' มา
const numButtons = document.querySelectorAll('.num-btn');

// ดึง div ที่จะแสดงหมายเลขที่กรอก
const displayNumber = document.getElementById('display-number');

// ฟังก์ชันที่ทำงานเมื่อคลิกปุ่มตัวเลข
numButtons.forEach(button => {
    button.addEventListener('click', () => {
        // ถ้ามีตัวเลขในหมายเลขไม่เกิน 10 ตัว
        if (phoneNumber.length < 10) {
            // ดึงค่า alt ของแต่ละปุ่ม
            const num = button.querySelector('img').alt;
            
            // เพิ่มหมายเลขที่กดลงใน phoneNumber
            phoneNumber += num;
            
            // แสดงหมายเลขที่กรอกใน display-number
            displayNumber.textContent = phoneNumber;
        }
    });
});

// ฟังก์ชันลบหมายเลข
const deleteButton = document.getElementById('btn-delete');
deleteButton.addEventListener('click', () => {
    phoneNumber = phoneNumber.slice(0, -1);  // ลบตัวสุดท้าย
    displayNumber.textContent = phoneNumber;  // แสดงหมายเลขใหม่หลังจากลบ
});

// ปิด Popup สำเร็จ
// document.getElementById('close-success-popup').addEventListener('click', () => {
//     document.getElementById('success-popup').style.display = 'none';
// });

// ฟังก์ชันเมื่อกดปุ่มตกลง
const confirmButton = document.getElementById('btn-confirm');
confirmButton.addEventListener('click', () => {
    if (phoneNumber.length === 10) {
        showPopup("สำเร็จ"); // ถ้ากรอกครบ 10 ตัว
        // ปิด popup
        
         // รอ 3 วินาทีแล้วค่อยเปลี่ยนหน้าไปที่ /point
         setTimeout(() => {
            window.location.href = "/orders";
        }, 1500);  // 2000 มิลลิวินาที = 2 วินาที
      
    } else {
        showPopup("ล้มเหลว"); // ถ้ากรอกไม่ครบ 10 ตัว
        
    }
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
    // เลือกปุ่มกากบาทด้วย id ใหม่
    const closeBtn = document.getElementById('num-close-btn');

    // เมื่อคลิกปุ่มไม่สน
    closeBtn.addEventListener('click', function () {
        // กลับไปที่หน้า addmenu
        window.location.href = '/orders';
    });
});

// ฟังก์ชันปิด Popup เมื่อคลิกที่พื้นที่ว่าง
// document.getElementById('success-popup').addEventListener('click', (event) => {
//     if (event.target === document.getElementById('success-popup')) {
        
//         window.location.href = "/point"; // เปลี่ยนเส้นทางไปที่หน้า /point
//     }
// });
// // ปิด Popup และเปลี่ยนหน้าไปที่ "/point"
// document.getElementById('close-btn').addEventListener('click', () => {
//     document.getElementById('btn-confirm').style.display = 'none';
//     window.location.href = "/point"; // เปลี่ยนเส้นทางไปที่หน้า /point
//     // window.location.href = /num_point?phoneNumber=${displayNumber.textContent}; // เปลี่ยนเส้นทางไปที่หน้า /point
// });




document.getElementById("btn-confirm").addEventListener("click", function() {
    let phoneNumber = document.getElementById("display-number").innerText;

    // ตรวจสอบว่าหมายเลขกรอกครบ 10 ตัว
    if (phoneNumber.length === 10) {
        // ส่งคำขอไปยัง server เพื่อเพิ่มหรืออัพเดตข้อมูลในฐานข้อมูล
        fetch('/update-points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phoneNumber: phoneNumber })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("เพิ่มข้อมูลสำเร็จ");
                
            } else {
                console.log("ไม่สามารถเพิ่มข้อมูลได้");
                
            }
        })
        .catch(error => {
            console.log(error);
            
        });
    } else {
        console.log(error);
    }
});
