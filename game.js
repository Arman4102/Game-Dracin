// Dapatkan elemen canvas  
const canvas = document.getElementById('gameCanvas');  
const ctx = canvas.getContext('2d');  

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
    pesan: ""  
};  

// Tambahkan variabel global untuk mengontrol munculnya rintangan  
const JARAK_MUNCULKAN_RINTANGAN = 100; // Bisa disesuaikan  
let jarakSebelumRintangan = 0;  
let rintanganSudahMuncul = false;  

// Kelas Rintangan  
class Rintangan {  
    constructor(x, y) {  
        this.x = x;  
        this.y = y;  
        this.radius = 20; // Ukuran bola  
        this.kecepatanY = 0;  
        this.jatuh = true; // Langsung jatuh  
    }  

    update() {  
        // Gravitasi untuk jatuh  
        if (this.jatuh) {  
            this.kecepatanY += GRAVITASI_RINTANGAN;  
            this.y += this.kecepatanY;  
        }  
    }  

    gambar(ctx) {  
      // Gambar lingkaran dengan warna merah  
        ctx.beginPath();  
        ctx.fillStyle = 'red';  
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);  
        ctx.fill();  

        // Tambahkan kotak pembatas untuk debugging  
        ctx.strokeStyle = 'green';  
        ctx.strokeRect(  
            this.x - this.radius,   
            this.y - this.radius,   
            this.radius * 2,   
            this.radius * 2  
        );  
    }  
}  

// Karakter  
let pemain = {  
    x: 180,  
    y: canvas.height - 40,  
    lebar: 40,  
    tinggi: 40,  
    kecepatanX: 0,  
    kecepatanY: 0,  
    kecepatan: 1.25,  
    diTanah: true,  
    gambar: catStayImg,  
    menghadapKanan: false  
};  

// Fungsi Muat Gambar  
function muatGambar() {  
    backgroundImg.src = 'assets/background_game.png';  
    catMoveImg.src = 'assets/cat_move.png';  
    catSleepImg.src = 'assets/cat_sleep.png';  
    catStayImg.src = 'assets/cat_stay.png';  

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
    const mirrorCanvas = document.createElement('canvas');  
    mirrorCanvas.width = image.width;  
    mirrorCanvas.height = image.height;  
    const mirrorCtx = mirrorCanvas.getContext('2d');  

    mirrorCtx.scale(-1, 1);  
    mirrorCtx.drawImage(image, -image.width, 0);  

    return mirrorCanvas;  
}  

// Tambahan Fungsi Rintangan  
function tambahkanRintangan() {  
    // Posisi Y di bagian atas layar  
    let rintanganBaru = new Rintangan(canvas.width / 1.3, 10);  
    daftarRintangan.push(rintanganBaru);  
}  

function updateRintangan() {  
    // Hapus rintangan yang sudah keluar layar  
    daftarRintangan = daftarRintangan.filter(rintangan => rintangan.y < canvas.height + 50);  
    
    // Update setiap rintangan  
    daftarRintangan.forEach(rintangan => rintangan.update());  
}  

function gambarRintangan(ctx) {  
    daftarRintangan.forEach(rintangan => rintangan.gambar(ctx));  
}  

function cekTabrakan() {  
     daftarRintangan.forEach(rintangan => {  
        // Hitung jarak antara pusat karakter dan pusat rintangan  
        let jarakX = Math.abs(pemain.x + pemain.lebar/2 - rintangan.x);  
        let jarakY = Math.abs(pemain.y + pemain.tinggi/2 - rintangan.y);  

        // Tentukan ukuran area tabrakan  
        let lebarTabrakan = (pemain.lebar + rintangan.radius * 2) / 2.2;  
        let tinggiTabrakan = (pemain.tinggi + rintangan.radius * 2) / 2.5;  

        // Cek tabrakan  
        if (  
            jarakX < lebarTabrakan &&   
            jarakY < tinggiTabrakan  
        ) {  
            gameOver();  
        }  
    });  
}  

function gameOver() {  
      alert('Game Over!');  
    
    // Log status rintangan sebelum reset  
    console.log("Game Over - Rintangan Status Sebelum Reset:", {  
        jarakTempuh: jarakTempuh,  
        rintanganMuncul: rintanganSudahMuncul,  
        jumlahRintangan: daftarRintangan.length  
    });  

    resetPermainan(); 
}  

