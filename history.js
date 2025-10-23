function loadHistory() {
  const container = document.getElementById("historyContainer");
  container.innerHTML = "";

  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];

  if(sessionHistory.length === 0) {
    container.innerHTML = "<p>No sessions yet.</p>";
    return;
  }

  // Flatten sessions to lastSession per subject
  let sessions = [];
  subjects.forEach(sub => {
    if(sub.lastSession) {
      sessions.push({
        name: sub.name,
        hours: sub.lastSession.hours,
        minutes: sub.lastSession.minutes,
        marksGained: sub.lastSession.marksGained,
        xpGained: sub.lastSession.xpGained,
        date: sub.lastSession.date,
        code: sub.code
      });
    }
  });

  sessions.forEach((s, index) => {
    let div = document.createElement("div");
    div.className = "history-row";
    div.innerHTML = `
      <span class="subject-name">${s.name}</span>
      <span class="time-studied">${s.hours}h ${s.minutes}m</span>
      <span class="marks-gained">${s.marksGained.toFixed(1)}</span>
      <span class="xp-gained">${s.xpGained.toFixed(1)}</span>
      <span class="date">${s.date}</span>
      <button class="remove-btn">Remove</button>
    `;

    // Remove button
    div.querySelector(".remove-btn").addEventListener("click", () => {
      const sub = subjects.find(subj => subj.code === s.code);
      if(sub) {
        sub.marks -= s.marksGained;
        sub.xp -= s.xpGained;
        if(sub.marks < 0) sub.marks = 0;
        if(sub.xp < 0) sub.xp = 0;
        sub.lastSession = null;
        localStorage.setItem("subjects", JSON.stringify(subjects));
        sessionHistory.pop(); // Remove last session
        localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
        loadHistory();
      }
    });

    container.appendChild(div);
  });
}

function clearHistory() {
  if(!confirm("Are you sure you want to clear all sessions?")) return;
  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  subjects.forEach(s => {
    s.marks = 0;
    s.xp = 0;
    s.lastSession = null;
  });
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify([]));
  loadHistory();
}

window.onload = loadHistory;
