const taskSection = document.getElementById("taskSection");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let editingId = null;
let currentQuery = "";
let currentFilter = "all";

let tasks = [
      
    ];

    function appendTask(title, dueDate, id, isCompleted, description){
        const node = document.createElement("div");
        node.className = "todo-app-task";

        node.innerHTML = `<div class="todo-app-task-left">
    
                        <p class="${isCompleted ? "done" : ""}">${title} </p>
                        <p>${description}</p>
                        <div class="todo-app-task-left-time">
                            <p>Due Date: ${dueDate}</p>
                        </div>

                        <button class="delete-btn" data-id="${id}">Delete</button>

                        <button class="edit-btn" data-id="${id}">Edit</button>

                      <div>
                       ${new Date(dueDate) < Date.now() ? `<p class='red'>Overdue</p>` : ""
                      }
                         </div>
                    </div>

                    <div class="todo-app-task-right">
                        <input type="checkbox" name="" ${isCompleted ? "checked" : ""} id="${id}">
                    </div>
                    
                    `
        taskSection.appendChild(node)
    }

    function renderTaskList(list){
        if(!taskSection){
            return;
        }
        taskSection.innerHTML = "";
        list.forEach(task => {
            appendTask(task.title, task.dueDate, task.id, task.isCompleted, task.description);
        });
    }

    function isOverdueTask(task){
        const due = new Date(task.dueDate).getTime();
        if(isNaN(due)){
            return false;
        }
        return due < Date.now();
    }

    function applyFilters(){
        let filtered = tasks.slice();

        if(currentQuery){
            filtered = filtered.filter(task => {
                const content = `${task.title || ""} ${task.description || ""}`.toLowerCase();
                return content.includes(currentQuery);
            });
        }

        switch(currentFilter){
            case "completed":
                filtered = filtered.filter(task => task.isCompleted);
                break;
            case "active":
                filtered = filtered.filter(task => !task.isCompleted);
                break;
            case "overdue":
                filtered = filtered.filter(task => isOverdueTask(task));
                break;
            default:
                break;
        }

        renderTaskList(filtered);
    }

    if(searchInput){
        searchInput.addEventListener("input", function(e){
            currentQuery = e.target.value.trim().toLowerCase();
            applyFilters();
        });
    }

    if(filterSelect){
        filterSelect.addEventListener("change", function(e){
            currentFilter = e.target.value;
            applyFilters();
        });
    }

    function loadTask() {
    fetch("https://692ea16491e00bafccd49bc3.mockapi.io/todo/tasks")
    .then(res => res.json())
    .then(data => {
        tasks = data;
        applyFilters();
    })
}

function addTask() {
    const field = document.getElementById("addField");
    field.innerHTML = `<div class="add-task">
                <input type="text" placeholder="Input your task" id="task-input">
                <textarea placeholder="Enter description" id="description"></textarea>

                <div class="add-task-time">

                    <div class="add-task-time-start">
                        <label for="due">Due Date:</label>
                        <input type="datetime-local" name="" id="due">
                    </div>
                </div>

                <button onclick="inputTask()">Save</button>
            </div>`
};

function closeAddTask() {}

function inputTask() {
    const inputSection = document.getElementById("task-input");
    const dueDate = document.getElementById("due")
    const description = document.getElementById("description")
    
    if (inputSection.value === '' || !dueDate.value || !description.value) {
       alert("The Input field is empty, please input all fields")
    }

    if (editingId !== null) {
        const task = tasks.find(t => t.id == editingId);
        if(!task){
            alert("Task not found.")
        }
        
        task.title =  inputSection.value;
        task.dueDate = dueDate.value;
        task.description = description.value;

        fetch(`https://692ea16491e00bafccd49bc3.mockapi.io/todo/tasks/${editingId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(task)
        }).then(() => {
            taskSection.innerHTML = "";
            loadTask();
        })

        editingId = null;

        document.getElementById("addField").innerHTML = "";
        return;
    }

    else {

        const task = {
            title: inputSection.value,
            dueDate : dueDate.value,
            isCompleted: false,
            description: description.value
        }

        fetch("https://692ea16491e00bafccd49bc3.mockapi.io/todo/tasks", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(task)
        })
        .then(res => res.json())
        .then(newTask => {
            tasks.push(newTask);
            applyFilters();
        })

const field = document.getElementById("addField");
    field.innerHTML = null;
    }
}

loadTask()

taskSection.addEventListener("change", function(e){
    if(e.target.type === "checkbox"){
        const id = e.target.getAttribute("id");

        const task = tasks.find(t => t.id == id);
        task.isCompleted = e.target.checked;

        fetch(`https://692ea16491e00bafccd49bc3.mockapi.io/todo/tasks/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(task)
        })

        const text = e.target
            .closest(".todo-app-task")
            .querySelector("p");
        
        if(task.isCompleted){
            text.classList.add("done");
        } else {
            text.classList.remove("done");
        }
    }
});

taskSection.addEventListener("click", function(e){
    if(e.target.classList.contains("delete-btn")){
        const id = e.target.getAttribute("data-id");

    
    const ok = confirm("Are you sure you want to delete this task?");
    if(!ok){
        return;
    }

        tasks = tasks.filter(t => t.id != id);

        fetch(`https://692ea16491e00bafccd49bc3.mockapi.io/todo/tasks/${id}`, {
            method: "DELETE"
        })
        
        applyFilters();
    }

    else if(e.target.classList.contains("edit-btn")){
        const id = e.target.getAttribute("data-id");
        
        const task = tasks.find(t => t.id == id);
        editingId = id

            const field = document.getElementById("addField");
    field.innerHTML = `<div class="add-task">
                <input type="text" value="${task.title}" placeholder="Input your task" id="task-input">
                <textarea placeholder="Enter description" id="description">${task.description}</textarea>

                <div class="add-task-time">

                    <div class="add-task-time-start">
                        <label for="due">Due Date:</label>
                        <input value="defaultValue="${task.dueDate}"" type="datetime-local" name="" id="due">
                    </div>
                </div>

                <button onclick="inputTask()">Save</button>
            </div>`
    }
});
