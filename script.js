const taskSection = document.getElementById("taskSection");

let editingId = null;

let tasks = [
        {
            title: "Going to church",
            dueDate: new Date().toLocaleDateString(),
            id: 1,
            isCompleted: true,
            description: "lorem ipsum, how are you?"
        },
        {
            title: "Going to mosque",
            dueDate: new Date().toLocaleDateString(),
            id: 2,
            isCompleted: true,
            description: "lorem ipsum, how are you?"
        }
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
                       ${new Date(dueDate) < Date.now() ? `<p>Overdue</p>` : ""
                      }
                         </div>
                    </div>

                    <div class="todo-app-task-right">
                        <input type="checkbox" name="" ${isCompleted ? "checked" : ""} id="${id}">
                    </div>
                    
                    `
        taskSection.appendChild(node)
    }

    function loadTask() {
    fetch("https://692ea16491e00bafccd49bc3.mockapi.io/todo/tasks")
    .then(res => res.json())
    .then(data => {
        tasks = data;
        taskSection.innerHTML = "";
        for(var i = 0; i <= tasks.length - 1; i++){
            appendTask(tasks[i].title, tasks[i].dueDate, tasks[i].id, tasks[i].isCompleted, tasks[i].description)
        }
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
            appendTask(newTask.title, newTask.dueDate, newTask.id, false, newTask.description)
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

        e.target.closest(".todo-app-task").remove();
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
