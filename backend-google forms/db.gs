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

  const photoColumn = headers.indexOf("Upload your photo");

  const students = values.map(row => {

    let student = {};

    headers.forEach((header, index) => {

      let value = row[index];

      // Handle uploaded photo
      if (index === photoColumn && value) {

        try {

          const fileId = value.toString().split(",")[0].trim();

          const file = DriveApp.getFileById(fileId);

          // Make photo viewable by anyone
          file.setSharing(
            DriveApp.Access.ANYONE_WITH_LINK,
            DriveApp.Permission.VIEW
          );

          value =
            "https://drive.google.com/thumbnail?id=" +
            fileId +
            "&sz=w1000";

        } catch (e) {

          value = "";

        }

      }

      student[header] = value;

    });

    return student;

  });

  return ContentService
    .createTextOutput(JSON.stringify(students))
    .setMimeType(ContentService.MimeType.JSON);

}