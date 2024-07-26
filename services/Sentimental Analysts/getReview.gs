function importJSON() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const url = 'https://588cr4cfe7.execute-api.us-east-1.amazonaws.com/userDetails/fetchReviews'; // API Gateway

  const response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
  
  const responseData = JSON.parse(response.getContentText());
  Logger.log(responseData);
  const data = responseData;
  Logger.log(data);

  // Clear the existing content
  sheet.clear();

  // Set headers
  sheet.appendRow(['UserId', 'ReviewId', 'Date', 'Review', 'Polarity', 'Sentiment']);

  // Populate the sheet with data
  data.forEach((item, index) => {
    sheet.appendRow([
      item.UserId,
      item.ReviewId,
      item.Date,
      item.Review,
      item.Polarity,
      item.Sentiment
    ]);
  });
}