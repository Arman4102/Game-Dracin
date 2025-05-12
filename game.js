// Dapatkan elemen canvas  
const canvas = document.getElementById('gameCanvas');  
const ctx = canvas.getContext('2d');  

// Konfigurasi Game  
const GRAVITASI = 0.5;  
const KEKUATAN_LOMPAT = -10;  
const WAKTU_TIDUR = 5000; // 5 detik  

// Gambar  
const backgroundImg = new Image();  
const catMoveImg = new Image();  
const catSleepImg = new Image();  
const catStayImg = new Image();  

// Flag untuk memastikan semua gambar dimuat  
let semuaGambarDimuat = false;  

// Muat Gambar  
function muatGambar() {  
    return new Promise((resolve) => {  
        let gambarDimuat = 0;  
        const totalGambar = 4;  

        function cekSelesai() {  
            gambarDimuat++;  
            if (gambarDimuat === totalGambar) {  
                semuaGambarDimuat = true;  
                resolve();  
            }  
        }  

        backgroundImg.onload = cekSelesai;  
        catMoveImg.onload = cekSelesai;  
        catSleepImg.onload = cekSelesai;  
        catStayImg.onload = cekSelesai;  

        backgroundImg.src = 'assets/background_game.png';  
        catMoveImg.src = 'assets/cat_move.png';  
        catSleepImg.src = 'assets/cat_sleep.png';  
        catStayImg.src = 'assets/cat_stay.png';  
    });  
}  

// Variabel untuk melacak waktu diam  
let waktuTerakhirBergerak = Date.now();  
let sedangTidur = false;  

// Background Scrolling  
let backgroundScroll = 0;  
const SCROLL_SPEED = 5;  

// Karakter  
let pemain = {  
    x: 180,  
    y: canvas.height - 40,  
    lebar: 40,  
    tinggi: 40,  
    kecepatanX: 0,  
    kecepatanY: 0,  
    kecepatan: 2,  
    diTanah: true,  
    gambar: catStayImg,  
    menghadapKanan: false  
};  

// Fungsi untuk membuat gambar mirror  
function createMirrorImage(img) {  
    const mirrorCanvas = document.createElement('canvas');  
    mirrorCanvas.width = img.width;  
    mirrorCanvas.height = img.height;  
    const mirrorCtx = mirrorCanvas.getContext('2d');  
    
    // Balik gambar  
    mirrorCtx.translate(img.width, 0);  
    mirrorCtx.scale(-1, 1);  
    mirrorCtx.drawImage(img, 0, 0);  
    
    return mirrorCanvas;  
}  

// Variabel untuk background mirror  
let backgroundMirror;  

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


// Modifikasi event listener untuk memastikan perubahan gambar  
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

// Hentikan Gerakan  
document.addEventListener('mouseup', () => {  
    pemain.kecepatanX = 0;  
    waktuTerakhirBergerak = Date.now();  
});  

// Tambahkan event listener keyboard serupa  
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
    }  
});  

document.addEventListener('keyup', function(event) {  
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {  
        pemain.kecepatanX = 0;  
        waktuTerakhirBergerak = Date.now();  
    }  
});

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
}  

function lompat(event) {  
    // Mencegah perilaku default  
    if (event) {  
        event.preventDefault();  
    }  

    // Debug: Tambahkan log untuk memastikan lompatan  
    console.log('Lompat dipanggil');  
    console.log('Status diTanah:', pemain.diTanah);  

    // Hanya bisa lompat jika di tanah  
    if (pemain.diTanah) {  
        // Debug: Konfirmasi lompatan  
        console.log('Lompatan dilakukan');  

        // Berikan kecepatan vertikal ke atas (negatif)  
        // Pastikan memberikan dorongan yang cukup kuat  
        pemain.kecepatanY = KEKUATAN_LOMPAT;  
        
        // Set diTanah ke false  
        pemain.diTanah = false;  
        
        // Ganti gambar  
        pemain.gambar = catMoveImg;  
        
        // Debug: Tampilkan posisi Y setelah lompat  
        console.log('Posisi Y setelah lompat:', pemain.y);  
        
        // Reset status tidur  
        sedangTidur = false;  
        waktuTerakhirBergerak = Date.now();  
    } else {  
        console.log('Tidak bisa lompat - tidak di tanah');  
    }  
}  

// Modifikasi event listener untuk tombol lompat  
document.getElementById('up').addEventListener('click', function(event) {  
    // Pastikan event dijalankan  
    lompat(event);  
}, { passive: false });  // non-passive untuk preventDefault  

// Tambahkan dukungan keyboard dengan opsi yang sama  
document.addEventListener('keydown', function(event) {  
    if (event.code === 'Space') {  
        event.preventDefault();  
        lompat(event);  
    }  
});

// Loop Permainan  
function loopPermainan() {  
    gerakkanPemain();  
    gambarPermainan();  
    requestAnimationFrame(loopPermainan);  
}  

// Inisialisasi Permainan  
async function inisialisasiPermainan() {  
    await muatGambar();  
    loopPermainan();  
}  

// Kontrol Gerakan  
document.getElementById('left').addEventListener('mousedown', () => {  
    pemain.kecepatanX = -pemain.kecepatan;  
    pemain.gambar = catMoveImg;  // Pastikan gambar berubah saat bergerak ke kiri  
    pemain.menghadapKanan = false;  
    
    // Reset status tidur  
    sedangTidur = false;  
    waktuTerakhirBergerak = Date.now();  
});  

document.getElementById('right').addEventListener('mousedown', () => {  
    pemain.kecepatanX = pemain.kecepatan;  
    pemain.gambar = catMoveImg;  // Pastikan gambar berubah saat bergerak ke kanan  
    pemain.menghadapKanan = true;  
    
    // Reset status tidur  
    sedangTidur = false;  
    waktuTerakhirBergerak = Date.now();  
});   

document.getElementById('up').addEventListener('click', lompat);  

// Hentikan Gerakan  
document.addEventListener('mouseup', () => {  
    pemain.kecepatanX = 0;  
    pemain.gambar = catStayImg;  
    
    // Perbarui waktu terakhir bergerak  
    waktuTerakhirBergerak = Date.now();  
});   

// Tambahan: Keyboard support  
document.addEventListener('keydown', (event) => {  
    if (event.code === 'Space') {  
        event.preventDefault();  
        lompat(event);  
    }  
});  

// Mulai Permainan  
inisialisasiPermainan();