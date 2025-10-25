// progress.js — Daily Progress Charts
document.addEventListener("DOMContentLoaded", () => {
  const dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || [];
  const subjects = JSON.parse(localStorage.getItem("subjects")) || [];

  const totalHours = dailyProgress.reduce((a,b)=>a+b.hours,0).toFixed(1);
  const totalMarks = dailyProgress.reduce((a,b)=>a+b.marks,0).toFixed(1);
  const totalXP = dailyProgress.reduce((a,b)=>a+b.xp,0).toFixed(0);

  document.getElementById("totalHours").textContent = `${totalHours}h`;
  document.getElementById("totalMarks").textContent = totalMarks;
  document.getElementById("totalXP").textContent = totalXP;

  const dates = dailyProgress.map(d => d.date);
  const hoursData = dailyProgress.map(d => d.hours.toFixed(1));
  const marksData = dailyProgress.map(d => d.marks.toFixed(1));
  const xpData = dailyProgress.map(d => d.xp.toFixed(0));

  function makeChart(id, label, data, color) {
    const ctx = document.getElementById(id).getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: dates,
        datasets: [{
          label: label,
          data: data,
          backgroundColor: color,
          borderRadius: 6,
          barThickness: id === "hoursChart" ? 14 : 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: "#00ffff" },
            grid: { color: "rgba(0,255,255,0.1)" }
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#00ffff" },
            grid: { color: "rgba(0,255,255,0.1)" }
          }
        },
        plugins: {
          legend: { labels: { color: "#00ffff" } }
        }
      }
    });
  }

  makeChart("hoursChart", "Study Hours", hoursData, "rgba(0,255,255,0.6)");
  makeChart("marksChart", "Marks", marksData, "rgba(255,165,0,0.6)");
  makeChart("xpChart", "XP", xpData, "rgba(0,255,100,0.6)");
});
