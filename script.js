'use strict';

 // Строгий режим, устранение тихих ошибок
let print = console.log; // Сокращение для удобства

const form = document.getElementById("taskForm"); // Получить элемент формы по айди

// Находим элементы из html по их id
const titleInput = document.getElementById("taskTitle");
const subjectSelect = document.getElementById("taskSubject");
const prioritySelect = document.getElementById("taskPriority");
const deadLineInput = document.getElementById("taskDeadline");
const taskList = document.getElementById("taskList");


form.addEventListener('submit', (event) => { // Слушай событие,  submit - когда форму отправляет 
    event.preventDefault(); // Отменяет стандартное поведение браузера(перезагрузка, отправка);
    
    // Читаем значения из input и select
    const title = titleInput.value.trim(); // Убрать пробелы у названия
    const subject = subjectSelect.value;
    const priority = prioritySelect.value;
    const deadline = deadLineInput.value;

    if (!title) return; // Если название пусто то не добавляем задачу

    // Создаем объект задачи
    const task = {
        id: Date.now(), // id нужен чтобы уникально отличать задачи
        title,
        subject,
        priority,
        deadline,
        done: false // Новая задача активная
    };

    tasks.push(task); // Добавить задачу в массив
    saveTasks(tasks); // Сохранить в localStorage
    renderTask(task); // Отрисовать на странице

    // Очистка формы
    titleInput.value = ""; // Очищаем input после нажатия
    subjectSelect.value = ""; // Сбрасываем выбор до Choose one...
    prioritySelect.value = "";
    deadLineInput.value = "";

});



// localStorage - встроенное хранилище в браузере, куда сайт сохраняет небольшие данные у тебя на компьютере, это хранилище имеет методы
const STORAGE_KEY = "studyTrackerTasks";// Имя ящика в localStorage, под этим ключом храниться JSON с всеми задачами

// tasks - массив объектов задач
function saveTasks(tasks) {
    const json = JSON.stringify(tasks); // JSON.stringify - Превращаем массив в строку
    localStorage.setItem(STORAGE_KEY, json); // Сохраняем эту строку по ключу STORAGE_KEY в localStorage, после перезагрузки задачи не пропадут
}


function loadTasks() {
    const json = localStorage.getItem(STORAGE_KEY);// Читает строку из localStorage
    if (json === null) return [];// если там пусто то вернет пустой массив
    return JSON.parse(json); // Превращаем строку обратно в массив объектов
}

// tasks - главный массив в памяти
let tasks = loadTasks(); // Загружаем задачи при запуске скрипта
for (const task of tasks) {
  renderTask(task); // Цикл вызывает renderTask для каждой сохраненной задачи чтобы отрисовать список
}

function renderTask(task) {
    const li = document.createElement("li"); // Создаем элемент li
    li.dataset.id = String(task.id); // dataset.id кладёт data-id="..." в HTML, удобно для будущих фильтров/изменения чтобы быстро понять какая задача
    if (task.deadline) {
        const today = new Date().toISOString().slice(0, 10);
        if (task.deadline < today) {
            li.classList.add("overdue");
        }
    }


    // Вставляем внутрь li:
    // span с текстом
    // две кнопки, важно type = button а не submit чтобы кнопки не пытались отправить форму
    li.innerHTML = `
    <span class="taskText">${task.title} | ${task.subject} | <span class="priority-${task.priority}">${task.priority}</span> | ${task.deadline || "no deadline"}</span>
    <button type="button" class="doneBtn">Done</button>
    <button type="button" class="delete-btn">Delete</button> 
    `;

    if (task.done) li.classList.add("done"); // Если задача была сохранена как выполненная то добавляем класс done в этот li, который в CSS зачеркнет задачу

    // Обработчики кнопок
    const deleteBtn = li.querySelector(".delete-btn");// Ищем кнопку delete внутри конкретного li
    deleteBtn.addEventListener("click", () => {
        li.remove();// При нажатии удаляем именно этот пункт
        tasks = tasks.filter(t => t.id !== task.id); // Удаляем объект задачи из массива tasks
        saveTasks(tasks); // Сохранить обновленный массив с задачами
        updateStats();
    }); // Польза: удаляем навсегда, даже после перезагрузки

    const doneBtn = li.querySelector(".doneBtn");
    doneBtn.addEventListener("click", () => {
        task.done = !task.done; // Переключаем состояние done в объекте задачи
        li.classList.toggle("done"); // если класса done нет → добавит, если есть → уберёт, classList - список классов элемента, влияет на CSS
        saveTasks(tasks) // Сохраняем обновленный tasks
        updateStats();
    }); // Тоже сохраняется после обновления страницы

    taskList.appendChild(li); // Добавляем элемент в список
};


let searchInput = document.getElementById("searchInput");
let statusFilter = document.getElementById("statusFilter");

searchInput.addEventListener("input", filterAndRender); // При вводе символов срабатывает функция
statusFilter.addEventListener("change", filterAndRender); // При выборе одного варианта из selection срабатывает функция

// Фукнция поиска
function filterAndRender() {
    const searchText = searchInput.value.toLowerCase();
    const filterValue = statusFilter.value;

    const filtered = tasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchText);
        const matchesStatus = filterValue === "all" ? true : filterValue === "done" ? task.done : !task.done; 

        return matchesSearch && matchesStatus;
    });

    const sorted = getSorted(filtered);

    taskList.innerHTML = "";
    sorted.forEach(task => renderTask(task));
}


function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const active = total - done;

    document.getElementById("statTotal").textContent = `Всего: ${total}`
    document.getElementById("statDone").textContent = `Выполнено: ${done}`;
    document.getElementById("statActive").textContent = `Осталось: ${active}`;

}

updateStats();


const sortSelect = document.getElementById("sortSelect");
sortSelect.addEventListener("change", filterAndRender)

function getSorted(tasks) {
    const value = sortSelect.value;
    const sorted = [...tasks];
    
    if (value === "priority") { 
        const order = {high: 1, medium: 2, low: 3};
        sorted.sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (value === "deadline") {
        sorted.sort((a, b) => {
            if (!a.deadline) return 1;
            if (!b.deadline) return -1;
            return a.deadline > b.deadline ? 1 : -1;
        })
    } else if (value === "date") {
        sorted.sort((a, b) => a.id - b.id) 
    }
    return sorted;
}




