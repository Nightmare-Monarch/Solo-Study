let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name: "Sinhala", code: "sin", marks: 0, xp: 0 },
  { name: "Science", code: "sci", marks: 0, xp: 0 },
  { name: "Commerce", code: "com", marks: 0, xp: 0 },
  { name: "Buddhism", code: "bud", marks: 0, xp: 0 },
  { name: "History", code: "his", marks: 0, xp: 0 },
  { name: "Dancing", code: "dan", marks: 0, xp: 0 },
  { name: "Health", code: "hea", marks: 0, xp: 0 },
  { name: "Maths", code: "mat", marks: 0, xp: 0 },
  { name: "English", code: "eng", marks: 0, xp: 0 }
];

let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
let redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || [];

function saveData() {
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
}

// Update UI
function updateUI() {
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";

  subjects.forEach((s, index) => {
    container.innerHTML += `
      <div class="subject">
        <strong>${index+1}. ${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
        <div class="progress marks-bar"><div class="progress-fill" style="width:${s.marks/15*100}%;"></div></div>
      </div>
    `;
  });

  // Total marks
  const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
  const maxMarks = 900; // 15h=100 marks for each subject, 9 subjects *100=900
  document.getElementById("totalMarksBottom").textContent = totalMarks.toFixed(1);
  document.getElementById("fullMarksFill").style.width = (totalMarks/maxMarks*100).toFixed(1)+"%";

  // Total XP
  const totalXP = subjects.reduce((a,b)=>a+b.xp,0);
  document.getElementById("totalXPBottom").textContent = totalXP.toFixed(1);
  document.getElementById("fullXPFill").style.width = Math.min(totalXP/50*100, 100)+"%";
}

// Add session
function handleSessionInput(){
  const inputBox = document.getElementById("sessionInput");
  const input = inputBox.value.trim().toLowerCase();
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

  const marksGained = (minutes/900) * 100; // 15h=100 marks, 1h=50xp
  const xpGained = (minutes/60)*50 + (pp?5:0) + (quiz?3:0);

  sub.marks += marksGained;
  sub.xp += xpGained;

  // Save last session data
  const now = new Date();
  sub.lastSession = {
    hours: Math.floor(minutes/60),
    minutes: minutes%60,
    marksGained: marksGained,
    xpGained: xpGained,
    date: now.toLocaleDateString()
  };

  // Save session snapshot for history
  sessionHistory.push(JSON.stringify(subjects));
  redoHistory = [];

  inputBox.value="";
  saveData();
  updateUI();
}

// Undo/Redo/Reset
function undo(){
  if(sessionHistory.length===0) return;
  redoHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(sessionHistory.pop());
  updateUI();
  saveData();
}

function redo(){
  if(redoHistory.length===0) return;
  sessionHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(redoHistory.pop());
  updateUI();
  saveData();
}

function resetAll(){
  if(!confirm("Are you sure?")) return;
  subjects.forEach(s=>{s.marks=0;s.xp=0;s.lastSession=null;});
  sessionHistory=[];
  redoHistory=[];
  saveData();
  updateUI();
}

// Enter key support
document.getElementById("sessionInput").addEventListener("keypress", function(e){
  if(e.key === "Enter") handleSessionInput();
});

window.onload = updateUI;
