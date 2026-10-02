// Register Service Worker untuk PWA Offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('Service Worker Active'))
    .catch(err => console.error('SW Error:', err));
}

const cameraInput = document.getElementById('cameraInput');
const galleryInput = document.getElementById('galleryInput');
const statusDiv = document.getElementById('status');
const ocrOutput = document.getElementById('ocrOutput');
const exportBtn = document.getElementById('exportBtn');
const useHeaderCheck = document.getElementById('useHeaderCheck');

// Aktifkan tombol download jika ada teks di textarea
ocrOutput.addEventListener('input', () => {
  exportBtn.disabled = ocrOutput.value.trim().length === 0;
});

// 1. Fungsi Pembersihan Karakter Sampah/Noise dari Hasil OCR
function cleanOCRText(text) {
  return text
    .split('\n')
    // Hapus baris yang hanya berisi 1-2 karakter simbol/sampah
    .filter(line => line.trim().length > 2 || /\d/.test(line))
    .map(line => {
      return line
        // Bersihkan simbol-simbol tidak beraturan yang sering muncul dari OCR
        .replace(/[|~`_=\\]/g, ' ')
        // Rapikan spasi berlebih
        .replace(/\s+/g, ' ')
        .trim();
    })
    .join('\n');
}

// 2. Fungsi Pemisah Kolom Pintar & Rapi
function splitLineToColumns(line) {
  // Jika baris berisi karakter koma (CSV)
  if (line.includes(',')) {
    return line.split(',').map(c => c.trim()).filter(c => c !== '');
  }
  // Jika baris berisi titik dua (Formulir)
  if (line.includes(':')) {
    return line.split(':').map(c => c.trim()).filter(c => c !== '');
  }
  // Pisahkan berdasarkan tab atau 2/lebih spasi berurutan (Tabel)
  const parts = line.split(/\s{2,}|\t/).map(c => c.trim()).filter(c => c !== '');
  
  if (parts.length > 1) {
    return parts;
  }
  
  // Jika tidak terpisah, coba pisahkan berdasarkan pola Angka / NIK / Nama jika ada
  return line.split(/\s+/).filter(c => c.length > 0);
}

// 3. Konversi Teks ke Objek Excel
function parseTextToExcelData(rawText, useHeader) {
  const cleanText = cleanOCRText(rawText);
  const lines = cleanText.split('\n').filter(l => l.trim() !== '');

  if (lines.length === 0) return [];

  if (useHeader && lines.length > 1) {
    const headers = splitLineToColumns(lines[0]);
    const dataRows = lines.slice(1);

    return dataRows.map(line => {
      const cells = splitLineToColumns(line);
      const rowObj = {};

      headers.forEach((header, index) => {
        const colKey = header || `Kolom ${index + 1}`;
        rowObj[colKey] = cells[index] !== undefined ? cells[index] : '';
      });

      // Jika jumlah sel melebihi header
      if (cells.length > headers.length) {
        for (let i = headers.length; i < cells.length; i++) {
          rowObj[`Kolom Extra ${i + 1}`] = cells[i];
        }
      }

      return rowObj;
    });
  } else {
    return lines.map(line => {
      const cells = splitLineToColumns(line);
      const rowObj = {};
      cells.forEach((cell, idx) => {
        rowObj[`Kolom ${idx + 1}`] = cell;
      });
      return rowObj;
    });
  }
}

// 4. Proses OCR dengan Konfigurasi Khusus Blok Tabel (PSM 6)
async function processImage(file) {
  if (!file) return;

  statusDiv.className = '';
  statusDiv.innerText = 'Menyiapkan modul OCR...';
  exportBtn.disabled = true;
  ocrOutput.value = '';

  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          const progress = Math.round((m.progress || 0) * 100);
          statusDiv.innerText = `Menganalisis dan merapikan tabel: ${progress}%`;
        }
      }
    });

    // SETTING KHUSUS: PSM 6 memaksa OCR membaca gambar sebagai blok teks/tabel bersatu
    await worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
    });

    statusDiv.innerText = 'Memproses pembacaan gambar...';
    const ret = await worker.recognize(file);
    await worker.terminate();

    const rawResult = ret.data ? ret.data.text : '';
    const cleanedResult = cleanOCRText(rawResult);

    if (!cleanedResult || cleanedResult.trim() === '') {
      statusDiv.className = 'error-msg';
      statusDiv.innerText = 'Teks tidak terdeteksi dengan jelas. Pastikan foto terang, fokus, dan tegak.';
    } else {
      ocrOutput.value = cleanedResult;
      statusDiv.innerText = 'Scan berhasil! Data telah dirapikan. Anda dapat mengedit teks sebelum mengunduh.';
      exportBtn.disabled = false;
    }
  } catch (err) {
    console.error("OCR Error:", err);
    statusDiv.className = 'error-msg';
    statusDiv.innerText = 'Gagal memproses gambar: ' + (err.message || 'Terjadi kesalahan OCR');
  }
}

// Event Listeners Input Foto
cameraInput.addEventListener('change', (e) => processImage(e.target.files[0]));
galleryInput.addEventListener('change', (e) => processImage(e.target.files[0]));

// 5. Ekspor Excel (.xlsx) dengan Format Kolom Rapi
exportBtn.addEventListener('click', () => {
  const currentText = ocrOutput.value;
  if (!currentText.trim()) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  try {
    const useHeader = useHeaderCheck.checked;
    const excelData = parseTextToExcelData(currentText, useHeader);

    if (excelData.length === 0) {
      alert("Format teks tidak dapat dikonversi.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Mengatur lebar kolom otomatis
    const allKeys = Object.keys(excelData[0] || {});
    worksheet['!cols'] = allKeys.map(key => {
      const maxLen = Math.max(
        key.length,
        ...excelData.map(r => (r[key] ? r[key].toString().length : 0))
      );
      return { wch: Math.min(Math.max(maxLen + 3, 12), 40) }; // Batas lebar minimal 12, maksimal 40
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Scan");

    // Unduh File
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hasil_Scan_Rapi_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);

  } catch (err) {
    console.error("Export Error:", err);
    alert("Gagal mengunduh Excel: " + err.message);
  }
});
