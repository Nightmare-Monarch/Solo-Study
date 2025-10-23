let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Sinhala", code: "sin", marks: 0 },
  { name: "Science", code: "sci", marks: 0 },
  { name: "Commerce", code: "com", marks: 0 },
  { name: "Buddhism", code: "bud", marks: 0 },
  { name: "History", code: "his", marks: 0 },
  { name: "Dancing", code: "dan", marks: 0 },
  { name: "Health", code: "hea", marks: 0 },
  { name: "Maths", code: "mat", marks: 0 },
  { name: "English", code: "eng", marks: 0 }
];

let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
let redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || [];
let totalXP = parseFloat(localStorage.getItem("totalXP")) || 0;

// Save data
function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
  localStorage.setItem("totalXP", totalXP);
}

// Update UI
function updateUI() {
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";

  subjects.forEach((s, index) => {
    container.innerHTML += `
      <div class="subject">
        <strong>${index + 1}. ${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
        <div class="progress marks-bar">
          <div class="progress-fill" style="width:${(s.marks).toFixed(1)}%"></div>
        </div>
      </div>
    `;
  });

  const totalMarks = subjects.reduce((a, b) => a + b.marks, 0);
  document.getElementById("totalMarksBottom").textContent = totalMarks.toFixed(1);
  document.getElementById("fullMarksFill").style.width = (totalMarks / 900 * 100).toFixed(1) + "%";

  document.getElementById("totalXPBottom").textContent = totalXP.toFixed(1);
  document.getElementById("fullXPFill").style.width = Math.min(totalXP / 750 * 100, 100).toFixed(1) + "%";
}

// Add session
function handleSessionInput() {
  const input = document.getElementById("sessionInput").value.trim().toLowerCase();
  if (!input) return;

  const parts = input.split(" ");
  const code = parts[0];
  let minutes = 0, pp = false, quiz = false;

  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    if (p.endsWith("h")) minutes += (parseInt(p) || 0) * 60;
    else if (p.endsWith("m")) minutes += parseInt(p) || 0;
    else if (p === "pp") pp = true;
    else if (p === "q") quiz = true;
  }

  const sub = subjects.find(s => s.code === code);
  if (!sub) return alert("Invalid subject code");

  // Save current state for undo
  sessionHistory.push(JSON.stringify({ subjects, totalXP }));
  redoHistory = [];

  // Marks: 15h = 100 marks → 1min = 100 / 900
  const marksGain = minutes * (100 / 900) + (pp ? 5 : 0) + (quiz ? 3 : 0);
  sub.marks += marksGain;
  if (sub.marks > 100) sub.marks = 100;

  // XP: 1h = 50 XP → 1min = 50/60
  const xpGain = minutes * (50 / 60) + (pp ? 5 : 0) + (quiz ? 3 : 0);
  totalXP += xpGain;

  document.getElementById("sessionInput").value = "";

  updateUI();
  saveData();
}

// Undo / Redo / Reset
function undo() {
  if (sessionHistory.length === 0) return;
  redoHistory.push(JSON.stringify({ subjects, totalXP }));
  const lastState = JSON.parse(sessionHistory.pop());
  subjects = lastState.subjects;
  totalXP = lastState.totalXP;
  updateUI();
  saveData();
}

function redo() {
  if (redoHistory.length === 0) return;
  sessionHistory.push(JSON.stringify({ subjects, totalXP }));
  const lastState = JSON.parse(redoHistory.pop());
  subjects = lastState.subjects;
  totalXP = lastState.totalXP;
  updateUI();
  saveData();
}

function resetAll() {
  if (!confirm("Are you sure you want to reset all marks and XP?")) return;
  subjects.forEach(s => s.marks = 0);
  totalXP = 0;
  sessionHistory = [];
  redoHistory = [];
  updateUI();
  saveData();
}

// Enter key support
document.getElementById("sessionInput").addEventListener("keypress", function(e){
  if (e.key === "Enter") handleSessionInput();
});

// Motivation quotes
const quotes = [
  "Stay focused and never give up!",
  "Consistency is key to mastery.",
  "Every hour counts, keep going!",
  "Your future self will thank you.",
  "Small steps lead to big progress."
];
function showMotivation() {
  document.getElementById("motivationQuote").textContent = quotes[Math.floor(Math.random() * quotes.length)];
}
setInterval(showMotivation, 15000);

// Initial UI render
updateUI();
showMotivation();
