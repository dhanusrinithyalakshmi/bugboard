const statuses = ["todo", "progress", "fixed"];
let bugs = [];

const form = document.getElementById("bug-form");
const searchInput = document.getElementById("search");
const priorityFilter = document.getElementById("filter-priority");
let editingId = null;
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");

async function loadBugs() {
  try {
    const res = await fetch("/api/bugs");
    bugs = await res.json();
    renderBoard();
  } catch (err) {
    console.error("Could not load bugs:", err);
  }
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

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => startEdit(bug.id));
  actions.appendChild(editBtn);

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
  const searchText = searchInput.value.toLowerCase();
  const selectedPriority = priorityFilter.value;

  statuses.forEach((status) => {
    const list = document.getElementById("list-" + status);
    list.innerHTML = "";

    const items = bugs.filter((bug) => {
      const matchesSearch = bug.title.toLowerCase().includes(searchText);
      const matchesPriority =
        selectedPriority === "All" || bug.priority === selectedPriority;
      return bug.status === status && matchesSearch && matchesPriority;
    });

    document.getElementById("count-" + status).textContent = items.length;
    items.forEach((bug) => list.appendChild(createCard(bug)));
  });
}

async function addBug(title, description, priority) {
  const res = await fetch("/api/bugs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, priority })
  });
  const newBug = await res.json();
  bugs.push(newBug);
  renderBoard();
}

async function updateBugOnServer(id, changes) {
  const res = await fetch("/api/bugs/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(changes)
  });
  const updated = await res.json();
  const index = bugs.findIndex((b) => b.id === id);
  bugs[index] = updated;
  renderBoard();
}

async function moveBug(id) {
  const bug = bugs.find((b) => b.id === id);
  const next = statuses.indexOf(bug.status) + 1;
  if (next < statuses.length) {
    await updateBugOnServer(id, { status: statuses[next] });
  }
}

async function deleteBug(id) {
  if (editingId === id) resetForm();
  await fetch("/api/bugs/" + id, { method: "DELETE" });
  bugs = bugs.filter((b) => b.id !== id);
  renderBoard();
}

function startEdit(id) {
  const bug = bugs.find((b) => b.id === id);
  document.getElementById("title").value = bug.title;
  document.getElementById("description").value = bug.description;
  document.getElementById("priority").value = bug.priority;
  editingId = id;
  submitBtn.textContent = "Save Changes";
  cancelBtn.classList.remove("hidden");
  form.scrollIntoView({ behavior: "smooth" });
}

function resetForm() {
  form.reset();
  document.getElementById("priority").value = "Medium";
  editingId = null;
  submitBtn.textContent = "Add Bug";
  cancelBtn.classList.add("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const priority = document.getElementById("priority").value;

  if (title === "") return;

  if (editingId !== null) {
    await updateBugOnServer(editingId, { title, description, priority });
  } else {
    await addBug(title, description, priority);
  }
  resetForm();
});

cancelBtn.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderBoard);
priorityFilter.addEventListener("change", renderBoard);

statuses.forEach((status) => {
  const column = document.getElementById("list-" + status).parentElement;

  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    column.classList.add("drag-over");
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("drag-over");
  });

  column.addEventListener("drop", async (e) => {
    e.preventDefault();
    column.classList.remove("drag-over");
   const id = e.dataTransfer.getData("text/plain");
    const bug = bugs.find((b) => b.id === id);
    if (bug && bug.status !== status) {
      await updateBugOnServer(id, { status });
    }
  });
});

loadBugs();