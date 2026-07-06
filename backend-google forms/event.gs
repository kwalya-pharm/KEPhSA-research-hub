function normalizeHeader(header) {
  return String(header || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getDriveFileId(value) {
  if (!value) {
    return "";
  }

  var rawValue = String(value || "").split(",")[0].trim();
  if (!rawValue) {
    return "";
  }

  var match = rawValue.match(/(?:\/d\/|id=)([A-Za-z0-9_-]{10,})/i);
  if (match && match[1]) {
    return match[1];
  }

  return rawValue;
}

function getImageUrl(value) {
  var fileId = getDriveFileId(value);
  if (!fileId) {
    return "";
  }

  try {
    var file = DriveApp.getFileById(fileId);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
  } catch (e) {
    return String(value || "");
  }
}

function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var headers = values.shift().map(normalizeHeader);
  var aliasMap = {
    "title": "Title",
    "description": "Description",
    "date": "Date",
    "time": "Time",
    "venue": "Venue",
    "published": "Published",
    "image": "Image",
    "image url": "Image",
    "imageurl": "Image",
    "picture": "Image"
  };

  var events = [];

  values.forEach(function(row) {
    var item = {};

    headers.forEach(function(header, index) {
      var key = aliasMap[header] || header;
      item[key] = row[index];
    });

    if (String(item["Published"] || "").toUpperCase() !== "YES") {
      return;
    }

    events.push({
      Title: String(item["Title"] || "").trim(),
      Description: String(item["Description"] || "").trim(),
      Date: String(item["Date"] || "").trim(),
      Time: String(item["Time"] || "").trim(),
      Venue: String(item["Venue"] || "").trim(),
      Image: getImageUrl(item["Image"])
    });
  });

  return ContentService
    .createTextOutput(JSON.stringify(events))
    .setMimeType(ContentService.MimeType.JSON);
}
