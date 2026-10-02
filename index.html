<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OCR Scan to Excel (Offline PWA)</title>
  
  <!-- Konfigurasi PWA -->
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#10b981">
  <meta name="description" content="Aplikasi PWA Offline untuk Scan Foto/Gambar ke File Excel (.xlsx)">

  <!-- Library CDN (Untuk Offline total, simpan file JS ini secara lokal di folder proyek) -->
  <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      padding: 20px;
      max-width: 640px;
      margin: 0 auto;
      background-color: #f3f4f6;
      color: #1f2937;
      line-height: 1.5;
    }

    .card {
      background: #ffffff;
      padding: 24px;
      border-radius: 16px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    h2 {
      color: #059669;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 16px;
      text-align: center;
    }

    .btn-group {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #2563eb;
      color: #ffffff;
      padding: 12px 16px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      flex: 1;
      text-align: center;
      user-select: none;
      transition: background-color 0.2s, transform 0.1s;
    }

    .btn-action:active {
      transform: scale(0.98);
    }

    .btn-gallery {
      background-color: #7c3aed;
    }

    .btn-action:hover {
      opacity: 0.92;
    }

    input[type="file"] {
      display: none;
    }

    #status {
      padding: 10px 14px;
      border-radius: 8px;
      background-color: #eff6ff;
      color: #1d4ed8;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 16px;
      word-break: break-word;
      border: 1px solid #bfdbfe;
    }

    #status.error-msg {
      background-color: #fef2f2;
      color: #dc2626;
      border-color: #fecaca;
    }

    .options-group {
      margin-bottom: 16px;
      background: #f9fafb;
      padding: 12px 16px;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      color: #374151;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #10b981;
      cursor: pointer;
    }

    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .review-header h3 {
      font-size: 1rem;
      color: #374151;
    }

    textarea {
      width: 100%;
      height: 180px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875rem;
      line-height: 1.4;
      resize: vertical;
      outline: none;
      transition: border-color 0.2s;
    }

    textarea:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
    }

    button#exportBtn {
      background-color: #10b981;
      color: #ffffff;
      border: none;
      padding: 14px 20px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      width: 100%;
      margin-top: 16px;
      transition: background-color 0.2s, opacity 0.2s;
    }

    button#exportBtn:hover:not(:disabled) {
      background-color: #059669;
    }

    button:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
      opacity: 0.7;
    }
  </style>
</head>
<body>

  <div class="card">
    <h2>Scan Foto ke Excel</h2>
    
    <!-- Tombol Input Media -->
    <div class="btn-group">
      <label for="cameraInput" class="btn-action">📷 Kamera</label>
      <input type="file" id="cameraInput" accept="image/*" capture="environment">

      <label for="galleryInput" class="btn-action btn-gallery">🖼️ Galeri</label>
      <input type="file" id="galleryInput" accept="image/*">
    </div>

    <!-- Status Pemrosesan -->
    <div id="status">Siap memproses gambar...</div>
    
    <!-- Opsi Pemrosesan Excel -->
    <div class="options-group">
      <label class="checkbox-label">
        <input type="checkbox" id="useHeaderCheck" checked>
        <span>Gunakan baris pertama sebagai Header / Nama Kolom</span>
      </label>
    </div>

    <!-- Review & Edit Data -->
    <div class="review-header">
      <h3>Review Data Hasil Scan:</h3>
    </div>
    <textarea id="ocrOutput" placeholder="Data hasil scan akan muncul di sini... Anda juga dapat mengetik atau mengedit teks secara manual di sini."></textarea>
    
    <!-- Tombol Unduh Excel -->
    <button id="exportBtn" disabled>Download File Excel (.xlsx)</button>
  </div>

  <!-- Skrip Utama Aplikasi -->
  <script src="app.js"></script>
</body>
</html>