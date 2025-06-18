function myFunction() {
  
}

function onEdit(e) {
  const sheetName = "Proposal Form";
  const logSheetName = "Approved Events Log";

  const sheet = e.source.getSheetByName(sheetName);
  const editedRange = e.range;

  if (sheet.getName() !== sheetName || editedRange.getColumn() !== 7 || editedRange.getRow() === 1) return;

  const status = editedRange.getValue();
  if (status !== "Approved") return;

  const row = editedRange.getRow();
  const rowData = sheet.getRange(row, 1, 1, 7).getValues()[0];
  const [dateStr, timeStr, title, team, platform, description] = rowData;
  const feedbackCell = sheet.getRange(row, 8);

  const props = PropertiesService.getScriptProperties();
  const calendarId = props.getProperty(`CALENDAR_ID_${team.toUpperCase().replace(" ", "_")}`);
  if (!calendarId) {
    feedbackCell.setNote("❌ No calendar ID found for team.");
    return;
  }

  // Convert date and time separately
  const rawDate = sheet.getRange(row, 1).getValue(); // Date
  const rawTime = sheet.getRange(row, 2).getValue(); // Time

  if (!(rawDate instanceof Date) || !(rawTime instanceof Date)) {
    feedbackCell.setNote("❌ Invalid date or time format.");
    return;
  }

  const eventDateTime = new Date(rawDate);
  eventDateTime.setHours(rawTime.getHours(), rawTime.getMinutes(), 0);

  const endDateTime = new Date(eventDateTime.getTime() + 60 * 60 * 1000);

  try {
    const calendar = CalendarApp.getCalendarById(calendarId);

    calendar.createEvent(title, eventDateTime, endDateTime, {
      description: `${platform} - ${description}`
    });

    const logSheet = e.source.getSheetByName(logSheetName);
    logSheet.appendRow([...rowData, "Approved"]);
    feedbackCell.setNote("✔ Event created and logged.");
  } catch (err) {
    feedbackCell.setNote(`❌ Calendar error: ${err.message}`);
    Logger.log("Calendar sync error:", err);
  }
}


function showProposalForm() {
  const html = HtmlService.createHtmlOutputFromFile('form')
    .setWidth(400)
    .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'New Content Proposal');
}
function submitProposal(data) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Proposal Form");
  const nextRow = sheet.getLastRow() + 1;

  sheet.getRange(nextRow, 1, 1, 7).setValues([[
    data.date,
    data.time,
    data.title,
    data.team,
    data.platform,
    data.description,
    "Pending"
  ]]);

  // Optional: show confirmation toast
  SpreadsheetApp.getActive().toast("Proposal submitted!", "Success", 3);
}

function syncTimelineView() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Timeline View");
  const props = PropertiesService.getScriptProperties();
  const calendarIds = {
    "Digital Media": props.getProperty("CALENDAR_ID_DIGITAL_MEDIA"),
    "Marketing": props.getProperty("CALENDAR_ID_MARKETING")
  };

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);
  nextYear.setHours(23, 59, 59, 999);

  const rows = [];

  for (const [team, calendarId] of Object.entries(calendarIds)) {
    const calendar = CalendarApp.getCalendarById(calendarId);
    const events = calendar.getEvents(now, nextYear);

    for (const event of events) {
      const start = event.getStartTime();
      const platform = (event.getDescription().split("-")[0] || "").trim();
      rows.push([
        Utilities.formatDate(start, Session.getScriptTimeZone(), "yyyy-MM-dd"),
        Utilities.formatDate(start, Session.getScriptTimeZone(), "HH:mm"),
        team,
        event.getTitle(),
        platform,
        "Approved"
      ]);
    }
  }

  // Sort by date + time
  rows.sort((a, b) => new Date(`${a[0]}T${a[1]}`) - new Date(`${b[0]}T${b[1]}`));

  // Output to Timeline View tab
  sheet.clearContents();
  sheet.appendRow(["Date", "Time", "Team", "Title", "Platform", "Status"]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, 6).setValues(rows);
  }
}
