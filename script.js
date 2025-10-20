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
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";

  subjects.forEach(s => {
    const xpPercent = (s.xp / 50) * 100;
    const marksPercent = Math.min((s.marks / 100) * 100, 100);

    container.innerHTML += `
      <div class="subject">
        <strong>${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
        
        <div class="progress xp-bar">
          <div class="progress-fill" style="width:${xpPercent}%;"></div>
        </div>
        <small>XP: ${s.xp.toFixed(1)}/50</small>

        <div class="progress marks-bar">
          <div class="progress-fill" style="width:${marksPercent}%;"></div>
        </div>
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
  let totalHours = 0, totalMinutes = 0;
  let isPP = false, isQuiz = false;

  // Sum all hours and minutes
  for (let i = 1; i < parts.length; i++) {
    let p = parts[i];
    if (p.endsWith("h")) totalHours += parseInt(p) || 0;
    else if (p.endsWith("m")) totalMinutes += parseInt(p) || 0;
    else if (p === "pp") isPP = true;
    else if (p === "q") isQuiz = true;
  }

  addSession(subjectCode, totalHours, totalMinutes, isPP, isQuiz);
  document.getElementById("sessionInput").value = "";
}


function addSession(subjectCode, hours, minutes, isPP, isQuiz) {
  const subject = subjects.find(s => s.code === subjectCode);
  if (!subject) return alert("Invalid subject code");

  let totalMinutes = (hours * 60) + minutes;
  let xpGain = (totalMinutes / 6);
  if (isPP) xpGain += 5;
  if (isQuiz) xpGain += 3;

  subject.xp += xpGain;

  while (subject.xp >= 50) {
    subject.xp -= 50;
    subject.marks += 2.5;
    if (subject.marks > 100) subject.marks = 100;
    document.getElementById("levelupSound").play();
  }

  saveData();
  updateUI();
  addHistory(`${subject.name}: +${xpGain.toFixed(1)} XP, Marks now: ${subject.marks.toFixed(1)}`);
}

window.onload = updateUI;
