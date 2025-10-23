let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];

// Get last N dates
function getLastNDates(n){
  const dates=[];
  const today=new Date();
  for(let i=n-1;i>=0;i--){
    const date=new Date();
    date.setDate(today.getDate()-i);
    dates.push(date.toISOString().slice(0,10));
  }
  return dates;
}

// Sum study hours for a date
function getDailyHours(date){
  let total=0;
  sessionHistory.forEach(session=>{
    const s=JSON.parse(session);
    s.forEach(sub=>{
      if(sub.lastSession && sub.lastSession.date===date){
        total += sub.lastSession.hours + sub.lastSession.minutes/60;
      }
    });
  });
  return total.toFixed(1);
}

// Sum XP for a date
function getDailyXP(date){
  let totalXP=0;
  sessionHistory.forEach(session=>{
    const s=JSON.parse(session);
    s.forEach(sub=>{
      if(sub.lastSession && sub.lastSession.date===date){
        totalXP += sub.lastSession.xp;
      }
    });
  });
  return totalXP.toFixed(1);
}

// === Daily Chart ===
const dailyCtx = document.getElementById("dailyChart").getContext("2d");
const dailyDates = getLastNDates(7);
const dailyData = dailyDates.map(date=>getDailyHours(date));
new Chart(dailyCtx,{
  type:'bar',
  data:{ labels:dailyDates, datasets:[{label:'Hours Studied', data:dailyData, backgroundColor:'rgba(0,216,255,0.7)'}] },
  options:{ scales:{ y:{beginAtZero:true,title:{display:true,text:'Hours'}}, x:{title:{display:true,text:'Date'}} } }
});

// === Weekly Chart ===
const weeklyCtx = document.getElementById("weeklyChart").getContext("2d");
let weeklyData=[];
for(let w=0; w<4; w++){
  let sum=0;
  for(let d=0; d<7; d++){
    let date=new Date();
    date.setDate(date.getDate()-(w*7+d));
    let dateStr=date.toISOString().slice(0,10);
    sum += parseFloat(getDailyHours(dateStr));
  }
  weeklyData.unshift(sum.toFixed(1));
}
new Chart(weeklyCtx,{
  type:'bar',
  data:{ labels:['4 weeks ago','3 weeks ago','2 weeks ago','Last week'], datasets:[{label:'Weekly Hours', data:weeklyData, backgroundColor:'rgba(0,216,255,0.5)'}] },
  options:{ scales:{ y:{beginAtZero:true,title:{display:true,text:'Hours'}}, x:{title:{display:true,text:'Week'}} } }
});

// === XP Chart ===
const xpCtx = document.getElementById("xpChart").getContext("2d");
const xpDates = getLastNDates(30);
let xpData = [];
let cumulativeXP = 0;
xpDates.forEach(date=>{
  let xp = parseFloat(getDailyXP(date));
  cumulativeXP += xp;
  xpData.push(cumulativeXP);
});
new Chart(xpCtx,{
  type:'line',
  data:{
    labels: xpDates,
    datasets:[{
      label:'Cumulative XP',
      data: xpData,
      fill:true,
      backgroundColor:'rgba(0,216,255,0.2)',
      borderColor:'rgba(0,216,255,0.8)',
      tension:0.3
    }]
  },
  options:{ scales:{ y:{beginAtZero:true,title:{display:true,text:'XP'}}, x:{title:{display:true,text:'Date'}} } }
});

// === Total Marks & XP ===
const totalMarks = subjects.reduce((a,b)=>a.marks+a,0);
document.getElementById("totalMarksProgress").textContent = totalMarks.toFixed(1);
document.getElementById("fullMarksFillProgress").style.width = (totalMarks/900*100).toFixed(1)+'%';

const totalXP = subjects.reduce((a,b)=>a.xp+a,0);
document.getElementById("totalXPProgress").textContent = totalXP.toFixed(1);
document.getElementById("fullXPFillProgress").style.width = (totalXP/100000*100).toFixed(1)+'%';
