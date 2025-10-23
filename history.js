let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
let historyRecords = JSON.parse(localStorage.getItem("historyRecords")) || [];

function saveHistory() {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
    localStorage.setItem("historyRecords", JSON.stringify(historyRecords));
}

function formatTime(minutes) {
    const h = Math.floor(minutes/60);
    const m = minutes % 60;
    return `${h>0 ? h+"h " : ""}${m}m`;
}

function loadHistory() {
    const container = document.getElementById("historyContainer");
    container.innerHTML = "";

    if(historyRecords.length===0){
        container.innerHTML = "<p style='text-align:center; margin:15px; color:#00d8ff;'>No sessions yet</p>";
        return;
    }

    historyRecords.forEach((rec, i)=>{
        const row = document.createElement("div");
        row.classList.add("history-row");
        row.style.display="flex";
        row.style.justifyContent="space-between";
        row.style.alignItems="center";
        row.style.padding="8px 12px";
        row.style.borderBottom="1px solid rgba(0,216,255,0.2)";
        row.style.maxWidth="600px";
        row.style.margin="auto";

        row.innerHTML = `
            <span>${rec.subject}</span>
            <span>${formatTime(rec.minutes)}</span>
            <span>${rec.marksGain.toFixed(1)}</span>
            <span>${rec.date}</span>
        `;

        const delBtn = document.createElement("button");
        delBtn.textContent="Remove";
        delBtn.className="btn curved-btn";
        delBtn.style.padding="4px 10px";
        delBtn.style.fontSize="0.8rem";
        delBtn.onclick = ()=>{
            // Remove session marks/xp from main subjects
            const sub = subjects.find(s=>s.code===rec.code);
            if(sub){
                sub.marks = Math.max(sub.marks - rec.marksGain, 0);
                sub.xp = Math.max(sub.xp - rec.xpGain, 0);
            }
            historyRecords.splice(i,1);
            saveHistory();
            loadHistory();
            // Update main page
            localStorage.setItem("subjects", JSON.stringify(subjects));
        };

        row.appendChild(delBtn);
        container.appendChild(row);
    });
}

// Clear all history
function clearAllHistory(){
    if(!confirm("Clear all history and reset marks/XP?")) return;
    historyRecords=[];
    subjects.forEach(s=>{s.marks=0; s.xp=0;});
    saveHistory();
    loadHistory();
    localStorage.setItem("subjects", JSON.stringify(subjects));
}

// Load on start
window.onload = loadHistory;
