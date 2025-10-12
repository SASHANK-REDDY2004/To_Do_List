const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const reminderInput = document.getElementById('reminder-input');
const todoList = document.getElementById('todo-list');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Set min to now for reminder-input so you can only select present or future
function setReminderInputMin() {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const local = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    reminderInput.min = local;
}

// Call this on page load and every time the form is reset
window.addEventListener('DOMContentLoaded', setReminderInputMin);
todoForm.addEventListener('reset', setReminderInputMin);

function setReminderTimeout(todo, idx) {
    if (!todo.reminder || todo.reminded || todo.completed) return;
    const reminderTime = new Date(todo.reminder).getTime();
    const now = Date.now();
    if (reminderTime > now) {
        setTimeout(() => {
            alert(`⏰ Reminder: ${todo.text}`);
            todos[idx].reminded = true;
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos();
        }, reminderTime - now);
    }
}

function checkReminders() {
    todos.forEach((todo, idx) => {
        setReminderTimeout(todo, idx);
    });
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, idx) => {
        const li = document.createElement('li');
        if (todo.completed) li.classList.add('completed');

        // Checkbox for completion
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
            todos[idx].completed = checkbox.checked;
            if (checkbox.checked) todos[idx].reminded = true; // Disable reminder if completed
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodos();
        });

        // Task text
        const span = document.createElement('span');
        span.textContent = todo.text;

        // Reminder display
        if (todo.reminder) {
            const reminderSpan = document.createElement('span');
            reminderSpan.className = 'reminder-time';
            const reminderDate = new Date(todo.reminder);
            reminderSpan.innerHTML = `⏰ ${reminderDate.toLocaleString()}`;
            li.appendChild(reminderSpan);
        }

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit';
        editBtn.className = 'action-btn edit';
        editBtn.onclick = () => editTodo(idx);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete';
        deleteBtn.className = 'action-btn delete';
        deleteBtn.onclick = () => deleteTodo(idx, li);

        // Append elements
        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        todoList.appendChild(li);
    });
}

function deleteTodo(idx, liElement) {
    // Animate before deleting
    liElement.classList.add('removing');
    setTimeout(() => {
        todos.splice(idx, 1);
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }, 230); // match CSS transition
}

function editTodo(idx) {
    const current = todos[idx];
    const newText = prompt('Edit task:', current.text);
    if (newText === null) return; // Cancelled
    setReminderInputMin();
    const newReminder = prompt(
        'Edit reminder (YYYY-MM-DDTHH:MM, leave blank to keep current, or clear to remove):',
        current.reminder ? current.reminder.slice(0, 16) : ''
    );
    if (newText.trim() !== '') {
        todos[idx].text = newText.trim();
        if (newReminder !== null) {
            if (newReminder.trim() === '') {
                todos[idx].reminder = null;
                todos[idx].reminded = false;
            } else {
                const selected = new Date(newReminder);
                const now = new Date();
                if (selected < now) {
                    alert("You can't set a reminder in the past!");
                } else {
                    todos[idx].reminder = selected.toISOString();
                    todos[idx].reminded = false;
                }
            }
        }
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
        checkReminders();
    }
}

todoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    setReminderInputMin();
    const text = todoInput.value.trim();
    const reminder = reminderInput.value ? new Date(reminderInput.value).toISOString() : null;
    if (text) {
        if (reminder) {
            const selected = new Date(reminderInput.value);
            const now = new Date();
            if (selected < now) {
                alert("You can't set a reminder in the past!");
                return;
            }
        }
        todos.push({ text, completed: false, reminder, reminded: false });
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
        checkReminders();
        todoInput.value = '';
        reminderInput.value = '';
        setReminderInputMin();
        // Animate last added
        setTimeout(() => {
            const lastLi = todoList.lastElementChild;
            if (lastLi) {
                lastLi.style.boxShadow = "0 0 0 4px #a7f3d0";
                lastLi.style.transform = "scale(1.04)";
                setTimeout(() => {
                    lastLi.style.boxShadow = "";
                    lastLi.style.transform = "";
                }, 350);
            }
        }, 20);
    }
});

// Initial render and check for reminders
renderTodos();
checkReminders();