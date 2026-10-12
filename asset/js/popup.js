// ========================================================
// POPUP TOKO ONLINE & MARKETPLACE CLICK TRACKING
// ========================================================

document.addEventListener("DOMContentLoaded", async function () {
  const viewProductsBtn = document.querySelector(".view-products-btn");
  const storePopup = document.getElementById("storePopup");
  const closePopup = document.querySelector(".close-popup");

  // Buka popup & catat event
  if (viewProductsBtn && storePopup) {
    viewProductsBtn.addEventListener("click", function (e) {
      e.preventDefault();
      storePopup.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent scrolling
      
      if (typeof trackClick === "function") {
        trackClick("marketplace_click", "Buka Popup Marketplace", "store_popup_trigger");
      }
    });
  }

  // Tutup popup
  if (closePopup && storePopup) {
    closePopup.addEventListener("click", function () {
      storePopup.classList.remove("active");
      document.body.style.overflow = "";
    });
  }

  // Tutup ketika klik di luar popup
  if (storePopup) {
    storePopup.addEventListener("click", function (e) {
      if (e.target === storePopup) {
        storePopup.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }

  // Pelacakan klik masing-masing tombol marketplace dalam popup
  const marketplaceButtons = document.querySelectorAll(".store-buttons .store-btn");
  marketplaceButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      let platform = "Marketplace";
      if (this.classList.contains("shopee")) platform = "Shopee";
      else if (this.classList.contains("tokopedia")) platform = "Tokopedia";
      else if (this.classList.contains("tiktok")) platform = "TikTok Shop";
      else if (this.classList.contains("instagram")) platform = "Instagram";

      if (typeof trackClick === "function") {
        trackClick("marketplace_click", platform, "store_popup");
      }
    });
  });

  // Sinkronisasi link dari pengaturan toko jika tersedia
  if (typeof getSiteSettings === "function") {
    try {
      const settings = await getSiteSettings();
      if (settings) {
        const shopeeLink = document.querySelector(".store-btn.shopee");
        if (shopeeLink && settings.shopee_url) shopeeLink.href = settings.shopee_url;

        const tokpedLink = document.querySelector(".store-btn.tokopedia");
        if (tokpedLink && settings.tokopedia_url) tokpedLink.href = settings.tokopedia_url;

        const tiktokLink = document.querySelector(".store-btn.tiktok");
        if (tiktokLink && settings.tiktok_url) tiktokLink.href = settings.tiktok_url;

        const igLink = document.querySelector(".store-btn.instagram");
        if (igLink && settings.instagram_url) igLink.href = settings.instagram_url;
      }
    } catch (e) {
      console.warn("Could not sync marketplace URLs in popup:", e);
    }
  }
});
