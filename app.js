const STORAGE_KEY = 'tasktracker-items';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentFilter = 'all';

const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const taskList = document.querySelector('#task-list');
const emptyState = document.querySelector('#empty-state');
const taskCount = document.querySelector('#task-count');
const clearCompletedButton = document.querySelector('#clear-completed');

document.querySelector('#today').textContent = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
}).format(new Date());

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function addTask(title) {
  const cleanTitle = title.trim();
  if (!cleanTitle) return;

  tasks.unshift({
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    title: cleanTitle,
    completed: false
  });

  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function getVisibleTasks() {
  if (currentFilter === 'active') {
    return tasks.filter(task => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter(task => task.completed);
  }

  return tasks;
}

function renderTasks() {
  taskList.replaceChildren();
  const visibleTasks = getVisibleTasks();
  const activeCount = tasks.filter(task => !task.completed).length;
  taskCount.textContent = activeCount;

  visibleTasks.forEach(task => {
    const item = document.createElement('li');
    item.className = `task-item ${task.completed ? 'completed' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.title} as complete`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const title = document.createElement('span');
    title.className = 'task-title';
    title.textContent = task.title;

    const remove = document.createElement('button');
    remove.className = 'delete-button';
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Delete ${task.title}`);
    remove.addEventListener('click', () => deleteTask(task.id));

    item.append(checkbox, title, remove);
    taskList.append(item);
  });

  emptyState.hidden = visibleTasks.length > 0;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  addTask(input.value);
  input.value = '';
  input.focus();
});

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(filter =>
      filter.classList.toggle('active', filter === button)
    );
    renderTasks();
  });
});

clearCompletedButton.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
