var googleDocId = "{YOUR_FORM_ID}";
var emailField = 'Email Address'; // This is the recipient's email
var emailSubject = "Your Email's Subject";
var emailStatus = 'Date sent';

var sheet = SpreadsheetApp.getActiveSheet();

function sendEmail() {
  var emailTemplate = DocumentApp.openById(googleDocId).getText(); // Get your email template from Google Docs
  var data = getCols(2, sheet.getLastRow() - 1);
  var myVars = getCols(1, 1)[0]; // Your column headers will be the variables used in your template
  var sentRow = myVars.indexOf(emailStatus) + 1;

  
  // Work through each data row in the spreadsheet
  data.forEach(function(row, index){
    // Build a configuration for each row
    var config = createConfig(myVars, row);
    
    // Prevent from sending duplicates and from sending emails without a recipient
    if (config[emailStatus] === '' && config[emailField]) {
      // Replace template variables with the form's data
      var emailBody = replaceTemplateVars(emailTemplate, config);
      // Replace template variables in subject line
      var emailSubjectUpdated = replaceTemplateVars(emailSubject, config); 

      GmailApp.sendEmail(
        config[emailField], // recipient - use your own email if you want responses automatically emailed to you
        emailSubjectUpdated, // subject
        emailBody // body
      );

      sheet.getRange(2 + index, sentRow).setValue(new Date()); // Update the last column to show when sent
      SpreadsheetApp.flush(); // Make sure the last cell is updated right away
    }
  });
}

function replaceTemplateVars(string, config) {
  return string.replace(/{[^{}]+}/g, function(key){
    return config[key.replace(/[{}]+/g, "")] || "";
  });
}

function createConfig(myVars, row) {
  return myVars.reduce(function(obj, myVar, index) {
    obj[myVar] = row[index];
    
    return obj;
  }, {});
}

function getCols(startRow, numRows) {
  var lastColumn = sheet.getLastColumn();
  var dataRange = sheet.getRange(startRow, 1, numRows, lastColumn)
  return dataRange.getValues();
}

function callAPIGateway(email) {
  var data = {
    'email': email
  };
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };
  UrlFetchApp.fetch('{API URL}', options);
}