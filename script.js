let subjects = [
  { name: "Math", marks: 0, xp: 0 },
  { name: "Science", marks: 0, xp: 0 },
  { name: "English", marks: 0, xp: 0 },
  { name: "History", marks: 0, xp: 0 },
  { name: "ICT", marks: 0, xp: 0 }
];

let totalMarks = 0;
let totalXP = 0;
let history = [];
let future = [];

function renderSubjects() {
  const section = document.getElementById("subjects");
  section.innerHTML = "";
  subjects.forEach((sub, i) => {
    section.innerHTML += `
      <div class="bar-container">
        <h3>${sub.name}</h3>
        <div class="mark-bar"><div class="fill" style="width:${sub.marks / 1000 * 100}%"></div></div>
        <div class="xp-bar"><div class="fill" style="width:${sub.xp / 750 * 100}%"></div></div>
      </div>
    `;
  });

  document.getElementById("totalMarkBar").style.width = `${(totalMarks / 1000) * 100}%`;
  document.getElementById("totalXPBar").style.width = `${(totalXP / 100000) * 100}%`;
}

function addSession() {
  const input = document.getElementById("sessionInput");
  const text = input.value.trim();
  if (text === "") return;

  saveHistory();

  const hours = 1;
  const gainedMarks = (hours / 15) * 100;
  const gainedXP = gainedMarks * 50;

  subjects.forEach(sub => {
    sub.marks += gainedMarks;
    sub.xp += gainedXP / 5;
  });

  totalMarks += gainedMarks;
  totalXP += gainedXP;

  input.value = "";
  renderSubjects();
}

function saveHistory() {
  history.push(JSON.parse(JSON.stringify(subjects)));
  future = [];
}

function undo() {
  if (history.length === 0) return;
  future.push(JSON.parse(JSON.stringify(subjects)));
  subjects = history.pop();
  renderSubjects();
}

function redo() {
  if (future.length === 0) return;
  history.push(JSON.parse(JSON.stringify(subjects)));
  subjects = future.pop();
  renderSubjects();
}

function resetAll() {
  if (!confirm("Are you sure to reset all progress?")) return;
  subjects.forEach(sub => { sub.marks = 0; sub.xp = 0; });
  totalMarks = 0;
  totalXP = 0;
  renderSubjects();
}

function openHistory() { alert("History page coming soon!"); }
function openStopwatch() { alert("Stopwatch page coming soon!"); }

renderSubjects();
