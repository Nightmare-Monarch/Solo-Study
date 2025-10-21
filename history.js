function loadHistory(){
  const container=document.getElementById("historyContainer");
  container.innerHTML="";
  let history=JSON.parse(localStorage.getItem("history")||"[]");
  history.forEach((item,i)=>{
    let div=document.createElement("div");
    div.textContent=item;
    let del=document.createElement("button");
    del.textContent="Delete";
    del.onclick=()=>{ history.splice(i,1); localStorage.setItem("history",JSON.stringify(history)); loadHistory(); };
    div.appendChild(del);
    container.appendChild(div);
  });
}
function clearHistory(){ localStorage.removeItem("history"); loadHistory(); }
window.onload=loadHistory;
