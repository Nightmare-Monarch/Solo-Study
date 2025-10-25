// v3.1.0 main script
// Subjects with marks & xp
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

// sessionHistory stores full session objects (for history page and undo)
let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || []; 
let redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || [];
let dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || []; // {date, hours, marks, xp}
let undoStack = JSON.parse(localStorage.getItem("undoStack")) || [];

// constants
const MAX_MARKS_PER_SUBJECT = 100;
const MAX_TOTAL_MARKS = subjects.length * MAX_MARKS_PER_SUBJECT; // 900
const MAX_TOTAL_XP = 50000;

// utility: save all
function saveAll(){
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
  localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));
  localStorage.setItem("undoStack", JSON.stringify(undoStack));
}

// generate id
function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

// UI update
function updateUI(){
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";
  // show subjects — Marks + (XP - 345)
  subjects.forEach((s, idx) => {
    const xpDisplay = Math.floor(s.xp);
    const marksDisplay = s.marks.toFixed(1);
    container.innerHTML += `
      <div class="subject">
        <strong>${idx+1}. ${s.name}</strong> - Marks: ${marksDisplay} <span class="xp-inline">(XP - ${xpDisplay})</span>
        <div class="progress marks-bar"><div class="progress-fill" style="width:${Math.min(s.marks,100)}%"></div></div>
      </div>
    `;
  });

  // total marks & xp
  const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
  const totalXP = subjects.reduce((a,b)=>a+b.xp,0);
  document.getElementById("totalMarksBottom").textContent = totalMarks.toFixed(1);
  document.getElementById("fullMarksFill").style.width = Math.min(totalMarks / MAX_TOTAL_MARKS * 100, 100) + "%";

  document.getElementById("totalXPBottom").textContent = Math.floor(totalXP);
  document.getElementById("fullXPFill").style.width = Math.min(totalXP / MAX_TOTAL_XP * 100, 100) + "%";

  saveAll();
}

// parse input like: "sin 2h pp", "sin 1h H", "sin 1h V q"
function handleSessionInput(){
  const inputEl = document.getElementById("sessionInput");
  const raw = (inputEl.value || "").trim();
  if(!raw) return;
  const parts = raw.split(/\s+/);
  const code = parts[0].toLowerCase();
  let minutes = 0;
  let pp = false, q = false;
  let type = "study"; // 'study' (marks+xp), 'homework' (H, xp-only), 'video' (V, double xp)
  for(let i=1;i<parts.length;i++){
    const p = parts[i];
    if(/^\d+h$/i.test(p)){
      minutes += (parseInt(p)||0) * 60;
    } else if(/^\d+m$/i.test(p)){
      minutes += parseInt(p)||0;
    } else if(p.toLowerCase() === "pp") pp = true;
    else if(p.toLowerCase() === "q") q = true;
    else if(p.toUpperCase() === "H") type = "homework";
    else if(p.toUpperCase() === "V") type = "video";
  }

  if(minutes <= 0) { alert("Please include duration (e.g. 1h or 30m)"); return; }

  // push current state into undo stack
  undoStack.push({
    subjects: JSON.parse(JSON.stringify(subjects)),
    sessionHistory: JSON.parse(JSON.stringify(sessionHistory)),
    dailyProgress: JSON.parse(JSON.stringify(dailyProgress))
  });
  // trim undo stack size (optional)
  if(undoStack.length > 100) undoStack.shift();

  addSession(code, minutes, {pp, q, type});
  inputEl.value = "";
  updateUI();
}

