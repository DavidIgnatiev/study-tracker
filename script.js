'use strict';

const form = document.getElementById("taskForm");
const titleInput = document.getElementById("taskTitle");
const subjectSelect = document.getElementById("taskSubject");
const prioritySelect = document.getElementById("taskPriority");
const deadLineInput = document.getElementById("taskDeadline");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const sortSelect = document.getElementById("sortSelect");

const STORAGE_KEY = "studyTrackerTasks";

// Load tasks from localStorage on startup
let tasks = loadTasks();
for (const task of tasks) {
    renderTask(task);
}
updateStats();

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const subject = subjectSelect.value;
    const priority = prioritySelect.value;
    const deadline = deadLineInput.value;

    if (!title) return;

    const task = {
        id: Date.now(), // used as unique identifier
        title,
        subject,
        priority,
        deadline,
        done: false
    };

    tasks.push(task);
    saveTasks(tasks);
    renderTask(task);
    updateStats();

    titleInput.value = "";
    subjectSelect.value = "";
    prioritySelect.value = "";
    deadLineInput.value = "";
});

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
}

function renderTask(task) {
    const li = document.createElement("li");
    li.dataset.id = String(task.id);

    // Highlight overdue tasks
    if (task.deadline) {
        const today = new Date().toISOString().slice(0, 10);
        if (task.deadline < today) {
            li.classList.add("overdue");
        }
    }

    li.innerHTML = `
        <span class="taskText">
            ${task.title} | ${task.subject} |
            <span class="priority-${task.priority}">${task.priority}</span> |
            ${task.deadline || "no deadline"}
        </span>
        <button type="button" class="doneBtn">Done</button>
        <button type="button" class="delete-btn">Delete</button>
    `;

    if (task.done) li.classList.add("done");

    li.querySelector(".delete-btn").addEventListener("click", () => {
        li.remove();
        tasks = tasks.filter(t => t.id !== task.id);
        saveTasks(tasks);
        updateStats();
    });

    li.querySelector(".doneBtn").addEventListener("click", () => {
        task.done = !task.done;
        li.classList.toggle("done");
        saveTasks(tasks);
        updateStats();
    });

    taskList.appendChild(li);
}

function filterAndRender() {
    const searchText = searchInput.value.toLowerCase();
    const filterValue = statusFilter.value;

    const filtered = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchText);
        const matchesStatus = filterValue === "all" ? true :
                              filterValue === "done" ? task.done : !task.done;
        return matchesSearch && matchesStatus;
    });

    taskList.innerHTML = "";
    getSorted(filtered).forEach(task => renderTask(task));
}

function getSorted(tasks) {
    const sorted = [...tasks]; // copy to avoid mutating original array
    const value = sortSelect.value;

    if (value === "priority") {
        const order = { high: 1, medium: 2, low: 3 };
        sorted.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (value === "deadline") {
        sorted.sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return a.deadline > b.deadline ? 1 : -1;
        });
    } else if (value === "date") {
        sorted.sort((a, b) => a.id - b.id);
    }

    return sorted;
}

function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const active = total - done;

    document.getElementById("statTotal").textContent = `Total: ${total}`;
    document.getElementById("statDone").textContent = `Done: ${done}`;
    document.getElementById("statActive").textContent = `Active: ${active}`;
}

searchInput.addEventListener("input", filterAndRender);
statusFilter.addEventListener("change", filterAndRender);
sortSelect.addEventListener("change", filterAndRender);