let subjects = {
    "sin": { name: "Sinhala", marks: 69, level: 7, exp: 0 },
    "sci": { name: "Science", marks: 68, level: 7, exp: 0 },
    "com": { name: "Commerce", marks: 80, level: 8, exp: 0 },
    "bud": { name: "Buddhism", marks: 95, level: 10, exp: 0 },
    "his": { name: "History", marks: 86, level: 9, exp: 0 },
    "dan": { name: "Dancing", marks: 73, level: 8, exp: 0 },
    "hea": { name: "Health", marks: 90, level: 9, exp: 0 },
    "mat": { name: "Maths", marks: 90, level: 9, exp: 0 },
    "eng": { name: "English", marks: 82, level: 8, exp: 0 }
  };
  
  const expPerLevel = 100;
  const marksPerLevel = 5;
  
  let undoStack = [];
  let redoStack = [];
  
  // Load progress
  if(localStorage.getItem("studyData")){
    subjects = JSON.parse(localStorage.getItem("studyData"));
  }
  
  function saveState() {
    undoStack.push(JSON.stringify(subjects));
    if(undoStack.length > 50) undoStack.shift();
    localStorage.setItem("studyData", JSON.stringify(subjects));
  }
  
  function addSession() {
    const input = document.getElementById("logInput").value.trim().toLowerCase();
    if(!input) return;
    saveState(); // Save current state for undo
    redoStack = []; // Clear redo stack when new action happens
  
    const parts = input.split(" ");
    const code = parts[0];
    if(!subjects[code]) { alert("Unknown subject code"); return; }
  
    let expGain = 0;
    for(let i=1;i<parts.length;i++){
      const t = parts[i];
      if(t === "0.5") expGain += 5;
      else if(t === "1") expGain += 10;
      else if(t === "2") expGain += 20;
      else if(t === "pp") expGain += 20;
      else if(t === "q") expGain += 25;
      else if(t.includes("pp")) expGain += 20;
      else if(!isNaN(parseFloat(t))) expGain += parseFloat(t)*10;
      else { alert("Unknown type: "+t); }
    }
  
    subjects[code].exp += expGain;
    while(subjects[code].exp >= expPerLevel){
      subjects[code].exp -= expPerLevel;
      subjects[code].level += 1;
      subjects[code].marks += marksPerLevel;
      if(subjects[code].marks > 150) subjects[code].marks = 150; // max cap
      // Optional: play sound or confetti here
    }
    updateTable();
    document.getElementById("logInput").value = "";
    localStorage.setItem("studyData", JSON.stringify(subjects));
  }
  
  function undo(){
    if(undoStack.length === 0) return;
    redoStack.push(JSON.stringify(subjects));
    const last = undoStack.pop();
    subjects = JSON.parse(last);
    updateTable();
    localStorage.setItem("studyData", JSON.stringify(subjects));
  }
  
  function redo(){
    if(redoStack.length === 0) return;
    undoStack.push(JSON.stringify(subjects));
    const next = redoStack.pop();
    subjects = JSON.parse(next);
    updateTable();
    localStorage.setItem("studyData", JSON.stringify(subjects));
  }
  
  function updateTable(){
    const tbody = document.querySelector("#trackerTable tbody");
    tbody.innerHTML = "";
    for(let key in subjects){
      const s = subjects[key];
      const progressPercent = (s.exp/expPerLevel*100).toFixed(0);
      const row = `<tr>
        <td>${s.name}</td>
        <td>${s.marks}</td>
        <td>${s.level}</td>
        <td>${s.exp}</td>
        <td>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${progressPercent}%">${progressPercent}%</div>
          </div>
        </td>
      </tr>`;
      tbody.innerHTML += row;
    }
  }
  
  updateTable();
  