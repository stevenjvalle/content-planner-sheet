function setupPlannerSheet() {
  const ss = SpreadsheetApp.getActive();

  // === Sheet 1: Proposal Form ===
  const proposalSheet = ss.insertSheet("Proposal Form");
  const headers = [
    "Date", "Time", "Title", "Team", "Platform", "Description", "Status"
  ];
  proposalSheet.appendRow(headers);

  // Data Validation: Status Dropdown
  const statusRange = proposalSheet.getRange("G2:G1000");
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "Approved", "Rejected"])
    .setAllowInvalid(false)
    .build();
  statusRange.setDataValidation(statusRule);

  // Data Validation: Team Dropdown
  const teamRange = proposalSheet.getRange("D2:D1000");
  const teamRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Digital Media", "Marketing"])
    .setAllowInvalid(false)
    .build();
  teamRange.setDataValidation(teamRule);

  // Data Validation: Platform Dropdown
  const platformRange = proposalSheet.getRange("E2:E1000");
  const platformRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Instagram", "LinkedIn", "YouTube", "Facebook", "Email"])
    .setAllowInvalid(false)
    .build();
  platformRange.setDataValidation(platformRule);

  // === Sheet 2: Approved Events Log ===
  const logSheet = ss.insertSheet("Approved Events Log");
  logSheet.appendRow(headers);

  // === Sheet 3: Timeline View ===
  const timelineSheet = ss.insertSheet("Timeline View");
  timelineSheet.appendRow(["Date", "Time", "Team", "Title", "Platform", "Status"]);

  // === Sheet 4: Pending Approval (Optional View) ===
  const pendingSheet = ss.insertSheet("Pending Approval");
  pendingSheet.getRange("A1").setValue("Use a filter view to show only 'Pending' rows from Proposal Form.");

  // Optionally delete the default "Sheet1" if still present
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet) ss.deleteSheet(defaultSheet);

  SpreadsheetApp.getUi().alert("Planner Sheet setup complete.");
}
function installOnEditTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t => t.getHandlerFunction() === 'onEdit');

  if (!exists) {
    ScriptApp.newTrigger('onEdit')
      .forSpreadsheet(SpreadsheetApp.getActive())
      .onEdit()
      .create();
    Logger.log('✅ Installable onEdit trigger installed.');
  } else {
    Logger.log('ℹ️ Trigger already exists.');
  }
}