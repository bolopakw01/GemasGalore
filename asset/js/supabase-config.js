// ========================================================
// SUPABASE CONFIGURATION - GEMAS GALORE
// ========================================================
// Terintegrasi dengan database PostgreSQL Supabase
// Lengkap dengan pelacakan analitik klik & pengaturan toko
// ========================================================

const SUPABASE_CONFIG = {
  url: "https://fgaymsvezuqrokylqvgw.supabase.co",
  anonKey: "sb_publishable_je0jY4fqWKqDAJ_-aj4uIQ_Ka-W04CB"
};

// Cek apakah konfigurasi Supabase sudah diisi dengan benar
function isSupabaseConfigured() {
  return (
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.anonKey &&
    !SUPABASE_CONFIG.url.includes("YOUR_PROJECT_ID") &&
    !SUPABASE_CONFIG.anonKey.includes("YOUR_SUPABASE_ANON_KEY")
  );
}

// Inisialisasi Supabase Client jika library sudah dimuat
let supabaseClient = null;
if (typeof supabase !== "undefined" && isSupabaseConfigured()) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log("✅ Supabase berhasil terhubung!");
  } catch (err) {
    console.warn("⚠️ Gagal inisialisasi Supabase:", err);
  }
}

// ========================================================
// DATA PRODUK CADANGAN (FALLBACK LOKAL)
// ========================================================
const DEFAULT_PRODUCTS = [
  {
    id: "1",
    title: "Kerudung Paris Eksklusif",
    category: "hijab",
    price: "Rp 18.000",
    image_url: "asset/img/produk/produk1.jpg",
    badge: "Bestseller",
    description: "Kerudung Paris premium dengan logo akrilik khas Gemas Galore. Menggunakan bahan berkualitas yang ringan, mudah dibentuk, adem, dan tidak gampang letoy.",
    material: "Paris Premium Super Fine + Pin Akrilik Eksklusif"
  },
  {
    id: "2",
    title: "Gantungan Tas Akrilik",
    category: "merchandise",
    price: "Rp 12.000",
    image_url: "asset/img/bgantungantas.png",
    badge: "Merchandise",
    description: "Gantungan tas estetik dengan desain unik dan eye-catching. Sangat cocok dipasang pada tas sekolah, kuliah, ransel, maupun tote bag.",
    material: "Akrilik Tebal 3mm Double Side + Gantungan O-Ring Premium"
  },
  {
    id: "3",
    title: "Card Holder Minimalis",
    category: "souvenir",
    price: "Rp 15.000",
    image_url: "asset/img/bcardholder.png",
    badge: "Souvenir",
    description: "Card holder ramping dan praktis dibawa bepergian. Memuat hingga 6 kartu penting plus kompartemen uang tunai lipat.",
    material: "Kulit Sintetis Lembut / Kanvas Tebal Jahitan Presisi"
  },
  {
    id: "4",
    title: "Premium Gift Packaging",
    category: "souvenir",
    price: "Rp 25.000",
    image_url: "asset/img/produk/produk2.jpg",
    badge: "Gift Set",
    description: "Hardbox custom premium dirancang eksklusif dengan sentuhan pita satin cantik dan kartu ucapan personal untuk hampers, kado ulang tahun, dan wisuda.",
    material: "Hardbox Doff Premium + Pita Satin + Custom Greeting Card"
  },
  {
    id: "5",
    title: "Kerudung Paris Segi Empat",
    category: "hijab",
    price: "Rp 18.000",
    image_url: "asset/img/bjilbab.png",
    badge: "New Colors",
    description: "Kerudung segi empat berbahan Paris Voile ringan dan breathable. Sangat mudah dibentuk, tidak kedap di telinga, dan awet dicuci berkali-kali.",
    material: "Paris Voile Berkualitas Ukuran 115 x 115 cm"
  },
  {
    id: "6",
    title: "Starter Reseller Kit",
    category: "merchandise",
    price: "Rp 15.000",
    image_url: "asset/img/produk/produk3.jpg",
    badge: "Paket Mitra",
    description: "Paket permulaan bisnis bagi Anda yang ingin menjadi reseller Gemas Galore. Termasuk sampel produk, materi foto/video promosi, dan pendampingan tim marketing.",
    material: "Sampel Produk + Katalog Digital + Bimbingan Penjualan"
  }
];

