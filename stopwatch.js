// Stopwatch logic
let hours = 0, minutes = 0, seconds = 0;
let timer = null;
const display = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const saveBtn = document.getElementById("saveBtn");

// Populate subjects
const swSubject = document.getElementById("swSubject");
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
subjects.forEach(s => {
  const option = document.createElement("option");
  option.value = s.code;
  option.textContent = s.name;
  swSubject.appendChild(option);
});

function updateDisplay() {
  const h = String(hours).padStart(2,'0');
  const m = String(minutes).padStart(2,'0');
  const s = String(seconds).padStart(2,'0');
  display.textContent = `${h}:${m}:${s}`;
}

// Start / Pause / Reset
startBtn.addEventListener("click", () => {
  if(timer) return;
  timer = setInterval(() => {
    seconds++;
    if(seconds >= 60){ seconds = 0; minutes++; }
    if(minutes >= 60){ minutes = 0; hours++; }
    updateDisplay();
  },1000);
});

pauseBtn.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
});

resetBtn.addEventListener("click", () => {
  clearInterval(timer);
  timer = null;
  hours = minutes = seconds = 0;
  updateDisplay();
});

// Save session
saveBtn.addEventListener("click", () => {
  const code = swSubject.value;
  const type = document.getElementById("swType").value;
  const pp = document.getElementById("swPP").checked;
  const q = document.getElementById("swQ").checked;

  if(!code) return alert("Select a subject!");

  // convert total time to minutes
  const totalMinutes = hours*60 + minutes + seconds/60;
  if(totalMinutes <= 0) return alert("Time must be greater than 0");

  // store pending session in localStorage
  localStorage.setItem("pendingSession", JSON.stringify({
    code, minutes: totalMinutes, pp, q, type
  }));

  alert(`Session saved! ${hours}h ${minutes}m ${seconds}s for ${type}`);
  
  // reset stopwatch
  hours = minutes = seconds = 0;
  updateDisplay();
  clearInterval(timer);
  timer = null;
});
