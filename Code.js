function myFunction() {
  
}

function onEdit(e) {
  const sheetName = "Proposal Form";
  const logSheetName = "Approved Events Log";

  const calendarIds = {
    "Digital Media": "your-digitalmedia-calendar-id@group.calendar.google.com",
    "Marketing": "your-marketing-calendar-id@group.calendar.google.com"
  };

  const range = e.range;
  const sheet = e.source.getSheetByName(sheetName);

  // Only run if the edit is on the Proposal Form sheet and on the Status column (G)
  if (sheet.getName() !== sheetName || range.getColumn() !== 7 || range.getRow() === 1) return;

  const status = range.getValue();
  if (status !== "Approved") return;

  const row = range.getRow();
  const values = sheet.getRange(row, 1, 1, 7).getValues()[0];

  const [date, time, title, team, platform, description, statusValue] = values;
  const calendarId = calendarIds[team];

  if (!calendarId || !date || !time || !title) {
    sheet.getRange(row, 8).setNote("Missing required info or invalid team.");
    return;
  }

  try {
    const eventDateTime = new Date(`${date} ${time}`);
    const cal = CalendarApp.getCalendarById(calendarId);
    cal.createEvent(title, eventDateTime, new Date(eventDateTime.getTime() + 60 * 60 * 1000), {
      description: `${platform} - ${description}`
    });

    // Copy to Approved Events Log
    const logSheet = e.source.getSheetByName(logSheetName);
    logSheet.appendRow(values);

    // Optional feedback
    sheet.getRange(row, 8).setNote("Event added to calendar ✔");

  } catch (error) {
    sheet.getRange(row, 8).setNote(`Calendar error: ${error.message}`);
  }
}
