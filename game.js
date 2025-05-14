// Dapatkan elemen canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Konfigurasi Game
const GRAVITASI = 0.5;
const KEKUATAN_LOMPAT = -10;
const WAKTU_TIDUR = 5000; // 5 detik
const GRAVITASI_RINTANGAN = 0.2; // Gravitasi untuk rintangan

// Gambar
const backgroundImg = new Image();
const catMoveImg = new Image();
const catSleepImg = new Image();
const catStayImg = new Image();

// Tambahkan di bagian global, sebelum inisialisasi pemain
let jarakKanan = 0;
let jarakKiri = 0;

// Flag untuk memastikan semua gambar dimuat
let semuaGambarDimuat = false;

// Variabel untuk melacak waktu diam
let waktuTerakhirBergerak = Date.now();
let sedangTidur = false;

// Background Scrolling
let backgroundScroll = 0;
const SCROLL_SPEED = 5;
let backgroundMirror;

// Rintangan
let daftarRintangan = [];
let jarakTempuh = 0;
// let rintanganSudahMuncul = false;
let debugRintangan = {
  status: false,
  pesan: "",
};

// Tambahkan variabel global untuk mengontrol munculnya rintangan
const JARAK_MUNCULKAN_RINTANGAN = 100; // Bisa disesuaikan
let jarakSebelumRintangan = 0;
let rintanganSudahMuncul = false;

// Tambahkan variabel global untuk melacak jumlah rintangan dan jarak munculnya
let jumlahRintanganMuncul = 0;
const JARAK_MUNCULKAN_RINTANGAN_KE_2 = 200; // Jarak untuk rintangan kedua

// Tambahkan di bagian global variabel
let jarakTempuhKarakter = 0;
const JARAK_MUNCULKAN_RINTANGAN_KETIGA = 400; // Bisa disesuaikan
let rintanganPengejar = null;

// Kelas Rintangan (tetap sama)
class Rintangan {
  constructor(x, y, bergerak = false, jatuh = true, sekaliMuncul = false) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.kecepatanX = bergerak ? 2 : 0;
    this.kecepatanY = jatuh ? 1 : 0;
    this.jatuh = jatuh;
    this.sekaliMuncul = sekaliMuncul;
    this.sudahSampaiAkhir = false;
  }

  update() {
    // Gerakan horizontal jika bergerak
    if (this.kecepatanX !== 0) {
      this.x += this.kecepatanX;

      // Jika sekali muncul, berhenti saat mencapai akhir layar
      if (this.sekaliMuncul && this.x > canvas.width + this.radius) {
        this.sudahSampaiAkhir = true;
      }
    }

    // Gerakan vertikal (jatuh)
    if (this.jatuh) {
      this.y += this.kecepatanY;

      // Terus jatuh sampai benar-benar keluar canvas
      if (this.y > canvas.height + this.radius) {
        // Hapus rintangan dari daftar
        daftarRintangan = daftarRintangan.filter((r) => r !== this);
      }
    }
  }

  gambar(ctx) {
    ctx.beginPath();
    ctx.fillStyle = "red";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    //         // Gambar border (garis pinggir rintangan)
    // ctx.strokeStyle = 'yellow';  // Warna border
    // ctx.lineWidth = 2;  // Lebar border
    // ctx.stroke();  // Gambar border pada lingkaran
  }
}

// Kelas RintanganPengejar
class RintanganPengejar {
  constructor(
    radius = 5, // Ukuran radius kecil
    startX = -radius,
    startY = 10,
    kecepatanAwal = 0.3,
    warna = "purple"
  ) {
    this.radius = radius;
    this.x = startX;
    this.y = startY;
    this.kecepatanX = kecepatanAwal;
    this.kecepatanY = 0;
    this.warna = warna;
  }

  update(targetX, targetY) {
    let sudutKekarakter = Math.atan2(targetY - this.y, targetX - this.x);
    this.kecepatanX = Math.cos(sudutKekarakter) * 0.3;
    this.kecepatanY = Math.sin(sudutKekarakter) * 0.3;
    this.x += this.kecepatanX;
    this.y += this.kecepatanY;
  }

