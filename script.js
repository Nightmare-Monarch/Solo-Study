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

function saveData(){
  localStorage.setItem("subjects", JSON.stringify(subjects));
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
}

// Update UI
function updateUI(){
  const container = document.getElementById("subjectContainer");
  container.innerHTML = "";

  subjects.forEach((s,index)=>{
    container.innerHTML += `
      <div class="subject">
        <strong>${index+1}. ${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
        <div class="progress marks-bar"><div class="progress-fill" style="width:${s.marks.toFixed(1)}%;"></div></div>
      </div>`;
  });

  // Total Marks & XP
  const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
  const totalXP = subjects.reduce((a,b)=>a+b.xp,0);
  document.getElementById("totalMarksBottom").textContent = totalMarks.toFixed(1);
  document.getElementById("fullMarksFill").style.width = (totalMarks/900*100).toFixed(1) + "%";

  const xpPercent = Math.min(totalXP/50000*100, 100);
  document.getElementById("totalXPBottom").textContent = totalXP.toFixed(0);
  document.getElementById("fullXPFill").style.width = xpPercent + "%";
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

  // Save session for undo
  sessionHistory.push(JSON.stringify(subjects));
  redoHistory = [];

  const marksGain = (minutes/15)*100;  // 15h =100 marks
  const xpGain = minutes*50/60;       // 1h=50xp

  sub.marks = Math.min(sub.marks+marksGain, 100);
  sub.xp += xpGain;

  saveData();
  updateUI();
  document.getElementById("sessionInput").value="";
}

// Undo / Redo / Reset
function undo(){
  if(sessionHistory.length===0) return;
  redoHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(sessionHistory.pop());
  saveData();
  updateUI();
}

function redo(){
  if(redoHistory.length===0) return;
  sessionHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(redoHistory.pop());
  saveData();
  updateUI();
}

function resetAll(){
  if(!confirm("Reset everything?")) return;
  subjects.forEach(s=>{ s.marks=0; s.xp=0; });
  sessionHistory=[]; redoHistory=[];
  saveData();
  updateUI();
}

// Init
updateUI();
