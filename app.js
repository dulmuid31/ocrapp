// Register Service Worker
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

// Aktifkan tombol download jika ada isi teks di textarea
ocrOutput.addEventListener('input', () => {
  exportBtn.disabled = ocrOutput.value.trim().length === 0;
});

function splitLineIntoCells(line) {
  if (line.includes(',')) {
    return line.split(',').map(cell => cell.trim());
  } else if (line.includes(':')) {
    return line.split(':').map(cell => cell.trim());
  } else if (/\s{2,}/.test(line)) {
    return line.split(/\s{2,}/).map(cell => cell.trim());
  } else {
    return line.split(/\s+/).map(cell => cell.trim());
  }
}

function parseOCRToExcelData(rawText, useHeader) {
  const lines = rawText.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  if (useHeader && lines.length > 1) {
    const headers = splitLineIntoCells(lines[0]);
    const dataRows = lines.slice(1);

    return dataRows.map((line) => {
      const cells = splitLineIntoCells(line);
      const rowObj = {};

      headers.forEach((headerName, index) => {
        const key = headerName || `Kolom ${index + 1}`;
        rowObj[key] = cells[index] !== undefined ? cells[index] : '';
      });

      if (cells.length > headers.length) {
        for (let i = headers.length; i < cells.length; i++) {
          rowObj[`Kolom ${i + 1}`] = cells[i];
        }
      }

      return rowObj;
    });
  } else {
    return lines.map((line) => {
      const cells = splitLineIntoCells(line);
      const rowObj = {};
      cells.forEach((cell, colIndex) => {
        rowObj[`Kolom ${colIndex + 1}`] = cell;
      });
      return rowObj;
    });
  }
}

// Fungsi Utama OCR dengan Progres Tracker & Fallback CDN
async function processImage(file) {
  if (!file) return;

  statusDiv.className = '';
  statusDiv.innerText = 'Menyiapkan modul OCR...';
  exportBtn.disabled = true;
  ocrOutput.value = '';

  try {
    // Inisialisasi Tesseract dengan event logger untuk memantau progres
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        console.log(m);
        if (m.status === 'loading tesseract core') {
          statusDiv.innerText = 'Memuat engine Tesseract...';
        } else if (m.status === 'initializing tesseract') {
          statusDiv.innerText = 'Inisialisasi bahasa (ENG)...';
        } else if (m.status === 'recognizing text') {
          const progress = Math.round((m.progress || 0) * 100);
          statusDiv.innerText = `Membaca teks gambar: ${progress}%`;
        }
      }
    });

    statusDiv.innerText = 'Memproses analisis OCR...';
    const ret = await worker.recognize(file);
    await worker.terminate();

    const resultText = ret.data ? ret.data.text : '';

    if (!resultText || resultText.trim() === '') {
      statusDiv.className = 'error-msg';
      statusDiv.innerText = 'Gambar terbaca tetapi tidak ditemukan teks. Coba gunakan foto yang lebih terang/jelas.';
    } else {
      ocrOutput.value = resultText;
      statusDiv.innerText = 'Scan selesai! Teks berhasil diekstrak.';
      exportBtn.disabled = false;
    }
  } catch (err) {
    console.error("OCR Error:", err);
    statusDiv.className = 'error-msg';
    statusDiv.innerText = 'Gagal memproses OCR: ' + (err.message || 'Pastikan terhubung ke internet saat pertama kali menggunakan.');
  }
}

cameraInput.addEventListener('change', (e) => processImage(e.target.files[0]));
galleryInput.addEventListener('change', (e) => processImage(e.target.files[0]));

// Ekspor Excel via Blob URL
exportBtn.addEventListener('click', () => {
  const currentText = ocrOutput.value;
  if (!currentText.trim()) {
    alert("Tidak ada teks untuk diekspor!");
    return;
  }

  try {
    const useHeader = useHeaderCheck.checked;
    const excelData = parseOCRToExcelData(currentText, useHeader);

    if (excelData.length === 0) {
      alert("Teks tidak dapat dikonversi ke format tabel.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-fit lebar kolom
    const allKeys = Object.keys(excelData[0] || {});
    worksheet['!cols'] = allKeys.map(key => {
      const maxLen = Math.max(
        key.length,
        ...excelData.map(r => (r[key] ? r[key].toString().length : 0))
      );
      return { wch: maxLen + 4 };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Scan");

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hasil_Scan_${Date.now()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);

  } catch (err) {
    console.error("Export Error:", err);
    alert("Gagal mengunduh file Excel: " + err.message);
  }
});
