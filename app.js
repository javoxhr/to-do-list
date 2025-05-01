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
    renderSubtasks(taskIndex);
    updateProgressAnimation(taskIndex);
    subtaskInput.value = '';
}

// Переключение подзадачи
function toggleSubtask(taskIndex, subIndex) {
    tasks[taskIndex].subtasks[subIndex].done = !tasks[taskIndex].subtasks[subIndex].done;
    saveTasks();
    updateProgressAnimation(taskIndex);
    renderSubtasks(taskIndex);
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
        renderTasks();
    }
}

// Удаление подзадачи
function deleteSubtask(taskIndex, subIndex) {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
        tasks[taskIndex].subtasks.splice(subIndex, 1);
        saveTasks();
        renderSubtasks(taskIndex);
        updateProgressAnimation(taskIndex);
    }
}

// Редактирование подзадачи
function editSubtask(taskIndex, subIndex) {
    const newSubtaskText = prompt("Edit subtask text:", tasks[taskIndex].subtasks[subIndex].text);
    if (newSubtaskText !== null) {
        tasks[taskIndex].subtasks[subIndex].text = newSubtaskText.trim();
        saveTasks();
        renderSubtasks(taskIndex);
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

// Рендеринг подзадач для конкретной задачи
function renderSubtasks(taskIndex) {
    const subtasksContainer = document.getElementById(`subtasks-${taskIndex}`);
    if (!subtasksContainer) return;
    
    const subtaskInputHTML = subtasksContainer.querySelector('.sub-inp-and-btn').outerHTML;
    subtasksContainer.innerHTML = subtaskInputHTML;
    
    tasks[taskIndex].subtasks.forEach((sub, subIndex) => {
        subtasksContainer.innerHTML += `
            <div class="subtask" data-task-index="${taskIndex}" data-sub-index="${subIndex}">
                <input type="checkbox" ${sub.done ? 'checked' : ''}>
                <span style="text-decoration: ${sub.done ? 'line-through' : 'none'}; 
                            color: ${sub.done ? 'gray' : 'black'}">
                    ${sub.text}
                </span>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
    });
}

// Рендеринг задач
function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasks.forEach((task, taskIndex) => {
        const progress = calculateProgress(task.subtasks);
        list.innerHTML += `
            <li>
                <div class="task-header" data-task-index="${taskIndex}">
                    <span>${task.text}</span>
                    <div class="task-top-btns">
                        <button class="edit-btn" data-task-index="${taskIndex}">Edit</button>
                        <button class="delete-btn" data-task-index="${taskIndex}">Delete</button>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <div class="subtasks" id="subtasks-${taskIndex}">
                    <div class="sub-inp-and-btn">
                        <input type="text" id="subtaskInput-${taskIndex}" placeholder="Enter subtask..." maxlength="20">
                        <button data-task-index="${taskIndex}">Add Subtask</button>
                    </div>
                </div>
                <div class="task-footer">
                    <span class="task-date">Created on: ${task.dateCreated}</span>
                    <span class="task-progress" id="progress-${taskIndex}">${progress}% Completed</span>
                </div>
            </li>
        `;
        
        // Рендерим подзадачи для этой задачи
        renderSubtasks(taskIndex);
    });
}

// Делегирование событий
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    
    document.getElementById('taskList').addEventListener('click', (e) => {
        const target = e.target;
        
        // Обработка клика по заголовку задачи
        if (target.closest('.task-header')) {
            const taskIndex = parseInt(target.closest('[data-task-index]').dataset.taskIndex);
            toggleTask(taskIndex);
            return;
        }
        
        // Обработка кнопок задач
        if (target.classList.contains('edit-btn') && target.dataset.taskIndex) {
            const taskIndex = parseInt(target.dataset.taskIndex);
            editTask(taskIndex);
            return;
        }
        
        if (target.classList.contains('delete-btn') && target.dataset.taskIndex) {
            const taskIndex = parseInt(target.dataset.taskIndex);
            deleteTask(taskIndex);
            return;
        }
        
        // Обработка добавления подзадачи
        if (target.tagName === 'BUTTON' && target.dataset.taskIndex && !target.classList.contains('edit-btn') && !target.classList.contains('delete-btn')) {
            const taskIndex = parseInt(target.dataset.taskIndex);
            addSubtask(taskIndex);
            return;
        }
        
        // Обработка подзадач
        const subtaskElement = target.closest('.subtask');
        if (subtaskElement) {
            const taskIndex = parseInt(subtaskElement.dataset.taskIndex);
            const subIndex = parseInt(subtaskElement.dataset.subIndex);
            
            if (target.tagName === 'INPUT' && target.type === 'checkbox') {
                toggleSubtask(taskIndex, subIndex);
            } else if (target.classList.contains('edit-btn')) {
                editSubtask(taskIndex, subIndex);
            } else if (target.classList.contains('delete-btn')) {
                deleteSubtask(taskIndex, subIndex);
            }
        }
    });
});