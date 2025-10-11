// เปิด-ปิด Navbar เมื่อคลิกขีดสามขีด
document.getElementById('menu-toggle').addEventListener('click', function() {
    const navbarMenu = document.querySelector('.navbar-menu');
    navbarMenu.classList.toggle('active');
});