  gambar(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.warna;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // // Gambar border (garis pinggir rintangan pengejar)
    // ctx.strokeStyle = 'yellow';  // Warna border
    // ctx.lineWidth = 2;  // Lebar border
    // ctx.stroke();  // Gambar border pada lingkaran pengejar
  }

  // Fungsi untuk mengecek tabrakan dengan karakter
  cekTabrakan(pemain) {
    let jarak = Math.sqrt(
      Math.pow(this.x - pemain.x, 2) + Math.pow(this.y - pemain.y, 2)
    );
    return jarak < this.radius + pemain.radius; // Memeriksa jarak antara dua objek
  }
}

// Fungsi cek tabrakan untuk rintangan pengejar dengan jarak yang lebih dalam
function cekTabrakanPengejar(rintanganPengejar, pemain) {
    // Hitung jarak antara pusat rintangan pengejar dan pusat pemain
    let jarakX = Math.abs(pemain.x + pemain.lebarHitbox / 2 - rintanganPengejar.x);  // Pakai /2 untuk tengah objek
    let jarakY = Math.abs(pemain.y + pemain.tinggiHitbox / 2 - rintanganPengejar.y); // Pakai /2 untuk tengah objek

    // Tentukan ukuran area tabrakan (lebih besar dari area normal)
    let lebarTabrakan = (pemain.lebarHitbox + rintanganPengejar.radius * 2) / 1.5;  // Menggunakan nilai yang lebih realistis
    let tinggiTabrakan = (pemain.tinggiHitbox + rintanganPengejar.radius * 2) / 1.5; // Menggunakan nilai yang lebih realistis

    // Cek tabrakan: jika jarak horizontal atau vertikal lebih kecil dari area tabrakan
    if (jarakX < lebarTabrakan && jarakY < tinggiTabrakan) {
        console.log("Tabrakan Detected!");
        return true; // Jika tabrakan, return true
    }
    return false; // Jika tidak ada tabrakan
}


// Karakter
let pemain = {
  x: 120,
  y: canvas.height - 40,
  lebar: 40,
  tinggi: 40,
  lebarHitbox: 10, // Lebar hitbox yang lebih kecil untuk perhitungan tabrakan
  tinggiHitbox: 10, // Tinggi hitbox yang lebih kecil untuk perhitungan tabrakan
  kecepatanX: 0,
  kecepatanY: 0,
  kecepatan: 1.25,
  diTanah: true,
  gambar: catStayImg,
  menghadapKanan: false,
};

// Fungsi Muat Gambar
function muatGambar() {
  backgroundImg.src = "assets/background_game.png";
  catMoveImg.src = "assets/cat_move.png";
  catSleepImg.src = "assets/cat_sleep.png";
  catStayImg.src = "assets/cat_stay.png";

  // Cek apakah semua gambar sudah dimuat
  let jumlahGambarDimuat = 0;
  const totalGambar = 4;

  function cekGambarDimuat() {
    jumlahGambarDimuat++;
    if (jumlahGambarDimuat === totalGambar) {
      semuaGambarDimuat = true;
      loopPermainan();
    }
  }

  backgroundImg.onload = cekGambarDimuat;
  catMoveImg.onload = cekGambarDimuat;
  catSleepImg.onload = cekGambarDimuat;
  catStayImg.onload = cekGambarDimuat;
}

// Buat mirror image
function createMirrorImage(image) {
  const mirrorCanvas = document.createElement("canvas");
  mirrorCanvas.width = image.width;
  mirrorCanvas.height = image.height;
  const mirrorCtx = mirrorCanvas.getContext("2d");

  mirrorCtx.scale(-1, 1);
  mirrorCtx.drawImage(image, -image.width, 0);

  return mirrorCanvas;
}

// Fungsi tambahkan rintangan (modifikasi)
function tambahkanRintangan() {
  if (jumlahRintanganMuncul === 0) {
    // Rintangan pertama (jatuh)
    let rintanganPertama = new Rintangan(canvas.width / 1.3, -50, false, true);
    daftarRintangan.push(rintanganPertama);
  } else if (jumlahRintanganMuncul === 1) {
    // Rintangan kedua (bergerak horizontal, tidak jatuh)
    let posisiY = canvas.height - 40;
    let rintanganKedua = new Rintangan(-20, posisiY, true, false);
    daftarRintangan.push(rintanganKedua);
  }
  jumlahRintanganMuncul++;
}
let gameOverCalled = false; // Status untuk memeriksa apakah game over sudah dipanggil

