// Load daily progress
let dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || [];
dailyProgress.sort((a,b)=> new Date(a.date) - new Date(b.date));

const labels = dailyProgress.map(d=>d.date);
const hoursData = dailyProgress.map(d=>+(d.hours||0).toFixed(2));
const marksData = dailyProgress.map(d=>+(d.marks||0).toFixed(1));
const xpData = dailyProgress.map(d=>+(d.xp||0).toFixed(0));

// Update total stats
document.getElementById("totalHours").innerText = `${hoursData.reduce((a,b)=>a+b,0).toFixed(2)} h`;
document.getElementById("totalMarks").innerText = marksData.reduce((a,b)=>a+b,0);
document.getElementById("totalXP").innerText = xpData.reduce((a,b)=>a+b,0);

// Chart function
function createChart(ctx, label, data, type, color) {
  return new Chart(ctx, {
    type,
    data: { labels, datasets:[{label,data,borderColor:color,backgroundColor:color+"55",borderWidth:2,fill:true,tension:0.3}] },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      animation:{duration:1500,easing:"easeOutQuart"},
      scales:{
        y:{beginAtZero:true,ticks:{color:'white'},grid:{color:'rgba(255,255,255,0.1)'}},
        x:{ticks:{color:'white'},grid:{color:'rgba(255,255,255,0.1)'}}
      },
      plugins:{legend:{labels:{color:'white',font:{size:14}}}}
    }
  });
}

// Create charts
createChart(document.getElementById("hoursChart"),"Hours Studied",hoursData,"bar","cyan");
createChart(document.getElementById("marksChart"),"Marks",marksData,"line","#00ff88");
createChart(document.getElementById("xpChart"),"XP",xpData,"line","#ff8800");
