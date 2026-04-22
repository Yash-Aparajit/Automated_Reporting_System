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

  let str = timeValue.toString().trim();

  // ensure two digit minutes
  if(!str.includes(".")) str += ".00";

  let parts = str.split(".");
  let hour = parseInt(parts[0]);
  let minute = parseInt(parts[1]);

  if(minute > 59){
    minute = Math.round((minute/100)*60);
  }

  let totalMinutes = hour*60 + minute;

  if(totalMinutes >= 360 && totalMinutes <= 569) return "Shift1";   // 06:00–09:29
  if(totalMinutes >= 570 && totalMinutes <= 1109) return "General"; // 09:30–18:29
  if(totalMinutes >= 1110 || totalMinutes <= 29) return "Shift2";   // 18:30–00:29

  return "Night"; // 00:30–05:59
}
