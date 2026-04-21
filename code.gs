function generateSummary() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const rawSheet = ss.getSheetByName("RAW_ATTENDANCE");
  const summarySheet = ss.getSheetByName("AUTO_SUMMARY");

  const data = rawSheet.getDataRange().getValues();

  summarySheet.clear();

  const summary = {};

  for (let i = 1; i < data.length; i++) {

    const row = data[i];

    const agency = row[1];
    const inTimeDecimal = row[7];

    if (!agency || !inTimeDecimal) continue;

    const shift = getShiftFromDecimal(inTimeDecimal);

    if (!summary[agency]) {

      summary[agency] = {
        Shift1:0,
        General:0,
        Shift2:0,
        Night:0
      };

    }

    summary[agency][shift]++;

  }

  summarySheet.appendRow(["Agency","Shift1","General","Shift2","Night","Total"]);

  const output = [];

  for (let agency in summary) {

    const s = summary[agency];

    const total = s.Shift1 + s.General + s.Shift2 + s.Night;

    output.push([
      agency,
      s.Shift1,
      s.General,
      s.Shift2,
      s.Night,
      total
    ]);

  }

  if (output.length > 0) {
    summarySheet.getRange(2,1,output.length,6).setValues(output);
  }

}


function getShiftFromDecimal(timeValue) {

  const hour = Math.floor(timeValue);
  const minute = Math.round((timeValue - hour) * 100);

  const totalMinutes = hour * 60 + minute;

  const shift1Start = 6*60 + 30;
  const shift1End = 9*60 + 29;

  const generalStart = 9*60 + 30;
  const generalEnd = 18*60 + 29;

  const shift2Start = 18*60 + 30;
  const shift2End = 24*60 + 29;

  const nightStart = 0*60 + 30;
  const nightEnd = 6*60 + 29;

  if (totalMinutes >= shift1Start && totalMinutes <= shift1End) return "Shift1";

  if (totalMinutes >= generalStart && totalMinutes <= generalEnd) return "General";

  if (totalMinutes >= shift2Start || totalMinutes <= 29) return "Shift2";

  return "Night";

}
