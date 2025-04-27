let tasks = [];

// Load tasks from localStorage when the page loads
function loadTasks() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
        renderTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add a new task
function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    if (text === '') return;

    const dateCreated = new Date().toLocaleDateString();

    // Add task to the beginning of the array
    tasks.unshift({
        text,
        isCompleted: false,
        subtasks: [],
        dateCreated
    });

    saveTasks();
    renderTasks();
    input.value = '';
}

// Toggle task completion
function toggleTask(index) {
    tasks[index].isCompleted = !tasks[index].isCompleted;
    saveTasks();
    renderTasks();
}

// Add a subtask to a task
function addSubtask(taskIndex) {
    const subtaskInput = document.getElementById(`subtaskInput-${taskIndex}`);
    const subtaskText = subtaskInput.value.trim();
    if (subtaskText === '') return;

    tasks[taskIndex].subtasks.push({ text: subtaskText, done: false });
    saveTasks();
    renderTasks();
    subtaskInput.value = '';
}

// Toggle subtask completion
function toggleSubtask(taskIndex, subIndex) {
    tasks[taskIndex].subtasks[subIndex].done = !tasks[taskIndex].subtasks[subIndex].done;
    saveTasks();
    renderTasks();
}

// Delete a task with confirmation
function deleteTask(index) {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (confirmDelete) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }
}

// Edit a task
function editTask(index) {
    const newTaskText = prompt("Edit task text:", tasks[index].text);
    if (newTaskText !== null) {
        tasks[index].text = newTaskText.trim();
        saveTasks();
        renderTasks();
    }
}

// Delete a subtask with confirmation
function deleteSubtask(taskIndex, subIndex) {
    const confirmDelete = window.confirm("Are you sure you want to delete this subtask?");
    if (confirmDelete) {
        tasks[taskIndex].subtasks.splice(subIndex, 1);
        saveTasks();
        renderTasks();
    }
}

// Edit a subtask
function editSubtask(taskIndex, subIndex) {
    const newSubtaskText = prompt("Edit subtask text:", tasks[taskIndex].subtasks[subIndex].text);
    if (newSubtaskText !== null) {
        tasks[taskIndex].subtasks[subIndex].text = newSubtaskText.trim();
        saveTasks();
        renderTasks();
    }
}

// Calculate the progress of a task based on its subtasks
function calculateProgress(subtasks) {
    if (subtasks.length === 0) return 0;
    const completed = subtasks.filter(s => s.done).length;
    return Math.round((completed / subtasks.length) * 100);
}

// Render all tasks and subtasks using innerHTML
function renderTasks() {
    const list = document.getElementById('taskList');
    list.innerHTML = '';

    tasks.forEach((task, taskIndex) => {
        const taskHTML = `
  <li>
    <div class="task-header" onclick="toggleTask(${taskIndex})">
      <span>${task.text}</span>
      <div class="task-top-btns">
        <button class="edit-btn" onclick="event.stopPropagation(); editTask(${taskIndex})">Edit</button>
         <button class="delete-btn" onclick="event.stopPropagation(); deleteTask(${taskIndex})">Delete</button>  
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress" style="width: ${calculateProgress(task.subtasks)}%"></div>
    </div>
    <div class="subtasks">
        <div class="sub-inp-and-btn">
            <input type="text" id="subtaskInput-${taskIndex}" placeholder="Enter subtask..." maxlength="20">
           <button onclick="addSubtask(${taskIndex})">Add Subtask</button>
        </div>
      ${task.subtasks.map((sub, subIndex) => `
        <div class="subtask">
          <input type="checkbox" ${sub.done ? 'checked' : ''} onchange="toggleSubtask(${taskIndex}, ${subIndex})">
          <span style="text-decoration: ${sub.done ? 'line-through' : 'none'}; color: ${sub.done ? 'gray' : 'black'}">${sub.text}</span>
          <button class="edit-btn" onclick="editSubtask(${taskIndex}, ${subIndex})">Edit</button>
          <button class="delete-btn" onclick="deleteSubtask(${taskIndex}, ${subIndex})">Delete</button>
        </div>
      `).join('')}
    </div>
    <div class="task-footer">
      <span class="task-date">Created on: ${task.dateCreated}</span>
      <span class="task-progress">${calculateProgress(task.subtasks)}% Completed</span>
    </div>
  </li>
`;
        list.innerHTML += taskHTML;
    });
}

// Load tasks from localStorage when the page is loaded
loadTasks();