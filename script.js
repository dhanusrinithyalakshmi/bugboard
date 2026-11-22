const statuses = ["todo", "progress", "fixed"];
let bugs = JSON.parse(localStorage.getItem("bugs")) || [];

const form = document.getElementById("bug-form");

function saveBugs() {
  localStorage.setItem("bugs", JSON.stringify(bugs));
}

function createCard(bug) {
  const card = document.createElement("div");
  card.className = "card " + bug.priority.toLowerCase();
  card.draggable = true;

card.addEventListener("dragstart", (e) => {
  e.dataTransfer.setData("text/plain", bug.id);
  card.classList.add("dragging");
});

card.addEventListener("dragend", () => {
  card.classList.remove("dragging");
});
  const title = document.createElement("h3");
  title.textContent = bug.title;

  const desc = document.createElement("p");
  desc.textContent = bug.description;

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = bug.priority;

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const date = document.createElement("span");
  date.className = "date";
  date.textContent = bug.date;

  const actions = document.createElement("div");
  actions.className = "card-actions";

  if (bug.status !== "fixed") {
    const moveBtn = document.createElement("button");
    moveBtn.className = "move-btn";
    moveBtn.textContent = "Move ➜";
    moveBtn.addEventListener("click", () => moveBug(bug.id));
    actions.appendChild(moveBtn);
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteBug(bug.id));
  actions.appendChild(deleteBtn);

  footer.appendChild(date);
  footer.appendChild(actions);

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(tag);
  card.appendChild(footer);

  return card;
}

function renderBoard() {
  const searchText = document.getElementById("search").value.toLowerCase();
  const priorityFilter = document.getElementById("filter-priority").value;

  statuses.forEach((status) => {
    const list = document.getElementById("list-" + status);
    list.innerHTML = "";

    const items = bugs.filter((bug) => {
      const matchesSearch = bug.title.toLowerCase().includes(searchText);
      const matchesPriority =
        priorityFilter === "All" || bug.priority === priorityFilter;
      return bug.status === status && matchesSearch && matchesPriority;
    });

    document.getElementById("count-" + status).textContent = items.length;
    items.forEach((bug) => list.appendChild(createCard(bug)));
  });
}

function addBug(title, description, priority) {
  bugs.push({
    id: Date.now(),
    title: title,
    description: description,
    priority: priority,
    status: "todo",
    date: new Date().toLocaleDateString()
  });
  saveBugs();
  renderBoard();
}

function moveBug(id) {
  const bug = bugs.find((b) => b.id === id);
  const next = statuses.indexOf(bug.status) + 1;
  if (next < statuses.length) {
    bug.status = statuses[next];
    saveBugs();
    renderBoard();
  }
}

function deleteBug(id) {
  bugs = bugs.filter((b) => b.id !== id);
  saveBugs();
  renderBoard();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const priority = document.getElementById("priority").value;

  if (title === "") return;

  addBug(title, description, priority);
  form.reset();
  document.getElementById("priority").value = "Medium";
});

renderBoard();
statuses.forEach((status) => {
  const column = document.getElementById("list-" + status).parentElement;

  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    column.classList.add("drag-over");
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("drag-over");
  });

  column.addEventListener("drop", (e) => {
    e.preventDefault();
    column.classList.remove("drag-over");
    const id = Number(e.dataTransfer.getData("text/plain"));
    const bug = bugs.find((b) => b.id === id);
    if (bug && bug.status !== status) {
      bug.status = status;
      saveBugs();
      document.getElementById("search").addEventListener("input", renderBoard);
      document.getElementById("filter-priority").addEventListener("change", renderBoard);
      renderBoard();
    }
  });
});