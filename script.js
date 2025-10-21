let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Sinhala", code: "sin", marks: 0, xp: 0 },
  { name: "Science", code: "sci", marks: 0, xp: 0 },
  { name: "Commerce", code: "com", marks: 0, xp: 0 },
  { name: "Buddhism", code: "bud", marks: 0, xp: 0 },
  { name: "History", code: "his", marks: 0, xp: 0 },
  { name: "Dancing", code: "dan", marks: 0, xp: 0 },
  { name: "Health", code: "hea", marks: 0, xp: 0 },
  { name: "Maths", code: "mat", marks: 0, xp: 0 },
  { name: "English", code: "eng", marks: 0, xp: 0 }
];

let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
let redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || [];
let totalXP = JSON.parse(localStorage.getItem("totalXP")) || 0;

function saveUserData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
  localStorage.setItem("totalXP", JSON.stringify(totalXP));
}

function handleSessionInput() {
  const input = document.getElementById("sessionInput").value.trim().toLowerCase();
  if (!input) return;

  const parts = input.split(" ");
  const subjectCode = parts[0];
  let totalMinutes = 0;
  let isPP = false, isQuiz = false;

  for (let i = 1; i < parts.length; i++) {
    let p = parts[i];
    if (p.endsWith("h")) totalMinutes += (parseInt(p)||0) * 60;
    else if (p.endsWith("m")) totalMinutes += parseInt(p)||0;
    else if (p === "pp") isPP = true;
    else if (p === "q") isQuiz = true;
  }

  sessionHistory.push(JSON.stringify(subjects));
  redoHistory = [];
  addSession(subjectCode, totalMinutes, isPP, isQuiz);
  document.getElementById("sessionInput").value = "";
  saveUserData();
}

function addSession(subjectCode, totalMinutes, isPP, isQuiz) {
  const subject = subjects.find(s => s.code === subjectCode);
  if (!subject) return alert("Invalid subject code");

  let marksGain = totalMinutes * (100/900); // 15h=100marks
  let xpGain = marksGain * 2; // XP x2 speed

  if (isPP) { marksGain += 5; xpGain += 5; }
  if (isQuiz) { marksGain += 3; xpGain += 3; }

  subject.marks += marksGain;
  subject.xp += xpGain;
  if (subject.marks > 100) subject.marks = 100;
  if (subject.xp > 100) subject.xp = 100;

  totalXP += xpGain;
  updateUI();
}

function undo() {
  if (!sessionHistory.length) return alert("Nothing to undo");
  redoHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(sessionHistory.pop());
  updateUI(); saveUserData();
}

function redo() {
  if (!redoHistory.length) return alert("Nothing to redo");
  sessionHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(redoHistory.pop());
  updateUI(); saveUserData();
}

function resetAll() {
  if (!confirm("Are you sure to reset all?")) return;
  subjects.forEach(s=>{s.marks=0; s.xp=0});
  sessionHistory = []; redoHistory = []; totalXP = 0;
  updateUI(); saveUserData();
}

function updateUI() {
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";

  subjects.sort((a,b)=>b.marks-a.marks);
  subjects.forEach((s,index)=>{
    const div = document.createElement("div");
    div.className = "subject";
    div.innerHTML = `
      <strong>${index+1}. ${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
      <div class="progress marks-bar"><div class="progress-fill" style="width:${s.marks}%"></div></div>
      XP: ${s.xp.toFixed(1)}/100
      <div class="progress xp-bar"><div class="progress-fill" style="width:${s.xp}%"></div></div>
    `;
    container.appendChild(div);
    setTimeout(()=>div.classList.add("show"),100); // smooth scroll-in effect
  });

  const summary = document.getElementById("summaryContainer");
  summary.innerHTML = `
    <strong>Total Marks: ${subjects.reduce((a,b)=>a+b.marks,0).toFixed(1)}/900</strong>
    <strong>Total XP: ${totalXP.toFixed(1)}</strong>
  `;
}

window.onload = updateUI;
