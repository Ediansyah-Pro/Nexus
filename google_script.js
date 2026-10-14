/**
 * google_script.js
 * 
 * Petunjuk Penggunaan:
 * 1. Buka Google Sheets Anda.
 * 2. Masuk ke Extensions (Ekstensi) > Apps Script.
 * 3. Hapus semua kode bawaan, lalu tempel kode di bawah ini.
 * 4. Simpan proyek, kemudian klik tombol "Deploy" > "New deployment".
 * 5. Pilih tipe "Web app", jalankan sebagai "Me" (Saya) dan akses untuk "Anyone" (Siapa saja).
 * 6. Salin URL Web App yang dihasilkan dan tempel di konfigurasi aplikasi Nexus.
 */

// Daftar Header Kolom A sampai W default jika membuat sheet baru
var DEFAULT_HEADERS = [
  "Ticket ID",
  "THC Ticket",
  "Vendor Ticket",
  "Infra Category",
  "Activity Type",
  "Status",
  "Severity",
  "Vendor",
  "Site / POP",
  "Link / Device",
  "Title",
  "Start Time",
  "End Time",
  "Actual Duration",
  "On Hold Duration",
  "SLA Duration",
  "Root Cause L1",
  "Root Cause L2",
  "Root Cause Detail",
  "Action",
  "Created By",
  "Closed By",
  "Timeline Docs"
];

// Header Kolom untuk Sheet Master Customer
var CUSTOMER_HEADERS = [
  "Customer ID",
  "Customer Name",
  "Segment",
  "PIC Name",
  "PIC Contact",
  "Address",
  "Status"
];

// Helper: Membuka sheet spesifik atau membuatnya jika belum ada
function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Resolusi nama sheet yang toleran terhadap variasi penamaan
  var targetName = "Tickets"; // Default awal
  
  if (sheetName) {
    var nameLower = sheetName.toLowerCase().replace(/\s+/g, '');
    if (nameLower === "tickets" || nameLower === "infraticket" || nameLower === "infra") {
      if (ss.getSheetByName("Infra Ticket")) targetName = "Infra Ticket";
      else if (ss.getSheetByName("Tickets")) targetName = "Tickets";
      else targetName = "Infra Ticket"; // Buat "Infra Ticket" jika belum ada
    } else if (nameLower === "corporate" || nameLower === "corporateticket") {
      if (ss.getSheetByName("Corporate Ticket")) targetName = "Corporate Ticket";
      else if (ss.getSheetByName("Corporate")) targetName = "Corporate";
      else targetName = "Corporate Ticket"; // Buat "Corporate Ticket" jika belum ada
    } else if (nameLower === "mastercustomer" || nameLower === "customer" || nameLower === "customers") {
      if (ss.getSheetByName("Master Customer")) targetName = "Master Customer";
      else if (ss.getSheetByName("Customer")) targetName = "Customer";
      else targetName = "Master Customer"; // Buat "Master Customer" jika belum ada
    }
  }
  
  var sheet = ss.getSheetByName(targetName);
  if (!sheet) {
    sheet = ss.insertSheet(targetName);
    var headersToUse = targetName.indexOf("Customer") > -1 ? CUSTOMER_HEADERS : DEFAULT_HEADERS;
    sheet.appendRow(headersToUse);
    // Format header agar tebal
    sheet.getRange(1, 1, 1, headersToUse.length).setFontWeight("bold").setBackground("#e2e8f0");
    
    // Jika membuat sheet Master Customer untuk pertama kali, tambahkan beberapa data awal agar tidak kosong
    if (targetName === "Master Customer") {
      sheet.appendRow(["CUST-001", "Dinas Kesehatan Kabupaten Kubu Raya", "Government", "Budi Hartono", "081234567890", "Jl. Arteri Supadio No. 10, Kubu Raya", "Active"]);
      sheet.appendRow(["CUST-002", "Dinas Kominfo Kabupaten Pontianak", "Government", "Siti Rahma", "siti.rahma@dinkes.go.id", "Jl. Ahmad Yani No. 5, Pontianak", "Active"]);
      sheet.appendRow(["CUST-003", "PT Bank Pembangunan Daerah Kalbar", "Finance", "Indra Wijaya", "08119876543", "Jl. Rahadi Usman No. 1, Pontianak", "Active"]);
    }
  }
  return sheet;
}

