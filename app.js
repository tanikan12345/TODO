const STORAGE_KEY = "todo-items";

/** @type {{id: string, text: string, completed: boolean}[]} */
let todos = loadTodos();
let currentFilter = "all";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const itemsLeft = document.getElementById("items-left");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  const filtered = todos.filter((t) => {
    if (currentFilter === "active") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  list.innerHTML = "";
  for (const todo of filtered) {
    list.appendChild(renderItem(todo));
  }

  emptyState.hidden = filtered.length > 0;
  const remaining = todos.filter((t) => !t.completed).length;
  itemsLeft.textContent = `${remaining} 件残り`;
}

function renderItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");
  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = todo.text;
  label.addEventListener("dblclick", () => startEdit(li, todo));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.type = "button";
  deleteBtn.setAttribute("aria-label", "削除");
  deleteBtn.textContent = "×";
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  li.append(checkbox, label, deleteBtn);
  return li;
}

function startEdit(li, todo) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;
  editInput.maxLength = 200;

  const label = li.querySelector(".label");
  li.replaceChild(editInput, label);
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  const commit = () => {
    const text = editInput.value.trim();
    if (text) {
      updateTodoText(todo.id, text);
    } else {
      deleteTodo(todo.id);
    }
  };

  editInput.addEventListener("blur", commit);
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") editInput.blur();
    if (e.key === "Escape") {
      editInput.removeEventListener("blur", commit);
      render();
    }
  });
}

function addTodo(text) {
  todos.push({ id: crypto.randomUUID(), text, completed: false });
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function updateTodoText(id, text) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.text = text;
    saveTodos();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-selected", String(b === btn));
    });
    render();
  });
});

render();
