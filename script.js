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
  
  // Load progress from localStorage
  if(localStorage.getItem("studyData")){
    subjects = JSON.parse(localStorage.getItem("studyData"));
  }
  
  function addSession() {
    const input = document.getElementById("logInput").value.trim().toLowerCase();
    const parts = input.split(" ");
    if(parts.length < 2) { alert("Invalid format"); return; }
  
    const code = parts[0];
    const type = parts[1];
  
    let expGain = 0;
    if(type === "0.5") expGain = 5;
    else if(type === "1") expGain = 10;
    else if(type === "2") expGain = 20;
    else if(type === "pp") expGain = 20;
    else if(type === "q") expGain = 25;
    else if(type.includes("pp")) expGain = 20;
    else { alert("Unknown type"); return; }
  
    if(subjects[code]){
      subjects[code].exp += expGain;
      while(subjects[code].exp >= expPerLevel){
        subjects[code].exp -= expPerLevel;
        subjects[code].level += 1;
        subjects[code].marks += marksPerLevel;
      }
      updateTable();
      saveProgress();
    } else {
      alert("Unknown subject code");
    }
  
    document.getElementById("logInput").value = "";
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
  
  function saveProgress(){
    localStorage.setItem("studyData", JSON.stringify(subjects));
  }
  
  // Initialize table
  updateTable();
  