// Fungsi updateRintangan yang diperbarui
function updateRintangan() {
  // Jika game sudah berakhir, jangan jalankan update lainnya
  if (gameOverCalled) return;

  // Hapus rintangan yang sudah keluar layar
  daftarRintangan = daftarRintangan.filter(
    (rintangan) => rintangan.y < canvas.height + 50
  );

  // Periksa tabrakan untuk rintangan biasa
  daftarRintangan.forEach((rintangan) => {
    if (
      typeof rintangan.cekTabrakan === "function" &&
      rintangan.cekTabrakan(pemain)
    ) {
      console.log("Kena rintangan!");
      gameOver(); // Panggil game over jika kena rintangan biasa
      gameOverCalled = true; // Tandai game over sudah dipanggil
    }
  });

  // Update dan gambar rintangan pengejar jika ada
  if (rintanganPengejar) {
    rintanganPengejar.update(pemain.x, pemain.y);

    // Cek tabrakan dengan rintangan pengejar
    if (cekTabrakanPengejar(rintanganPengejar, pemain)) {
      console.log("Kena rintangan pengejar!");
      gameOver(); // Panggil game over jika kena rintangan pengejar
      gameOverCalled = true; // Tandai game over sudah dipanggil
    }
  }

  // Gambar rintangan pengejar jika ada
  if (rintanganPengejar) {
    rintanganPengejar.gambar(ctx);
  }
}

function cekTabrakan() {
  daftarRintangan.forEach((rintangan) => {
    // Hitung jarak antara pusat karakter dan pusat rintangan
    let jarakX = Math.abs(pemain.x + pemain.lebar / 2 - rintangan.x);
    let jarakY = Math.abs(pemain.y + pemain.tinggi / 2 - rintangan.y);

    // Tentukan ukuran area tabrakan
    let lebarTabrakan = (pemain.lebarHitbox + rintangan.radius * 2) / 3;
    let tinggiTabrakan = (pemain.tinggiHitbox + rintangan.radius * 2) / 3;

    // Cek tabrakan
    if (jarakX < lebarTabrakan && jarakY < tinggiTabrakan) {
      gameOver();
    }
  });
}

function gameOver() {
  alert("Game Over!");

  // Log status rintangan sebelum reset
  console.log("Game Over - Rintangan Status Sebelum Reset:", {
    jarakTempuh: jarakTempuh,
    rintanganMuncul: rintanganSudahMuncul,
    jumlahRintangan: daftarRintangan.length,
  });

  resetPermainan();

  gameOverCalled = true;
}

function resetPermainan() {
  jarakTempuh = 0;
  jarakSebelumRintangan = 0;
  jarakKanan = 0; // Reset jarak kanan
  jarakKiri = 0; // Reset jarak kiri
  daftarRintangan = [];
  rintanganSudahMuncul = false;
  jumlahRintanganMuncul = 0; // Reset jumlah rintangan

  pemain.x = 180;
  pemain.y = canvas.height - 40;
}

