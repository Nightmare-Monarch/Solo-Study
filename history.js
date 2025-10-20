function loadHistory(){
  const historyContainer = document.getElementById("historyContainer");
  historyContainer.innerHTML = "";

  let history = JSON.parse(localStorage.getItem("history") || "[]");
  history.forEach((item, index) => {
    let div = document.createElement("div");
    div.textContent = item;

    let delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      history.splice(index, 1);
      localStorage.setItem("history", JSON.stringify(history));
      loadHistory();
    };

    div.appendChild(delBtn);
    historyContainer.appendChild(div);
  });
}

function clearHistory(){
  localStorage.removeItem("history");
  loadHistory();
}

window.onload = loadHistory;

