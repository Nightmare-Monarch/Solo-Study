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
let dailyLog = JSON.parse(localStorage.getItem("dailyLog")) || {}; // key=date, value=minutes

function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
  localStorage.setItem("dailyLog", JSON.stringify(dailyLog));
}

// Animate numbers
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
  if(xpFill) xpFill.style.width=(totalXP/900*100).toFixed(1)+"%"; 

  updateAchievements(totalXP);
  updateCharts();
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

  // Log daily minutes
  const today=new Date().toISOString().split("T")[0];
  dailyLog[today]=(dailyLog[today]||0)+totalMinutes;
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

// Undo / Redo / Reset
function undo(){ if(sessionHistory.length===0) return alert("Nothing to undo"); redoHistory.push(JSON.stringify(subjects)); subjects=JSON.parse(sessionHistory.pop()); updateUI(); saveData(); }
function redo(){ if(redoHistory.length===0) return alert("Nothing to redo"); sessionHistory.push(JSON.stringify(subjects)); subjects=JSON.parse(redoHistory.pop()); updateUI(); saveData(); }
function resetAll(){ if(!confirm("Reset all marks and XP?")) return; subjects.forEach(s=>{s.marks=0; s.xp=0;}); sessionHistory=[]; redoHistory=[]; dailyLog={}; saveData(); updateUI(); }

// Motivation quote
const quotes=["Every day is a new chance to improve!","Small steps lead to big progress!","Stay consistent, stay strong!","Knowledge is power, keep studying!","Focus today, succeed tomorrow!"];
function showMotivation(){ const el=document.getElementById("motivation"); if(el) el.textContent=quotes[Math.floor(Math.random()*quotes.length)]; }

// Achievement badges
const achievements=[
  {id:"1h", text:"1 Hour Total", condition:()=>totalHours()>=60},
  {id:"5h", text:"5 Hour Total", condition:()=>totalHours()>=300},
  {id:"15h", text:"15 Hour Total", condition:()=>totalHours()>=900},
  {id:"30h", text:"30 Hour Total", condition:()=>totalHours()>=1800},
  {id:"60h", text:"60 Hour Total", condition:()=>totalHours()>=3600},
  {id:"100h", text:"100 Hour Total", condition:()=>totalHours()>=6000},
  {id:"7d", text:"7 Days Streak", condition:()=>currentStreak()>=7},
  {id:"14d", text:"14 Days Streak", condition:()=>currentStreak()>=14},
  {id:"21d", text:"21 Days Streak", condition:()=>currentStreak()>=21},
  {id:"30d", text:"30 Days Streak", condition:()=>currentStreak()>=30},
  {id:"500xp", text:"Earn 500 XP", condition:()=>totalXP()>=500},
  {id:"1000xp", text:"Earn 1000 XP", condition:()=>totalXP()>=1000}
];

function totalHours(){ return Object.values(dailyLog).reduce((a,b)=>a+b,0);}
function totalXP(){ return subjects.reduce((a,b)=>a+b.xp,0);}
function currentStreak(){ 
  const dates=Object.keys(dailyLog).sort(); 
  if(dates.length===0) return 0;
  let streak=1;
  for(let i=dates.length-1;i>0;i--){
    const d1=new Date(dates[i]);
    const d2=new Date(dates[i-1]);
    if((d1-d2)/(1000*3600*24)===1) streak++; else break;
  }
  return streak;
}

function updateAchievements(){
  const container=document.getElementById("achievementsContainer");
  container.innerHTML="";
  achievements.forEach(a=>{
    const el=document.createElement("div");
    el.className="achievement";
    el.textContent=a.text;
    if(a.condition()) el.classList.add("unlocked");
    container.appendChild(el);
    if(a.condition() && !el.classList.contains("shown")){
      el.classList.add("shown");
      el.style.transform="scale(1.2)";
      setTimeout(()=>el.style.transform="scale(1)",500);
    }
  });
}

// Charts
let dailyChartInstance, weeklyChartInstance;
function updateCharts(){
  const dailyCtx=document.getElementById("dailyChart").getContext("2d");
  const sortedDates=Object.keys(dailyLog).sort();
  const dailyData=sortedDates.map(d=>dailyLog[d]/60);
  if(dailyChartInstance) dailyChartInstance.destroy();
  dailyChartInstance=new Chart(dailyCtx,{ type:'line', data:{ labels:sortedDates, datasets:[{label:"Hours Studied", data:dailyData, backgroundColor:'rgba(0,216,255,0.2)', borderColor:'#00d8ff', borderWidth:2, fill:true}] }, options:{ responsive:true, scales:{ y:{ beginAtZero:true } } }});

  const weeklyCtx=document.getElementById("weeklyChart").getContext("2d");
  let weeklyData={}, week=0;
  sortedDates.forEach(d=>{ week=Math.floor(new Date(d).getTime()/(1000*3600*24*7)); weeklyData[week]=(weeklyData[week]||0)+dailyLog[d]; });
  const weekLabels=Object.keys(weeklyData).map(w=>`Week ${parseInt(w)+1}`);
  const weekHours=Object.values(weeklyData).map(m=>m/60);
  if(weeklyChartInstance) weeklyChartInstance.destroy();
  weeklyChartInstance=new Chart(weeklyCtx,{ type:'bar', data:{ labels:weekLabels, datasets:[{label:"Weekly Hours", data:weekHours, backgroundColor:'#00d8ff'}]}, options:{ responsive:true, scales:{ y:{ beginAtZero:true }}}});
}

window.onload=()=>{ updateUI(); showMotivation(); };
