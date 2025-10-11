document.addEventListener("DOMContentLoaded", function () {
    const imageUpload = document.getElementById("imageUpload");
    const imagePreview = document.getElementById("imagePreview");
    const submitButton = document.getElementById("submitButton");

    imageUpload.addEventListener("change", function (event) {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagePreview.style.display = "block";
                imagePreview.innerHTML = `<img src="${e.target.result}" width="100%">`;
                submitButton.classList.add("active");
                submitButton.removeAttribute("disabled");
            };
            reader.readAsDataURL(file);
        }
        document.addEventListener("DOMContentLoaded", function () {
            console.log("JS Loaded"); // ตรวจสอบว่า JS โหลดสำเร็จ
        });

    });
});