// Fungsi Gerakkan Pemain
function gerakkanPemain() {
  // Gravitasi
  pemain.kecepatanY += GRAVITASI;

  // Perbarui Posisi
  let potensialX = pemain.x + pemain.kecepatanX;

  // Batasan Horizontal dengan margin 50 piksel di KEDUA SISI
  const margin = 50;

  // Periksa apakah posisi potensial masih dalam batas yang diizinkan
  if (
    potensialX >= margin &&
    potensialX <= canvas.width - pemain.lebar - margin
  ) {
    pemain.x = potensialX;
  }

  pemain.y += pemain.kecepatanY;

  // Tambahkan logika untuk munculkan rintangan ketiga
  if (pemain.kecepatanX > 0) {
    // Pastikan bergerak ke kanan
    // Hitung jarak tempuh
    jarakTempuhKarakter += Math.abs(pemain.kecepatanX);

    // Debug: Tampilkan jarak tempuh
    console.log("Jarak Tempuh Karakter:", jarakTempuhKarakter);

    // Cek untuk munculkan rintangan ketiga berdasarkan jarak kanan
    if (
      jumlahRintanganMuncul === 2 &&
      jarakKanan >= JARAK_MUNCULKAN_RINTANGAN_KETIGA &&
      !rintanganPengejar
    ) {
      console.log("Munculkan Rintangan Ketiga berdasarkan Jarak Kanan");
      rintanganPengejar = new RintanganPengejar(); // Buat rintangan pengejar baru
      jumlahRintanganMuncul++; // Meningkatkan jumlah rintangan muncul
    }
  }

  // Update rintangan pengejar jika ada
  if (rintanganPengejar) {
    rintanganPengejar.update(pemain.x, pemain.y);

    // Cek tabrakan
    if (rintanganPengejar.cekTabrakan(pemain)) {
      console.log("Kena rintangan pengejar!");
      gameOver();
    }
  }

  // Gambar rintangan pengejar jika ada
  if (rintanganPengejar) {
    rintanganPengejar.gambar(ctx);
  }

  if (pemain.kecepatanX > 0) {
    // Pastikan bergerak ke
    if (
      jumlahRintanganMuncul === 0 &&
      jarakKanan >= JARAK_MUNCULKAN_RINTANGAN
    ) {
      tambahkanRintangan(); // Tambah rintangan pertama
      jarakSebelumRintangan = jarakKanan;
      console.log("Rintangan Pertama Muncul di Jarak Kanan:", jarakKanan);
    } else if (
      jumlahRintanganMuncul === 1 &&
      jarakKanan >= jarakSebelumRintangan + JARAK_MUNCULKAN_RINTANGAN_KE_2
    ) {
      tambahkanRintangan(); // Tambah rintangan kedua
      jarakSebelumRintangan = jarakKanan;
      console.log("Rintangan Kedua Muncul di Jarak Kanan:", jarakKanan);
    } else if (
      jumlahRintanganMuncul === 2 &&
      jarakKanan >= jarakSebelumRintangan + JARAK_MUNCULKAN_RINTANGAN_KETIGA
    ) {
      console.log("Munculkan Rintangan Ketiga");

      // Buat rintangan pengejar baru
      rintanganPengejar = new RintanganPengejar();
      jumlahRintanganMuncul++;
    }
  }

  // Update rintangan pengejar jika ada
  if (rintanganPengejar) {
    rintanganPengejar.update(pemain.x, pemain.y);

    // Cek tabrakan
    if (rintanganPengejar.cekTabrakan(pemain)) {
      console.log("Kena rintangan pengejar!");
      gameOver();
    }
  }

  // Gambar rintangan pengejar jika ada
  if (rintanganPengejar) {
    rintanganPengejar.gambar(ctx);
  }

  // Batasan Tanah
  if (pemain.y >= canvas.height - pemain.tinggi) {
    pemain.y = canvas.height - pemain.tinggi;
    pemain.kecepatanY = 0;
    pemain.diTanah = true;
  }

  // Log jarak tempuh ke kanan dan ke kiri dengan logika baru
  if (pemain.kecepatanX > 0) {
    // Bergerak ke kanan
    jarakKanan += Math.abs(pemain.kecepatanX);
    jarakKiri = Math.max(0, jarakKiri - Math.abs(pemain.kecepatanX));

    console.log(
      "Jarak Kanan: " +
        jarakKanan.toFixed(2) +
        ", Jarak Kiri: " +
        jarakKiri.toFixed(2)
    );
  } else if (pemain.kecepatanX < 0) {
    // Bergerak ke kiri
    jarakKiri += Math.abs(pemain.kecepatanX);
    jarakKanan = Math.max(0, jarakKanan - Math.abs(pemain.kecepatanX));

    console.log(
      "Jarak Kanan: " +
        jarakKanan.toFixed(2) +
        ", Jarak Kiri: " +
        jarakKiri.toFixed(2)
    );
  }
  // Tambahkan logika jarak tempuh
  if (pemain.kecepatanX > 0) {
    jarakTempuh += Math.abs(pemain.kecepatanX);
  }

  // Fungsi untuk mengubah gambar berdasarkan gerakan
  function updateGambar() {
    // Jika sedang bergerak horizontal
    if (pemain.kecepatanX !== 0) {
      pemain.gambar = catMoveImg;
      sedangTidur = false;
      waktuTerakhirBergerak = Date.now();
    }
    // Jika tidak bergerak dan sudah lewat waktu tidur
    else if (
      Date.now() - waktuTerakhirBergerak >= WAKTU_TIDUR &&
      !sedangTidur
    ) {
      pemain.gambar = catSleepImg;
      sedangTidur = true;
    }
    // Jika tidak bergerak tapi belum waktunya tidur
    else if (pemain.kecepatanX === 0 && !sedangTidur) {
      pemain.gambar = catStayImg;
    }
  }

  // Fungsi Update Game
  function updateGame() {
    if (pemain.kecepatanX > 0) {
      // Pastikan bergerak ke kanan
      // Cek untuk munculkan rintangan ketiga berdasarkan jarak kanan
      if (
        jumlahRintanganMuncul === 2 &&
        jarakKanan >= JARAK_MUNCULKAN_RINTANGAN_KETIGA &&
        !rintanganPengejar
      ) {
        console.log("Munculkan Rintangan Ketiga berdasarkan Jarak Kanan");
        // Buat rintangan pengejar baru
        rintanganPengejar = new RintanganPengejar();
        jumlahRintanganMuncul++; // Meningkatkan jumlah rintangan muncul
      }
    }

    // Update rintangan pengejar jika ada
    if (rintanganPengejar) {
      rintanganPengejar.update(pemain.x, pemain.y);

      // Cek tabrakan
      if (rintanganPengejar.cekTabrakan(pemain)) {
        console.log("Kena rintangan pengejar!");
        gameOver(); // Jika tabrakan, panggil gameOver
      }
    }

    // Gambar rintangan pengejar jika ada
    if (rintanganPengejar) {
      rintanganPengejar.gambar(ctx);
    }

    // Update posisi pemain berdasarkan gravitasi
    pemain.kecepatanY += GRAVITASI; // Gravitasi menambah kecepatan vertikal pemain

    // Perbarui posisi pemain secara horizontal
    let potensialX = pemain.x + pemain.kecepatanX;

    // Batasan Horizontal dengan margin 50 piksel di kiri dan kanan
    const margin = 50;

    // Periksa apakah posisi horizontal pemain masih dalam batas yang diizinkan
    if (
      potensialX >= margin &&
      potensialX <= canvas.width - pemain.lebar - margin
    ) {
      pemain.x = potensialX;
    }

    // Perbarui posisi vertikal pemain
    pemain.y += pemain.kecepatanY;

    // Periksa apakah pemain telah mencapai tanah
    if (pemain.y >= canvas.height - pemain.tinggi) {
      pemain.y = canvas.height - pemain.tinggi; // Setel Y ke posisi tanah
      pemain.kecepatanY = 0; // Hentikan kecepatan vertikal
      pemain.diTanah = true; // Tandai pemain ada di tanah
    }

    // Update rintangan yang telah melewati layar
    daftarRintangan = daftarRintangan.filter(
      (rintangan) => rintangan.y < canvas.height + 50
    );

    // Update posisi dan gambar setiap rintangan
    daftarRintangan.forEach((rintangan) => rintangan.update());

    // Gambar semua rintangan
    daftarRintangan.forEach((rintangan) => rintangan.gambar(ctx));

    // Cek tabrakan antara pemain dan rintangan
    cekTabrakan();

    // Gambar karakter berdasarkan statusnya
    ctx.save();
    if (pemain.menghadapKanan) {
      ctx.translate(pemain.x + pemain.lebar, pemain.y);
      ctx.scale(-1, 1); // Gambar karakter dengan pembalikan horizontal
      ctx.drawImage(pemain.gambar, 0, 0, pemain.lebar, pemain.tinggi);
    } else {
      ctx.drawImage(
        pemain.gambar,
        pemain.x,
        pemain.y,
        pemain.lebar,
        pemain.tinggi
      );
    }
    ctx.restore();

    // Update gambar karakter berdasarkan gerakan
    updateGambar();

    // Geser background jika pemain bergerak ke kanan
    if (pemain.kecepatanX > 0) {
      backgroundScroll -= SCROLL_SPEED; // Geser latar belakang ke kiri
    } else if (pemain.kecepatanX < 0) {
      backgroundScroll += SCROLL_SPEED; // Geser latar belakang ke kanan
    }
  }

  // Fungsi untuk mengupdate gambar karakter berdasarkan gerakan
  function updateGambar() {
    // Jika pemain bergerak horizontal
    if (pemain.kecepatanX !== 0) {
      pemain.gambar = catMoveImg;
      sedangTidur = false;
      waktuTerakhirBergerak = Date.now();
    }
    // Jika pemain tidak bergerak dan sudah lewat waktu tidur
    else if (
      Date.now() - waktuTerakhirBergerak >= WAKTU_TIDUR &&
      !sedangTidur
    ) {
      pemain.gambar = catSleepImg;
      sedangTidur = true;
    }
    // Jika tidak bergerak tapi belum waktunya tidur
    else if (pemain.kecepatanX === 0 && !sedangTidur) {
      pemain.gambar = catStayImg;
    }
  }

  // Panggil fungsi update gambar
  updateGambar();

  // Geser background
  if (pemain.kecepatanX > 0) {
    // Bergerak ke kanan
    backgroundScroll -= SCROLL_SPEED;
  } else if (pemain.kecepatanX < 0) {
    // Bergerak ke kiri
    backgroundScroll += SCROLL_SPEED;
  }
}

