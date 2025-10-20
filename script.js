// Subject data
let subjects = {
    "sin": { name: "Sinhala", marks: 69, level: 7, exp: 0, icon: "📚" },
    "sci": { name: "Science", marks: 68, level: 7, exp: 0, icon: "🔬" },
    "com": { name: "Commerce", marks: 80, level: 8, exp: 0, icon: "💰" },
    "bud": { name: "Buddhism", marks: 95, level: 10, exp: 0, icon: "🕉️" },
    "his": { name: "History", marks: 86, level: 9, exp: 0, icon: "🏺" },
    "dan": { name: "Dancing", marks: 73, level: 8, exp: 0, icon: "💃" },
    "hea": { name: "Health", marks: 90, level: 9, exp: 0, icon: "💊" },
    "mat": { name: "Maths", marks: 90, level: 9, exp: 0, icon: "📐" },
    "eng": { name: "English", marks: 82, level: 8, exp: 0, icon: "📝" }
  };
  
  // XP settings
  const expPerLevel = 100;
  const marksPerLevel = 5;
  const expPerHour = 10;
  const expPP = 20;
  const expQuiz = 25;
  
  // Undo/Redo stacks
  let undoStack = [];
  let redoStack = [];
  let sessionHistory = [];
  
  // Load from LocalStorage
  if(localStorage.getItem("studyData")) subjects = JSON.parse(localStorage.getItem("studyData"));
  if(localStorage.getItem("sessionHistory")) sessionHistory = JSON.parse(localStorage.getItem("sessionHistory"));
  
  // Save state for undo
  function saveState(){
    undoStack.push(JSON.stringify(subjects));
    if(undoStack.length>50) undoStack.shift();
  }
  
  // Add session
  function addSession(){
    const input = document.getElementById("logInput").value.trim().toLowerCase();
    if(!input) return;
  
    saveState(); 
    redoStack = [];
  
    // Save to history
    sessionHistory.push(input);
    localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  
    // Update XP / EXP
    processSession(input);
  
    // Save subjects to LocalStorage
    localStorage.setItem("studyData", JSON.stringify(subjects));
  
    // Refresh table
    updateTable();
  
    document.getElementById("logInput").value = "";
  }
  
  // Process session string
  function processSession(input){
    const parts = input.split(" ");
    const code = parts[0];
    if(!subjects[code]){ alert("Unknown subject: "+code); return; }
  
    let expGain = 0;
    for(let i=1;i<parts.length;i++){
      const t = parts[i];
      if(t==="pp") expGain += expPP;
      else if(t==="q") expGain += expQuiz;
      else if(!isNaN(parseFloat(t))) expGain += parseFloat(t)*expPerHour;
    }
  
    subjects[code].exp += expGain;
  
    // Level up if needed
    while(subjects[code].exp >= expPerLevel){
      subjects[code].exp -= expPerLevel;
      subjects[code].level += 1;
      subjects[code].marks += marksPerLevel;
      if(subjects[code].marks > 150) subjects[code].marks = 150;
  
      document.getElementById("levelUpSound").play();
      confetti({particleCount:100, spread:70, origin:{y:0.6}});
    }
  }
  
  // Undo
  function undo(){
    if(undoStack.length===0) return;
    redoStack.push(JSON.stringify(subjects));
    subjects = JSON.parse(undoStack.pop());
    localStorage.setItem("studyData", JSON.stringify(subjects));
    updateTable();
  }
  
  // Redo
  function redo(){
    if(redoStack.length===0) return;
    undoStack.push(JSON.stringify(subjects));
    subjects = JSON.parse(redoStack.pop());
    localStorage.setItem("studyData", JSON.stringify(subjects));
    updateTable();
  }
  
  // Update tracker table
  function updateTable(){
    const tbody = document.querySelector("#trackerTable tbody");
    tbody.innerHTML = "";
    for(let key in subjects){
      const sub = subjects[key];
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${sub.icon} ${sub.name}</td>
                      <td>${sub.marks}</td>
                      <td>${sub.level}</td>
                      <td>${sub.exp}/${expPerLevel}</td>
                      <td>
                        <div class="progress-bar">
                          <div class="progress-fill" style="width:${(sub.exp/expPerLevel)*100}%">
                            ${Math.floor((sub.exp/expPerLevel)*100)}%
                          </div>
                        </div>
                      </td>`;
      tbody.appendChild(tr);
    }
  }
  
  // Reset subjects to default (optional)
  function resetSubjects(){
    subjects = {
      "sin": { name: "Sinhala", marks: 69, level: 7, exp: 0, icon: "📚" },
      "sci": { name: "Science", marks: 68, level: 7, exp: 0, icon: "🔬" },
      "com": { name: "Commerce", marks: 80, level: 8, exp: 0, icon: "💰" },
      "bud": { name: "Buddhism", marks: 95, level: 10, exp: 0, icon: "🕉️" },
      "his": { name: "History", marks: 86, level: 9, exp: 0, icon: "🏺" },
      "dan": { name: "Dancing", marks: 73, level: 8, exp: 0, icon: "💃" },
      "hea": { name: "Health", marks: 90, level: 9, exp: 0, icon: "💊" },
      "mat": { name: "Maths", marks: 90, level: 9, exp: 0, icon: "📐" },
      "eng": { name: "English", marks: 82, level: 8, exp: 0, icon: "📝" }
    };
  }
  
  // Initialize table
  updateTable();
  