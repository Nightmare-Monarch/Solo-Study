let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Sinhala", code: "sin", marks:0, xp:0 },
  { name: "Science", code: "sci", marks:0, xp:0 },
  { name: "Commerce", code: "com", marks:0, xp:0 },
  { name: "Buddhism", code: "bud", marks:0, xp:0 },
  { name: "History", code: "his", marks:0, xp:0 },
  { name: "Dancing", code: "dan", marks:0, xp:0 },
  { name: "Health", code: "hea", marks:0, xp:0 },
  { name: "Maths", code: "mat", marks:0, xp:0 },
  { name: "English", code: "eng", marks:0, xp:0 }
];

let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
let redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || [];
let dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || [];
let totalXP = parseFloat(localStorage.getItem("totalXP")) || 0;

const achievements = [
  { name:"1 Hour Total", type:"hours", value:1 },
  { name:"5 Hour Total", type:"hours", value:5 },
  { name:"15 Hour Total", type:"hours", value:15 },
  { name:"30 Hour Total", type:"hours", value:30 },
  { name:"60 Hour Total", type:"hours", value:60 },
  { name:"100 Hour Total", type:"hours", value:100 },
  { name:"150 Hour Total", type:"hours", value:150 },
  { name:"7 Days Streak", type:"streak", value:7 },
  { name:"14 Days Streak", type:"streak", value:14 },
  { name:"21 Days Streak", type:"streak", value:21 },
  { name:"30 Days Streak", type:"streak", value:30 },
  { name:"Earn 500 XP", type:"xp", value:500 },
  { name:"Earn 1000 XP", type:"xp", value:1000 }
];

const quotes = [
  "Keep pushing forward!",
  "Small steps every day make a big difference.",
  "Consistency is the key to mastery.",
  "Study today, shine tomorrow!",
  "Your effort defines your success."
];









function saveData(){
  localStorage.setItem("subjects",JSON.stringify(subjects));
  localStorage.setItem("sessionHistory",JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory",JSON.stringify(redoHistory));
  localStorage.setItem("dailyProgress",JSON.stringify(dailyProgress));
  localStorage.setItem("totalXP",totalXP);
}

function animateNumber(el,start,end,duration=800){
  const range=end-start; let startTime=null;
  function step(time){ if(!startTime)startTime=time;
    let progress=Math.min((time-startTime)/duration,1);
    el.textContent=(start+range*progress).toFixed(1);
    if(progress<1) requestAnimationFrame(step);
  } requestAnimationFrame(step);
}

function updateUI(){
  const container=document.getElementById("subjectContainer");
  container.innerHTML="";
  subjects.sort((a,b)=>b.marks-a.marks);
  subjects.forEach((s,index)=>{
    const card=document.createElement("div");
    card.className="subject";
    card.innerHTML=`<strong>${index+1}. ${s.name}</strong>
      <p>Marks: ${s.marks.toFixed(1)}</p>
      <p>XP: ${s.xp.toFixed(1)}</p>`;
    container.appendChild(card);
    setTimeout(()=>card.classList.add("show"),index*100);
  });

  const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
  animateNumber(document.getElementById("totalMarksBottom"),parseFloat(document.getElementById("totalMarksBottom").textContent)||0,totalMarks);
  document.getElementById("fullMarksFill").style.width=(totalMarks/900*100).toFixed(1)+"%";

  animateNumber(document.getElementById("totalXPBottom"),parseFloat(document.getElementById("totalXPBottom").textContent)||0,totalXP);
  document.getElementById("fullXPFill").style.width=Math.min(totalXP/2000*100,100).toFixed(1)+"%";

  updateChart();
  updateAchievements();
  showRandomQuote();
}

function handleSessionInput(){
  const input=document.getElementById("sessionInput").value.trim().toLowerCase();
  if(!input)return;
  const parts=input.split(" ");
  const subjectCode=parts[0];
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

function addSession(subjectCode,totalMinutes,isPP,isQuiz){
  const subject=subjects.find(s=>s.code===subjectCode);
  if(!subject) return alert("Invalid subject code");

  // XP x2 system
  let xpGain=totalMinutes*(30/60);
  if(isPP) xpGain+=10;
  if(isQuiz) xpGain+=6;
  subject.xp+=xpGain;
  totalXP+=xpGain;

  // Marks 15h=100 marks
  let marksGain=totalMinutes*(100/900);
  if(isPP) marksGain+=5;
  if(isQuiz) marksGain+=3;
  subject.marks+=marksGain;
  if(subject.marks>100) subject.marks=100;

  // Daily progress
  const today=new Date().toISOString().slice(0,10);
  let todayRecord=dailyProgress.find(d=>d.date===today);
  if(!todayRecord){ todayRecord={date:today,hours:0}; dailyProgress.push(todayRecord);}
  todayRecord.hours+=totalMinutes/60;

  updateUI();

}

function undo(){ if(sessionHistory.length===0)return alert("Nothing to undo");


  redoHistory.push(JSON.stringify(subjects));
  subjects=JSON.parse(sessionHistory.pop());
  updateUI(); saveData();
}
function redo(){ if(redoHistory.length===0)return alert("Nothing to redo");


  sessionHistory.push(JSON.stringify(subjects));
  subjects=JSON.parse(redoHistory.pop());
  updateUI(); saveData();
}

function resetAll(){
  if(!confirm("Are you sure you want to reset all marks and XP?"))return;
  subjects.forEach(s=>{s.marks=0;s.xp=0;});
  sessionHistory=[]; redoHistory=[]; dailyProgress=[]; totalXP=0;
  saveData(); updateUI();




}

// Chart.js
let chart;
function updateChart(){
  const ctx=document.getElementById("progressChart").getContext("2d");
  const labels=dailyProgress.map(d=>d.date);
  const data=dailyProgress.map(d=>d.hours.toFixed(1));
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:'bar',
    data:{ labels:labels, datasets:[{label:'Hours Studied',data:data,backgroundColor:'rgba(0,216,255,0.7)'}] },
    options:{ scales:{ y:{beginAtZero:true,title:{display:true,text:'Hours'}}, x:{title:{display:true,text:'Date'}} } }
  });
}

// Achievements
function updateAchievements(){
  const container=document.getElementById("achievementContainer");
  container.innerHTML="";
  const streak=getStreak();
  achievements.forEach(a=>{
    let unlocked=false;
    if(a.type==="hours"){
      const totalHours=dailyProgress.reduce((sum,d)=>sum+d.hours,0);
      if(totalHours>=a.value) unlocked=true;
    }else if(a.type==="streak"){
      if(streak>=a.value) unlocked=true;
    }else if(a.type==="xp"){
      if(totalXP>=a.value) unlocked=true;
    }
    const badge=document.createElement("div");
    badge.className="badge"+(unlocked?" unlocked":"");
    badge.textContent=a.name;
    container.appendChild(badge);
  });
}

// Calculate streak
function getStreak(){
  let streak=0;
  let dates=dailyProgress.map(d=>d.date).sort();
  for(let i=dates.length-1;i>=0;i--){
    const today=new Date(dates[i]);
    const prev=new Date();
    prev.setDate(prev.getDate()-streak);
    if(today.toISOString().slice(0,10)===prev.toISOString().slice(0,10)) streak++;
    else break;
  }
  return streak;
}

// Motivation quotes
function showRandomQuote(){
  const container=document.getElementById("quoteContainer");
  const quote=quotes[Math.floor(Math.random()*quotes.length)];
  container.textContent=quote;
}

window.onload=updateUI;