let tasks = [];
const themeSwitcherBtn = document.querySelector('.header__icon');
const form = document.querySelector('.form');
const formInput = document.querySelector('.task__form');
const tasksList = document.querySelector('.tasks__list');
const tasksCount = document.querySelector('.items__count');
const viewsOptions = document.querySelectorAll('.states');
const clearCompletedBtn = document.querySelector('.clear__completed');

themeSwitcherBtn.addEventListener('click', switchTheme);
form.addEventListener('submit', addTask);
clearCompletedBtn.addEventListener('click', clearCompleted);
viewsOptions.forEach(view => view.addEventListener('click', updateView));
if (window.matchMedia("(prefers-color-scheme:dark)").matches) {
    document.body.className = 'dark-theme';
}
if (localStorage.getItem('tasks')) {
    tasks = JSON.parse(localStorage.getItem('tasks'));
    reCreateDOM();
}

class Task {
    constructor(id, task, completed=false) {
        this.id = id;
        this.task = task;
        this.completed = completed;
    }
}

function switchTheme() {
    document.body.className = (document.body.className === 'light-theme') ? 'dark-theme' : 'light-theme';
}

function addTask(e) {
    e.preventDefault();
    if (!formInput.value) return;
    const task = new Task(tasks.length, formInput.value);
    tasks.push(task);
    updateLocalStorage();
    addTaskToDOM(task);
    form.reset();
    tasksCount.innerText = +tasksCount.innerText + 1;
}

function addTaskToDOM(task) {
    const taskItem = document.createElement('li');
    const taskText = document.createTextNode(task.task);
    const taskCheckbox = document.createElement('input');
    const taskCrossImg = document.createElement('img');
    taskItem.setAttribute('data-id', task.id);
    taskItem.className = 'task__item';
    taskItem.draggable = true;
    taskItem.addEventListener('dragstart', dragStart);
    taskItem.addEventListener('dragend', dragEnd);
    taskCheckbox.type = 'checkbox';
    taskCheckbox.className = 'tasks__checkbox';
    taskCheckbox.addEventListener('click', toggleTaskCompletion);
    if (task.completed) {
        taskItem.classList.add('task__item--completed');
        taskCheckbox.checked = true;
    }
    taskCrossImg.src = 'assets/imgs/icon-cross.svg';
    taskCrossImg.className = 'task__cross';
    taskCrossImg.addEventListener('click', removeTask);
    taskItem.appendChild(taskCheckbox);
    taskItem.append(taskText);
    taskItem.appendChild(taskCrossImg);
    tasksList.appendChild(taskItem);
}
function toggleTaskCompletion(e) {
    const taskItem = e.target.parentElement;
    const taskIndex = parseInt(taskItem.getAttribute('data-id'));
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    updateLocalStorage();
    taskItem.classList.toggle('task__item--completed');
    if (tasks[taskIndex].completed) {
        tasksCount.innerText = +tasksCount.innerText - 1;
    } else {
        tasksCount.innerText = +tasksCount.innerText + 1;
    }

}
function removeTask(e) {
    const taskItem = e.target.parentElement;
    const taskIndex = taskItem.getAttribute('data-id');
    tasks.splice(taskIndex, 1);
    updateLocalStorage();
    reCreateDOM();
}
function updateId() {
    let remainingTasks = 0;
    for (let task of tasks) {
        task.id = tasks.indexOf(task);
        if (!task.completed) remainingTasks++;
    }
    tasksCount.innerText = remainingTasks;
}

function reCreateDOM(update=true) {
    if (update) updateId();
    const selectedView = document.querySelector('.active__state').innerText;
    let taskList = tasks;
    if (selectedView === 'Active') {
        taskList = tasks.filter(task => !task.completed);
    } else if (selectedView === 'Completed') {
        taskList = tasks.filter(task => task.completed);
    }
    while (tasksList.firstChild) {
        tasksList.firstChild.remove();
    }
    for (let task of taskList) {
        addTaskToDOM(task);
    }

}
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    updateLocalStorage();
    reCreateDOM();
}

function updateView(e) {
    const selectedView = e.target;
    viewsOptions.forEach(view => view.classList.remove('active__state'));
    selectedView.classList.add('active__state');
    reCreateDOM(false);
}

function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Drag and Drop Functionality
tasksList.addEventListener('dragover', dragHandler);
function dragStart(e) {
    e.target.classList.add('dragging');
}
function dragEnd(e) {
    const nextItem = document.querySelector('.dragging + .task__item');
    const currentItem = e.target;
    e.target.classList.remove('dragging');
    // Updating tasks order
    currentItemIndex = currentItem.getAttribute('data-id');
    nextItemIndex = (nextItem) ? nextItem.getAttribute('data-id') : tasks.length;
    [ currentItemTask ] = tasks.splice(currentItemIndex, 1);
    tasks.splice(nextItemIndex - 1, 0, currentItemTask);
    reCreateDOM();
    updateLocalStorage();
}
function dragHandler(e) {
    e.preventDefault();
    const afterElement = getDragAfterElement(tasksList, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
        tasksList.appendChild(draggable);
    } else {
        tasksList.insertBefore(draggable, afterElement);
    }
}
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task__item:not(.dragging)')]
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}