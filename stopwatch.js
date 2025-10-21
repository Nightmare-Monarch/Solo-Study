let stopwatchInterval, elapsed=0;

function formatTime(sec){
  let h=Math.floor(sec/3600);
  let m=Math.floor((sec%3600)/60);
  let s=sec%60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

function startStopwatch(){
  clearInterval(stopwatchInterval);
  stopwatchInterval=setInterval(()=>{
    elapsed++;
    document.getElementById("stopwatchDisplay").textContent=formatTime(elapsed);
  },1000);
}
function pauseStopwatch(){ clearInterval(stopwatchInterval); }
function resetStopwatch(){ clearInterval(stopwatchInterval); elapsed=0; document.getElementById("stopwatchDisplay").textContent=formatTime(elapsed); }

function submitStopwatch(){
  const input=document.getElementById("stopwatchSessionInput").value.trim().toLowerCase();
  if(!input)return alert("Enter subject code");
  const minutes=elapsed/60;
  if(minutes<=0)return alert("Stopwatch must run some time");
  // Add session with same XP/marks logic
  const event=new Event('input');
  document.getElementById("sessionInput").value=`${input} ${minutes.toFixed(0)}m`;
  window.handleSessionInput();
  resetStopwatch();
}
