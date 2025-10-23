// Select elements
const addSessionBtn = document.getElementById("addSessionBtn");
const subjectSelect = document.getElementById("subjectSelect");
const durationInput = document.getElementById("durationInput");
const marksDisplay = document.getElementById("marksDisplay");
const totalMarksBar = document.getElementById("totalMarksBar");

// Load saved data
let subjects = JSON.parse(localStorage.getItem("subjects")) || {};
let totalMarks = parseFloat(localStorage.getItem("totalMarks")) || 0;
let undoStack = [];
let redoStack = [];

// Update bars and UI
function updateUI() {
  let totalMarksDisplay = document.getElementById("totalMarks");
  if (totalMarksDisplay) {
    totalMarksDisplay.textContent = totalMarks.toFixed(1);
  }

  if (totalMarksBar) {
    totalMarksBar.style.width = Math.min(totalMarks / 750 * 100, 100) + "%";
  }

  Object.keys(subjects).forEach(subject => {
    const markBar = document.getElementById(`${subject}-mark-bar`);
    const markLabel = document.getElementById(`${subject}-mark-label`);
    if (markBar && markLabel) {
      let marks = subjects[subject].marks || 0;
      markBar.style.width = Math.min(marks / 750 * 100, 100) + "%";
      markLabel.textContent = marks.toFixed(1);
    }
  });

  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("totalMarks", totalMarks);
}

// Add a new study session
addSessionBtn.addEventListener("click", () => {
  const subject = subjectSelect.value;
  const durationText = durationInput.value.trim();

  if (!subject || !durationText) {
    alert("Please select a subject and enter a duration!");
    return;
  }

  // Parse hours and minutes
  let hours = 0;
  let minutes = 0;
  const timeMatch = durationText.match(/(\d+)\s*h/i);
  const minMatch = durationText.match(/(\d+)\s*m/i);
  if (timeMatch) hours = parseFloat(timeMatch[1]);
  if (minMatch) minutes = parseFloat(minMatch[1]) / 60;

  const totalHours = hours + minutes;
  const marksEarned = totalHours * (100 / 15);
  const xpEarned = totalHours * 50;

  if (!subjects[subject]) {
    subjects[subject] = { marks: 0, xp: 0 };
  }

  // Save undo state
  undoStack.push(JSON.stringify({ subjects, totalMarks }));
  redoStack = [];

  subjects[subject].marks += marksEarned;
  subjects[subject].xp += xpEarned;
  totalMarks += marksEarned;

  updateUI();
  saveHistory(subject, `${hours > 0 ? hours + " Hour" : ""} ${minutes > 0 ? Math.round(minutes * 60) + " Minutes" : ""}`.trim());
  durationInput.value = "";
});

// Save session to history
function saveHistory(subject, durationText) {
  const history = JSON.parse(localStorage.getItem("studyHistory")) || [];
  history.push({ subject, duration: durationText });
  localStorage.setItem("studyHistory", JSON.stringify(history));
}

// Undo, Redo, Reset All
document.getElementById("undoBtn").addEventListener("click", () => {
  if (undoStack.length === 0) return;
  redoStack.push(JSON.stringify({ subjects, totalMarks }));
  const prev = JSON.parse(undoStack.pop());
  subjects = prev.subjects;
  totalMarks = prev.totalMarks;
  updateUI();
});

document.getElementById("redoBtn").addEventListener("click", () => {
  if (redoStack.length === 0) return;
  undoStack.push(JSON.stringify({ subjects, totalMarks }));
  const next = JSON.parse(redoStack.pop());
  subjects = next.subjects;
  totalMarks = next.totalMarks;
  updateUI();
});

document.getElementById("resetAllBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all progress?")) {
    subjects = {};
    totalMarks = 0;
    undoStack = [];
    redoStack = [];
    localStorage.removeItem("studyHistory");
    updateUI();
  }
});

updateUI();
