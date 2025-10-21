let swSeconds=0, swInterval=null;

function formatTime(sec){
  const h=Math.floor(sec/3600);
  const m=Math.floor((sec%3600)/60);
  const s=sec%60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function startStopwatch(){ if(!swInterval) swInterval=setInterval(()=>{ swSeconds++; document.getElementById("stopwatchDisplay").textContent=formatTime(swSeconds); },1000); }
function pauseStopwatch(){ clearInterval(swInterval); swInterval=null; }
function resetStopwatch(){ pauseStopwatch(); swSeconds=0; document.getElementById("stopwatchDisplay").textContent=formatTime(0); }
function submitStopwatch(){
  const code=document.getElementById("stopwatchSubject").value.trim();
  if(!code) return alert("Enter subject code");
  const pp=document.getElementById("ppCheck").checked;
  const quiz=document.getElementById("qCheck").checked;
  const mins=swSeconds/60;
  swSeconds=0; pauseStopwatch(); document.getElementById("stopwatchDisplay").textContent=formatTime(0);
  addSession(code, mins, pp, quiz); saveData(); alert("Session submitted!");
}
