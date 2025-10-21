let timerInterval;
let totalSeconds = 0;
let running = false;

// Load subjects and daily progress
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

let dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || [];
let totalXP = JSON.parse(localStorage.getItem("totalXP")) || 0;

// Stopwatch functions
function updateDisplay() {
  let h = Math.floor(totalSeconds / 3600);
  let m = Math.floor((totalSeconds % 3600) / 60);
  let s = totalSeconds % 60;
  document.getElementById("stopwatch").textContent =
    `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function startStopwatch() {
  if(running) return;
  running = true;
  timerInterval = setInterval(() => {
    totalSeconds++;
    updateDisplay();
  }, 1000);
}

function pauseStopwatch() {
  running = false;
  clearInterval(timerInterval);
}

function resetStopwatch() {
  running = false;
  clearInterval(timerInterval);
  totalSeconds = 0;
  updateDisplay();
}

// Submit session
function submitStopwatch() {
  const subjectCode = document.getElementById("subjectSelect").value;
  if(!subjectCode) return alert("Select a subject");

  const minutes = Math.floor(totalSeconds / 60);
  if(minutes <= 0) return alert("Stopwatch must be running at least 1 minute");

  // Calculate marks and XP (same system as progress)
  let marksGain = minutes * (100/900); // 15h=100 marks
  let xpGain = marksGain * 2; // XP x2

  const subject = subjects.find(s => s.code === subjectCode);
  subject.marks += marksGain;
  subject.xp += xpGain;
  if(subject.marks>100) subject.marks=100;
  if(subject.xp>100) subject.xp=100;

  // Daily progress record
  const today = new Date().toISOString().split("T")[0];
  const todayIndex = dailyProgress.findIndex(d => d.date === today);
  if(todayIndex === -1) dailyProgress.push({date: today, minutes: minutes});
  else dailyProgress[todayIndex].minutes += minutes;

  totalXP += xpGain;

  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));
  localStorage.setItem("totalXP", JSON.stringify(totalXP));

  alert(`Session submitted!\n${minutes} minutes added to ${subject.name}`);
  resetStopwatch();
}
