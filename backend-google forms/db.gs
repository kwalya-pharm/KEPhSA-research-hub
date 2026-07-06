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

  const rawValue = String(value).split(",")[0].trim();

  if (!rawValue) {
    return "";
  }

  const match = rawValue.match(/(?:\/d\/|id=)([A-Za-z0-9_-]{10,})/);

  if (match && match[1]) {
    return match[1];
  }

  return rawValue;
}

function getPhotoUrl(value) {
  const fileId = getDriveFileId(value);

  if (!fileId) {
    return "";
  }

  try {
    const file = DriveApp.getFileById(fileId);

    file.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

    return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
  } catch (e) {
    return "";
  }
}

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Form Responses 1");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values.shift();
  const headerAliases = {
    "full name": "name",
    "name": "name",
    "upload your photo": "photo",
    "photo": "photo",
    "year of study": "year",
    "year": "year",
    "career ambitions": "career",
    "career": "career",
    "research interests": "interests",
    "interests": "interests",
    "current research project s": "projects",
    "current research projects": "projects",
    "projects": "projects",
    "research publications": "publications",
    "publications": "publications",
    "linkedin profile": "linkedin",
    "linkedin": "linkedin",
    "orcid": "orcid"
  };

  const photoColumn = headers.findIndex((header) => {
    return normalizeHeader(header) === "upload your photo" || normalizeHeader(header) === "photo";
  });

  const students = values.map((row) => {
    let student = {};

    headers.forEach((header, index) => {
      let value = row[index];

      if (index === photoColumn && value) {
        value = getPhotoUrl(value);
      }

      const normalizedHeader = normalizeHeader(header);
      const outputKey = headerAliases[normalizedHeader] || header;
      student[outputKey] = value;
    });

    return student;
  });

  return ContentService
    .createTextOutput(JSON.stringify(students))
    .setMimeType(ContentService.MimeType.JSON);
}