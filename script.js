let dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || [];

// Prepare data
let labels = [];
let hoursData = [];
let marksData = [];
let xpData = [];

dailyProgress.sort((a,b)=> new Date(a.date) - new Date(b.date)).forEach(d=>{
  labels.push(d.date);
  hoursData.push(d.hours.toFixed(2));
  marksData.push(d.marks.toFixed(1));
  xpData.push(d.xp.toFixed(1));
});

// Update stats
document.getElementById("totalHours").innerText = hoursData.reduce((a,b)=>+a+ +b,0).toFixed(2) + " h";
document.getElementById("totalMarks").innerText = marksData.reduce((a,b)=>+a+ +b,0);
document.getElementById("totalXP").innerText = xpData.reduce((a,b)=>+a+ +b,0);

// Create chart function
function createChart(ctx,label,data,type,color){
  return new Chart(ctx,{
    type,
    data:{
      labels,
      datasets:[{
        label,
        data,
        borderColor:color,
        backgroundColor:type==="bar"? color+"99" : color+"55",
        borderWidth:2,
        fill:true,
        tension:0.3,
        maxBarThickness: type==="bar"?36:undefined
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      animation:{duration:1500,easing:"easeOutQuart"},
      scales:{
        y:{beginAtZero:true,ticks:{color:'white', font:{size:14}}, grid:{color:'rgba(255,255,255,0.1)'}},
        x:{ticks:{color:'white', font:{size:14}}, grid:{color:'rgba(255,255,255,0.1)'}}
      },
      plugins:{legend:{labels:{color:'white', font:{size:14}}}}
    }
  });
}

// Create charts
createChart(document.getElementById("hoursChart"),"Hours Studied",hoursData,"bar","cyan");
createChart(document.getElementById("marksChart"),"Marks",marksData,"line","#00ff88");
createChart(document.getElementById("xpChart"),"XP",xpData,"line","#ff8800");
