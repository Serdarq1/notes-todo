const title = document.getElementById("title");
const description = document.getElementById("description");
const createdAt = document.getElementById("createdAt");
const isActive = document.getElementById("isActive");
const activeColor = document.getElementById("activeColor");
const allCards = document.getElementById("all-cards");
const statusButton = document.getElementById("status");
const detailedEdit = document.getElementById("detailed-edit");
const detailedTitle = document.getElementById("detailed-title");
const category = document.getElementById("category");
const detailedDescription = document.getElementById("detailed-description");
const detailedCreatedAt = document.getElementById("detailed-created-at");
const sectionTitle = document.getElementById("section-title");
const notes = document.getElementById("notes");
const tasks = document.getElementById("tasks");
const searchBar = document.getElementById("search-bar");
const addBtn = document.getElementById("add-btn");

searchBar.addEventListener("input", (e) => {
    searchFilter(e.target.value);
})

let notesData = [];
let tasksData = [];
let allItems = [];
let curId = null;

let isEditing = false;

async function loadData() {
    try {
        const res = await fetch("./assets/notes-tasks.json");
        const data = await res.json();
        console.log(data);
        
        notesData = data.notes;
        tasksData = data.tasks;
        allItems = [...notesData, ...tasksData];

        sectionTitle.textContent = "Notes";
        renderList(notesData);

         allCards.addEventListener("click", (event) => {
            const deleteBtn = event.target.closest(".delete-btn");

            if (deleteBtn) {
                const id = parseInt(deleteBtn.dataset.id);
                deleteItem(id);
                return;
            }

            const card = event.target.closest(".card-item");
            if (!card) return;

            const id = parseInt(card.dataset.id);
            const item = allItems.find(x => x.id === id);

            if (item) updateDetailPanel(item);
        });

        // Tab: Notes
        notes.addEventListener("click", () => {
            sectionTitle.textContent = "Notes";
            renderList(notesData);
        });

        // Tab: Tasks
        tasks.addEventListener("click", () => {
            sectionTitle.textContent = "Tasks";
            renderList(tasksData);
        });

    } catch (err) {
        console.log("There was an error.");
        console.log(err);
    }
}

loadData()

function createCard(note) { 
    const isCompleted = note.completed === true || note.status === "completed";
    const statusLabel = isCompleted ? "Completed" : "Active";

    return `
        <li class="card-item bg-gray-100 p-5 rounded-2xl border border-slate-100 shadow-sm hover:bg-emerald-50 transition cursor-pointer" data-id="${note.id}">
            <div class="mb-3 flex items-start justify-between">
                <h3 class="text-sm font-semibold text-slate-800">${note.title}</h3>
                <span class="status-pill inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 status-icon"></span>
                    <span class="status-text">${statusLabel}</span>
                </span>
            </div>
            <p class="text-xs text-slate-500 leading-relaxed">
                ${note.content}
            </p>
            <div class="flex justify-between">
                <p class="text-[11px] text-slate-400 mt-4">${note.createdAt}</p>
                <button class="delete-btn text-[11px] text-orange-600 mt-4 cursor-pointer" data-id="${note.id}">
                    Delete
                </button>
            </div>
        </li>
    `;
}


function updateDetailPanel(note) {
    curId = note.id;
    detailedEdit.querySelector('span').textContent = 'Edit';
    isEditing = false

    detailedTitle.textContent = note.title;
    category.textContent = "• " + note.category;
    detailedDescription.textContent = note.content;
    detailedCreatedAt.textContent = note.createdAt;
}

function toggleStatus() {
    if (curId === null) return;

    let item = notesData.find(n => n.id === curId);
    if (!item) {
        item = tasksData.find(t => t.id === curId);
    }
    if (!item) return;

    const isCurrentlyCompleted = item.completed === true || item.status === "completed";
    const newCompleted = !isCurrentlyCompleted;

    item.completed = newCompleted;
    item.status = newCompleted ? "completed" : "active";

    updateDetailPanel(item);

    const card = document.querySelector(`.card-item[data-id="${curId}"]`);
    if (card) {
        const statusTextEl = card.querySelector(".status-text");
        const statusIcon = card.querySelector(".status-icon");
        if (statusTextEl && statusIcon) {
            statusTextEl.textContent = newCompleted ? "Completed" : "Active";

            if (newCompleted) {
                statusTextEl.classList.add("text-orange-600");
                statusIcon.classList.remove("bg-emerald-500");
                statusIcon.classList.add("bg-orange-500");
            } else {
                statusTextEl.classList.remove("text-orange-600");
                statusIcon.classList.add("bg-emerald-500");
                statusIcon.classList.remove("bg-orange-500");
            }
        }
    }
}