// Fungsi Lompat
function lompat() {
  // Hanya bisa lompat jika di tanah
  if (pemain.diTanah) {
    pemain.kecepatanY = KEKUATAN_LOMPAT;
    pemain.diTanah = false;

    // Ubah gambar ke gambar bergerak saat melompat
    pemain.gambar = catMoveImg;

    // Reset waktu tidur
    waktuTerakhirBergerak = Date.now();
  }
  sedangTidur = false;
}

// Fungsi untuk menggambar karakter dengan border
function gambarKarakter(ctx) {
  // Gambar karakter
  ctx.drawImage(pemain.gambar, pemain.x, pemain.y, pemain.lebar, pemain.tinggi);

  // Gambar border karakter (garis pinggir)
  ctx.strokeStyle = "blue"; // Warna border karakter
  ctx.lineWidth = 2; // Lebar border
  ctx.strokeRect(pemain.x, pemain.y, pemain.lebar, pemain.tinggi); // Gambar rectangle border
}

function gambarRintangan(ctx) {
  // Gambar semua rintangan
  daftarRintangan.forEach((rintangan) => {
    rintangan.gambar(ctx); // Gambar rintangan biasa

    // Gambar border rintangan biasa
    ctx.strokeStyle = "yellow"; // Warna border
    ctx.lineWidth = 2; // Lebar border
    ctx.stroke(); // Gambar border pada lingkaran rintangan
  });

  // Gambar rintangan pengejar (bola ungu)
  if (rintanganPengejar) {
    rintanganPengejar.gambar(ctx); // Gambar rintangan pengejar
    // Gambar border pada rintangan pengejar
    ctx.strokeStyle = "yellow"; // Warna border
    ctx.lineWidth = 2; // Lebar border
    ctx.stroke(); // Gambar border pada lingkaran pengejar
  }
}

