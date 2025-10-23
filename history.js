let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Sinhala", code: "sin", marks: 0 },
  { name: "Science", code: "sci", marks: 0 },
  { name: "Commerce", code: "com", marks: 0 },
  { name: "Buddhism", code: "bud", marks: 0 },
  { name: "History", code: "his", marks: 0 },
  { name: "Dancing", code: "dan", marks: 0 },
  { name: "Health", code: "hea", marks: 0 },
  { name: "Maths", code: "mat", marks: 0 },
  { name: "English", code: "eng", marks: 0 }
];

let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
let redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || [];
let totalXP = parseFloat(localStorage.getItem("totalXP")) || 0;

function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
  localStorage.setItem("totalXP", totalXP);
}

// Update UI (marks bar fixed)
function updateUI(){
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";
  subjects.forEach((s,index)=>{
    container.innerHTML+=`
      <div class="subject">
        <strong>${index+1}. ${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
        <div class="progress marks-bar"><div class="progress-fill" style="width:${s.marks}%;"></div></div>
      </div>`;
  });

  // Total marks bottom
  const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
  document.getElementById("totalMarksBottom").textContent = totalMarks.toFixed(1);
  document.getElementById("fullMarksFill").style.width = (totalMarks/900*100).toFixed(1)+"%";

  // Total XP bar
  document.getElementById("totalXPBottom").textContent = totalXP.toFixed(0);
  let xpPercent = Math.min(totalXP/50000*100, 100);
  document.getElementById("fullXPFill").style.width = xpPercent+"%";
}

// Add session
function handleSessionInput(){
  const input = document.getElementById("sessionInput").value.trim().toLowerCase();
  if(!input) return;
  const parts = input.split(" ");
  const code = parts[0];
  let minutes=0, pp=false, quiz=false;
  for(let i=1;i<parts.length;i++){
    let p=parts[i];
    if(p.endsWith("h")) minutes += (parseInt(p)||0)*60;
    else if(p.endsWith("m")) minutes += parseInt(p)||0;
    else if(p==="pp") pp=true;
    else if(p==="q") quiz=true;
  }

  const sub = subjects.find(s=>s.code===code);
  if(!sub) return alert("Invalid subject code");

  // Calculate marks and XP
  let marksGain = (minutes/900)*100; // 15h = 100 marks -> 900 min
  if(pp) marksGain+=5;
  if(quiz) marksGain+=3;
  sub.marks += marksGain;
  if(sub.marks>100) sub.marks=100;

  let xpGain = (minutes/60)*50; // 1h = 50 XP
  if(pp) xpGain+=5;
  if(quiz) xpGain+=3;
  totalXP += xpGain;

  // Save session in history
  const now = new Date();
  const sessionRecord = {
    subject: sub.name,
    hours: Math.floor(minutes/60),
    minutes: minutes%60,
    marksGained: marksGain.toFixed(1),
    date: now.toLocaleDateString()
  };
  sessionHistory.push(sessionRecord);
  redoHistory = [];

  document.getElementById("sessionInput").value="";
  saveData();
  updateUI();
}

// Undo/Redo/Reset
function undo(){ 
  if(sessionHistory.length===0) return; 
  redoHistory.push(JSON.stringify(subjects));
  subjects=JSON.parse(sessionHistory.pop().subjects || JSON.stringify(subjects));
  totalXP = sessionHistory.length>0 ? sessionHistory[sessionHistory.length-1].totalXP : 0;
  updateUI(); 
  saveData();
}
function redo(){ 
  if(redoHistory.length===0) return; 
  sessionHistory.push(JSON.stringify(subjects)); 
  subjects=JSON.parse(redoHistory.pop()); 
  updateUI(); 
  saveData();
}
function resetAll(){ 
  if(!confirm("Are you sure?")) return; 
  subjects.forEach(s=>s.marks=0);
  sessionHistory=[]; redoHistory=[]; totalXP=0;
  saveData(); updateUI();
}

// Motivation
const quotes=["Stay focused and never give up!","Consistency is key to mastery.","Every hour counts, keep going!","Your future self will thank you.","Small steps lead to big progress."];
function showMotivation(){ 
  document.getElementById("motivationQuote").textContent=quotes[Math.floor(Math.random()*quotes.length)]; 
}
setInterval(showMotivation,15000);

// Enter key to submit
document.getElementById("sessionInput").addEventListener("keydown", function(e){
  if(e.key==="Enter") handleSessionInput();
});

window.onload = updateUI;