// Handler GET: Membaca seluruh data tiket dari sheet tertentu
function doGet(e) {
  var action = e.parameter.action;
  var sheetName = e.parameter.sheet || "Tickets"; // Mengambil parameter sheet
  
  if (action === "readAll" || !action) {
    return handleReadAll(sheetName);
  }
  
  return createJsonResponse({
    status: "error",
    message: "Aksi GET tidak dikenal"
  });
}

// Handler POST: Menulis, memperbarui, atau menghapus data tiket pada sheet tertentu
function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    var action = requestData.action;
    var sheetName = requestData.sheet || "Tickets"; // Mengambil parameter sheet dari payload POST
    
    if (action === "create") {
      return handleCreate(sheetName, requestData.data);
    } else if (action === "update") {
      return handleUpdate(sheetName, requestData.ticketId, requestData.data);
    } else if (action === "delete") {
      return handleDelete(sheetName, requestData.ticketId);
    }
    
    return createJsonResponse({
      status: "error",
      message: "Aksi POST tidak dikenal"
    });
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: "Gagal memproses request: " + error.toString()
    });
  }
}

// Helper: Memeriksa apakah sheet memiliki header di Baris 1
function checkSheetHasHeader(sheet, cleanHeaders) {
  if (sheet.getLastColumn() === 1) {
    var firstCell = cleanHeaders[0] ? cleanHeaders[0].toLowerCase() : "";
    if (firstCell !== "customer name" && firstCell !== "customer" && firstCell !== "pelanggan" && firstCell !== "name") {
      return false;
    }
  }
  return true;
}

// Fungsi Read All: Mengubah baris-baris sheet secara dinamis berdasarkan header asli di Baris 1
function handleReadAll(sheetName) {
  var sheet = getOrCreateSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  if (lastRow === 0 || lastCol === 0) {
    return createJsonResponse({
      status: "success",
      data: []
    });
  }
  
  // Ambil header asli dari kolom spreadsheet secara dinamis
  var sheetHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var cleanHeaders = sheetHeaders.map(function(h) {
    return h ? h.toString().trim() : "";
  });
  
  var hasHeader = checkSheetHasHeader(sheet, cleanHeaders);
  var startRow = hasHeader ? 2 : 1;
  var rowCount = hasHeader ? lastRow - 1 : lastRow;
  
  if (!hasHeader) {
    cleanHeaders = ["Customer Name"];
  }
  
  var data = [];
  if (rowCount > 0) {
    // Baca seluruh nilai dengan getDisplayValues agar teks durasi/tanggal tidak berubah
    var values = sheet.getRange(startRow, 1, rowCount, lastCol).getDisplayValues();
    
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      var item = {};
      var hasData = false;
      for (var j = 0; j < cleanHeaders.length; j++) {
        if (cleanHeaders[j]) {
          var val = row[j] !== undefined ? row[j] : "";
          item[cleanHeaders[j]] = val;
          if (val !== "") {
            hasData = true;
          }
        }
      }
      if (hasData) {
        data.push(item);
      }
    }
  }
  
  return createJsonResponse({
    status: "success",
    data: data
  });
}

// Fungsi Create: Menyimpan baris tiket baru dengan memetakan kolom secara dinamis ke header sheet
function handleCreate(sheetName, data) {
  var sheet = getOrCreateSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  if (lastRow === 0 || lastCol === 0) {
    // Jika sheet kosong, append header virtual
    sheet.appendRow(["Customer Name"]);
    sheet.appendRow([data["Customer Name"] || ""]);
    return createJsonResponse({
      status: "success",
      message: "Data berhasil disimpan"
    });
  }
  
  var sheetHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var cleanHeaders = sheetHeaders.map(function(h) {
    return h ? h.toString().trim() : "";
  });
  
  var hasHeader = checkSheetHasHeader(sheet, cleanHeaders);
  
  if (hasHeader) {
    // Susun baris baru mengikuti urutan header yang ada di sheet
    var newRow = [];
    for (var i = 0; i < cleanHeaders.length; i++) {
      var key = cleanHeaders[i];
      newRow.push(data[key] !== undefined ? data[key] : "");
    }
    sheet.appendRow(newRow);
  } else {
    // Jika tidak ada header (Master Customer kolom tunggal)
    var newValue = data["Customer Name"] || data["Customer ID"] || "";
    sheet.appendRow([newValue]);
  }
  
  return createJsonResponse({
    status: "success",
    message: "Data berhasil disimpan ke Google Sheet [" + sheetName + "]"
  });
}

