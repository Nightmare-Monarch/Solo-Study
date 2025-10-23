// Load history from localStorage
const historyList = document.getElementById("historyList");
const clearAllBtn = document.getElementById("clearAllBtn");

// Get saved history or empty array
let studyHistory = JSON.parse(localStorage.getItem("studyHistory")) || [];

// Display all saved sessions
function renderHistory() {
  historyList.innerHTML = "";

  if (studyHistory.length === 0) {
    historyList.innerHTML = "<p>No study sessions yet.</p>";
    return;
  }

  studyHistory.forEach((session, index) => {
    const div = document.createElement("div");
    div.classList.add("history-item");

    const text = document.createElement("span");
    // ✅ Fix: Use session.subject & session.duration properly
    text.textContent = `${session.subject} — ${session.duration}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.classList.add("remove-btn");
    removeBtn.addEventListener("click", () => {
      studyHistory.splice(index, 1);
      localStorage.setItem("studyHistory", JSON.stringify(studyHistory));
      renderHistory();
    });

    div.appendChild(text);
    div.appendChild(removeBtn);
    historyList.appendChild(div);
  });
}

// Clear all history
clearAllBtn.addEventListener("click", () => {
  if (confirm("Clear all study history?")) {
    studyHistory = [];
    localStorage.removeItem("studyHistory");
    renderHistory();
  }
});

renderHistory();
