const dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || [];

function getLastNDays(n){
  const result = [];
  const today = new Date();
  for(let i=n-1;i>=0;i--){
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0,10);
    const record = dailyProgress.find(d=>d.date===dateStr);
    result.push(record ? record.hours.toFixed(1) : 0);
  }
  return result;
}

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

// Weekly Chart
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

// Monthly Chart
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
