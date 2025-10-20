let sessionHistory = [];
if(localStorage.getItem("sessionHistory")){
  sessionHistory = JSON.parse(localStorage.getItem("sessionHistory"));
}

function updateHistory(){
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  sessionHistory.forEach((sess,index)=>{
    const li=document.createElement("li");
    li.textContent = sess;
    const delBtn=document.createElement("button");
    delBtn.textContent="Remove";
    delBtn.onclick=()=> removeSession(index);
    li.appendChild(delBtn);
    historyList.appendChild(li);
  });
}

function removeSession(index){
  sessionHistory.splice(index,1);
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
  updateHistory();
  localStorage.removeItem("studyData");
}

function clearHistory(){
  if(confirm("Are you sure you want to clear all history and reset progress?")){
    sessionHistory=[];
    localStorage.removeItem("sessionHistory");
    localStorage.removeItem("studyData");
    updateHistory();
  }
}

updateHistory();
