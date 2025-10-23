let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let sessionRecords = JSON.parse(localStorage.getItem("sessionRecords")) || [];

function updateProgressUI(){
  const container = document.getElementById("subjectProgressContainer");
  container.innerHTML="";

  subjects.forEach(s=>{
    const div = document.createElement("div");
    div.className="subject";
    div.innerHTML = `
      <strong>${s.name} - Marks: ${s.marks.toFixed(1)}/100</strong>
      <div class="progress marks-bar">
        <div class="progress-fill" style="width:${Math.min(s.marks,100)}%;"></div>
      </div>
    `;
    container.appendChild(div);
  });

  // Total XP
  const totalXP = subjects.reduce((a,b)=>a+b.xp,0);
  document.getElementById("totalXP").textContent = totalXP.toFixed(0);
  const fillPercent = Math.min(totalXP/50000*100,100);
  document.getElementById("totalXPFill").style.width = fillPercent+"%";
}

function getLastNDates(n){
  const dates = [];
  const today = new Date();
  for(let i=n-1;i>=0;i--){
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0,10));
  }
  return dates;
}

function getHoursPerDay(n){
  const hours = [];
  const dates = getLastNDates(n);
  for(let d of dates){
    let sum = 0;
    sessionRecords.forEach(s=>{
      if(s.date===d) sum += s.hours + s.minutes/60;
    });
    hours.push(sum.toFixed(1));
  }
  return hours;
}

// Weekly Chart
const weeklyCtx = document.getElementById("weeklyChart").getContext("2d");
new Chart(weeklyCtx,{
  type:'bar',
  data:{
    labels:getLastNDates(7),
    datasets:[{
      label:'Hours Studied',
      data:getHoursPerDay(7),
      backgroundColor:'rgba(0,216,255,0.7)'
    }]
  },
  options:{scales:{y:{beginAtZero:true,title:{display:true,text:'Hours'}},x:{title:{display:true,text:'Date'}}}}
});

// Monthly Chart
const monthlyCtx = document.getElementById("monthlyChart").getContext("2d");
new Chart(monthlyCtx,{
  type:'bar',
  data:{
    labels:getLastNDates(30),
    datasets:[{
      label:'Hours Studied',
      data:getHoursPerDay(30),
      backgroundColor:'rgba(0,216,255,0.5)'
    }]
  },
  options:{scales:{y:{beginAtZero:true,title:{display:true,text:'Hours'}},x:{title:{display:true,text:'Date'}}}}
});

window.onload = updateProgressUI;