function deleteItem(id) {
    notesData = notesData.filter(n => n.id !== id);

    tasksData = tasksData.filter(t => t.id !== id);

    allItems = [...notesData, ...tasksData];

    const section = sectionTitle.textContent;
    if (section === "Notes") renderList(notesData);
    else renderList(tasksData);

    if (curId === id) {
        detailedTitle.textContent = "";
        detailedDescription.textContent = "";
        detailedCreatedAt.textContent = "";
        category.textContent = "";
        curId = null;
    }
}

statusButton.addEventListener("click", toggleStatus);

function handleClick(){
    if (statusButton.innerHTML == "Completed"){
        statusButton.innerHTML = "Not Completed";
    }else{
        statusButton.innerHTML = "Completed"
    }
    statusButton.classList.toggle("border-orange-200");
    statusButton.classList.toggle("bg-orange-100");
    statusButton.classList.toggle("text-orange-700");
    statusButton.classList.toggle("hover:bg-orange-200");
    statusButton.classList.toggle("bg-green-300");
    statusButton.classList.toggle("border-green-400");
    statusButton.classList.toggle("text-green-700");
    statusButton.classList.toggle("hover:bg-green-200");
}


function renderList(items){
    allCards.innerHTML = "";
    items.forEach(item => {
        allCards.innerHTML += createCard(item);
    })
};

function searchFilter(q){
    const query = q.trim().toLowerCase();

    if (!query) {
        if (sectionTitle == "Notes"){
            renderList(notesData)
        }
        else if (sectionTitle == "Tasks"){
            renderList(tasksData);
        }
        return;
    }
    const allItems = [...notesData, ...tasksData];
    const filtered = allItems.filter(item => {
        const title = (item.title || "").toLowerCase();
        const content = (item.content || "").toLowerCase();
        return title.includes(q) || content.includes(q);
    });
    renderList(filtered)
}

detailedEdit.addEventListener("click", () => {
    if (!curId) return;

    if (!isEditing) {
        enterEditMode();
    }
    else {
        saveEdit();
    }
});

function enterEditMode() { 
    isEditing = true;
    detailedEdit.querySelector('span').textContent = 'Save';

    const titleValue = detailedTitle.textContent;
    detailedTitle.innerHTML = `<input id="edit-title-input" class="w-full text-xl font-semibold bg-transparent outline-none" value="${titleValue}">`;

    const descValue = detailedDescription.textContent;
    detailedDescription.innerHTML = `
        <textarea id="edit-description-input" class="w-full text-sm text-slate-600 bg-transparent outline-none mt-2" rows="4">${descValue}</textarea>
    `;
}

function saveEdit(){
    const titleInput = document.getElementById("edit-title-input");
    const decInput = document.getElementById("edit-description-input");

    const newTitle = titleInput.value.trim();
    const newContent = decInput.value.trim();

    let item = notesData.find(n => n.id == curId);
    if (!item) {
        item = tasksData.find(t => t.id === curId);
    }
    if (!item) return;

    item.title = newTitle;
    item.content = newContent;

    isEditing = false;
    detailedEdit.querySelector("span").textContent = "Edit";

    updateDetailPanel(item);

    const section = sectionTitle.textContent;
    if (section === "Notes") {
        renderList(notesData);
    } else if (section === "Tasks") {
        renderList(tasksData);
    }
}

addBtn.addEventListener("click", () => {
    const section = sectionTitle.textContent;

    const maxExistingId = allItems.length ? Math.max(...allItems.map(i => i.id)) : 0;
    const newId = maxExistingId + 1;

    let newItem;

    if (section === "Notes") {
        newItem = {
            id: newId,
            title: "Untitled note",
            content: "",
            category: "Notes",
            status: "active",
            createdAt: "Just now",
            completed: false
        };
        notesData.push(newItem);
    } else if (section === "Tasks") {
        newItem = {
            id: newId,
            title: "New task",
            content: "",
            category: "Tasks",
            status: "active",
            createdAt: "Just now",
            completed: false
        };
        tasksData.push(newItem);
    }

    allItems = [...notesData, ...tasksData];

    if (section === "Notes") {
        renderList(notesData);
    } else {
        renderList(tasksData);
    }

    updateDetailPanel(newItem);
});
