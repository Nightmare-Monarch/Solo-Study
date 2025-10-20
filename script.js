let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Sinhala", code: "sin", marks: 80, xp: 0 },
  { name: "Science", code: "sci", marks: 80, xp: 0 },
  { name: "Commerce", code: "com", marks: 94, xp: 0 },
  { name: "Buddhism", code: "bud", marks: 97, xp: 0 },
  { name: "History", code: "his", marks: 93, xp: 0 },
  { name: "Dancing", code: "dan", marks: 90, xp: 0 },
  { name: "Health", code: "hea", marks: 97, xp: 0 },
  { name: "Maths", code: "mat", marks: 98, xp: 0 },
  { name: "English", code: "eng", marks: 93, xp: 0 }
];

function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function updateUI() {
  subjects.sort((a,b) => b.marks - a.marks);
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";
  subjects.forEach(s => {
    const xpPercent = (s.xp / 50) * 100;
    container.innerHTML += `
      <div class="subject">
        <strong>${s.name}</strong> - ${s.marks.toFixed(1)} Marks
        <div class="progress">
          <div class="progress-fill" style="width:${xpPercent}%;"></div>
        </div>
        <small>${s.xp.toFixed(1)}/50 XP</small>
      </div>`;
  });
}

function addHistory(text) {
  let h = JSON.parse(localStorage.getItem("history")) || [];
  h.push(`${new Date().toLocaleString()} - ${text}`);
  localStorage.setItem("history", JSON.stringify(h));
}

function handleSessionInput() {
  const input = document.getElementById("sessionInput").value.trim().toLowerCase();
  if (!input) return;

  const parts = input.split(" ");
  const subjectCode = parts[0];
  let hours = 0, minutes = 0, isPP = false, isQuiz = false;

  parts.forEach(p => {
    if (p.endsWith("h")) hours = parseInt(p);
    else if (p.endsWith("m")) minutes = parseInt(p);
    else if (p === "pp") isPP = true;
    else if (p === "q") isQuiz = true;
  });

  addSession(subjectCode, hours, minutes, isPP, isQuiz);
  document.getElementById("sessionInput").value = "";
}

function addSession(subjectCode, hours, minutes, isPP, isQuiz) {
  const subject = subjects.find(s => s.code === subjectCode);
  if (!subject) return alert("Invalid subject code");

  let totalMinutes = (hours * 60) + minutes;
  let xpGain = (totalMinutes / 6); // 10 XP per 1h
  if (isPP) xpGain += 5;
  if (isQuiz) xpGain += 3;

  subject.xp += xpGain;

  while (subject.xp >= 50) {
    subject.xp -= 50;
    subject.marks += 2.5;
    document.getElementById("levelupSound").play();
  }

  saveData();
  updateUI();
  addHistory(`${subject.name}: +${xpGain.toFixed(1)} XP`);
}

window.onload = updateUI;
