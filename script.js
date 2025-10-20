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
  
  function updateUI() {
    const container = document.getElementById("subjectContainer");
    container.innerHTML = "";
  
    subjects.sort((a,b)=>b.marks - a.marks);
  
    subjects.forEach((s,index)=>{
      const xpPercent = (s.xp/50)*100;
      container.innerHTML += `
        <div class="subject">
          <strong>${index+1}. ${s.name}</strong> - Marks: <span>${s.marks.toFixed(1)}</span>
          <div class="progress xp">
            <div class="fill" style="width:${xpPercent}%"></div>
          </div>
          <small>${s.xp.toFixed(1)}/50 XP</small>
        </div>`;
    });
  
    const totalMarks = subjects.reduce((a,b)=>a+b.marks,0);
    const fill = document.getElementById("fullMarksFill");
    if(fill) fill.style.width = (totalMarks/822*100).toFixed(1) + "%";
    const totalMarksEl = document.getElementById("totalMarksBottom");
    if(totalMarksEl) animateNumber(totalMarksEl, parseFloat(totalMarksEl.textContent)||0, totalMarks);
  }
  
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
  
  function addSession(subjectCode,totalMinutes,isPP,isQuiz){
    const subject = subjects.find(s => s.code === subjectCode);
    if(!subject) return alert("Invalid subject code");
  
    let xpGain = (totalMinutes / 60) * 15; 
    if(isPP) xpGain += 5;
    if(isQuiz) xpGain += 3;
  
    subject.xp += xpGain;
    subject.marks += xpGain / 2; // 2xp = 1 mark
  
    while(subject.xp >= 50){
      subject.xp -= 50;
      subject.marks += 50;
      document.getElementById("levelupSound").play();
    }
  
    if(subject.marks > 100) subject.marks = 100;
    updateUI();
  }
  
  function undo(){
    if(sessionHistory.length===0) return alert("Nothing to undo");
    redoHistory.push(JSON.stringify(subjects));
    subjects = JSON.parse(sessionHistory.pop());
    updateUI(); saveData();
  }
  
  function redo(){
    if(redoHistory.length===0) return alert("Nothing to redo");
    sessionHistory.push(JSON.stringify(subjects));
    subjects = JSON.parse(redoHistory.pop());
    updateUI(); saveData();
  }
  
  function resetAll(){
    if(!confirm("Reset all progress?")) return;
    subjects.forEach(s=>{s.marks=0;s.xp=0;});
    sessionHistory=[]; redoHistory=[];
    saveData(); updateUI();
  }
  
  window.onload = updateUI;
  