// ========================================================
// 1. DATABASE HELPER: PRODUK
// ========================================================

async function getProducts() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Gagal memuat produk dari Supabase, menggunakan data lokal:", error.message);
        return getLocalProducts();
      }
      return data && data.length > 0 ? data : getLocalProducts();
    } catch (e) {
      console.warn("Error fetching from Supabase:", e);
      return getLocalProducts();
    }
  }
  return getLocalProducts();
}

function getLocalProducts() {
  const custom = localStorage.getItem("gemas_custom_products");
  if (custom) {
    try {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return DEFAULT_PRODUCTS;
}

// ========================================================
// 2. DATABASE HELPER: PESAN & FORM KONTAK
// ========================================================

async function saveMessage(messageData) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("messages")
        .insert([messageData]);
      if (error) {
        console.error("Gagal menyimpan pesan ke Supabase:", error.message);
        saveLocalMessage(messageData);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (e) {
      console.error("Error saving message:", e);
      saveLocalMessage(messageData);
      return { success: false, error: e };
    }
  }
  saveLocalMessage(messageData);
  return { success: true, fallback: true };
}

function saveLocalMessage(messageData) {
  const localMessages = JSON.parse(localStorage.getItem("offline_messages") || "[]");
  localMessages.push({ ...messageData, created_at: new Date().toISOString() });
  localStorage.setItem("offline_messages", JSON.stringify(localMessages));
}

// ========================================================
// 3. DATABASE HELPER: PELACAKAN KLIK & ANALITIK
// ========================================================

/**
 * Mencatat event klik (produk, marketplace, whatsapp)
 * @param {string} eventType - 'product_click', 'product_whatsapp', 'marketplace_click'
 * @param {string} targetName - contoh: 'Kerudung Paris Eksklusif', 'Shopee', 'Tokopedia'
 * @param {string} category - contoh: 'hijab', 'store_popup', 'floating_wa'
 */
async function trackClick(eventType, targetName, category = "general") {
  if (!targetName) return;

  const clickData = {
    event_type: eventType,
    target_name: targetName,
    category: category,
    created_at: new Date().toISOString()
  };

  // Simpan ke localStorage selalu agar instan dan offline-ready
  try {
    const rawEvents = JSON.parse(localStorage.getItem("gemas_analytics_events") || "[]");
    rawEvents.push(clickData);
    // Batasi maksimum 1000 log lokal untuk hemat memori
    if (rawEvents.length > 1000) rawEvents.shift();
    localStorage.setItem("gemas_analytics_events", JSON.stringify(rawEvents));

    // Agregat counter
    const counts = JSON.parse(localStorage.getItem("gemas_click_counts") || "{}");
    const key = `${eventType}:::${targetName}`;
    counts[key] = (counts[key] || 0) + 1;
    localStorage.setItem("gemas_click_counts", JSON.stringify(counts));
  } catch (err) {
    console.warn("Failed caching click event locally:", err);
  }

  // Kirim ke Supabase jika client aktif
  if (supabaseClient) {
    try {
      await supabaseClient.from("analytics_clicks").insert([{
        event_type: eventType,
        target_name: targetName,
        category: category
      }]);
    } catch (e) {
      // Non-blocking error, log diam-diam
    }
  }
}

/**
 * Mengambil ringkasan analitik klik
 */
async function getAnalyticsSummary() {
  let events = [];
  const localEvents = JSON.parse(localStorage.getItem("gemas_analytics_events") || "[]");

  // 1. Coba ambil dari Supabase
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("analytics_clicks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(2000);

      if (!error && data && data.length > 0) {
        events = data;
      }
    } catch (e) {
      console.warn("Could not fetch remote analytics:", e);
    }
  }

  // 2. Gabungkan data Supabase dan lokal
  if (events.length === 0) {
    events = localEvents;
  } else if (localEvents.length > 0) {
    const existingIds = new Set(events.map(e => `${e.event_type}_${e.target_name}_${e.created_at}`));
    localEvents.forEach(le => {
      const key = `${le.event_type}_${le.target_name}_${le.created_at}`;
      if (!existingIds.has(key)) {
        events.push(le);
      }
    });
  }

  // 3. Agregasi data
  const productClicks = {};
  const marketplaceClicks = {};
  let totalProductClicks = 0;
  let totalMarketplaceClicks = 0;

  events.forEach(ev => {
    const target = ev.target_name || "Unknown";
    if (ev.event_type === "product_click" || ev.event_type === "product_whatsapp") {
      productClicks[target] = (productClicks[target] || 0) + 1;
      totalProductClicks++;
    } else if (ev.event_type === "marketplace_click") {
      marketplaceClicks[target] = (marketplaceClicks[target] || 0) + 1;
      totalMarketplaceClicks++;
    }
  });

  // Gabungkan dengan counter lokal agar klik instan selalu tercermin
  const localCounts = JSON.parse(localStorage.getItem("gemas_click_counts") || "{}");
  Object.keys(localCounts).forEach(k => {
    const [type, name] = k.split(":::");
    if (type === "product_click" || type === "product_whatsapp") {
      if ((productClicks[name] || 0) < localCounts[k]) {
        const diff = localCounts[k] - (productClicks[name] || 0);
        productClicks[name] = localCounts[k];
        totalProductClicks += diff;
      }
    } else if (type === "marketplace_click") {
      if ((marketplaceClicks[name] || 0) < localCounts[k]) {
        const diff = localCounts[k] - (marketplaceClicks[name] || 0);
        marketplaceClicks[name] = localCounts[k];
        totalMarketplaceClicks += diff;
      }
    }
  });

  return {
    rawEvents: events,
    productClicks,
    marketplaceClicks,
    totalProductClicks,
    totalMarketplaceClicks,
    totalClicks: totalProductClicks + totalMarketplaceClicks
  };
}