function resetPermainan() {  
    jarakTempuh = 0;  
    jarakSebelumRintangan = 0;  
    jarakKanan = 0;  // Reset jarak kanan  
    jarakKiri = 0;   // Reset jarak kiri  
    daftarRintangan = [];  
    rintanganSudahMuncul = false;  
    
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
    if (potensialX >= margin && potensialX <= canvas.width - pemain.lebar - margin) {  
        pemain.x = potensialX;  
    }  

    pemain.y += pemain.kecepatanY;  

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
        
        console.log("Jarak Kanan: " + jarakKanan.toFixed(2) + ", Jarak Kiri: " + jarakKiri.toFixed(2));  
    } else if (pemain.kecepatanX < 0) {  
        // Bergerak ke kiri  
        jarakKiri += Math.abs(pemain.kecepatanX);  
        jarakKanan = Math.max(0, jarakKanan - Math.abs(pemain.kecepatanX));  
        
        console.log("Jarak Kanan: " + jarakKanan.toFixed(2) + ", Jarak Kiri: " + jarakKiri.toFixed(2));  
    }  
    // Tambahkan logika jarak tempuh  
    if (pemain.kecepatanX > 0) {  
        jarakTempuh += Math.abs(pemain.kecepatanX);  
    }  

      
    // Tambahkan rintangan setelah bergerak sejauh tertentu  
    if (  
        pemain.kecepatanX > 0 && // Pastikan bergerak ke kanan  
        !rintanganSudahMuncul &&   
        jarakKanan - jarakSebelumRintangan >= JARAK_MUNCULKAN_RINTANGAN  
    ) {  
        // Tambahkan rintangan dengan posisi kustom  
        tambahkanRintangan(); // Posisi X dan Y bisa disesuaikan  
        
        rintanganSudahMuncul = true;  
        jarakSebelumRintangan = jarakKanan;  

        console.log("Rintangan Muncul di Jarak Kanan:", jarakKanan);  
    }  


     // Tambahkan rintangan hanya sekali saat mencapai jarak tertentu  
    if (jarakTempuh >= 200 && !rintanganSudahMuncul) {  
        tambahkanRintangan();  
        rintanganSudahMuncul = true;  
        
        // Debug log  
        debugRintangan.status = true;  
        debugRintangan.pesan = "Rintangan pertama muncul";  
        console.log("Rintangan Muncul:", debugRintangan);  
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
        else if (Date.now() - waktuTerakhirBergerak >= WAKTU_TIDUR && !sedangTidur) {  
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
        sedangTidur = false;  
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
    
    // Kondisi untuk status tidur  
    if (  
        pemain.kecepatanX === 0 &&   
        pemain.kecepatanY === 0 &&   
        !sedangTidur  
    ) {  
        // Jika tidak bergerak selama 5 detik  
        if (waktuSekarang - waktuTerakhirBergerak >= WAKTU_TIDUR) {  
            pemain.gambar = catSleepImg;  
            sedangTidur = true;  
        }  

         // Setelah menggambar karakter  
    ctx.strokeStyle = 'blue';  
    ctx.strokeRect(  
        pemain.x,   
        pemain.y,   
        pemain.lebar,   
        pemain.tinggi  
    );  

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
        let posisiX = backgroundScroll + (i * lebarBackground);  

        // Gambar background  
        ctx.drawImage(  
            gambarSekarang,   
            posisiX,   
            0,   
            lebarBackground,   
            canvas.height  
        );  
    }  

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
        ctx.drawImage(pemain.gambar, pemain.x, pemain.y, pemain.lebar, pemain.tinggi);  
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

// Event Listener Tombol  
document.getElementById('left').addEventListener('mousedown', () => {  
    pemain.kecepatanX = -pemain.kecepatan;  
    pemain.menghadapKanan = false;  
    waktuTerakhirBergerak = Date.now();  
    sedangTidur = false;  
});  

document.getElementById('right').addEventListener('mousedown', () => {  
    pemain.kecepatanX = pemain.kecepatan;  
    pemain.menghadapKanan = true;  
    waktuTerakhirBergerak = Date.now();  
    sedangTidur = false;  
});  

document.addEventListener('mouseup', () => {  
    pemain.kecepatanX = 0;  
    waktuTerakhirBergerak = Date.now();  
});  

// Event Listener Keyboard  
document.addEventListener('keydown', function(event) {  
    switch(event.code) {  
        case 'ArrowLeft':  
            pemain.kecepatanX = -pemain.kecepatan;  
            pemain.menghadapKanan = false;  
            waktuTerakhirBergerak = Date.now();  
            sedangTidur = false;  
            break;  
        case 'ArrowRight':  
            pemain.kecepatanX = pemain.kecepatan;  
            pemain.menghadapKanan = true;  
            waktuTerakhirBergerak = Date.now();  
            sedangTidur = false;  
            break;  
        case 'Space':  
        case 'ArrowUp':  
            lompat();  
            break;  
    }  
});  

document.addEventListener('keyup', function(event) {  
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {  
        pemain.kecepatanX = 0;  
        waktuTerakhirBergerak = Date.now();  
    }  
});  

// Event Listener untuk tombol Up  
document.getElementById('up').addEventListener('mousedown', () => {  
    lompat();  
});  

// Inisialisasi Permainan  
muatGambar();