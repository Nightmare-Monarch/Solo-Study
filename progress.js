let subjects = JSON.parse(localStorage.getItem("subjects")) || [
    { name: "Sinhala", marks: 0, xp: 0 },
    { name: "Science", marks: 0, xp: 0 },
    { name: "Commerce", marks: 0, xp: 0 },
    { name: "Buddhism", marks: 0, xp: 0 },
    { name: "History", marks: 0, xp: 0 },
    { name: "Dancing", marks: 0, xp: 0 },
    { name: "Health", marks: 0, xp: 0 },
    { name: "Maths", marks: 0, xp: 0 },
    { name: "English", marks: 0, xp: 0 }
  ];
  
  function updateProgressUI() {
    const container = document.getElementById("progressSubjects");
    container.innerHTML = "";
  
    subjects.forEach(s => {
      const subjectDiv = document.createElement("div");
      subjectDiv.className = "subject";
      subjectDiv.innerHTML = `
        <strong>${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
        <div class="progress marks-bar">
          <div class="progress-fill"></div>
        </div>`;
      container.appendChild(subjectDiv);
  
      // Animate the bar
      const fillDiv = subjectDiv.querySelector(".progress-fill");
      setTimeout(() => {
        fillDiv.style.width = Math.min(s.marks,100) + "%";
      }, 50);
    });
  
    // Total Marks
    const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
    document.getElementById("totalMarksProgress").textContent = totalMarks.toFixed(1);
    document.getElementById("progressMarksFill").style.width = Math.min(totalMarks/900*100, 100) + "%";
  
    // Total XP
    const totalXP = subjects.reduce((a,b)=>a+b.xp,0);
    document.getElementById("totalXPProgress").textContent = totalXP.toFixed(0);
    document.getElementById("progressXPFill").style.width = Math.min(totalXP/50000*100, 100) + "%";
  
    updateCharts();
  }

  
  // Charts
  function getLastNDates(n) {
    const dates = [];
    const today = new Date();
    for(let i=n-1;i>=0;i--){
      const d = new Date();
      d.setDate(today.getDate()-i);
      dates.push(d.toISOString().slice(0,10));
    }
    return dates;
  }
  
  function getLastNDaysHours(n){
    const history = JSON.parse(localStorage.getItem("sessionHistory") || "[]");
    const result = [];
    const dates = getLastNDates(n);
    for(let d of dates){
      let totalHours = 0;
      history.forEach(h => {
        const session = JSON.parse(h);
        if(session.date === d) totalHours += session.hours || 0;
      });
      result.push(totalHours);
    }
    return result;
  }
  
  function updateCharts() {
    const weeklyCtx = document.getElementById("weeklyChart").getContext("2d");
    new Chart(weeklyCtx,{
      type:'bar',
      data:{
        labels: getLastNDates(7),
        datasets:[{
          label:'Hours Studied',
          data:getLastNDaysHours(7),
          backgroundColor:'rgba(0,216,255,0.7)'
        }]
      },
      options:{scales:{y:{beginAtZero:true},x:{}}}
    });
  
    const monthlyCtx = document.getElementById("monthlyChart").getContext("2d");
    new Chart(monthlyCtx,{
      type:'bar',
      data:{
        labels: getLastNDates(30),
        datasets:[{
          label:'Hours Studied',
          data:getLastNDaysHours(30),
          backgroundColor:'rgba(0,216,255,0.5)'
        }]
      },
      options:{scales:{y:{beginAtZero:true},x:{}}}
    });
  }
  
  window.onload = updateProgressUI;
  