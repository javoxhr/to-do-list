let tasks = [];

// Анимация числа
function animateValue(element, target) {
    let current = parseInt(element.textContent) || 0;
    const duration = 500;
    const step = (target - current) / (duration / 16);

    const timer = setInterval(() => {
        current += step;
        if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
            clearInterval(timer);
            current = target;
        }
        element.textContent = `${Math.round(current)}% Completed`;
    }, 16);
}

// Загрузка задач
function loadTasks() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
        renderTasks();
    }
}

// Сохранение задач
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Добавление задачи
function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (text === '') return;

    tasks.unshift({
        text,
        isCompleted: false,
        subtasks: [],
        dateCreated: new Date().toLocaleDateString()
    });

    saveTasks();
    renderTasks();
    input.value = '';
}

// Переключение статуса задачи
function toggleTask(index) {
    tasks[index].isCompleted = !tasks[index].isCompleted;
    saveTasks();
    updateProgressAnimation(index);
}

// Добавление подзадачи
function addSubtask(taskIndex) {
    const subtaskInput = document.getElementById(`subtaskInput-${taskIndex}`);
    const subtaskText = subtaskInput.value.trim();
    if (subtaskText === '') return;

    tasks[taskIndex].subtasks.push({ text: subtaskText, done: false });
    saveTasks();
    updateProgressAnimation(taskIndex);
    
    // Добавляем подзадачу сразу в DOM
    const subtasksContainer = document.getElementById(`subtasks-${taskIndex}`);
    const subtaskHTML = `
        <div class="subtask">
            <input type="checkbox" onchange="toggleSubtask(${taskIndex}, ${tasks[taskIndex].subtasks.length - 1})">
            <span>${subtaskText}</span>
            <button class="edit-btn" onclick="editSubtask(${taskIndex}, ${tasks[taskIndex].subtasks.length - 1})">Edit</button>
            <button class="delete-btn" onclick="deleteSubtask(${taskIndex}, ${tasks[taskIndex].subtasks.length - 1})">Delete</button>
        </div>
    `;
    subtasksContainer.innerHTML += subtaskHTML;

    subtaskInput.value = '';
}

// Переключение подзадачи
function toggleSubtask(taskIndex, subIndex) {
    tasks[taskIndex].subtasks[subIndex].done = !tasks[taskIndex].subtasks[subIndex].done;
    saveTasks();
    updateProgressAnimation(taskIndex);
}

// Удаление задачи
function deleteTask(index) {
    if (window.confirm("Are you sure you want to delete this task?")) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
}

// Редактирование задачи
function editTask(index) {
    const newTaskText = prompt("Edit task text:", tasks[index].text);
    if (newTaskText !== null) {
        tasks[index].text = newTaskText.trim();
        saveTasks();
        updateProgressAnimation(index);
    }
}

// Удаление подзадачи
function deleteSubtask(taskIndex, subIndex) {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
        tasks[taskIndex].subtasks.splice(subIndex, 1);
        saveTasks();
        updateProgressAnimation(taskIndex);
        
        // Удаляем подзадачу сразу из DOM
        const subtasksContainer = document.getElementById(`subtasks-${taskIndex}`);
        subtasksContainer.removeChild(subtasksContainer.children[subIndex]);
    }
}

// Редактирование подзадачи
function editSubtask(taskIndex, subIndex) {
    const newSubtaskText = prompt("Edit subtask text:", tasks[taskIndex].subtasks[subIndex].text);
    if (newSubtaskText !== null) {
        tasks[taskIndex].subtasks[subIndex].text = newSubtaskText.trim();
        saveTasks();
        
        // Обновляем текст подзадачи в DOM
        const subtasksContainer = document.getElementById(`subtasks-${taskIndex}`);
        subtasksContainer.children[subIndex].querySelector('span').textContent = newSubtaskText;
    }
}

// Расчёт прогресса
function calculateProgress(subtasks) {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(s => s.done).length;
    return Math.round((completed / subtasks.length) * 100);
}

// Обновление анимации прогресса
function updateProgressAnimation(taskIndex) {
    const progressElement = document.getElementById(`progress-${taskIndex}`);
    const progressBar = document.querySelector(`li:nth-child(${taskIndex + 1}) .progress`);
    const newProgress = calculateProgress(tasks[taskIndex].subtasks);
    
    animateValue(progressElement, newProgress);
    progressBar.style.width = `${newProgress}%`;
}

// Рендеринг задач
function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasks.forEach((task, taskIndex) => {
        const progress = calculateProgress(task.subtasks);
        list.innerHTML += `
            <li>
                <div class="task-header" onclick="toggleTask(${taskIndex})">
                    <span>${task.text}</span>
                    <div class="task-top-btns">
                        <button class="edit-btn" onclick="event.stopPropagation(); editTask(${taskIndex})">Edit</button>
                        <button class="delete-btn" onclick="event.stopPropagation(); deleteTask(${taskIndex})">Delete</button>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <div class="subtasks" id="subtasks-${taskIndex}">
                    <div class="sub-inp-and-btn">
                        <input type="text" id="subtaskInput-${taskIndex}" placeholder="Enter subtask..." maxlength="20">
                        <button onclick="addSubtask(${taskIndex})">Add Subtask</button>
                    </div>
                    ${task.subtasks.map((sub, subIndex) => `
                        <div class="subtask">
                            <input type="checkbox" ${sub.done ? 'checked' : ''} 
                                   onchange="toggleSubtask(${taskIndex}, ${subIndex})">
                            <span style="text-decoration: ${sub.done ? 'line-through' : 'none'}; 
                                        color: ${sub.done ? 'gray' : 'black'}">
                                ${sub.text}
                            </span>
                            <button class="edit-btn" onclick="editSubtask(${taskIndex}, ${subIndex})">Edit</button>
                            <button class="delete-btn" onclick="deleteSubtask(${taskIndex}, ${subIndex})">Delete</button>
                        </div>
                    `).join('')}
                </div>
                <div class="task-footer">
                    <span class="task-date">Created on: ${task.dateCreated}</span>
                    <span class="task-progress" id="progress-${taskIndex}">${progress}% Completed</span>
                </div>
            </li>
        `;
    });
}

// Инициализация
loadTasks();
