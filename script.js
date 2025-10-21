let subjects = JSON.parse(localStorage.getItem("subjects")) || [
  { name:"Sinhala", code:"sin", marks:0, xp:0 },
  { name:"Science", code:"sci", marks:0, xp:0 },
  { name:"Commerce", code:"com", marks:0, xp:0 },
  { name:"Buddhism", code:"bud", marks:0, xp:0 },
  { name:"History", code:"his", marks:0, xp:0 },
  { name:"Dancing", code:"dan", marks:0, xp:0 },
  { name:"Health", code:"hea", marks:0, xp:0 },
  { name:"Maths", code:"mat", marks:0, xp:0 },
  { name:"English", code:"eng", marks:0, xp:0 }
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

function handleSessionInput() {
  const input = document.getElementById("sessionInput").value.trim().toLowerCase();
  if(!input) return;
  const parts = input.split(" ");
  const subjectCode = parts[0];
  let totalMinutes = 0, isPP=false, isQuiz=false;

  for(let i=1;i<parts.length;i++){
    let p=parts[i];
    if(p.endsWith("h")) totalMinutes += (parseInt(p)||0)*60;
    else if(p.endsWith("m")) totalMinutes += parseInt(p)||0;
    else if(p=="pp") isPP=true;
    else if(p=="q") isQuiz=true;
  }

  sessionHistory.push(JSON.stringify(subjects));
  redoHistory=[];
  addSession(subjectCode,totalMinutes,isPP,isQuiz);
  document.getElementById("sessionInput").value="";
  saveData();
}

function addSession(code, mins, pp, quiz) {
  const s = subjects.find(sub=>sub.code==code);
  if(!s) return alert("Invalid subject code");

  let marksGain = mins*(100/(15*60)); // 15h = 100 marks
  let xpGain = marksGain*2; // XP double speed
  if(pp){ marksGain+=5; xpGain+=5; }
  if(quiz){ marksGain+=3; xpGain+=3; }

  s.marks+=marksGain; s.xp+=0; // XP now separate
  totalXP+=xpGain;

  if(s.marks>100) s.marks=100;
  if(totalXP<0) totalXP=0;

  updateUI();
}

function undo() {
  if(!sessionHistory.length) return alert("Nothing to undo");
  redoHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(sessionHistory.pop());
  updateUI(); saveData();
}

function redo() {
  if(!redoHistory.length) return alert("Nothing to redo");
  sessionHistory.push(JSON.stringify(subjects));
  subjects = JSON.parse(redoHistory.pop());
  updateUI(); saveData();
}

function resetAll() {
  if(!confirm("Are you sure?")) return;
  subjects.forEach(s=>{s.marks=0;s.xp=0});
  sessionHistory=[]; redoHistory=[]; totalXP=0;
  updateUI(); saveData();
}

function updateUI(){
  const container = document.getElementById("subjectContainer");
  container.innerHTML="";
  subjects.sort((a,b)=>b.marks-a.marks);
  subjects.forEach((s,i)=>{
    const div = document.createElement("div");
    div.className="subject";
    div.innerHTML=`
      <strong>${i+1}. ${s.name}</strong> - Marks: ${s.marks.toFixed(1)}
      <div class="progress marks-bar"><div class="progress-fill" style="width:${s.marks}%"></div></div>
      XP: 0 / 100
      <div class="progress xp-bar"><div class="progress-fill" style="width:0%"></div></div>
    `;
    container.appendChild(div);
    setTimeout(()=>div.classList.add("show"),100);
  });

  document.getElementById("totalMarksBottom").textContent = subjects.reduce((a,b)=>a+b.marks,0).toFixed(1);
  document.getElementById("totalXPBottom").textContent = totalXP.toFixed(1);
}

window.onload=updateUI;
