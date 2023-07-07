'use strict';
const addBtn = document.querySelector('.add__btn');
const todoInput = document.querySelector('.todo__input');
const savebtn = document.querySelector('.save__btn');
const delAll = document.querySelector('.del__all');
const taskContainer = document.querySelector('.todo__list');
const priorityIn = document.querySelector('.pri');
const sortBtn = document.querySelector('.sort__btn');
const calender = document.querySelector('.calender');
const taskType = document.querySelector('.task-type');

let priEle;

let sorted = false;

let allTasks;

class Task {
  id = (Date.now() + '').slice(-10);
  color;
  type = 'pending';
  constructor(priority, taskInfo, date) {
    this.priority = priority;
    this.taskInfo = taskInfo;
    this.date = date;
  }
}

class App {
  #tasks = [];
  taskEle;
  constructor() {
    // Get tasks from local storage if any
    this._getLocalStorage();

    addBtn.addEventListener('click', this._addTask.bind(this));
    savebtn.addEventListener('click', this._saveTask.bind(this));
    taskContainer.addEventListener('click', this._findAction.bind(this));
    delAll.addEventListener('click', this._delAll.bind(this));
    sortBtn.addEventListener('click', this._sortTasks.bind(this));
    taskType.addEventListener('change', () => {
      this._renderTask();
    });
  }

  _addTask() {
    // Check for valid Inputs
    if (!this._validInputs()) return;

    // Get Inputs
    const priority = priorityIn.value;
    const taskInfo = todoInput.value;
    const date = new Date(calender.value);

    // Create new Task
    let newTask = new Task(priority, taskInfo, date);

    // Push in tasks array
    this.#tasks.push(newTask);

    // Render tasks
    this._renderTask();

    // Clear input fields
    this._clearInputs();
  }

  _editTask() {
    todoInput.value = this.taskEle.taskInfo;
    priorityIn.value = this.taskEle.priority;
    calender.value = new Date(this.taskEle.date).toISOString().split('T')[0];
    addBtn.classList.add('hidden');
    savebtn.classList.remove('hidden');
  }

  _saveTask() {
    // Check for valid Inputs
    if (!this._validInputs()) return;

    // Get Inputs
    const priority = priorityIn.value;
    const taskInfo = todoInput.value;
    const date = new Date(calender.value);

    this.taskEle.priority = priority;
    this.taskEle.taskInfo = taskInfo;
    this.taskEle.date = date;

    // Clear input fields
    this._clearInputs();

    // Render tasks
    this._renderTask();

    addBtn.classList.remove('hidden');
    savebtn.classList.add('hidden');
  }

  _validInputs() {
    if (todoInput.value.length == 0) {
      alert('Enter something to do');
      return false;
    }
    if (priorityIn.value == '' || priorityIn.value < 0) {
      alert('Select Priority');
      return false;
    }
    if (
      (new Date(calender.value) - new Date()) / (1000 * 60 * 60 * 24) < -1 ||
      !calender.value
    ) {
      alert('Please set a valid due date');
      return false;
    }
    return true;
  }

  _clearInputs() {
    todoInput.value = '';
    priorityIn.value = -200;
    calender.value = '';
  }

  _renderTask() {
    // Empty Task Container
    taskContainer.innerHTML = '';

    let tasksv1;

    // If there are no tasks ...return
    if (this.#tasks.length == 0) return;

    // Filter Tasks by type
    if (taskType.value === 'pending') {
      tasksv1 = this.#tasks.slice().filter(task => task.type === 'pending');
    } else if (taskType.value === 'completed') {
      tasksv1 = this.#tasks.slice().filter(task => task.type === 'completed');
    } else {
      tasksv1 = this.#tasks.slice();
    }

    // Sort tasks by priority if selected
    const tasksv2 = sorted
      ? tasksv1.slice().sort((a, b) => b.priority - a.priority)
      : tasksv1;

    tasksv2.forEach(task => {
      const days = this._returnDays(task.date);
      if (task.priority == 3) task.color = 'red';
      if (task.priority == 2) task.color = 'blue';
      if (task.priority == 1) task.color = 'lightgreen';
      let type, style;
      if (task.type === 'pending') {
        type = `fa-regular fa-circle`;
        style = '';
      } else if (task.type === 'completed') {
        type = `fa-solid fa-circle-check`;
        style = `line-through`;
      }
      const html = `
        <div class="task" data-id="${task.id}">
            <div class="task__info">
            <button class="check_btn" data-title="Mark/UnMark"><i class="${type}"></i></button>
            <span class="work" data-title="Task Info" style="text-decoration:${style}">${task.taskInfo}</span>
            </div>
            <button class="pri_btn" data-title="Priority:${task.priority}" style="color: ${task.color}"><i class="fa-solid fa-circle"></i></button>
            <span class="due_date" data-title="Due">${days}</span>
            <button class="edit__task" data-title="Edit">
                <i class="fa-solid fa-pen-to-square"></i>
                </button>
            <button class="del__task" data-title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
            `;
      taskContainer.insertAdjacentHTML('beforeend', html);

      this._setLocalStorage();
    });
  }

  _returnDays(date) {
    // Return due days/date
    const days = (new Date(date) - Date.now()) / (1000 * 60 * 60 * 24);

    if (days < 1 && days >= -1) {
      return 'Today';
    }
    if (days < 2) {
      return 'Tomorrow';
    }
    if (days <= 7) {
      return `${Math.round(days)} days left`;
    }
    return new Intl.DateTimeFormat('en-Us', {
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  }

  _sortTasks() {
    sorted = !sorted;
    this._renderTask();
  }

  _findAction(e) {
    // Choose if action is edit/delete/Mark as complete
    const edit = e.target.closest('.edit__task');
    const del = e.target.closest('.del__task');
    const checked = e.target.closest('.check_btn');

    // If no action return
    if (!edit && !del && !checked) return;

    // Select the task Element selected
    const taskEd = e.target.closest('.task');
    this.taskEle = this.#tasks.find(task => task.id == taskEd.dataset.id);

    if (edit) {
      this._editTask();
    }

    if (del) {
      this._delTask();
    }

    if (checked) {
      this._markTask();
    }
  }

  _markTask() {
    // Change type of the task when Marked/Unmarked
    if (this.taskEle.type === 'pending') {
      this.taskEle.type = 'completed';
    } else if (this.taskEle.type === 'completed') {
      this.taskEle.type = 'pending';
    }
    this._renderTask();
  }

  _delTask() {
    // console.log(this.#tasks);
    this.#tasks = this.#tasks.filter(task => task != this.taskEle);
    console.log(this.#tasks);
    localStorage.setItem('tasks', JSON.stringify(this.#tasks));
    this._renderTask();
  }

  _delAll() {
    taskContainer.innerHTML = '';
    this.#tasks = [];
    this._setLocalStorage();
  }

  _setLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.#tasks));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('tasks'));

    if (!data) return;

    this.#tasks = data;

    this._renderTask();
  }
}

const app = new App();
