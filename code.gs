function generateSummary() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const rawSheet = ss.getSheetByName("RAW_ATTENDANCE");
  const uniqueSheet = ss.getSheetByName("UNIQUE_LOG");
  const summarySheet = ss.getSheetByName("AUTO_SUMMARY");

  const rawData = rawSheet.getDataRange().getValues();

  uniqueSheet.clear();
  summarySheet.clear();

  uniqueSheet.appendRow(["Date","Agency","Emp Code","In Time","Shift"]);

  const seen = new Set();
  const uniqueRows = [];

  for (let i = 1; i < rawData.length; i++) {

    const row = rawData[i];

    const agency = row[1];
    const empCode = row[4];
    const date = row[6];
    const inTime = row[7];

    if (!agency || !empCode || !date || !inTime) continue;

    const key = empCode + "_" + date;

    if (seen.has(key)) continue;

    seen.add(key);

    const shift = getShift(inTime);

    uniqueRows.push([date, agency, empCode, inTime, shift]);

  }

  if (uniqueRows.length > 0) {
    uniqueSheet.getRange(2,1,uniqueRows.length,5).setValues(uniqueRows);
  }

  const summary = {};

  uniqueRows.forEach(r => {

    const agency = r[1];
    const shift = r[4];

    if (!summary[agency]) {

      summary[agency] = {
        Shift1:0,
        General:0,
        Shift2:0,
        Night:0
      };

    }

    summary[agency][shift]++;

  });

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


function getShift(timeValue){

  const time = Utilities.formatDate(new Date(timeValue),"GMT+5:30","HH:mm");

  if (time >= "06:30" && time < "09:30") return "Shift1";

  if (time >= "09:30" && time < "18:30") return "General";

  if (time >= "18:30" && time <= "23:59") return "Shift2";

  if (time >= "00:00" && time < "00:30") return "Shift2";

  return "Night";

}
