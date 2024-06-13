(() => {
  const KEY_ENTER = 'Enter';
  const KEY_ESCAPE = 'Escape';
  const KEY_DBLCLICK = 2;
  const PAGE_SIZE = 5;

  const inputLine = document.querySelector('#input-line');
  const listContainer = document.querySelector('#list-container');
  const addTaskButton = document.querySelector('#add-task');
  const deleteCompleted = document.querySelector('.delete-completed');
  const checkAllButton = document.querySelector('#check-all-task');
  const allTasksButton = document.querySelector('#all');
  const activeTasksButton = document.querySelector('#active');
  const completedTasksButton = document.querySelector('#completed');
  const countersContainer = document.querySelector('.counters');
  const pagesContainer = document.querySelector('.page-numbers');

  let tasks = [];
  let filterType = 'all';
  let activePage = 1;

  const validatate = (text) => {
    text = text.replace(/\s+/g, ' ')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
    return text;
  };

  const counterTabulation = () => {
    allTasksButton.textContent = `All Tasks (${tasks.length})`;
    const activeTasksLength = tasks.filter((task) => !task.isReady).length;
    activeTasksButton.textContent = `Active (${activeTasksLength})`;
    completedTasksButton.textContent = `Completed (${tasks.length - activeTasksLength})`;
  };

  const filterTasks = () => {
    switch (filterType) {
      case ('active'): return tasks.filter((task) => !task.isReady);
      case ('completed'): return tasks.filter((task) => task.isReady);
      default: return tasks;
    }
  };

  const createPageButtons = (arrLength) => {
    const totalPages = Math.ceil(arrLength / PAGE_SIZE);
    if (activePage === 0 || activePage > totalPages) activePage = totalPages;
    let renderButton = '';
    for (let i = 1; i <= totalPages; i += 1) {
      renderButton += `<button class='page ${activePage === i ? 'active' : ''}'>${i}</button>`;
    }
    pagesContainer.innerHTML = renderButton;
  };

  const sliceTasksForPagination = (arr) => {
    const start = (activePage - 1) * PAGE_SIZE;
    const end = activePage * PAGE_SIZE;
    return arr.slice(start, end);
  };

  const checkAllButtonStatus = () => {
    checkAllButton.checked = tasks.length ? tasks.every((task) => task.isReady) : false;
  };

  const renderTask = () => {
    let filteredTasks = filterTasks();
    createPageButtons(filteredTasks.length);
    filteredTasks = sliceTasksForPagination(filteredTasks);
    let listRenderedTask = '';
    filteredTasks.forEach((task) => {
      listRenderedTask += `
    <li class="task-item" id="${task.id}">
      <input type="checkbox" class="checkbox" ${task.isReady ? 'checked' : ''}>
      <p class="text-task">${task.text}</p>
      <input value="${task.text}" class="editing" placeholder="Need to write something" hidden maxlength="254">
      <button id="remove-task">X</button>
    </li>`;
    });
    listContainer.innerHTML = listRenderedTask;
    checkAllButtonStatus();
    counterTabulation();
  };

  const showPage = (event) => {
    if (event.target.type === 'submit') {
      activePage = Number(event.target.innerHTML);
    }
    renderTask();
  };

  const changeFilterType = (event) => {
    filterType = event.target.value;
    activePage = 1;
    event.target.selected = true;
    renderTask();
  };

  const addTask = () => {
    if (inputLine.value === '' || inputLine.value.trim() === '') return;
    const task = {
      id: Date.now(),
      isReady: false,
      text: validatate(inputLine.value),
    };
    tasks.push(task);
    filterType = 'active';
    activeTasksButton.selected = true;
    activePage = Math.ceil(tasks.length / PAGE_SIZE);
    inputLine.value = '';
    renderTask();
  };

  const addTaskByEnter = (event) => {
    if (event.key === KEY_ENTER) addTask();
  };

  const deleteTask = (id) => {
    tasks = tasks.filter((task) => task.id !== id);
    renderTask();
  };

  const checkTask = (id) => {
    tasks.forEach((task) => {
      if (task.id === id) task.isReady = !task.isReady;
    });
    renderTask();
  };

  const checkAllTask = (event) => {
    tasks.forEach((task) => {
      task.isReady = event.target.checked;
    });
    renderTask();
  };

  const deleteCompletedTasks = () => {
    tasks.forEach((task) => {
      if (task.isReady) deleteTask(task.id);
    });
  };

  const editText = (event) => {
    const hiddenInput = event.target.nextElementSibling;
    event.target.hidden = true;
    hiddenInput.hidden = false;
    hiddenInput.focus();
    hiddenInput.selectionStart = hiddenInput.value.length;
  };

  const changeEvent = (event) => {
    const currentTaskId = Number(event.target.parentNode.id);
    if (event.target.type === 'checkbox') checkTask(currentTaskId);
    if (event.target.type === 'submit') deleteTask(currentTaskId);
    if (event.detail === KEY_DBLCLICK && event.target.classList.contains('text-task')) {
      const currentTask = tasks.find((task) => currentTaskId === task.id);
      if (!currentTask.isReady) editText(event);
    }
  };

  const saveCurrentText = (event) => {
    if (event.target.value.trim().length === 0) return;
    tasks.forEach((task) => {
      if (task.id === Number(event.target.parentNode.id)) {
        task.text = validatate(event.target.value);
        renderTask();
      }
    });
  };

  const saveTextHandler = (event) => {
    if (event.key === KEY_ENTER) {
      saveCurrentText(event);
    } else if (event.key === KEY_ESCAPE) {
      event.target.value = '';
      renderTask();
    }
  };

  const saveTextByBlur = (event) => {
    if (event.type === 'blur' && event.target.classList.contains('editing')) {
      saveCurrentText(event);
    }
  };

  countersContainer.addEventListener('change', changeFilterType);
  listContainer.addEventListener('blur', saveTextByBlur, true);
  listContainer.addEventListener('keydown', saveTextHandler);
  deleteCompleted.addEventListener('click', deleteCompletedTasks);
  listContainer.addEventListener('click', changeEvent);
  addTaskButton.addEventListener('click', addTask);
  inputLine.addEventListener('keypress', addTaskByEnter);
  checkAllButton.addEventListener('click', checkAllTask);
  pagesContainer.addEventListener('click', showPage);
})();
