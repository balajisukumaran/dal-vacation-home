function importJSON() {
  // Get the active sheet in the active spreadsheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // URL of the JSON data endpoint
  const url = 'https://588cr4cfe7.execute-api.us-east-1.amazonaws.com/userDetails/fetchUsers';

  // Fetch the response from the URL
  const response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
  
  // Parse the JSON response
  const responseData = JSON.parse(response.getContentText());
  Logger.log(responseData);
  const data = responseData;
  Logger.log(data);

  // Clear the existing content in the sheet
  sheet.clear();

  // Set the headers for the sheet
  sheet.appendRow(['userId', 'isAgent', 'name', 'createdAt', 'email', 'updatedAt']);

  // Populate the sheet with data
  data.forEach((item, index) => {
    const row = index + 2; // Start from the second row
    
    // Append the row with user details
    sheet.appendRow([
      item.userId,
      item.isAgent,
      item.name,
      item.createdAt,
      item.email,
      item.updatedAt
    ]);

  });
}