// Fungsi Gambar Permainan
function gambarPermainan() {
  // Periksa apakah gambar sudah dimuat
  if (!semuaGambarDimuat) return;

  // Buat mirror background jika belum ada
  if (!backgroundMirror) {
    backgroundMirror = createMirrorImage(backgroundImg);
  }

  // Periksa waktu diam
  let waktuSekarang = Date.now();

  // Filter rintangan yang sudah mencapai akhir
  daftarRintangan = daftarRintangan.filter(
    (rintangan) => !rintangan.sudahSampaiAkhir
  );

  daftarRintangan.forEach((rintangan) => {
    rintangan.update();
    rintangan.gambar(ctx);
  });

  // Kondisi untuk status tidur
  if (pemain.kecepatanX === 0 && pemain.kecepatanY === 0 && !sedangTidur) {
    // Jika tidak bergerak selama 5 detik
    if (waktuSekarang - waktuTerakhirBergerak >= WAKTU_TIDUR) {
      pemain.gambar = catSleepImg;
      sedangTidur = true;
    }

    // Setelah menggambar karakter
    ctx.strokeStyle = "blue";
    ctx.strokeRect(pemain.x, pemain.y, pemain.lebar, pemain.tinggi);
  }

  // Bersihkan Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gambar background berulang tak terbatas
  ctx.save();

  const lebarBackground = canvas.width;
  const totalBackground = 100; // Jumlah background yang akan di-render

  for (let i = -totalBackground; i < totalBackground; i++) {
    let gambarSekarang;

    // Tentukan gambar berdasarkan indeks
    if (i % 2 === 0) {
      gambarSekarang = backgroundImg;
    } else {
      gambarSekarang = backgroundMirror;
    }

    // Hitung posisi x
    let posisiX = backgroundScroll + i * lebarBackground;

    // Gambar background
    ctx.drawImage(gambarSekarang, posisiX, 0, lebarBackground, canvas.height);
  }

  // Gambar rintangan dan karakter
  gambarRintangan(ctx);
  gambarKarakter(ctx); // Gambar karakter dengan border

  ctx.restore();

  // Gerakkan Pemain
  gerakkanPemain();

  // Update dan Gambar Rintangan
  updateRintangan();
  gambarRintangan(ctx);

  // Periksa Tabrakan
  cekTabrakan();

  // Gambar karakter
  ctx.save();
  if (pemain.menghadapKanan) {
    ctx.translate(pemain.x + pemain.lebar, pemain.y);
    ctx.scale(-1, 1);
    ctx.drawImage(pemain.gambar, 0, 0, pemain.lebar, pemain.tinggi);
  } else {
    ctx.drawImage(
      pemain.gambar,
      pemain.x,
      pemain.y,
      pemain.lebar,
      pemain.tinggi
    );
  }
  ctx.restore();

  // Lanjutkan Animasi
  requestAnimationFrame(gambarPermainan);
}

