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

let totalXP = parseFloat(localStorage.getItem("totalXP")) || 0;
let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
let redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || [];

function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("totalXP", totalXP);
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
}

function updateUI() {
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";
  subjects.sort((a,b) => b.marks - a.marks);
  subjects.forEach((s, i) => {
    container.innerHTML += `
      <div class="subject">
        <strong>${i + 1}. ${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
        <div class="progress marks-bar">
          <div class="progress-fill marks" style="width:${s.marks}%;"></div>
        </div>
      </div>`;
  });

  const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
  document.getElementById("totalMarksBottom").textContent = totalMarks.toFixed(1);
  document.getElementById("fullMarksFill").style.width = (totalMarks / 900 * 100) + "%";

  document.getElementById("totalXPBottom").textContent = totalXP.toFixed(0);
  document.getElementById("fullXPFill").style.width = (totalXP / 100000 * 100) + "%";
}

function handleSessionInput() {
  const input = document.getElementById("sessionInput").value.trim().toLowerCase();
  if (!input) return;
  const parts = input.split(" ");
  const code = parts[0];
  let minutes = 0, pp = false, quiz = false;
  for (let i = 1; i < parts.length; i++) {
    let p = parts[i];
    if (p.endsWith("h")) minutes += (parseInt(p) || 0) * 60;
    else if (p.endsWith("m")) minutes += parseInt(p) || 0;
    else if (p === "pp") pp = true;
    else if (p === "q") quiz = true;
  }

  sessionHistory.push(JSON.stringify(subjects));
  redoHistory = [];

  addSession(code, minutes, pp, quiz);
  document.getElementById("sessionInput").value = "";
  saveData();
}

function addSession(code, minutes, pp, quiz) {
  const sub = subjects.find(s => s.code === code);
  if (!sub) return alert("Invalid subject code");

  // 15 hours = 100 marks  => 1 min = 100 / (15*60)
  const markRate = 100 / (15 * 60);
  const xpRate = 50 / 60; // 1h = 50 xp

  let markGain = minutes * markRate;
  let xpGain = minutes * xpRate;
  if (pp) markGain += 5;
  if (quiz) markGain += 3;

  sub.marks += markGain;
  if (sub.marks > 100) sub.marks = 100;

  totalXP += xpGain;
  if (totalXP > 100000) totalXP = 100000;

  updateUI();
}

function undo() {
  if (sessionHistory.length === 0) return;
  redoHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(sessionHistory.pop());
  updateUI();
  saveData();
}

function redo() {
  if (redoHistory.length === 0) return;
  sessionHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(redoHistory.pop());
  updateUI();
  saveData();
}

function resetAll() {
  if (!confirm("Are you sure?")) return;
  subjects.forEach(s => s.marks = 0);
  totalXP = 0;
  sessionHistory = [];
  redoHistory = [];
  saveData();
  updateUI();
}

window.onload = updateUI;
