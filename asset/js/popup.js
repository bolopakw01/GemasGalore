// Popup Toko Online
document.addEventListener("DOMContentLoaded", function () {
  const viewProductsBtn = document.querySelector(".view-products-btn");
  const storePopup = document.getElementById("storePopup");
  const closePopup = document.querySelector(".close-popup");

  // Buka popup
  viewProductsBtn.addEventListener("click", function (e) {
    e.preventDefault();
    storePopup.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  });

  // Tutup popup
  closePopup.addEventListener("click", function () {
    storePopup.classList.remove("active");
    document.body.style.overflow = "";
  });

  // Tutup ketika klik di luar popup
  storePopup.addEventListener("click", function (e) {
    if (e.target === storePopup) {
      storePopup.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
});
