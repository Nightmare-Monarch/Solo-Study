function loadProgress(){
  const container = document.getElementById("progressContainer");
  container.innerHTML = "";

  let data = JSON.parse(localStorage.getItem("progressData")) || [];
  if(data.length === 0){
    container.innerHTML = "<p>No progress data yet.</p>";
    return;
  }

  // Sort by date (newest last)
  data.sort((a,b)=>new Date(a.date)-new Date(b.date));

  // Find max for progress bar scaling
  const maxMinutes = Math.max(...data.map(d=>d.minutes));

  data.forEach(entry=>{
    const hours = (entry.minutes/60).toFixed(2);
    const width = (entry.minutes/maxMinutes)*100;

    container.innerHTML += `
      <div class="subject">
        <strong>${entry.date}</strong> - ${hours} hours
        <div class="progress marks-bar">
          <div class="progress-fill" style="width:${width}%;"></div>
        </div>
      </div>
    `;
  });
}

window.onload = loadProgress;
