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

function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
}

// Update UI (marks bar fixed)
function updateUI(){
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";
  subjects.sort((a,b)=>b.marks - a.marks);
  subjects.forEach((s,index)=>{
    container.innerHTML+=`
      <div class="subject">
        <strong>${index+1}. ${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
        <div class="progress xp-bar"><div class="progress-fill" style="width:${s.xp}%;"></div></div>
        <div class="progress marks-bar"><div class="progress-fill" style="width:${s.marks}%;"></div></div>
      </div>`;
  });
  // Total marks bottom
  const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
  const maxMarks = 900;
  document.getElementById("totalMarksBottom").textContent = totalMarks.toFixed(1);
  document.getElementById("fullMarksFill").style.width = (totalMarks/maxMarks*100).toFixed(1)+"%";

  updateAchievements();
}

// Add session
function handleSessionInput(){
  const input = document.getElementById("sessionInput").value.trim().toLowerCase();
  if(!input) return;
  const parts = input.split(" ");
  const code = parts[0];
  let minutes=0, pp=false, quiz=false;
  for(let i=1;i<parts.length;i++){
    let p=parts[i];
    if(p.endsWith("h")) minutes += (parseInt(p)||0)*60;
    else if(p.endsWith("m")) minutes += parseInt(p)||0;
    else if(p==="pp") pp=true;
    else if(p==="q") quiz=true;
  }
  sessionHistory.push(JSON.stringify(subjects));
  redoHistory=[];
  addSession(code,minutes,pp,quiz);
  document.getElementById("sessionInput").value="";
  saveData();
}

function addSession(code,minutes,pp,quiz){
  const sub = subjects.find(s=>s.code===code);
  if(!sub) return alert("Invalid subject code");
  let xpGain = minutes*(100/600); if(pp) xpGain+=5; if(quiz) xpGain+=3;
  sub.xp += xpGain; if(sub.xp>100) sub.xp=100;
  let marksGain = minutes*(100/600); if(pp) marksGain+=5; if(quiz) marksGain+=3;
  sub.marks += marksGain; if(sub.marks>100) sub.marks=100;
  updateUI();
}

// Undo/Redo/Reset
function undo(){ if(sessionHistory.length===0) return; redoHistory.push(JSON.stringify(subjects)); subjects=JSON.parse(sessionHistory.pop()); updateUI(); saveData();}
function redo(){ if(redoHistory.length===0) return; sessionHistory.push(JSON.stringify(subjects)); subjects=JSON.parse(redoHistory.pop()); updateUI(); saveData();}
function resetAll(){ if(!confirm("Are you sure?")) return; subjects.forEach(s=>{s.marks=0;s.xp=0;}); sessionHistory=[]; redoHistory=[]; saveData(); updateUI();}

// Motivation
const quotes=["Stay focused and never give up!","Consistency is key to mastery.","Every hour counts, keep going!","Your future self will thank you.","Small steps lead to big progress."];
function showMotivation(){ document.getElementById("motivation").textContent=quotes[Math.floor(Math.random()*quotes.length)]; }
setInterval(showMotivation,15000);

// Achievements (simplified)
const achievements=[
  {name:"1 Hour Total",hours:1},{name:"5 Hours Total",hours:5},{name:"15 Hours Total",hours:15},
  {name:"30 Hours Total",hours:30},{name:"60 Hours Total",hours:60},{name:"100 Hours Total",hours:100},
  {name:"150 Hours Total",hours:150},{name:"500 XP",xp:500},{name:"1000 XP",xp:1000}
];
function updateAchievements(){
  const container = document.getElementById("achievementsContainer");
  container.innerHTML="";
  const totalXP = subjects.reduce((a,b)=>a+b.xp,0);
  const totalHours = subjects.reduce((a,b)=>a.marks*(15/100)+a.xp*(15/100),0);
  achievements.forEach(a=>{
    let unlocked=false;
    if(a.hours && totalHours>=a.hours) unlocked=true;
    if(a.xp && totalXP>=a.xp) unlocked=true;
    container.innerHTML+=`<div class="achievement ${unlocked?"unlocked":""}" title="${a.name}">${a.name}</div>`;
  });
}

window.onload = ()=>{ updateUI(); showMotivation(); };
