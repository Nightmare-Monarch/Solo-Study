// Subjects & XP
let subjects = { 
    "sin": { name:"Sinhala", marks:69, level:7, exp:0, icon:"📚" },
    "sci": { name:"Science", marks:68, level:7, exp:0, icon:"🔬" },
    "com": { name:"Commerce", marks:80, level:8, exp:0, icon:"💰" },
    "bud": { name:"Buddhism", marks:95, level:10, exp:0, icon:"🕉️" },
    "his": { name:"History", marks:86, level:9, exp:0, icon:"🏺" },
    "dan": { name:"Dancing", marks:73, level:8, exp:0, icon:"💃" },
    "hea": { name:"Health", marks:90, level:9, exp:0, icon:"💊" },
    "mat": { name:"Maths", marks:90, level:9, exp:0, icon:"📐" },
    "eng": { name:"English", marks:82, level:8, exp:0, icon:"📝" }
  };
  
  const expPerMark = 20;
  const expPP = 20;
  const expQuiz = 25;
  const expPerMinute = 1;
  
  let undoStack=[], redoStack=[], sessionHistory=[];
  if(localStorage.getItem("studyData")) subjects = JSON.parse(localStorage.getItem("studyData"));
  if(localStorage.getItem("sessionHistory")) sessionHistory = JSON.parse(localStorage.getItem("sessionHistory"));
  
  function saveState(){ undoStack.push(JSON.stringify(subjects)); if(undoStack.length>50) undoStack.shift(); }
  function addSession(){
    const input = document.getElementById("logInput").value.trim().toLowerCase();
    if(!input) return;
    saveState(); redoStack=[];
    sessionHistory.push(input); localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
    processSession(input);
    localStorage.setItem("studyData", JSON.stringify(subjects));
    updateTable(); document.getElementById("logInput").value="";
  }
  function processSession(input){
    const parts=input.split(" "), code=parts[0]; if(!subjects[code]){ alert("Unknown subject"); return; }
    let expGain=0;
    for(let i=1;i<parts.length;i++){
      const t=parts[i];
      if(t==="pp") expGain+=expPP;
      else if(t==="q") expGain+=expQuiz;
      else if(t.endsWith("m")) expGain+=parseInt(t.replace("m",""))*expPerMinute;
      else if(t.includes("h")){ let [h,m]=t.split("h").map(x=>parseInt(x)||0); expGain+=(h*60+m)*expPerMinute;}
      else if(!isNaN(parseFloat(t))) expGain+=parseFloat(t)*expPerMinute;
    }
    subjects[code].exp+=expGain;
    while(subjects[code].exp>=expPerMark){subjects[code].exp-=expPerMark; subjects[code].marks+=1; document.getElementById("levelUpSound").play(); confetti({particleCount:100, spread:70, origin:{y:0.6}});}
  }
  function undo(){if(undoStack.length===0) return; redoStack.push(JSON.stringify(subjects)); subjects=JSON.parse(undoStack.pop()); localStorage.setItem("studyData", JSON.stringify(subjects)); updateTable();}
  function redo(){if(redoStack.length===0) return; undoStack.push(JSON.stringify(subjects)); subjects=JSON.parse(redoStack.pop()); localStorage.setItem("studyData", JSON.stringify(subjects)); updateTable();}
  
  // Update table sorted
  function updateTable(){
    const tbody=document.querySelector("#trackerTable tbody"); tbody.innerHTML="";
    const sortedSubjects=Object.values(subjects).sort((a,b)=>b.marks-a.marks);
    for(let sub of sortedSubjects){
      const tr=document.createElement("tr");
      tr.innerHTML=`<td>${sub.icon} ${sub.name}</td><td>${sub.marks}</td><td>${sub.level}</td><td>${sub.exp}/${expPerMark}</td>
                    <td><div class="progress-bar"><div class="progress-fill" style="width:${(sub.exp/expPerMark)*100}%">${Math.floor((sub.exp/expPerMark)*100)}%</div></div></td>`;
      tbody.appendChild(tr);
    }
  }
  
  // Background music
  const music=document.getElementById("bgMusic"); music.volume=0.3;
  window.addEventListener("DOMContentLoaded",()=>music.play().catch(()=>{document.body.addEventListener("click",()=>music.play(),{once:true});}));
  
  // Stopwatch
  let stopwatchInterval, stopwatchTime=0, running=false, currentSubject="";
  function formatTime(s){ const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60; return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;}
  function startStopwatch(){ if(running) return; currentSubject=document.getElementById("subjectSelect").value; running=true; stopwatchInterval=setInterval(()=>{stopwatchTime++; document.getElementById("stopwatchDisplay").textContent=formatTime(stopwatchTime);},1000);}
  function stopStopwatch(){running=false; clearInterval(stopwatchInterval);}
  function resumeStopwatch(){if(running) return; running=true; stopwatchInterval=setInterval(()=>{stopwatchTime++; document.getElementById("stopwatchDisplay").textContent=formatTime(stopwatchTime);},1000);}
  function submitStopwatch(){ if(stopwatchTime===0) return; let hours=Math.floor(stopwatchTime/3600), minutes=Math.floor((stopwatchTime%3600)/60); let sessionStr=currentSubject+` ${hours>0?hours+'h':''} ${minutes>0?minutes+'m':''}`; document.getElementById("logInput").value=sessionStr; addSession(); stopwatchTime=0; document.getElementById("stopwatchDisplay").textContent="00:00:00"; stopStopwatch();}
  updateTable();
  