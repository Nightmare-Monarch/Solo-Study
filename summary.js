// ===== Data for Charts =====
const subjects = JSON.parse(localStorage.getItem("subjects")) || [];
const dailyProgress = JSON.parse(localStorage.getItem("sessionHistory")) || [];

// ===== Last N Dates & Hours =====
function getLastNDates(n){
  const dates = [];
  const today = new Date();
  for(let i=n-1;i>=0;i--){
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().slice(0,10));
  }
  return dates;
}

function getLastNDays(n){
  const result = [];
  const today = new Date();
  const history = dailyProgress.map(s=>JSON.parse(s));
  for(let i=n-1;i>=0;i--){
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0,10);
    // Calculate hours for this date
    let totalHours = 0;
    history.forEach(session=>{
      session.forEach(sub=>{
        totalHours += sub.marks*(15/100) + sub.xp*(15/1000);
      });
    });
    result.push(totalHours.toFixed(1));
  }
  return result;
}

// ===== Weekly Chart =====
const weeklyCtx = document.getElementById("weeklyChart").getContext("2d");
new Chart(weeklyCtx,{
  type:'bar',
  data:{
    labels:getLastNDates(7),
    datasets:[{
      label:'Hours Studied',
      data:getLastNDays(7),
      backgroundColor:'rgba(0,216,255,0.7)'
    }]
  },
  options:{scales:{y:{beginAtZero:true,title:{display:true,text:'Hours'}},x:{title:{display:true,text:'Date'}}}}
});

// ===== Monthly Chart =====
const monthlyCtx = document.getElementById("monthlyChart").getContext("2d");
new Chart(monthlyCtx,{
  type:'bar',
  data:{
    labels:getLastNDates(30),
    datasets:[{
      label:'Hours Studied',
      data:getLastNDays(30),
      backgroundColor:'rgba(0,216,255,0.5)'
    }]
  },
  options:{scales:{y:{beginAtZero:true,title:{display:true,text:'Hours'}},x:{title:{display:true,text:'Date'}}}}
});

// ===== Achievements Animation =====
const achievements = [
  {name:"1 Hour Total",hours:1},{name:"5 Hours Total",hours:5},{name:"15 Hours Total",hours:15},
  {name:"30 Hours Total",hours:30},{name:"60 Hours Total",hours:60},{name:"100 Hours Total",hours:100},
  {name:"150 Hours Total",hours:150},{name:"500 XP",xp:500},{name:"1000 XP",xp:1000}
];

function updateAchievements(){
  const container = document.getElementById("achievementsContainer");
  if(!container) return;
  container.innerHTML="";
  let totalXP = subjects.reduce((a,b)=>a+b.xp,0);
  let totalHours = subjects.reduce((a,b)=>a.marks*(15/100)+a.xp*(15/1000),0);
  achievements.forEach(a=>{
    let unlocked=false;
    if(a.hours && totalHours>=a.hours) unlocked=true;
    if(a.xp && totalXP>=a.xp) unlocked=true;
    const div = document.createElement("div");
    div.className="achievement "+(unlocked?"unlocked":"locked");
    div.textContent = a.name;
    if(unlocked){
      div.style.animation="pop 0.5s ease";
    }
    container.appendChild(div);
  });
}
window.onload=updateAchievements;
