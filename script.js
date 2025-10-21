// Subjects
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
let dailyLog = JSON.parse(localStorage.getItem("dailyLog")) || {};

// Save Data
function saveData(){
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
  localStorage.setItem("dailyLog", JSON.stringify(dailyLog));
}

// --- Stopwatch ---
let stopwatchTime=0, stopwatchInterval;
document.getElementById("startStopwatch").onclick=()=>{
  clearInterval(stopwatchInterval);
  stopwatchInterval=setInterval(()=>{
    stopwatchTime++;
    updateStopwatch();
  },1000);
};
document.getElementById("pauseStopwatch").onclick=()=>clearInterval(stopwatchInterval);
document.getElementById("resetStopwatch").onclick=()=>{
  clearInterval(stopwatchInterval); stopwatchTime=0; updateStopwatch();
};
document.getElementById("submitStopwatch").onclick=()=>{
  if(stopwatchTime<=0) return;
  const subjectCode=prompt("Enter subject code:").toLowerCase();
  addSession(subjectCode,stopwatchTime/60,false,false);
  stopwatchTime=0; updateStopwatch();
};
function updateStopwatch(){
  let h=Math.floor(stopwatchTime/3600), m=Math.floor((stopwatchTime%3600)/60), s=stopwatchTime%60;
  document.getElementById("stopwatchDisplay").textContent=
    `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// --- Session ---
function handleSessionInput(){
  const input=document.getElementById("sessionInput").value.trim().toLowerCase();
  if(!input) return;
  const parts=input.split(" "), subjectCode=parts[0];
  let totalMinutes=0, isPP=false, isQuiz=false;
  for(let i=1;i<parts.length;i++){
    let p=parts[i];
    if(p.endsWith("h")) totalMinutes+=(parseInt(p)||0)*60;
    else if(p.endsWith("m")) totalMinutes+=parseInt(p)||0;
    else if(p==="pp") isPP=true;
    else if(p==="q") isQuiz=true;
  }
  sessionHistory.push(JSON.stringify(subjects));
  redoHistory=[];
  addSession(subjectCode,totalMinutes,isPP,isQuiz);
  document.getElementById("sessionInput").value="";
  saveData();
}

// --- Add Session ---
function addSession(code,totalMinutes,isPP,isQuiz){
  const subject=subjects.find(s=>s.code===code);
  if(!subject) return alert("Invalid subject code");

  let marksGain=totalMinutes*(100/900); // 15h = 100 marks
  let xpGain=totalMinutes*(100/900); xpGain*=2; // XP doubled
  if(isPP){marksGain+=5; xpGain+=5;}
  if(isQuiz){marksGain+=3; xpGain+=3;}

  subject.marks=Math.min(subject.marks+marksGain,100);
  subject.xp=Math.min(subject.xp+xpGain,100);

  const today=new Date().toISOString().slice(0,10);
  dailyLog[today]=(dailyLog[today]||0)+totalMinutes;

  updateUI();
}

// --- Circular Bars ---
function updateUI(){
  const container=document.getElementById("circularBars");
  container.innerHTML="";
  subjects.forEach(s=>{
    const div=document.createElement("div"); div.className="circular-bar";
    const canvas=document.createElement("canvas"); canvas.width=120; canvas.height=120;
    div.appendChild(canvas);
    const label=document.createElement("div"); label.className="label";
    label.innerHTML=`${s.name}<br>${s.marks.toFixed(1)} | XP:${s.xp.toFixed(1)}`; div.appendChild(label);
    container.appendChild(div);

    new Chart(canvas.getContext("2d"),{
      type:'doughnut',
      data:{labels:['Progress',''], datasets:[{data:[s.marks,s.xp], backgroundColor:['#ff7f50','#00d8ff'], borderWidth:0}]},
      options:{cutout:'80%', responsive:false, animation:{animateRotate:true, animateScale:true}}
    });
  });
  updateCharts(); updateAchievements();
}

// --- Achievements ---
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
    const d1=new Date(dates[i]), d2=new Date(dates[i-1]);
    if((d1-d2)/(1000*3600*24)===1) streak++; else break;
  }
  return streak;
}

function updateAchievements(){
  const container=document.getElementById("achievementsContainer"); container.innerHTML="";
  achievements.forEach(a=>{
    const el=document.createElement("div"); el.className="achievement"; el.textContent=a.text;
    if(a.condition()) el.classList.add("unlocked");
    container.appendChild(el);
  });
}

// --- Charts ---
let dailyChartInstance, weeklyChartInstance;
function updateCharts(){
  const dailyCtx=document.getElementById("dailyChart").getContext("2d");
  const sortedDates=Object.keys(dailyLog).sort();
  const dailyData=sortedDates.map(d=>dailyLog[d]/60);
  if(dailyChartInstance) dailyChartInstance.destroy();
  dailyChartInstance=new Chart(dailyCtx,{
    type:'line',
    data:{labels:sortedDates,datasets:[{label:"Hours Studied",data:dailyData,backgroundColor:'#00d8ff',borderColor:'#00d8ff',fill:true,tension:0.3}]},
    options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
  });

  const weeklyCtx=document.getElementById("weeklyChart").getContext("2d");
  const weekData=[];
  let weekSum=0, weekLabels=[];
  sortedDates.forEach((d,i)=>{
    weekSum+=dailyLog[d]/60;
    if((i+1)%7===0 || i===sortedDates.length-1){
      weekLabels.push(d);
      weekData.push(weekSum);
      weekSum=0;
    }
  });
  if(weeklyChartInstance) weeklyChartInstance.destroy();
  weeklyChartInstance=new Chart(weeklyCtx,{
    type:'bar',
    data:{labels:weekLabels,datasets:[{label:"Weekly Hours",data:weekData,backgroundColor:'#ff7f50'}]},
    options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
  });
}

// --- Undo/Redo/Reset ---
function undo(){ if(sessionHistory.length===0) return alert("Nothing to undo"); redoHistory.push(JSON.stringify(subjects)); subjects=JSON.parse(sessionHistory.pop()); updateUI(); saveData();}
function redo(){ if(redoHistory.length===0) return alert("Nothing to redo"); sessionHistory.push(JSON.stringify(subjects)); subjects=JSON.parse(redoHistory.pop()); updateUI(); saveData();}
function resetAll(){ if(!confirm("Are you sure?")) return; subjects.forEach(s=>{s.marks=0;s.xp=0;}); sessionHistory=[]; redoHistory=[]; dailyLog={}; saveData(); updateUI();}

// --- Motivation Quotes ---
const quotes=[
  "Stay focused and never give up!",
  "Consistency is key to mastery.",
  "Every hour counts, keep going!",
  "Your future self will thank you.",
  "Small steps lead to big progress."
];
function showMotivation(){ const m=document.getElementById("motivation"); m.textContent=quotes[Math.floor(Math.random()*quotes.length)]; }
setInterval(showMotivation,15000);
window.onload=()=>{ updateUI(); showMotivation(); };
