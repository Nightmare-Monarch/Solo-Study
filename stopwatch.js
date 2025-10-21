let swInterval, swTime=0;
function formatTime(t){
  let h=Math.floor(t/3600);
  let m=Math.floor((t%3600)/60);
  let s=t%60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}
function startStopwatch(){ clearInterval(swInterval); swInterval=setInterval(()=>{ swTime++; document.getElementById("display").textContent=formatTime(swTime); },1000);}
function pauseStopwatch(){ clearInterval(swInterval);}
function resetStopwatch(){ clearInterval(swInterval); swTime=0; document.getElementById("display").textContent=formatTime(swTime);}
function submitStopwatchSession(){
  const mins=Math.floor(swTime/60);
  const code=document.getElementById("subjectSelect").value;
  addSession(code, mins, false, false);
  swTime=0; document.getElementById("display").textContent=formatTime(swTime);
  saveData(); alert("Session submitted!");
}
