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

      if (!error && Array.isArray(data)) {
        return data;
      }
      if (error) {
        console.warn("Gagal memuat produk dari Supabase, menggunakan data cadangan:", error.message);
      }
    } catch (e) {
      console.warn("Error fetching from Supabase:", e);
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
 * Mencatat kunjungan halaman (Page View)
 * Menggunakan sessionStorage agar tidak mencatat ganda saat refresh di tab yang sama
 */
async function trackPageView(pageName = "Halaman Utama") {
  try {
    const sessionKey = `gg_pv_${encodeURIComponent(pageName)}`;
    if (sessionStorage.getItem(sessionKey)) {
      return; // Sudah tercatat dalam sesi tab aktif ini
    }
    sessionStorage.setItem(sessionKey, Date.now().toString());
  } catch (e) {}

  return trackClick("page_view", pageName, "pageview");
}

/**
 * Mencatat event klik (produk, marketplace, whatsapp, page view)
 * @param {string} eventType - 'product_click', 'product_whatsapp', 'marketplace_click', 'page_view'
 * @param {string} targetName - contoh: 'Kerudung Paris Eksklusif', 'Shopee', 'Tokopedia', 'Halaman Utama'
 * @param {string} category - contoh: 'hijab', 'store_popup', 'lead_form', 'pageview'
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
    if (rawEvents.length > 2000) rawEvents.shift();
    localStorage.setItem("gemas_analytics_events", JSON.stringify(rawEvents));
  } catch (err) {
    console.warn("Failed caching click event locally:", err);
  }

  // Kirim ke Supabase secara realtime
  if (supabaseClient) {
    try {
      await supabaseClient.from("analytics_clicks").insert([{
        event_type: eventType,
        target_name: targetName,
        category: category
      }]);
    } catch (e) {
      // Non-blocking error
    }
  }
}

/**
 * Mengambil data analitik real dari database Supabase
 */
async function getAnalyticsSummary() {
  let events = [];
  const localEvents = JSON.parse(localStorage.getItem("gemas_analytics_events") || "[]");

  // 1. Ambil data asli dari Supabase
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("analytics_clicks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5000);

      if (!error && Array.isArray(data)) {
        events = data;
      }
    } catch (e) {
      console.warn("Could not fetch remote analytics:", e);
    }
  }

  // 2. Jika Supabase offline atau belum ada data remote, gunakan log lokal
  if (events.length === 0) {
    events = localEvents;
  }

  // 3. Agregasi data murni dari log event
  const productClicks = {};
  const marketplaceClicks = {};
  const pageViews = {};
  let totalProductClicks = 0;
  let totalMarketplaceClicks = 0;
  let totalPageViews = 0;

  events.forEach(ev => {
    const target = ev.target_name || "Unknown";
    if (ev.event_type === "page_view") {
      pageViews[target] = (pageViews[target] || 0) + 1;
      totalPageViews++;
    } else if (ev.event_type === "product_click" || ev.event_type === "product_whatsapp") {
      productClicks[target] = (productClicks[target] || 0) + 1;
      totalProductClicks++;
    } else if (ev.event_type === "marketplace_click") {
      marketplaceClicks[target] = (marketplaceClicks[target] || 0) + 1;
      totalMarketplaceClicks++;
    }
  });

  return {
    rawEvents: events,
    totalPageViews,
    pageViews,
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

// ========================================================
// 5. DATABASE HELPER: MITRA RESELLER
// ========================================================

async function registerReseller(resellerData) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("resellers")
        .insert([{
          name: resellerData.name,
          phone: resellerData.phone,
          city: resellerData.city || "",
          status: "pending"
        }]);
      if (!error) return { success: true, data };
      console.warn("Gagal simpan reseller ke Supabase:", error.message);
    } catch (e) {
      console.warn("Error registering reseller:", e);
    }
  }

  // Fallback lokal jika offline
  const local = JSON.parse(localStorage.getItem("gemas_resellers") || "[]");
  local.unshift({
    id: Date.now(),
    name: resellerData.name,
    phone: resellerData.phone,
    city: resellerData.city || "",
    status: "pending",
    created_at: new Date().toISOString()
  });
  localStorage.setItem("gemas_resellers", JSON.stringify(local));
  return { success: true, fallback: true };
}

async function getResellers() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("resellers")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) return data;
    } catch (e) {
      console.warn("Error fetching resellers:", e);
    }
  }
  const local = localStorage.getItem("gemas_resellers");
  return local ? JSON.parse(local) : [];
}

async function updateResellerStatus(id, newStatus) {
  if (supabaseClient) {
    try {
      await supabaseClient.from("resellers").update({ status: newStatus }).eq("id", id);
    } catch (e) {
      console.warn("Error updating reseller:", e);
    }
  }
  const list = await getResellers();
  const target = list.find(r => r.id == id);
  if (target) target.status = newStatus;
  localStorage.setItem("gemas_resellers", JSON.stringify(list));
  return true;
}

async function deleteReseller(id) {
  if (supabaseClient) {
    try {
      await supabaseClient.from("resellers").delete().eq("id", id);
    } catch (e) {
      console.warn("Error deleting reseller:", e);
    }
  }
  let list = await getResellers();
  list = list.filter(r => r.id != id);
  localStorage.setItem("gemas_resellers", JSON.stringify(list));
  return true;
}

