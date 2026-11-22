const TARGET_PERCENT = 75;

let subjects = JSON.parse(localStorage.getItem("subjectsData")) || [];
let attendanceData = JSON.parse(localStorage.getItem("attendanceData")) || null;

const subjectNameInput = document.getElementById("subjectName");
const creditsInput = document.getElementById("credits");
const gradePointSelect = document.getElementById("gradePoint");
const addSubjectBtn = document.getElementById("addSubjectBtn");
const subjectList = document.getElementById("subjectList");
const gpaResult = document.getElementById("gpaResult");

const totalClassesInput = document.getElementById("totalClasses");
const attendedClassesInput = document.getElementById("attendedClasses");
const predictBtn = document.getElementById("predictBtn");
const attendanceResult = document.getElementById("attendanceResult");
const clearAllBtn = document.getElementById("clearAllBtn");

function renderSubjects() {
  if (!subjectList || !gpaResult) return;

  subjectList.innerHTML = "";

  let totalWeightedPoints = 0;
  let totalCredits = 0;

  subjects.forEach((item, index) => {
    totalWeightedPoints += item.credits * item.gradePoint;
    totalCredits += item.credits;

    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${item.name}</strong> — Credits: ${item.credits}, Grade Point: ${item.gradePoint}</span>
      <button class="delete-btn" type="button" onclick="deleteSubject(${index})">Remove</button>
    `;
    subjectList.appendChild(li);
  });

  const gpa = totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : "0.00";
  let tip = "";

  if (totalCredits > 0) {
    const numericGpa = parseFloat(gpa);
    if (numericGpa >= 8.5) {
      tip = " — Strong CGPA track. Keep consistency across core subjects.";
    } else if (numericGpa >= 7.0) {
      tip = " — Good standing. Higher grades in high-credit subjects will lift your GPA faster.";
    } else {
      tip = " — Focus on high-credit courses and labs to improve your GPA.";
    }
  }

  gpaResult.innerHTML = `Current GPA: <strong>${gpa}</strong> | Total Credits: <strong>${totalCredits}</strong>${tip}`;
  localStorage.setItem("subjectsData", JSON.stringify(subjects));
}

function deleteSubject(index) {
  subjects.splice(index, 1);
  renderSubjects();
}

function calculateAttendancePrediction(total, attended) {
  const currentPct = (attended / total) * 100;

  if (currentPct >= TARGET_PERCENT) {
    const maxTotal = Math.floor(attended / (TARGET_PERCENT / 100));
    const safeBunks = Math.max(0, maxTotal - total);
    return `
      Current Attendance: <strong>${currentPct.toFixed(1)}%</strong> (Safe)<br/>
      You can miss up to <strong>${safeBunks}</strong> more class(es) and stay at or above ${TARGET_PERCENT}%.
    `;
  }

  const needed = Math.ceil(
    ((TARGET_PERCENT / 100) * total - attended) / (1 - TARGET_PERCENT / 100)
  );
  const classesNeeded = Math.max(1, needed);

  return `
    Current Attendance: <strong>${currentPct.toFixed(1)}%</strong> (Below ${TARGET_PERCENT}%)<br/>
    Attend <strong>${classesNeeded}</strong> continuous class(es) without missing to reach ${TARGET_PERCENT}%.
  `;
}

if (addSubjectBtn) {
  addSubjectBtn.addEventListener("click", () => {
    const name = subjectNameInput.value.trim() || `Subject ${subjects.length + 1}`;
    const credits = parseFloat(creditsInput.value);
    const gradePoint = parseFloat(gradePointSelect.value);

    if (isNaN(credits) || credits <= 0) {
      alert("Enter valid credits greater than 0.");
      return;
    }

    subjects.push({ name, credits, gradePoint });
    subjectNameInput.value = "";
    creditsInput.value = "";
    renderSubjects();
  });
}

if (predictBtn) {
  predictBtn.addEventListener("click", () => {
    const total = parseInt(totalClassesInput.value, 10);
    const attended = parseInt(attendedClassesInput.value, 10);

    if (isNaN(total) || isNaN(attended) || total <= 0 || attended < 0 || attended > total) {
      alert("Enter valid values: Total > 0 and 0 <= Attended <= Total.");
      return;
    }

    attendanceData = { total, attended };
    localStorage.setItem("attendanceData", JSON.stringify(attendanceData));
    attendanceResult.innerHTML = calculateAttendancePrediction(total, attended);
  });
}

if (clearAllBtn) {
  clearAllBtn.addEventListener("click", () => {
    localStorage.removeItem("subjectsData");
    localStorage.removeItem("attendanceData");
    subjects = [];
    attendanceData = null;

    if (subjectNameInput) subjectNameInput.value = "";
    if (creditsInput) creditsInput.value = "";
    if (gradePointSelect) gradePointSelect.value = "10";
    if (totalClassesInput) totalClassesInput.value = "";
    if (attendedClassesInput) attendedClassesInput.value = "";
    if (attendanceResult) {
      attendanceResult.innerHTML = "Enter total and attended classes to see your prediction.";
    }

    renderSubjects();
    window.location.reload();
  });
}

renderSubjects();

if (attendanceData && totalClassesInput && attendedClassesInput && attendanceResult) {
  totalClassesInput.value = attendanceData.total;
  attendedClassesInput.value = attendanceData.attended;
  attendanceResult.innerHTML = calculateAttendancePrediction(
    attendanceData.total,
    attendanceData.attended
  );
}