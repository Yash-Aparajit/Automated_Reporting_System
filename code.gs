function generateSummary() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rawSheet = ss.getSheetByName("RAW_ATTENDANCE");
  const summarySheet = ss.getSheetByName("AUTO_SUMMARY");

  const data = rawSheet.getDataRange().getValues();

  summarySheet.clear();

  const summary = {};

  for (let i = 1; i < data.length; i++) {

    const plant = data[i][0];
    const agency = data[i][1];
    const inTime = data[i][7];

    if (!plant || !agency || !inTime) continue;

    const shift = getShift(inTime);

    if (!summary[plant]) summary[plant] = {};

    if (!summary[plant][agency]) {
      summary[plant][agency] = {Shift1:0, General:0, Shift2:0, Night:0};
    }

    summary[plant][agency][shift]++;

  }

  summarySheet.appendRow(["Plant","Agency","Shift1","General","Shift2","Night","Total"]);

  const output = [];

  let grand = {Shift1:0, General:0, Shift2:0, Night:0};

  for (const plant in summary) {

    let plantTotal = {Shift1:0, General:0, Shift2:0, Night:0};

    for (const agency in summary[plant]) {

      const s = summary[plant][agency];
      const total = s.Shift1 + s.General + s.Shift2 + s.Night;

      output.push([plant, agency, s.Shift1, s.General, s.Shift2, s.Night, total]);

      plantTotal.Shift1 += s.Shift1;
      plantTotal.General += s.General;
      plantTotal.Shift2 += s.Shift2;
      plantTotal.Night += s.Night;
    }

    const plantSum = plantTotal.Shift1 + plantTotal.General + plantTotal.Shift2 + plantTotal.Night;

    output.push([plant,"Total",plantTotal.Shift1,plantTotal.General,plantTotal.Shift2,plantTotal.Night,plantSum]);
    output.push(["","","","","","",""]);

    grand.Shift1 += plantTotal.Shift1;
    grand.General += plantTotal.General;
    grand.Shift2 += plantTotal.Shift2;
    grand.Night += plantTotal.Night;
  }

  const grandTotal = grand.Shift1 + grand.General + grand.Shift2 + grand.Night;

  output.push(["Plant 1 + New Plant","Total",grand.Shift1,grand.General,grand.Shift2,grand.Night,grandTotal]);

  summarySheet.getRange(2,1,output.length,7).setValues(output);

  syncHRInput();
}


function getShift(timeValue){

  let str = timeValue.toString().trim();

  let parts = str.split(".");
  let hour = parseInt(parts[0]);

  let minute = 0;

  if(parts.length > 1){

    let minStr = parts[1];

    // handle 6.3 → 30 minutes
    if(minStr.length === 1){
      minute = parseInt(minStr) * 10;
    } else {
      minute = parseInt(minStr);
    }

  }

  let totalMinutes = hour*60 + minute;

  // SHIFT 1 → 06:00–08:50
  if(totalMinutes >= 360 && totalMinutes <= 530) return "Shift1";

  // GENERAL → 08:51–14:50
  if(totalMinutes >= 531 && totalMinutes <= 890) return "General";

  // SHIFT 2 → 14:51–21:30
  if(totalMinutes >= 891 && totalMinutes <= 1290) return "Shift2";

  // NIGHT → 21:31–05:59
  return "Night";

}

function syncHRInput(){

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const summarySheet = ss.getSheetByName("AUTO_SUMMARY");
  const inputSheet = ss.getSheetByName("HR_INPUT");

  const summaryData = summarySheet.getDataRange().getValues();
  const inputData = inputSheet.getDataRange().getValues();

  const existing = {};

  // store existing HR input rows
  for(let i=1;i<inputData.length;i++){

    const plant = inputData[i][0];
    const agency = inputData[i][1];

    if(!plant || !agency) continue;

    const key = plant + "|" + agency;

    existing[key] = inputData[i];

  }

  const newRows = [];

  for(let i=1;i<summaryData.length;i++){

    const plant = summaryData[i][0];
    const agency = summaryData[i][1];

    if(!plant || !agency || agency==="Total" || agency==="") continue;

    const key = plant + "|" + agency;

    if(existing[key]){

      newRows.push(existing[key]);

    } else {

      newRows.push([
        plant,
        agency,
        0, // Req1
        0, // Req2
        0, // New1
        0, // NewGen
        0, // New2
        0  // NewNight
      ]);

    }

  }

  inputSheet.clear();

  inputSheet.appendRow(["Plant","Agency","Req1","Req2","New1","NewGen","New2","NewNight"]);

  if(newRows.length>0){
    inputSheet.getRange(2,1,newRows.length,8).setValues(newRows);
  }

}
