document.addEventListener("DOMContentLoaded", function () {
  var todoListEl = document.getElementById("todo-items");
  var calendarEl = document.getElementById("calendar");
  var sidebar = document.getElementById("event-sidebar");
  var currentEvent = null;

  function loadTodoList() {
    var todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.forEach(function (todo) {
      addTodoItem(todo.text, todo.subtasks);
    });
  }

  function saveTodoList() {
    var todos = Array.from(todoListEl.children).map(function (item) {
      var todoText = item.querySelector(".todo-text").textContent;
      var subtasks = Array.from(item.querySelectorAll(".subtask-item")).map(
        function (subtask) {
          return subtask.querySelector(".subtask-text").textContent;
        }
      );
      return { text: todoText, subtasks: subtasks };
    });
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  function addTodoItem(text, subtasks = []) {
    var todoItem = document.createElement("div");
    todoItem.className = "todo-item";

    var todoItemContent = document.createElement("div");
    todoItemContent.className = "todo-item-content";

    var dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';

    var todoText = document.createElement("span");
    todoText.className = "todo-text";
    todoText.textContent = text;

    var todoItemButtons = document.createElement("div");
    todoItemButtons.className = "todo-item-buttons";

    var editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = "編集";
    editBtn.onclick = function () {
      var newText = prompt("タスクを編集:", todoText.textContent);
      if (newText !== null) {
        todoText.textContent = newText;
        saveTodoList();
      }
    };

    var deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.title = "削除";
    deleteBtn.onclick = function () {
      todoListEl.removeChild(todoItem);
      saveTodoList();
    };

    var addSubtaskBtn = document.createElement("button");
    addSubtaskBtn.className = "add-subtask-btn";
    addSubtaskBtn.innerHTML = '<i class="fas fa-plus"></i>';
    addSubtaskBtn.title = "サブタスク追加";
    addSubtaskBtn.onclick = function () {
      var subtaskText = prompt("サブタスクを入力してください：");
      if (subtaskText) {
        addSubtask(subtaskList, subtaskText);
        saveTodoList();
      }
    };

    var addToCalendarBtn = document.createElement("button");
    addToCalendarBtn.className = "add-to-calendar-btn";
    addToCalendarBtn.innerHTML = '<i class="fas fa-calendar-plus"></i>';
    addToCalendarBtn.title = "カレンダーへ追加";
    addToCalendarBtn.onclick = function () {
      addEventToCalendar(text);
      todoListEl.removeChild(todoItem);
      saveTodoList();
    };

    todoItemButtons.appendChild(editBtn);
    todoItemButtons.appendChild(deleteBtn);
    todoItemButtons.appendChild(addSubtaskBtn);
    todoItemButtons.appendChild(addToCalendarBtn);

    todoItemContent.appendChild(dragHandle);
    todoItemContent.appendChild(todoText);
    todoItemContent.appendChild(todoItemButtons);

    todoItem.appendChild(todoItemContent);

    var subtaskList = document.createElement("div");
    subtaskList.className = "subtask-list";
    todoItem.appendChild(subtaskList);

    subtasks.forEach(function (subtask) {
      addSubtask(subtaskList, subtask);
    });

    todoListEl.appendChild(todoItem);

    new Sortable(subtaskList, {
      group: "subtasks",
      animation: 150,
      handle: ".drag-handle",
      onEnd: saveTodoList,
    });

    saveTodoList();
  }

  function addSubtask(parentList, text) {
    var subtaskItem = document.createElement("div");
    subtaskItem.className = "subtask-item";

    var subtaskItemContent = document.createElement("div");
    subtaskItemContent.className = "subtask-item-content";

    var dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';

    var subtaskText = document.createElement("span");
    subtaskText.className = "subtask-text";
    subtaskText.textContent = text;

    var subtaskItemButtons = document.createElement("div");
    subtaskItemButtons.className = "subtask-item-buttons";

    var editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = "編集";
    editBtn.onclick = function () {
      var newText = prompt("サブタスクを編集:", subtaskText.textContent);
      if (newText !== null) {
        subtaskText.textContent = newText;
        saveTodoList();
      }
    };

    var deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.title = "削除";
    deleteBtn.onclick = function () {
      parentList.removeChild(subtaskItem);
      saveTodoList();
    };

    var addToCalendarBtn = document.createElement("button");
    addToCalendarBtn.className = "add-to-calendar-btn";
    addToCalendarBtn.innerHTML = '<i class="fas fa-calendar-plus"></i>';
    addToCalendarBtn.title = "カレンダーへ追加";
    addToCalendarBtn.onclick = function () {
      addEventToCalendar(text);
      parentList.removeChild(subtaskItem);
      saveTodoList();
    };

    subtaskItemButtons.appendChild(editBtn);
    subtaskItemButtons.appendChild(deleteBtn);
    subtaskItemButtons.appendChild(addToCalendarBtn);

    subtaskItemContent.appendChild(dragHandle);
    subtaskItemContent.appendChild(subtaskText);
    subtaskItemContent.appendChild(subtaskItemButtons);

    subtaskItem.appendChild(subtaskItemContent);
    parentList.appendChild(subtaskItem);
  }

  new Sortable(todoListEl, {
    animation: 150,
    handle: ".drag-handle",
    onEnd: saveTodoList,
  });

  document
    .getElementById("todo-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        var todoText = this.value.trim();
        if (todoText) {
          addTodoItem(todoText);
          this.value = "";
          saveTodoList();
        }
      }
    });

  function loadCalendarEvents() {
    var events = JSON.parse(localStorage.getItem("calendarEvents")) || [];
    events.forEach(function (event) {
      calendar.addEvent(cleanEventData(event));
    });
  }

  function saveCalendarEvents() {
    var events = calendar.getEvents().map(function (event) {
      return cleanEventData(event.toPlainObject());
    });
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }

  function cleanEventData(eventData) {
    return {
      title: (eventData.title || "").trim(),
      start: eventData.start,
      end: eventData.end,
      description:
        (eventData.extendedProps && eventData.extendedProps.description) || "",
      backgroundColor: eventData.backgroundColor,
      borderColor: eventData.borderColor,
      allDay: eventData.allDay,
    };
  }

  function addEventToCalendar(title) {
    var event = {
      title: title,
      start: new Date(),
      allDay: true,
      backgroundColor: "#3788d8",
      borderColor: "#3788d8",
    };
    calendar.addEvent(event);
    saveCalendarEvents();
  }

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "100%",
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,timeGridWeek,timeGridDay",
    },
    editable: true,
    eventChange: function () {
      saveCalendarEvents();
    },
    dateClick: function (info) {
      var taskText = prompt("新しいタスクを入力してください：");
      if (taskText) {
        calendar.addEvent({
          title: taskText,
          start: info.date,
          allDay: true,
          backgroundColor: "#3788d8",
          borderColor: "#3788d8",
        });
        saveCalendarEvents();
      }
    },
    eventClick: function (info) {
      currentEvent = info.event;
      document.getElementById("event-title").value = currentEvent.title;
      document.getElementById("event-description").value =
        currentEvent.extendedProps.description || "";
      document.getElementById("event-start").value = currentEvent.start
        ? currentEvent.start.toISOString().slice(0, 16)
        : "";
      document.getElementById("event-end").value = currentEvent.end
        ? currentEvent.end.toISOString().slice(0, 16)
        : "";
      document.getElementById("event-color").value =
        currentEvent.backgroundColor;
      sidebar.style.display = "block";
    },
    eventDrop: function () {
      saveCalendarEvents();
    },
  });

  calendar.render();

  document.getElementById("save-event").addEventListener("click", function () {
    if (currentEvent) {
      currentEvent.remove();
    }
    var newEventData = cleanEventData({
      title: document.getElementById("event-title").value,
      start: document.getElementById("event-start").value,
      end: document.getElementById("event-end").value,
      extendedProps: {
        description: document.getElementById("event-description").value,
      },
      backgroundColor: document.getElementById("event-color").value,
      borderColor: document.getElementById("event-color").value,
    });
    calendar.addEvent(newEventData);
    saveCalendarEvents();
    sidebar.style.display = "none";
  });

  document
    .getElementById("delete-event")
    .addEventListener("click", function () {
      if (currentEvent) {
        currentEvent.remove();
        saveCalendarEvents();
      }
      sidebar.style.display = "none";
    });

  document
    .getElementById("return-to-todo")
    .addEventListener("click", function () {
      if (currentEvent) {
        addTodoItem(currentEvent.title);
        currentEvent.remove();
        saveCalendarEvents();
      }
      sidebar.style.display = "none";
    });

  loadTodoList();
  loadCalendarEvents();
});
