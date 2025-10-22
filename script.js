// ---- CONFIG ---- //
const MARKS_FOR_15_HOURS = 100; // 15 hours -> 100 marks
const MINUTES_IN_15_HOURS = 15 * 60; // 900
const MARKS_PER_MINUTE = MARKS_FOR_15_HOURS / MINUTES_IN_15_HOURS; // ≈0.111111...
const XP_PER_HOUR = 50; // 1 hour = 50 XP
const XP_PER_MINUTE = XP_PER_HOUR / 60; // ≈0.833333...
const TOTAL_XP_CAP = 100000;
const SUBJECT_XP_CAP = 100;
const SUBJECT_MARKS_CAP = 100;
const MAX_TOTAL_MARKS = 900; // 9 subjects * 100
// --------------- //

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
let dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || []; // {date:'YYYY-MM-DD', minutes: N}
let totalXP = parseFloat(localStorage.getItem("totalXP")) || 0;

// Save all relevant data
function saveData(){
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
  localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));
  localStorage.setItem("totalXP", totalXP.toString());
}

// Utility: animate number
function animateNumber(el, start, end, duration = 700){
  start = parseFloat(start) || 0;
  const range = end - start;
  let startTime = null;
  function step(time){
    if(!startTime) startTime = time;
    const t = Math.min((time - startTime) / duration, 1);
    el.textContent = (start + range * t).toFixed(1);
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Build subject UI
function updateUI(){
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";
  // sort by marks descending
  subjects.sort((a,b)=>b.marks - a.marks);

  subjects.forEach((s, idx) => {
    const subjectEl = document.createElement("div");
    subjectEl.className = "subject";
    subjectEl.innerHTML = `
      <div class="subject-row">
        <h3>${idx+1}. ${s.name}</h3>
        <div class="meta">Marks ${s.marks.toFixed(1)} • XP ${s.xp.toFixed(1)}/100</div>
      </div>

      <div class="progress-row">
        <div class="progress" style="width:80%;margin:0 auto;">
          <div class="progress-fill xp-fill" style="width:${Math.min(s.xp, SUBJECT_XP_CAP)}%"></div>
        </div>
        <div style="height:6px"></div>
        <div class="progress" style="width:80%;margin:0 auto;">
          <div class="progress-fill marks-fill" style="width:${Math.min(s.marks, SUBJECT_MARKS_CAP)}%"></div>
        </div>
      </div>
    `;
    container.appendChild(subjectEl);
  });

  // update totals
  const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
  const totalMarksEl = document.getElementById("totalMarksBottom");
  animateNumber(totalMarksEl, parseFloat(totalMarksEl.textContent)||0, totalMarks);

  const fullMarksFill = document.getElementById("fullMarksFill");
  fullMarksFill.style.width = (Math.min(totalMarks, MAX_TOTAL_MARKS) / MAX_TOTAL_MARKS * 100).toFixed(1) + "%";

  const totalXPEl = document.getElementById("totalXPBottom");
  animateNumber(totalXPEl, parseFloat(totalXPEl.textContent)||0, totalXP);

  const fullXPFill = document.getElementById("fullXPFill");
  fullXPFill.style.width = (Math.min(totalXP, TOTAL_XP_CAP) / TOTAL_XP_CAP * 100).toFixed(2) + "%";
}

// Parse user input like "sci 1h 30m pp q"
function parseSessionInput(input){
  input = (input||"").trim().toLowerCase();
  if(!input) return null;
  const parts = input.split(/\s+/);
  const code = parts[0];
  let minutes = 0;
  let isPP = false, isQuiz = false;
  for(let i=1;i<parts.length;i++){
    const p = parts[i];
    if(p.endsWith("h")){
      const n = parseInt(p.slice(0,-1))||0; minutes += n*60;
    } else if(p.endsWith("m")){
      minutes += parseInt(p.slice(0,-1))||0;
    } else if(p === 'pp') isPP = true;
    else if(p === 'q') isQuiz = true;
  }
  return {code, minutes, isPP, isQuiz};
}

// Add session (minutes given)
function addSession(code, minutes, isPP=false, isQuiz=false){
  const subject = subjects.find(s => s.code === code);
  if(!subject) { alert("Invalid subject code: " + code); return; }

  // push snapshot for undo
  sessionHistory.push(JSON.stringify({subjects, totalXP, dailyProgress}));
  // clear redo stack
  redoHistory = [];

  // marks: based on minutes -> 15h = 900min => 100 marks
  const marksGain = minutes * MARKS_PER_MINUTE; // per minute marks
  // xp: minutes -> xp (1h = 50 xp)
  const xpGain = minutes * XP_PER_MINUTE;
  // optional bonuses
  let bonusMarks = 0, bonusXP = 0;
  if(isPP){ bonusMarks += 5; bonusXP += 5; }
  if(isQuiz){ bonusMarks += 3; bonusXP += 3; }

  subject.marks = Math.min(SUBJECT_MARKS_CAP, subject.marks + marksGain + bonusMarks);
  subject.xp = Math.min(SUBJECT_XP_CAP, subject.xp + (xpGain + bonusXP));

  // update totalXP (global) — not per-subject cap
  totalXP = Math.min(TOTAL_XP_CAP, totalXP + (xpGain + bonusXP));

  // record dailyProgress (minutes)
  const today = new Date().toISOString().slice(0,10);
  const rec = dailyProgress.find(r=>r.date===today);
  if(rec) rec.minutes += minutes;
  else dailyProgress.push({date: today, minutes: minutes});

  saveData();
  updateUI();
}

// handlers
function handleSessionInput(){
  const val = document.getElementById("sessionInput").value;
  const parsed = parseSessionInput(val);
  if(!parsed) return;
  addSession(parsed.code, parsed.minutes, parsed.isPP, parsed.isQuiz);
  document.getElementById("sessionInput").value = "";
}

// undo / redo / reset
function undo(){
  if(sessionHistory.length === 0){ alert("Nothing to undo"); return; }
  const snap = sessionHistory.pop();
  redoHistory.push(JSON.stringify({subjects, totalXP, dailyProgress}));
  const obj = JSON.parse(snap);
  subjects = JSON.parse(JSON.stringify(obj.subjects));
  totalXP = obj.totalXP || 0;
  dailyProgress = obj.dailyProgress || [];
  saveData();
  updateUI();
}
function redo(){
  if(redoHistory.length === 0){ alert("Nothing to redo"); return; }
  const snap = redoHistory.pop();
  sessionHistory.push(JSON.stringify({subjects, totalXP, dailyProgress}));
  const obj = JSON.parse(snap);
  subjects = JSON.parse(JSON.stringify(obj.subjects));
  totalXP = obj.totalXP || 0;
  dailyProgress = obj.dailyProgress || [];
  saveData();
  updateUI();
}
function resetAll(){
  if(!confirm("Reset all marks, XP and history?")) return;
  subjects.forEach(s=>{ s.marks = 0; s.xp = 0; });
  totalXP = 0;
  sessionHistory = [];
  redoHistory = [];
  dailyProgress = [];
  saveData();
  updateUI();
}

// small helper: show motivation rotating
const quotes = [
  "Stay focused — one step at a time.",
  "Small steps daily = big results.",
  "Consistency beats intensity.",
  "Learn. Repeat. Improve.",
  "Discipline builds freedom."
];
function showMotivation(){
  const el = document.getElementById("motivation");
  if(!el) return;
  el.textContent = quotes[Math.floor(Math.random()*quotes.length)];
}
setInterval(showMotivation, 15000);

// init
window.onload = function(){
  // migrate older storage shapes if needed
  // ensure dailyProgress shape
  if(!Array.isArray(dailyProgress)) dailyProgress = [];

  updateUI();
  showMotivation();
};
