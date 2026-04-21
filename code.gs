function generateSummary() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawSheet = ss.getSheetByName("RAW_ATTENDANCE");
  const summarySheet = ss.getSheetByName("AUTO_SUMMARY");

  const data = rawSheet.getDataRange().getValues();

  summarySheet.clear();

  const summary = {};

  for (let i = 1; i < data.length; i++) {

    const agency = data[i][1];
    const inTime = data[i][7];

    if (!agency || !inTime) continue;

    const shift = getShift(inTime);

    if (!summary[agency]) {
      summary[agency] = {Shift1:0, General:0, Shift2:0, Night:0};
    }

    summary[agency][shift]++;

  }

  summarySheet.appendRow(["Agency","Shift1","General","Shift2","Night","Total"]);

  const output = [];

  for (let agency in summary) {

    const s = summary[agency];
    const total = s.Shift1 + s.General + s.Shift2 + s.Night;

    output.push([agency,s.Shift1,s.General,s.Shift2,s.Night,total]);

  }

  if (output.length > 0) {
    summarySheet.getRange(2,1,output.length,6).setValues(output);
  }

}



function getShift(timeValue){

  const parts = timeValue.toString().split(".");

  const hour = parseInt(parts[0]);
  const minute = parts[1] ? parseInt(parts[1]) : 0;

  const totalMinutes = hour*60 + minute;

  const shift1Start = 6*60 + 30;
  const shift1End = 9*60 + 29;

  const generalStart = 9*60 + 30;
  const generalEnd = 18*60 + 29;

  const shift2Start = 18*60 + 30;

  if (totalMinutes >= shift1Start && totalMinutes <= shift1End) return "Shift1";

  if (totalMinutes >= generalStart && totalMinutes <= generalEnd) return "General";

  if (totalMinutes >= shift2Start || totalMinutes <= 29) return "Shift2";

  return "Night";

}