// Loop Permainan
function loopPermainan() {
  // Mulai gambar permainan
  gambarPermainan();
}
// Event Listener Tombol untuk Sentuhan dan Mouse
function setupControls() {
  const leftButton = document.getElementById("left");
  const rightButton = document.getElementById("right");
  const upButton = document.getElementById("up");

  // Fungsi untuk start bergerak ke kiri
  function startMoveLeft() {
    pemain.kecepatanX = -pemain.kecepatan;
    pemain.menghadapKanan = false;
    waktuTerakhirBergerak = Date.now();
    sedangTidur = false;
  }

  // Fungsi untuk start bergerak ke kanan
  function startMoveRight() {
    pemain.kecepatanX = pemain.kecepatan;
    pemain.menghadapKanan = true;
    waktuTerakhirBergerak = Date.now();
    sedangTidur = false;
  }

  // Fungsi untuk stop bergerak
  function stopMove() {
    pemain.kecepatanX = 0;
    waktuTerakhirBergerak = Date.now();
  }

  // Event untuk tombol kiri
  leftButton.addEventListener("mousedown", startMoveLeft);
  leftButton.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Mencegah scroll/zoom
    startMoveLeft();
  });

  // Event untuk tombol kanan
  rightButton.addEventListener("mousedown", startMoveRight);
  rightButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startMoveRight();
  });

  // Event untuk tombol up/lompat
  upButton.addEventListener("mousedown", lompat);
  upButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    lompat();
  });

  // Events untuk stop bergerak
  document.addEventListener("mouseup", stopMove);
  document.addEventListener("touchend", stopMove);

  // Event Listener Keyboard
  document.addEventListener("keydown", function (event) {
    switch (event.code) {
      case "ArrowLeft":
        startMoveLeft();
        break;
      case "ArrowRight":
        startMoveRight();
        break;
      case "Space":
      case "ArrowUp":
        lompat();
        break;
    }
  });

  document.addEventListener("keyup", function (event) {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      stopMove();
    }
  });
}

// Panggil fungsi setup kontrol saat game dimuat
window.addEventListener("load", setupControls);
// Inisialisasi Permainan
muatGambar();
