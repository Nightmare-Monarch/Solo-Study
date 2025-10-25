// history.js — shows sessionHistory and allows delete (revert)
function loadHistory(){
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  const sessions = JSON.parse(localStorage.getItem("sessionHistory")) || [];

  if(sessions.length === 0){
    list.innerHTML = "<p style='text-align:center;color:#9feaff;margin:12px;'>No sessions yet.</p>";
    return;
  }

  // show newest first
  sessions.slice().reverse().forEach(s => {
    const row = document.createElement("div");
    row.className = "subject";
    // format time like "1h 34m"
    const h = Math.floor(s.minutes/60);
    const m = s.minutes % 60;
    const timeStr = `${h>0? h+'h':''}${h>0 && m>0? ' ':''}${m>0? m+'m':''}` || "0m";
    const typeLabel = s.type === "video" ? "V" : (s.type === "homework" ? "H" : "Study");
    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div style="flex:1;">
          <strong>${s.subjectName}</strong> — ${timeStr} — ${typeLabel} — Marks: ${s.marksGain.toFixed(1)} — XP: ${Math.floor(s.xpGain)} — <small>${s.date}</small>
        </div>
        <div>
          <button class="btn curved-btn" onclick="deleteSession('${s.id}')">Remove</button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });
}

function deleteSession(id){
  const sessions = JSON.parse(localStorage.getItem("sessionHistory")) || [];
  const idx = sessions.findIndex(x => x.id === id);
  if(idx === -1) return alert("Session not found");
  if(!confirm("Delete this session AND revert its marks & XP?")) return;

  const s = sessions[idx];
  // revert subject
  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  const sub = subjects.find(x => x.code === s.subject);
  if(sub){
    sub.xp = Math.max(0, (sub.xp || 0) - (s.xpGain || 0));
    sub.marks = Math.max(0, (sub.marks || 0) - (s.marksGain || 0));
  }

  // revert dailyProgress
  let dailyProgress = JSON.parse(localStorage.getItem("dailyProgress")) || [];
  const day = dailyProgress.find(d => d.date === s.date);
  if(day){
    day.hours = Math.max(0, day.hours - (s.hours || s.minutes/60 || 0));
    day.marks = Math.max(0, day.marks - (s.marksGain || 0));
    day.xp = Math.max(0, day.xp - (s.xpGain || 0));
    if(day.hours === 0 && day.marks === 0 && day.xp === 0){
      dailyProgress = dailyProgress.filter(dd => dd.date !== s.date);
    }
  }

  // remove session
  sessions.splice(idx, 1);

  // save
  localStorage.setItem("sessionHistory", JSON.stringify(sessions));
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("dailyProgress", JSON.stringify(dailyProgress));

  loadHistory();
  alert("Deleted and reverted.");
}

function clearAllHistory(){
  if(!confirm("Clear all history? This will not revert marks/xp.")) return;
  localStorage.removeItem("sessionHistory");
  loadHistory();
}

window.onload = loadHistory;