// Fungsi Update: Mencari Ticket ID secara dinamis, lalu memperbarui baris mengikuti header sheet
function handleUpdate(sheetName, ticketId, data) {
  var sheet = getOrCreateSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  if (lastRow === 0 || lastCol === 0) {
    return createJsonResponse({
      status: "error",
      message: "Database kosong, tidak bisa mengupdate"
    });
  }
  
  var sheetHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var cleanHeaders = sheetHeaders.map(function(h) {
    return h ? h.toString().trim() : "";
  });
  
  var hasHeader = checkSheetHasHeader(sheet, cleanHeaders);
  var startRow = hasHeader ? 2 : 1;
  var rowCount = hasHeader ? lastRow - startRow + 1 : lastRow;
  
  var idColIndex = 0;
  if (hasHeader) {
    idColIndex = cleanHeaders.indexOf("Ticket ID");
    if (idColIndex === -1) idColIndex = cleanHeaders.indexOf("Customer ID");
    if (idColIndex === -1) idColIndex = cleanHeaders.indexOf("ID");
    if (idColIndex === -1) idColIndex = 0; // Fallback ke kolom pertama
  }
  
  var ids = sheet.getRange(startRow, idColIndex + 1, rowCount, 1).getValues();
  var targetRowIndex = -1;
  
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0].toString() === ticketId.toString()) {
      targetRowIndex = i + startRow;
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    return createJsonResponse({
      status: "error",
      message: "Data dengan ID " + ticketId + " tidak ditemukan di Sheet [" + sheetName + "]"
    });
  }
  
  if (hasHeader) {
    // Susun data baru sesuai urutan header asli spreadsheet
    var updatedRow = [];
    for (var j = 0; j < cleanHeaders.length; j++) {
      var key = cleanHeaders[j];
      updatedRow.push(data[key] !== undefined ? data[key] : "");
    }
    // Tulis ulang baris tersebut
    sheet.getRange(targetRowIndex, 1, 1, cleanHeaders.length).setValues([updatedRow]);
  } else {
    // Jika tidak ada header (Master Customer kolom tunggal)
    var newValue = data["Customer Name"] || data["Customer ID"] || "";
    sheet.getRange(targetRowIndex, 1).setValue(newValue);
  }
  
  return createJsonResponse({
    status: "success",
    message: "Data " + ticketId + " berhasil diperbarui di Sheet [" + sheetName + "]"
  });
}

// Fungsi Delete: Mencari Ticket ID secara dinamis, lalu menghapus barisnya
function handleDelete(sheetName, ticketId) {
  var sheet = getOrCreateSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  
  if (lastRow === 0 || lastCol === 0) {
    return createJsonResponse({
      status: "error",
      message: "Database kosong"
    });
  }
  
  var sheetHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var cleanHeaders = sheetHeaders.map(function(h) {
    return h ? h.toString().trim() : "";
  });
  
  var hasHeader = checkSheetHasHeader(sheet, cleanHeaders);
  var startRow = hasHeader ? 2 : 1;
  var rowCount = hasHeader ? lastRow - startRow + 1 : lastRow;
  
  var idColIndex = 0;
  if (hasHeader) {
    idColIndex = cleanHeaders.indexOf("Ticket ID");
    if (idColIndex === -1) idColIndex = cleanHeaders.indexOf("Customer ID");
    if (idColIndex === -1) idColIndex = cleanHeaders.indexOf("ID");
    if (idColIndex === -1) idColIndex = 0;
  }
  
  var ids = sheet.getRange(startRow, idColIndex + 1, rowCount, 1).getValues();
  var targetRowIndex = -1;
  
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0].toString() === ticketId.toString()) {
      targetRowIndex = i + startRow;
      break;
    }
  }
  
  if (targetRowIndex === -1) {
    return createJsonResponse({
      status: "error",
      message: "Data dengan ID " + ticketId + " tidak ditemukan di Sheet [" + sheetName + "]"
    });
  }
  
  // Hapus baris dari sheet
  sheet.deleteRow(targetRowIndex);
  
  return createJsonResponse({
    status: "success",
    message: "Data " + ticketId + " berhasil dihapus dari Sheet [" + sheetName + "]"
  });
}

// Helper: Membuat response JSON
function createJsonResponse(data) {
  var output = JSON.stringify(data);
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}
