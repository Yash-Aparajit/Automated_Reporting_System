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
      summary[plant][agency] = {Shift1:0, General:0, Shift2:0, SixThirty:0};
    }

    summary[plant][agency][shift]++;

  }

  summarySheet.appendRow(["Plant","Agency","Shift1","General","Shift2","SixThirty","Total"]);

  const output = [];

  let grand = {Shift1:0, General:0, Shift2:0, SixThirty:0};

  for (const plant in summary) {

    let plantTotal = {Shift1:0, General:0, Shift2:0, SixThirty:0};

    for (const agency in summary[plant]) {

      const s = summary[plant][agency];
      const total = s.Shift1 + s.General + s.Shift2 + s.SixThirty;

      output.push([plant, agency, s.Shift1, s.General, s.Shift2, s.SixThirty, total]);

      plantTotal.Shift1 += s.Shift1;
      plantTotal.General += s.General;
      plantTotal.Shift2 += s.Shift2;
      plantTotal.SixThirty += s.SixThirty;
    }

    const plantSum = plantTotal.Shift1 + plantTotal.General + plantTotal.Shift2 + plantTotal.SixThirty;

    output.push([plant,"Total",plantTotal.Shift1,plantTotal.General,plantTotal.Shift2,plantTotal.SixThirty,plantSum]);
    output.push(["","","","","","",""]);

    grand.Shift1 += plantTotal.Shift1;
    grand.General += plantTotal.General;
    grand.Shift2 += plantTotal.Shift2;
    grand.SixThirty += plantTotal.SixThirty;
  }

  const grandTotal = grand.Shift1 + grand.General + grand.Shift2 + grand.SixThirty;

  output.push(["Plant 1 + New Plant","Total",grand.Shift1,grand.General,grand.Shift2,grand.SixThirty,grandTotal]);

  summarySheet.getRange(2,1,output.length,7).setValues(output);

  syncHRInput();
  generateMPReport();
}


function getShift(timeValue){

  // convert incoming value to string
  let str = timeValue.toString().trim();

  // split hour and minute using "."
  let parts = str.split(".");
  let hour = parseInt(parts[0]);

  let minute = 0;

  if(parts.length > 1){

    let minStr = parts[1];

    // vendor format rules
    // 6.3  → 6:30
    // 15.2 → 15:20
    // 6.07 → 6:07

    if(minStr.length === 1){
      minute = parseInt(minStr) * 10;
    } else {
      minute = parseInt(minStr);
    }

    if(minute > 59){
      minute = 59;
    }

  }

  let totalMinutes = hour * 60 + minute;

  // MORNING SHIFT → 05:51–08:50
  if(totalMinutes >= 351 && totalMinutes <= 530){
    return "Shift1";
  }

  // GENERAL SHIFT → 08:51–14:50
  if(totalMinutes >= 531 && totalMinutes <= 890){
    return "General";
  }

  // SECOND SHIFT → 14:51–17:50
  if(totalMinutes >= 891 && totalMinutes <= 1070){
    return "Shift2";
  }

  // 6:30 SHIFT → 17:51–05:50
  return "SixThirty";

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

  inputSheet.appendRow(["Plant","Agency","Req1","Req2","New1","NewGen","New2","NewSixThirty"]);

  if(newRows.length>0){
    inputSheet.getRange(2,1,newRows.length,8).setValues(newRows);
  }

}

function generateMPReport(){

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const summarySheet = ss.getSheetByName("AUTO_SUMMARY");
  const inputSheet = ss.getSheetByName("HR_INPUT");
  const reportSheet = ss.getSheetByName("MP_REPORT");

  const summaryData = summarySheet.getDataRange().getValues();
  const inputData = inputSheet.getDataRange().getValues();

  reportSheet.clear();

  reportSheet.appendRow([
    "Plant","Agency",
    "1st Regular","1st New","Gen. Regular","Gen. New","2nd Regular","2nd New","6:30 Regular","6:30 New",
    "Request 1st","Request 2nd","Difference 1st","Difference 2nd","Total"
  ]);

  const inputMap = {};

  for(let i=1;i<inputData.length;i++){

    const plant = inputData[i][0];
    const agency = inputData[i][1];

    if(!plant || !agency) continue;

    const key = plant+"|"+agency;

    inputMap[key] = inputData[i];

  }

  const output = [];

  let grandTotal = 0;

  for(let i=1;i<summaryData.length;i++){

    const plant = summaryData[i][0];
    const agency = summaryData[i][1];

    if(!plant || !agency || agency==="Total") continue;

    const s1 = summaryData[i][2];
    const g  = summaryData[i][3];
    const s2 = summaryData[i][4];
    const n  = summaryData[i][5];

    const key = plant+"|"+agency;

    const input = inputMap[key] || [null,null,0,0,0,0,0,0];

    const req1 = input[2];
    const req2 = input[3];

    const new1 = input[4];
    const newG = input[5];
    const new2 = input[6];
    const newN = input[7];

    const diff1 = (s1 + new1 + g + newG) - req1;

    const diff2 = (s2 + new2 + n + newN) - req2;

    const total =
      s1 + new1 +
      g + newG +
      s2 + new2 +
      n + newN;

    grandTotal += total;

    output.push([
      plant,agency,
      s1,new1,
      g,newG,
      s2,new2,
      n,newN,
      req1,req2,
      diff1,diff2,
      total
    ]);

  }

  reportSheet.getRange(2,1,output.length,15).setValues(output);

}
