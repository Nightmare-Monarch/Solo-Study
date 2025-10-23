// Get subjects and session history
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];

// Helper: get last N days
function getLastNDates(n) {
  const dates = [];
  const today = new Date();
  for (let i = n-1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().slice(0,10));
  }
  return dates;
}

// Helper: daily hours from history
function getDailyHours(n){
  const daily = {};
  sessionHistory.forEach(hist => {
    const record = JSON.parse(hist);
    record.forEach(sub => {
      if (!daily[sub.date]) daily[sub.date] = 0;
      daily[sub.date] += sub.marks/100*15; // 15h = 100 marks
    });
  });
  const lastNDays = getLastNDates(n);
  return lastNDays.map(d => daily[d] ? daily[d].toFixed(1) : 0);
}

// Update total bars
function updateTotalBars(){
  const totalMarks = subjects.reduce((a,b)=>a.marks+a,0);
  const totalXP = subjects.reduce((a,b)=>a.xp+a,0);
  document.getElementById("totalMarksProgress").textContent = totalMarks.toFixed(1);
  document.getElementById("fullMarksFillProgress").style.width = (totalMarks/900*100).toFixed(1)+"%";
  document.getElementById("totalXPProgress").textContent = totalXP.toFixed(1);
  document.getElementById("fullXPFillProgress").style.width = (totalXP/50000*100).toFixed(1)+"%";
}

// Charts
const dailyCtx = document.getElementById("dailyChart").getContext("2d");
new Chart(dailyCtx,{
  type:'bar',
  data:{
    labels: getLastNDates(7),
    datasets:[{
      label:'Hours Studied',
      data: getDailyHours(7),
      backgroundColor:'rgba(0,216,255,0.7)'
    }]
  },
  options:{scales:{y:{beginAtZero:true,title:{display:true,text:'Hours'}},x:{title:{display:true,text:'Date'}}}}
});

const weeklyCtx = document.getElementById("weeklyChart").getContext("2d");
new Chart(weeklyCtx,{
  type:'bar',
  data:{
    labels: ['Week 1','Week 2','Week 3','Week 4'],
    datasets:[{
      label:'Hours Studied',
      data: [0,0,0,0].map((_,i)=>getDailyHours(28).slice(i*7,(i+1)*7).reduce((a,b)=>a+parseFloat(b),0).toFixed(1)),
      backgroundColor:'rgba(0,216,255,0.5)'
    }]
  },
  options:{scales:{y:{beginAtZero:true,title:{display:true,text:'Hours'}},x:{title:{display:true,text:'Week'}}}}
});

const monthlyCtx = document.getElementById("monthlyChart").getContext("2d");
new Chart(monthlyCtx,{
  type:'bar',
  data:{
    labels: getLastNDates(30),
    datasets:[{
      label:'Hours Studied',
      data: getDailyHours(30),
      backgroundColor:'rgba(0,216,255,0.3)'
    }]
  },
  options:{scales:{y:{beginAtZero:true,title:{display:true,text:'Hours'}},x:{title:{display:true,text:'Date'}}}}
});

updateTotalBars();
