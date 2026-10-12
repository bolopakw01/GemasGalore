// ========================================================
// SUPABASE CONFIGURATION - GEMAS GALORE
// ========================================================
// Masukkan URL dan Anon Key project Supabase Anda di bawah ini:
// Dapatkan di: Supabase Dashboard -> Project Settings -> API
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
// DATA PRODUK CADANGAN (FALLBACK)
// ========================================================
// Digunakan otomatis jika Supabase belum dikonfigurasi atau offline
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
// DATABASE HELPER FUNCTIONS
// ========================================================

// 1. Ambil semua produk
async function getProducts() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Gagal memuat produk dari Supabase, menggunakan data lokal:", error.message);
        return DEFAULT_PRODUCTS;
      }
      return data && data.length > 0 ? data : DEFAULT_PRODUCTS;
    } catch (e) {
      console.warn("Error fetching from Supabase:", e);
      return DEFAULT_PRODUCTS;
    }
  }
  return DEFAULT_PRODUCTS;
}

// 2. Simpan pesan dari form kontak
async function saveMessage(messageData) {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("messages")
        .insert([messageData]);
      if (error) {
        console.error("Gagal menyimpan pesan ke Supabase:", error.message);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (e) {
      console.error("Error saving message:", e);
      return { success: false, error: e };
    }
  }
  // Simpan di localStorage sebagai fallback offline
  const localMessages = JSON.parse(localStorage.getItem("offline_messages") || "[]");
  localMessages.push({ ...messageData, created_at: new Date().toISOString() });
  localStorage.setItem("offline_messages", JSON.stringify(localMessages));
  return { success: true, fallback: true };
}

