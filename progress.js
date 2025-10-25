// progress.js — draw three charts from dailyProgress
const dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || [];
const sorted = dailyProgress.slice().sort((a,b) => new Date(a.date) - new Date(b.date));
const labels = sorted.map(d => d.date);
const hoursData = sorted.map(d => +(d.hours || 0).toFixed(2));
const marksData = sorted.map(d => +(d.marks || 0).toFixed(2));
const xpData = sorted.map(d => Math.floor(d.xp || 0));

document.getElementById("totalHours").innerText = hoursData.reduce((a,b)=>a+b,0).toFixed(2) + " h";
document.getElementById("totalMarks").innerText = marksData.reduce((a,b)=>a+b,0).toFixed(1);
document.getElementById("totalXP").innerText = xpData.reduce((a,b)=>a+b,0);

function createChart(ctx, label, data, type, color){
  return new Chart(ctx, {
    type,
    data: { labels, datasets: [{ label, data, borderColor: color, backgroundColor: (type==='bar'?color+'88':color+'55'), borderWidth: 2, fill: true, tension: 0.3, ...(type==='bar'?{barPercentage:0.45, categoryPercentage:0.6}:{}) }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero:true, ticks:{ color: 'white' }, grid:{ color:'rgba(255,255,255,0.08)' } },
        x: { ticks:{ color:'white' }, grid:{ color:'rgba(255,255,255,0.03)' } }
      },
      plugins: { legend: { labels: { color:'white' } } }
    }
  });
}

// create charts
createChart(document.getElementById("hoursChart"), "Hours Studied", hoursData, "bar", "#00d8ff");
createChart(document.getElementById("marksChart"), "Marks", marksData, "line", "#ff7f50");
createChart(document.getElementById("xpChart"), "XP", xpData, "line", "#00ff88");
