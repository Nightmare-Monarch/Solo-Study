function loadHistory(){
  const container = document.getElementById("historyContainer");
  container.innerHTML = "";

  let history = JSON.parse(localStorage.getItem("fullHistory")) || [];

  history.forEach((item,i)=>{
    const row = document.createElement("div");
    row.className="history-row";
    const hours = Math.floor(item.duration/60);
    const mins = item.duration%60;

    row.innerHTML = `
      <span>${item.subject}</span> 
      <span>${hours}h ${mins}m</span> 
      <span>${item.marks} marks</span> 
      <span>${item.date}</span> 
      <button class="btn remove-btn" onclick="removeSession(${i})">Remove</button>
    `;
    container.appendChild(row);
  });
}

function removeSession(index){
  let history = JSON.parse(localStorage.getItem("fullHistory")) || [];
  const session = history[index];

  // Rollback marks & XP
  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  const sub = subjects.find(s=>s.name===session.subject);
  if(sub){
    sub.marks -= parseFloat(session.marks);
    if(sub.marks<0) sub.marks=0;
    sub.xp -= parseFloat(session.xp);
    if(sub.xp<0) sub.xp=0;
  }

  // Remove from history
  history.splice(index,1);
  localStorage.setItem("fullHistory",JSON.stringify(history));
  localStorage.setItem("subjects",JSON.stringify(subjects));

  loadHistory();
}

function clearHistory(){
  if(!confirm("Clear all history?")) return;
  localStorage.setItem("fullHistory","[]");
  loadHistory();
}

window.onload = loadHistory;
