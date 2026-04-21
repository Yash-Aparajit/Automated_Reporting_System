# 📊 Workforce Automation & MP Reporting System

![Google Apps Script](https://img.shields.io/badge/Platform-Google%20Apps%20Script-yellow)
![Status](https://img.shields.io/badge/Status-Active-success)
![Automation](https://img.shields.io/badge/Automation-Level%20100%25-blue)
![Maintenance](https://img.shields.io/badge/Maintenance-Low-brightgreen)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

---

## 🚀 Overview

This project automates workforce reporting from raw attendance logs.

It eliminates manual Excel work performed by HR teams and generates **accurate, structured MP (Manpower) reports** with a single click.

---

## ❗ Problem Statement

HR teams typically:

* Download attendance reports from third-party systems
* Filter and count manually in Excel
* Calculate shift-wise manpower
* Add requirement, new workers, etc.
* Prepare MP sheets daily

### Pain Points

* ⏳ 45–60 minutes daily manual effort
* ❌ High chances of human error
* 🔁 Repetitive work
* 📉 No analytics or scalability

---

## ✅ Solution

This system automates the entire workflow:

```text
RAW_ATTENDANCE
      ↓
AUTO_SUMMARY
      ↓
HR_INPUT
      ↓
MP_REPORT
```

---

## 🧠 Core Features

### 1️⃣ Attendance Processing

* Parses raw CSV attendance logs
* Handles **non-standard time format** (e.g. `6.3 → 06:30`)
* Classifies shifts accurately

---

### 2️⃣ Shift Classification Logic

| Shift      | Time          |
| ---------- | ------------- |
| 1st Shift  | 05:51 – 08:50 |
| General    | 08:51 – 14:50 |
| 2nd Shift  | 14:51 – 17:50 |
| 6:30 Shift | 17:51 – 05:50 |

---

### 3️⃣ Auto Summary Generation

Generates plant-wise and agency-wise manpower:

| Plant | Agency | Shift1 | General | Shift2 | 6:30 | Total |

Includes:

* ✔ Plant totals
* ✔ Grand totals

---

### 4️⃣ Self-Maintaining HR Input

* Auto-populates based on attendance
* Preserves previous inputs
* HR only enters:

```text
Requirement (1st & 2nd)
New workers (shift-wise)
```

---

### 5️⃣ MP Report Generation

Fully automated report including:

* Regular manpower
* New workers
* Requirements
* Differences
* Totals

Example:

| Plant | Agency | 1R | 1N | GR | GN | 2R | 2N | 6:30R | 6:30N | Req1 | Req2 | Diff1 | Diff2 | Total |

Includes:

* ✔ Plant totals
* ✔ Grand totals

---

## ⚙️ Tech Stack

* **Google Apps Script**
* **Google Sheets**
* JavaScript (ES5 compatible)

---

## 📂 Project Structure

```text
.
├── RAW_ATTENDANCE   # Input CSV data
├── AUTO_SUMMARY     # System generated summary
├── HR_INPUT         # Manual HR inputs (auto-managed)
├── MP_REPORT        # Final output report
└── code.gs          # Core logic
```

---

## 🔄 Workflow

1. Download attendance CSV
2. Paste into `RAW_ATTENDANCE`
3. Click **Generate Summary**
4. Enter:

   * Requirements
   * New workers
5. MP Report is generated automatically

⏱ Total time: **~2 minutes**

---

## 🧩 Key Engineering Decisions

### ✔ Separation of Concerns

| Data Type    | Source |
| ------------ | ------ |
| Attendance   | System |
| Requirements | HR     |
| New Workers  | HR     |

---

### ✔ Robust Time Parsing

Handles broken vendor formats:

```text
6.3  → 06:30
15.2 → 15:20
6.07 → 06:07
```

---

### ✔ Dynamic Data Sync

* HR_INPUT updates automatically
* New agencies added without manual effort
* Existing values preserved

---

## 📈 Future Enhancements

Planned improvements:

* Department-wise manpower analysis
* Contractor performance tracking
* Man-days calculation
* Overtime analytics
* Trend dashboard
* Unique worker validation

---

## ⚠️ Known Limitations

* Depends on consistent attendance export format
* Does not yet handle duplicate employee entries
* Manual agencies (without attendance) not yet merged (planned)

---

## 💡 Impact

* ⏱ Saves **20–30 minutes daily per HR**
* 📊 Improves accuracy
* 🔁 Eliminates repetitive manual work
* 📈 Enables future analytics

---

## 🧑‍💻 Author

**Yash Aparajit**

---

## 📜 License

MIT License — feel free to use and modify.

---

## ⭐ Final Note

This project transforms a manual, error-prone HR process into a **scalable automation system**.

It can evolve into a **full workforce analytics platform** with minimal additional effort.
