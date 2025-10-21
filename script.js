let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name:"Sinhala", code:"sin", marks:0, xp:0 },
  { name:"Science", code:"sci", marks:0, xp:0 },
  { name:"Commerce", code:"com", marks:0, xp:0 },
  { name:"Buddhism", code:"bud", marks:0, xp:0 },
  { name:"History", code:"his", marks:0, xp:0 },
  { name:"Dancing", code:"dan", marks:0, xp:0 },
  { name:"Health", code:"hea", marks:0, xp:0 },
  { name:"Maths", code:"mat", marks:0, xp:0 },
  { name:"English", code:"eng", marks:0, xp:0 }
];

let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
let redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || [];

function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
}

// Animate number
function animateNumber(el, start, end, duration=800){
  const range=end-start;
  let startTime=null;
  function step(time){
    if(!startTime) startTime=time;
    let progress=Math.min((time-startTime)/duration,1);
    el.textContent=(start+range*progress).toFixed(1);
    if(progress<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Update UI
function updateUI(){
  const container=document.getElementById("subjectContainer");
  container.innerHTML="";
  subjects.sort((a,b)=>b.marks-a.marks);

  subjects.forEach((s,index)=>{
    const xpPercent=(s.xp/100)*100;
    const subDiv=document.createElement("div");
    subDiv.className="subject";
    subDiv.innerHTML=`
      <strong>${index+1}. ${s.name}</strong> - Marks: <span class="marks-value">${s.marks.toFixed(1)}</span>
      <div class="progress xp-bar"><div class="progress-fill xp-fill" style="width:${xpPercent}%;"></div></div>
      <small>XP: ${s.xp.toFixed(1)}/100</small>
      <div class="progress marks-bar"><div class="progress-fill" style="width:${s.marks.toFixed(1)}%"></div></div>
    `;
    container.appendChild(subDiv);
    setTimeout(()=>subDiv.classList.add("visible"),100*index);
  });

  const totalMarks=subjects.reduce((a,b)=>a+b.marks,0);
  const maxMarks=900;
  const totalMarksEl=document.getElementById("totalMarksBottom");
  if(totalMarksEl) animateNumber(totalMarksEl,parseFloat(totalMarksEl.textContent)||0,totalMarks);
  const fill=document.getElementById("fullMarksFill");
  if(fill) fill.style.width=(totalMarks/maxMarks*100).toFixed(1)+"%";

  const totalXP=subjects.reduce((a,b)=>a+b.xp,0);
  const totalXPEl=document.getElementById("totalXPBottom");
  if(totalXPEl) animateNumber(totalXPEl,parseFloat(totalXPEl.textContent)||0,totalXP);
  const xpFill=document.getElementById("fullXPFill");
  if(xpFill) xpFill.style.width=(totalXP/900*100).toFixed(1)+"%"; // 900 max XP
}

// Handle session input
function handleSessionInput(){
  const input=document.getElementById("sessionInput").value.trim().toLowerCase();
  if(!input) return;
  const parts=input.split(" ");
  const code=parts[0];
  let totalMinutes=0, pp=false, quiz=false;
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

// Add session
function addSession(code,totalMinutes,pp,quiz){
  const subject=subjects.find(s=>s.code===code);
  if(!subject){ alert("Invalid subject code"); return; }

  let marksGain=totalMinutes*(100/900); // 15h=900min →100 marks
  let xpGain=totalMinutes*(100/900); 
  if(pp){marksGain+=5; xpGain+=5;}
  if(quiz){marksGain+=3; xpGain+=3;}

  subject.marks+=marksGain;
  subject.xp+=xpGain;

  if(subject.marks>100) subject.marks=100;
  if(subject.xp>100) subject.xp=100;

  updateUI();
}

// Undo / Redo
function undo(){
  if(sessionHistory.length===0) return alert("Nothing to undo");
  redoHistory.push(JSON.stringify(subjects));
  subjects=JSON.parse(sessionHistory.pop());
  updateUI(); saveData();
}
function redo(){
  if(redoHistory.length===0) return alert("Nothing to redo");
  sessionHistory.push(JSON.stringify(subjects));
  subjects=JSON.parse(redoHistory.pop());
  updateUI(); saveData();
}

// Reset all
function resetAll(){
  if(!confirm("Reset all marks and XP?")) return;
  subjects.forEach(s=>{s.marks=0; s.xp=0;});
  sessionHistory=[]; redoHistory=[];
  saveData();
  updateUI();
}

// Motivation quote
const quotes=[
  "Every day is a new chance to improve!",
  "Small steps lead to big progress!",
  "Stay consistent, stay strong!",
  "Knowledge is power, keep studying!",
  "Focus today, succeed tomorrow!"
];
function showMotivation(){
  const el=document.getElementById("motivation");
  if(el) el.textContent=quotes[Math.floor(Math.random()*quotes.length)];
}

window.onload=()=>{ updateUI(); showMotivation(); };
