// === SOLO LEVELING STUDY SYSTEM ===
// System B: 2 XP = 1 MARK

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

const xpPerHour = 15;
const xpToMarkRatio = 2; // 2 XP = 1 Mark
const fullMarksGoal = 822;

// === Helper functions ===

function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function updateUI() {
  const container = document.getElementById("subjects");
  container.innerHTML = "";

  // Sort by marks (high → low)
  subjects.sort((a, b) => b.marks - a.marks);

  subjects.forEach((subj, index) => {
    const div = document.createElement("div");
    div.className =
      "subject bg-gray-800 text-white p-3 rounded-2xl mb-2 flex justify-between items-center shadow-md transition-all duration-300 hover:bg-gray-700";

    div.innerHTML = `
      <span>${index + 1}. ${subj.name}</span>
      <span>${subj.marks.toFixed(1)} Marks | ${subj.xp.toFixed(0)} XP</span>
    `;
    container.appendChild(div);
  });

  // Update total marks bar
  const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
  const percent = Math.min((totalMarks / fullMarksGoal) * 100, 100);
  document.getElementById("totalMarks").textContent = `Full Marks: ${totalMarks.toFixed(1)} / ${fullMarksGoal}`;
  document.getElementById("progressBar").style.width = `${percent}%`;
}

function addStudyTime(input) {
  const regex = /([a-z]+)\s*(\d+)(h|m)/i;
  const match = input.match(regex);

  if (!match) {
    alert("Invalid format! Use like 'sin 1h' or 'sci 30m'");
    return;
  }

  const code = match[1].toLowerCase();
  const amount = parseInt(match[2]);
  const type = match[3].toLowerCase();

  const subject = subjects.find((s) => s.code === code);
  if (!subject) {
    alert("Subject code not found!");
    return;
  }

  // XP calculation
  let xp = type === "h" ? amount * xpPerHour : (amount / 60) * xpPerHour;
  subject.xp += xp;
  subject.marks = subject.xp / xpToMarkRatio;

  saveData();
  updateUI();
}

// === Reset function ===
function resetAll() {
  if (confirm("Reset all progress?")) {
    subjects.forEach((s) => {
      s.marks = 0;
      s.xp = 0;
    });
    saveData();
    updateUI();
  }
}

// === Initial Load ===
document.addEventListener("DOMContentLoaded", updateUI);
