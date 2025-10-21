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

// Animate numbers
function animateNumber(el,start,end,duration=800){ const range=end-start; let startTime=null; function step(time){ if(!startTime) startTime=time; let progress=Math.min((time-startTime)/duration,1); el.textContent=(start+range*progress).toFixed(1); if(progress<1) requestAnimationFrame(step); } requestAnimationFrame(step); }

// Update UI
function updateUI(){
  const container=document.getElementById("subjectContainer");
  container.innerHTML="";
  subjects.sort((a,b)=>b.marks-a.marks);
  subjects.forEach((s,index)=>{
    const xpPercent=s.xp; // max 100
    container.innerHTML+=`
      <div class="subject">
        <strong>${index+1}. ${s.name}</strong> - Marks: <span class="marks-value">${s.marks.toFixed(1)}</span>
        <div class="progress xp-bar">
          <div class="progress-fill" style="width:${xpPercent}%;"></div>
        </div>
        <small>XP: ${s.xp.toFixed(1)}/100</small>
        <div class="progress marks-bar">
          <div class="progress-fill" style="width:${s.marks.toFixed(1)}%"></div>
        </div>
      </div>`;
  });

  // Total marks
  const totalMarks=subjects.reduce((a,b)=>a+b.marks,0);
  const maxMarks=900;
  const totalMarksEl=document.getElementById("totalMarksBottom");
  if(totalMarksEl) animateNumber(totalMarksEl,parseFloat(totalMarksEl.textContent)||0,totalMarks);
  const fill=document.getElementById("fullMarksFill");
  if(fill) fill.style.width=(totalMarks/maxMarks*100).toFixed(1)+"%";

  updateAchievements();
}

// Session input
function handleSessionInput(){
  const input=document.getElementById("sessionInput").value.trim().toLowerCase();
  if(!input) return;
  const parts=input.split(" ");
  const code=parts[0];
  let totalMinutes=0,pp=false,quiz=false;
  for(let i=1;i<parts.length;i++){
    let p=parts[i];
    if(p.endsWith("h")) totalMinutes+=(parseInt(p)||0)*60;
    else if(p.endsWith("m")) totalMinutes+=parseInt(p)||0;
    else if(p==="pp") pp=true;
    else if(p==="q") quiz=true;
  }
  sessionHistory.push(JSON.stringify(subjects));
  redoHistory=[];
  addSession(code,totalMinutes,pp,quiz);
  document.getElementById("sessionInput").value="";
  saveData();
}

// Add XP & marks
function addSession(code,minutes,pp,quiz){
  const sub=subjects.find(s=>s.code===code);
  if(!sub) return alert("Invalid subject code");
  let xpGain=minutes*(100/600);
  if(pp) xpGain+=5;
  if(quiz) xpGain+=3;
  sub.xp+=xpGain;
  let marksGain=minutes*(100/600);
  if(pp) marksGain+=5;
  if(quiz) marksGain+=3;
  sub.marks+=marksGain;
  if(sub.marks>100) sub.marks=100;
  if(sub.xp>100) sub.xp=100;
  updateUI();
}

// Undo/Redo/Reset
function undo(){ if(sessionHistory.length===0) return alert("Nothing to undo"); redoHistory.push(JSON.stringify(subjects)); subjects=JSON.parse(sessionHistory.pop()); updateUI(); saveData();}
function redo(){ if(redoHistory.length===0) return alert("Nothing to redo"); sessionHistory.push(JSON.stringify(subjects)); subjects=JSON.parse(redoHistory.pop()); updateUI(); saveData();}
function resetAll(){ if(!confirm("Are you sure?")) return; subjects.forEach(s=>{s.marks=0;s.xp=0;}); sessionHistory=[]; redoHistory=[]; saveData(); updateUI();}

// Motivation
const quotes=[
  "Stay focused and never give up!",
  "Consistency is key to mastery.",
  "Every hour counts, keep going!",
  "Your future self will thank you.",
  "Small steps lead to big progress."
];
function showMotivation(){ document.getElementById("motivation").textContent=quotes[Math.floor(Math.random()*quotes.length)]; }
setInterval(showMotivation,15000);

// Achievements
const achievements=[
  {id:"1h",name:"1 Hour Total",hours:1,unlocked:false},
  {id:"5h",name:"5 Hours Total",hours:5,unlocked:false},
  {id:"15h",name:"15 Hours Total",hours:15,unlocked:false},
  {id:"30h",name:"30 Hours Total",hours:30,unlocked:false},
  {id:"60h",name:"60 Hours Total",hours:60,unlocked:false},
  {id:"100h",name:"100 Hours Total",hours:100,unlocked:false},
  {id:"150h",name:"150 Hours Total",hours:150,unlocked:false},
  {id:"7d",name:"7 Days in a Row",streak:7,unlocked:false},
  {id:"14d",name:"14 Days in a Row",streak:14,unlocked:false},
  {id:"21d",name:"21 Days in a Row",streak:21,unlocked:false},
  {id:"30d",name:"30 Days in a Row",streak:30,unlocked:false},
  {id:"500xp",name:"500 XP",xp:500,unlocked:false},
  {id:"1000xp",name:"1000 XP",xp:1000,unlocked:false}
];

function updateAchievements(){
  const container=document.getElementById("achievementsContainer");
  container.innerHTML="";
  const totalHours=subjects.reduce((a,b)=>a.marks*(15/100)+a.xp*(15/100),0); // rough hours calculation
  const totalXP=subjects.reduce((a,b)=>a.xp,0);
  achievements.forEach(a=>{
    let unlocked=false;
    if(a.hours && totalHours>=a.hours) unlocked=true;
    if(a.xp && totalXP>=a.xp) unlocked=true;
    if(a.streak) unlocked=false; // streak logic later
    container.innerHTML+=`<div class="achievement ${unlocked?"unlocked":""}" title="${a.name}">${a.name}</div>`;
  });
}

window.onload=()=>{ updateUI(); showMotivation(); };
