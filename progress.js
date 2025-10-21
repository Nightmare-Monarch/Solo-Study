// Load progress data
let dailyProgress=JSON.parse(localStorage.getItem("dailyProgress"))||[];
let totalXP=JSON.parse(localStorage.getItem("totalXP"))||0;

// Achievements config
const achievements=[
  {name:"1h total",minutes:60,xp:0},
  {name:"5h total",minutes:300,xp:0},
  {name:"15h total",minutes:900,xp:0},
  {name:"30h total",minutes:1800,xp:0},
  {name:"60h total",minutes:3600,xp:0},
  {name:"100h total",minutes:6000,xp:0},
  {name:"150h total",minutes:9000,xp:0},
  {name:"7 day streak",streak:7,xp:50},
  {name:"14 day streak",streak:14,xp:100},
  {name:"21 day streak",streak:21,xp:150},
  {name:"30 day streak",streak:30,xp:300},
  {name:"Earn 500 XP",xpNeeded:500},
  {name:"Earn 1000 XP",xpNeeded:1000}
];

// Chart daily hours
const ctx=document.getElementById("dailyChart").getContext("2d");
const labels=dailyProgress.map(d=>d.date);
const data=dailyProgress.map(d=>d.minutes/60); // hours
const dailyChart=new Chart(ctx,{
  type:'bar',
  data:{
    labels:labels,
    datasets:[{
      label:'Hours Studied',
      data:data,
      backgroundColor:'#00d8ff'
    }]
  },
  options:{
    scales:{
      y:{beginAtZero:true, title:{display:true,text:'Hours'}} ,
      x:{title:{display:true,text:'Day'}}
    }
  }
});

// Summary
const totalMinutes=dailyProgress.reduce((a,b)=>a+b.minutes,0);
const weeklyMinutes=dailyProgress.slice(-7).reduce((a,b)=>a+b.minutes,0);
document.getElementById("weeklySummary").textContent=`Weekly Total: ${(weeklyMinutes/60).toFixed(2)} hours`;
document.getElementById("monthlySummary").textContent=`Monthly Total: ${(totalMinutes/60).toFixed(2)} hours`;

// Achievements rendering
const container=document.getElementById("achievementsContainer");
const today=new Date().toISOString().split("T")[0];

achievements.forEach((a,index)=>{
  const div=document.createElement("div");
  div.classList.add("achievement");
  let unlocked=false;

  // Hours achievements
  if(a.minutes && totalMinutes>=a.minutes) unlocked=true;

  // Streak achievements
  if(a.streak){
    let streak=0;
    for(let i=dailyProgress.length-1;i>=0;i--){
      if(dailyProgress[i].minutes>0) streak++;
      else break;
    }
    if(streak>=a.streak) unlocked=true;
  }

  // XP achievements
  if(a.xpNeeded && totalXP>=a.xpNeeded) unlocked=true;

  if(!unlocked) div.classList.add("locked");
  div.innerHTML=`<strong>${a.name}</strong>${unlocked?'<br>✅':''}`;
  container.appendChild(div);
  setTimeout(()=>div.classList.add("show"),index*100);
});
