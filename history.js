// Load all sessions into history page
function loadHistory() {
  const container = document.getElementById("historyContainer");
  container.innerHTML = "";

  // Get session history from localStorage
  const sessions = JSON.parse(localStorage.getItem("sessionHistory")) || [];

  sessions.forEach((session, index) => {
    const subArray = JSON.parse(session); // Each session contains subjects array
    subArray.forEach(sub => {
      if (!sub.lastSession) return; // Skip if no session data

      const div = document.createElement("div");
      div.className = "history-row";
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.marginBottom = "8px";
      div.style.padding = "6px 10px";
      div.style.background = "rgba(0, 216, 255, 0.1)";
      div.style.borderRadius = "10px";
      div.style.alignItems = "center";

      div.innerHTML = `
        <span>${sub.name}</span>
        <span>${sub.lastSession.hours}h ${sub.lastSession.minutes}m</span>
        <span>${sub.lastSession.marksGained.toFixed(1)}</span>
        <span>${sub.lastSession.date}</span>
        <button class="btn curved-btn" style="padding:2px 8px; font-size:0.8rem;">Remove</button>
      `;

      // Remove session
      div.querySelector("button").onclick = () => {
        removeSession(index, sub.code);
      };

      container.appendChild(div);
    });
  });
}

// Remove a session and update marks/xp in main page
function removeSession(sessionIndex, code) {
  const sessions = JSON.parse(localStorage.getItem("sessionHistory")) || [];
  const subArray = JSON.parse(sessions[sessionIndex]);

  const sub = subArray.find(s => s.code === code);
  if (sub && sub.lastSession) {
    // Subtract marks and XP gained in this session
    const subjects = JSON.parse(localStorage.getItem("subjects")) || [];
    const subjectToUpdate = subjects.find(s => s.code === code);
    if (subjectToUpdate) {
      subjectToUpdate.marks -= sub.lastSession.marksGained;
      subjectToUpdate.xp -= sub.lastSession.xpGained;
      if (subjectToUpdate.marks < 0) subjectToUpdate.marks = 0;
      if (subjectToUpdate.xp < 0) subjectToUpdate.xp = 0;
    }
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }

  // Remove session from history
  sessions.splice(sessionIndex, 1);
  localStorage.setItem("sessionHistory", JSON.stringify(sessions));
  loadHistory();

  // Update main page UI
  if (typeof updateUI === "function") updateUI();
}

// Clear all history
function clearHistory() {
  if (!confirm("Are you sure?")) return;
  localStorage.removeItem("sessionHistory");
  loadHistory();

  // Reset main page subjects
  const subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  subjects.forEach(s => { s.marks = 0; s.xp = 0; });
  localStorage.setItem("subjects", JSON.stringify(subjects));
  if (typeof updateUI === "function") updateUI();
}

window.onload = loadHistory;