// core addSession
function addSession(code, minutes, flags){
  const sub = subjects.find(s => s.code === code);
  if(!sub) return alert("Invalid subject code: " + code);

  const hours = minutes / 60;
  const pp = flags.pp;
  const q = flags.q;
  const type = flags.type || "study";

  // xp rules
  let xpPerHour = 50;
  if(type === "video") xpPerHour = 100; // double xp for V
  // Homework uses normal xpPerHour (50)
  let xpGain = hours * xpPerHour;
  if(pp) xpGain += 5;
  if(q) xpGain += 3;

  // marks rules: only for study (type === 'study')
  let marksGain = 0;
  if(type === "study") {
    marksGain = hours * (100/15);
    if(pp) marksGain += 5;
    if(q) marksGain += 3;
  }

  // apply to subject (xp can go beyond 100; user wanted subject XP to show up to high numbers)
  sub.xp = (sub.xp || 0) + xpGain;
  sub.marks = (sub.marks || 0) + marksGain;
  if(sub.marks > MAX_MARKS_PER_SUBJECT) sub.marks = MAX_MARKS_PER_SUBJECT;

  // session record object
  const now = new Date();
  const dateStr = now.toISOString().slice(0,10);
  const session = {
    id: genId(),
    subject: code,
    subjectName: sub.name,
    minutes: minutes,
    hours: hours,
    marksGain: marksGain,
    xpGain: xpGain,
    type: type, // study/homework/video
    pp: !!pp,
    q: !!q,
    date: dateStr,
    timestamp: now.toISOString()
  };

  sessionHistory.push(session);

  // dailyProgress aggregation
  let daily = dailyProgress.find(d => d.date === dateStr);
  if(!daily){
    daily = { date: dateStr, hours: 0, marks: 0, xp: 0 };
    dailyProgress.push(daily);
  }
  daily.hours += hours;
  daily.marks += marksGain;
  daily.xp += xpGain;

  saveAll();
}

// Undo / Redo / Reset All
function undo(){
  if(!undoStack.length) return alert("Nothing to undo");
  const prev = undoStack.pop();
  redoHistory.push(JSON.parse(JSON.stringify({
    subjects, sessionHistory, dailyProgress
  })));
  subjects = prev.subjects;
  sessionHistory = prev.sessionHistory;
  dailyProgress = prev.dailyProgress;
  saveAll();
  updateUI();
}
function redo(){
  if(!redoHistory.length) return alert("Nothing to redo");
  const next = redoHistory.pop();
  undoStack.push(JSON.parse(JSON.stringify({
    subjects, sessionHistory, dailyProgress
  })));
  subjects = next.subjects;
  sessionHistory = next.sessionHistory;
  dailyProgress = next.dailyProgress;
  saveAll();
  updateUI();
}
function resetAll(){
  if(!confirm("Reset all marks, xp, history and daily progress?")) return;
  subjects.forEach(s => { s.marks = 0; s.xp = 0; });
  sessionHistory = [];
  dailyProgress = [];
  redoHistory = [];
  undoStack = [];
  saveAll();
  updateUI();
}

// When page loads: check if there's a pendingSession from stopwatch
function applyPendingFromStopwatch(){
  const pendingRaw = localStorage.getItem("pendingSession");
  if(!pendingRaw) return;
  try {
    const pending = JSON.parse(pendingRaw);
    // pending must contain: code, minutes, pp, q, type
    // add to undo stack
    undoStack.push({
      subjects: JSON.parse(JSON.stringify(subjects)),
      sessionHistory: JSON.parse(JSON.stringify(sessionHistory)),
      dailyProgress: JSON.parse(JSON.stringify(dailyProgress))
    });
    addSession(pending.code, pending.minutes, { pp: !!pending.pp, q: !!pending.q, type: pending.type || "study" });
    localStorage.removeItem("pendingSession");
    // feedback to user
    alert(`Applied pending session: ${pending.code} ${Math.floor(pending.minutes/60)}h ${pending.minutes%60}m`);
    saveAll();
    updateUI();
  } catch(e){ console.error(e); }
}

// ENTER key handler
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("sessionInput");
  input.addEventListener("keydown", (e) => { if(e.key === "Enter") handleSessionInput(); });

  // load saved subjects etc.
  subjects = JSON.parse(localStorage.getItem("subjects")) || subjects;
  sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || sessionHistory;
  dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || dailyProgress;
  redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || redoHistory;
  undoStack = JSON.parse(localStorage.getItem("undoStack")) || undoStack;

  applyPendingFromStopwatch();
  updateUI();
  showMotivation();
});

// Motivation quotes
const quotes = [
  "Stay focused and never give up!",
  "Consistency is key to mastery.",
  "Every hour counts, keep going!",
  "Your future self will thank you.",
  "Small steps lead to big progress."
];
function showMotivation(){
  const el = document.getElementById("motivationQuote");
  if(!el) return;
  el.textContent = quotes[Math.floor(Math.random()*quotes.length)];
}
setInterval(showMotivation, 15000);
