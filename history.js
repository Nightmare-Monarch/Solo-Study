function loadHistory() {
  const container = document.getElementById("historyContainer");
  container.innerHTML = "";
  let history = JSON.parse(localStorage.getItem("sessionHistory") || "[]");

  history.forEach((item, i) => {
    let session = JSON.parse(item);
    let div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      ${session.subjects.map(s => `${s.name}: ${s.marks.toFixed(1)} Marks`).join(" | ")}
      <button class="btn curved-btn small-btn">Remove</button>
    `;

    div.querySelector("button").onclick = () => {
      if (!confirm("Delete this session?")) return;

      // Remove session and revert marks/XP
      history.splice(i, 1);
      localStorage.setItem("sessionHistory", JSON.stringify(history));
      subjects = session.subjects;
      totalXP = session.totalXP;
      localStorage.setItem("subjects", JSON.stringify(subjects));
      localStorage.setItem("totalXP", totalXP);
      loadHistory();
    };

    container.appendChild(div);
  });
}

function clearHistory() {
  if (!confirm("Clear all history?")) return;
  localStorage.removeItem("sessionHistory");
  loadHistory();
}

loadHistory();
