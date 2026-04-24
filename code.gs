function generateSummary() {

const ss = SpreadsheetApp.getActiveSpreadsheet();
const rawSheet = ss.getSheetByName("RAW_ATTENDANCE");
const summarySheet = ss.getSheetByName("AUTO_SUMMARY");

const data = rawSheet.getDataRange().getValues();

summarySheet.clear();

const summary = {};

for (let i = 1; i < data.length; i++) {

```
const plant = data[i][0];   // P-1 / P-2
const agency = data[i][1];
const inTime = data[i][7];

if (!plant || !agency || !inTime) continue;

const shift = getShift(inTime);

if (!summary[plant]) {
  summary[plant] = {};
}

if (!summary[plant][agency]) {
  summary[plant][agency] = {Shift1:0, General:0, Shift2:0, Night:0};
}

summary[plant][agency][shift]++;
```

}

summarySheet.appendRow(["Plant","Agency","Shift1","General","Shift2","Night","Total"]);

const output = [];

for (let plant in summary) {

```
for (let agency in summary[plant]) {

  const s = summary[plant][agency];
  const total = s.Shift1 + s.General + s.Shift2 + s.Night;

  output.push([
    plant,
    agency,
    s.Shift1,
    s.General,
    s.Shift2,
    s.Night,
    total
  ]);

}
```

}

if (output.length > 0) {
summarySheet.getRange(2,1,output.length,7).setValues(output);
}

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
