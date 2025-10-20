let subjects = JSON.parse(localStorage.getItem("subjects")) || [
    { name: "Sinhala", code: "sin", marks: 69, xp: 0 },
    { name: "Science", code: "sci", marks: 67, xp: 0 },
    { name: "Commerce", code: "com", marks: 82, xp: 0 },
    { name: "Buddhism", code: "bud", marks: 95, xp: 0 },
    { name: "History", code: "his", marks: 86, xp: 0 },
    { name: "Dancing", code: "dan", marks: 73, xp: 0 },
    { name: "Health", code: "hea", marks: 90, xp: 0 },
    { name: "Maths", code: "mat", marks: 90, xp: 0 },
    { name: "English", code: "eng", marks: 82, xp: 0 }
  ];
  
  let sessionHistory = JSON.parse(localStorage.getItem("sessionHistory")) || [];
  let redoHistory = JSON.parse(localStorage.getItem("redoHistory")) || [];
  
  
  
  
  function saveData() {
    localStorage.setItem("subjects", JSON.stringify(subjects));
    localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
    localStorage.setItem("redoHistory", JSON.stringify(redoHistory));
  }
  
  // Animate numbers smoothly
  function animateNumber(element, start, end, duration=800) {
    const range = end - start;
    let startTime = null;
    function step(time) {
      if(!startTime) startTime = time;
      let progress = Math.min((time - startTime)/duration,1);
      element.textContent = (start + range*progress).toFixed(1);
      if(progress<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  
  // Update UI
  function updateUI() {
    const container = document.getElementById("subjectContainer");
    container.innerHTML = "";
  
    subjects.sort((a,b)=>b.marks - a.marks); // Sort by marks
  
    subjects.forEach((s,index)=>{
      const xpPercent = (s.xp/100)*100; // XP bar max 100
      container.innerHTML += `
        <div class="subject">
          <strong>${index+1}. ${s.name}</strong> - Marks: <span class="marks-value">${s.marks.toFixed(1)}</span>
          <div class="progress xp-bar">
            <div class="progress-fill" style="width:${xpPercent}%;"></div>
          </div>
          <small>XP: ${s.xp.toFixed(1)}/100</small>
          <div class="progress marks-bar">
            <div class="progress-fill" style="width:${s.marks.toFixed(1)}%"></div>
          </div>
        </div>`;
    });
  
    // Update total marks bottom bar
    const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
    const maxMarks = 900; // 9 subjects * 100
    const totalMarksEl = document.getElementById("totalMarksBottom");
    if(totalMarksEl) animateNumber(totalMarksEl, parseFloat(totalMarksEl.textContent)||0, totalMarks);
    const fill = document.getElementById("fullMarksFill");
    if(fill) fill.style.width = (totalMarks/maxMarks*100).toFixed(1) + "%";
  }
  
  // Handle session input like "sci 1h 34m pp q 2h"
  function handleSessionInput() {
    const input = document.getElementById("sessionInput").value.trim().toLowerCase();
    if(!input) return;
  
    const parts = input.split(" ");
    const subjectCode = parts[0];
    let totalMinutes = 0;
    let isPP = false, isQuiz = false;
  
    for(let i=1;i<parts.length;i++){
      let p = parts[i];
      if(p.endsWith("h")) totalMinutes += (parseInt(p)||0)*60;
      else if(p.endsWith("m")) totalMinutes += parseInt(p)||0;
      else if(p === "pp") isPP = true;
      else if(p === "q") isQuiz = true;
    }
  
    sessionHistory.push(JSON.stringify(subjects));
    redoHistory = [];
  
    addSession(subjectCode,totalMinutes,isPP,isQuiz);
    document.getElementById("sessionInput").value="";
    saveData();
  
  
  }
  
  // Add session XP & marks
  function addSession(subjectCode,totalMinutes,isPP,isQuiz){
    const subject = subjects.find(s => s.code === subjectCode);
    if(!subject) return alert("Invalid subject code");
  
    // XP calculation: 10 hours = 100 XP → 1 hour = 10 XP → 1 min = 0.1667 XP
    let xpGain = totalMinutes * (100 / 600); 
    if(isPP) xpGain += 5; // practice problems bonus
    if(isQuiz) xpGain += 3; // quiz bonus
  
    subject.xp += xpGain;
  
    // Marks calculation: 10 hours = 100 marks → 1 min = 0.1667 marks
    let marksGain = totalMinutes * (100 / 600);
    if(isPP) marksGain += 5;
    if(isQuiz) marksGain += 3;
  
    subject.marks += marksGain;
  
    // Prevent marks exceeding 100
    if(subject.marks > 100) subject.marks = 100;
  
  
    // Prevent XP exceeding 100
    if(subject.xp > 100) subject.xp = 100;
  
  
  
  
    updateUI();
  }
  
  
  
  // Undo / Redo
  function undo(){
    if(sessionHistory.length===0) return alert("Nothing to undo");
    redoHistory.push(JSON.stringify(subjects));
    subjects = JSON.parse(sessionHistory.pop());
    updateUI();
    saveData();
  }
  
  function redo(){
    if(redoHistory.length===0) return alert("Nothing to redo");
    sessionHistory.push(JSON.stringify(subjects));
    subjects = JSON.parse(redoHistory.pop());
    updateUI();
    saveData();
  }
  
  // Reset all subjects
  function resetAll(){
    if(!confirm("Are you sure you want to reset all marks and XP?")) return;
    subjects.forEach(s=>{s.marks=0; s.xp=0;});
    sessionHistory=[];
    redoHistory=[];
    localStorage.removeItem("history");
    saveData();
    updateUI();
  
  }
  
  window.onload = updateUI;