// ========================================================
// 4. DATABASE HELPER: PENGATURAN TOKO (SETTINGS)
// ========================================================

const DEFAULT_SETTINGS = {
  whatsapp_number: "6289656759653",
  shopee_url: "https://id.shp.ee/FdqYZK8",
  tokopedia_url: "https://tokopedia.com/gemasgalore",
  tiktok_url: "https://tiktok.com/@gemasgalore",
  instagram_url: "https://instagram.com/gemasgalore"
};

async function getSiteSettings() {
  let settings = { ...DEFAULT_SETTINGS };

  // Ambil dari Supabase jika ada
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("site_settings").select("*");
      if (!error && data && data.length > 0) {
        data.forEach(item => {
          settings[item.key] = item.value;
        });
        localStorage.setItem("gemas_site_settings", JSON.stringify(settings));
        return settings;
      }
    } catch (e) {
      console.warn("Could not fetch remote settings:", e);
    }
  }

  // Fallback lokal
  const local = localStorage.getItem("gemas_site_settings");
  if (local) {
    try {
      return { ...settings, ...JSON.parse(local) };
    } catch (e) {}
  }
  return settings;
}

async function updateSiteSetting(key, value) {
  // Simpan lokal
  const current = await getSiteSettings();
  current[key] = value;
  localStorage.setItem("gemas_site_settings", JSON.stringify(current));

  // Simpan Supabase
  if (supabaseClient) {
    try {
      await supabaseClient.from("site_settings").upsert({
        key: key,
        value: value,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Could not upsert setting in Supabase:", e);
    }
  }
  return true;
}
