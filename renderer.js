// Check system preference or localStorage for theme
const themeToggleBtn = document.getElementById('theme-toggle');
const settingsThemeToggleBtn = document.getElementById('settings-theme-toggle');
const html = document.documentElement;

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        html.classList.remove('dark');
    } else if (savedTheme === 'dark') {
        html.classList.add('dark');
    } else {
        // Default to dark mode as requested
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

function toggleTheme() {
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);
settingsThemeToggleBtn.addEventListener('click', toggleTheme);
initTheme();

// Window Controls
if (window.electronAPI) {
    document.getElementById('btn-minimize').addEventListener('click', () => window.electronAPI.minimize());
    document.getElementById('btn-maximize').addEventListener('click', () => window.electronAPI.maximize());
    document.getElementById('btn-close').addEventListener('click', () => window.electronAPI.close());
}

// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view-section');

function switchView(targetId) {
    views.forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('flex');
        view.classList.remove('block');
    });

    navBtns.forEach(btn => {
        if (btn.dataset.target === targetId) {
            btn.classList.add('bg-brand/10', 'text-brand');
            btn.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:bg-gray-200', 'dark:hover:bg-surface');
        } else {
            btn.classList.remove('bg-brand/10', 'text-brand');
            btn.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:bg-gray-200', 'dark:hover:bg-surface');
        }
    });

    const targetView = document.getElementById(targetId);
    if (targetId === 'notes-view' || targetId === 'tasks-view') {
        targetView.classList.remove('hidden');
        targetView.classList.add('flex'); // those views are flex columns
    } else {
        targetView.classList.remove('hidden');
        targetView.classList.add('block');
    }
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchView(btn.dataset.target);
    });
});

// Dynamic Greeting
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Good Evening';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    document.getElementById('greeting').textContent = greeting;
}
updateGreeting();

// Data State
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveData() {
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateDashboardStats();
}

// --- Dashboard ---
function updateDashboardStats() {
    document.getElementById('stat-notes').textContent = notes.length;
    const doneTasks = tasks.filter(t => t.completed).length;
    document.getElementById('stat-tasks-done').textContent = doneTasks;
    document.getElementById('stat-tasks-pending').textContent = tasks.length - doneTasks;
}
updateDashboardStats();

// --- Notes App ---
const notesList = document.getElementById('notes-list');
const noteSearch = document.getElementById('note-search');
const btnNewNote = document.getElementById('btn-new-note');
const noteModal = document.getElementById('note-modal');
const noteModalContent = document.getElementById('note-modal-content');
const noteTitle = document.getElementById('note-title');
const noteBody = document.getElementById('note-body');
const btnSaveNote = document.getElementById('btn-save-note');
const btnCancelNote = document.getElementById('btn-cancel-note');
const btnCloseNote = document.getElementById('btn-close-note');
const btnDeleteNote = document.getElementById('btn-delete-note');

let currentEditingNoteId = null;

function renderNotes(filter = '') {
    notesList.innerHTML = '';
    const filteredNotes = notes.filter(n =>
        n.title.toLowerCase().includes(filter.toLowerCase()) ||
        n.body.toLowerCase().includes(filter.toLowerCase())
    ).sort((a, b) => b.updatedAt - a.updatedAt);

    if (filteredNotes.length === 0) {
        notesList.innerHTML = `
      <div class="col-span-full py-16 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <i class="ph ph-notebook text-6xl mb-4 opacity-40"></i>
        <p class="text-lg">No notes found.</p>
        <button onclick="document.getElementById('btn-new-note').click()" class="mt-4 text-brand hover:underline font-medium">Create your first note</button>
      </div>`;
        return;
    }

    filteredNotes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'glass p-6 rounded-3xl cursor-pointer hover:border-brand/60 transition-all duration-300 group relative overflow-hidden h-56 flex flex-col border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:shadow-brand/5 active:scale-95';

        // Format date
        const d = new Date(note.updatedAt);
        const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        card.innerHTML = `
      <h3 class="font-bold text-xl text-gray-900 dark:text-white truncate mb-3">${note.title || 'Untitled Note'}</h3>
      <p class="text-base text-gray-600 dark:text-gray-400 line-clamp-4 flex-1 whitespace-pre-wrap leading-relaxed">${note.body}</p>
      <div class="mt-4 text-xs text-gray-500 font-medium flex justify-between items-center shrink-0 border-t border-gray-200 dark:border-gray-800 pt-4">
        <span class="flex items-center gap-1.5"><i class="ph ph-clock"></i> ${dateStr}</span>
      </div>
    `;
        card.onclick = () => openNoteModal(note.id);
        notesList.appendChild(card);
    });
}

function showModal() {
    noteModal.classList.remove('hidden');
    // Small delay to allow display block to apply before animating opacity/transform
    setTimeout(() => {
        noteModalContent.classList.remove('scale-95', 'opacity-0');
        noteModalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
    noteTitle.focus();
}

function hideModal() {
    noteModalContent.classList.remove('scale-100', 'opacity-100');
    noteModalContent.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        noteModal.classList.add('hidden');
    }, 300);
}

function openNoteModal(id = null) {
    currentEditingNoteId = id;
    if (id) {
        const note = notes.find(n => n.id === id);
        noteTitle.value = note.title;
        noteBody.value = note.body;
        btnDeleteNote.classList.remove('hidden');
    } else {
        noteTitle.value = '';
        noteBody.value = '';
        btnDeleteNote.classList.add('hidden');
    }
    showModal();
}

function saveNote() {
    const title = noteTitle.value.trim();
    const body = noteBody.value.trim();

    if (!title && !body) {
        hideModal();
        return;
    }

    if (currentEditingNoteId) {
        const idx = notes.findIndex(n => n.id === currentEditingNoteId);
        if (idx !== -1) {
            notes[idx].title = title;
            notes[idx].body = body;
            notes[idx].updatedAt = Date.now();
        }
    } else {
        notes.push({
            id: Date.now().toString(),
            title,
            body,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }

    saveData();
    renderNotes(noteSearch.value);
    hideModal();
}

function deleteNote() {
    if (currentEditingNoteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(n => n.id !== currentEditingNoteId);
            saveData();
            renderNotes(noteSearch.value);
            hideModal();
        }
    }
}

btnNewNote.addEventListener('click', () => openNoteModal());
btnSaveNote.addEventListener('click', saveNote);
btnCancelNote.addEventListener('click', hideModal);
btnCloseNote.addEventListener('click', hideModal);
btnDeleteNote.addEventListener('click', deleteNote);
noteSearch.addEventListener('input', (e) => renderNotes(e.target.value));

renderNotes();

// --- Tasks App ---
const tasksList = document.getElementById('tasks-list');
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskPriority = document.getElementById('task-priority');

function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
        case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
}

function renderTasks() {
    tasksList.innerHTML = '';

    if (tasks.length === 0) {
        tasksList.innerHTML = `
      <div class="py-16 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <i class="ph ph-check-square-offset text-6xl mb-4 opacity-40"></i>
        <p class="text-lg">No tasks yet. Add one above!</p>
      </div>`;
        return;
    }

    // Sort: pending first, then by priority (high > medium > low), then date
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (priorityWeight[b.priority] !== priorityWeight[a.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return b.createdAt - a.createdAt;
    });

    sortedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `glass p-5 rounded-2xl flex items-center gap-4 transition-all duration-300 border ${task.completed ? 'border-transparent opacity-50 bg-gray-50 dark:bg-transparent shadow-none' : 'border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5'}`;

        li.innerHTML = `
      <button class="checkbox-btn w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${task.completed ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20' : 'border-gray-400 dark:border-gray-500 hover:border-brand hover:bg-brand/10 text-transparent'}" data-id="${task.id}">
        <i class="ph ph-check font-bold ${task.completed ? 'opacity-100 scale-100' : 'opacity-0 scale-50 text-brand'} transition-all"></i>
      </button>
      <div class="flex-1 min-w-0">
        <p class="text-base font-medium text-gray-900 dark:text-white truncate transition-all duration-300 ${task.completed ? 'line-through text-gray-500 dark:text-gray-500' : ''}">${task.text}</p>
      </div>
      <span class="text-xs px-2.5 py-1 rounded-lg border capitalize font-semibold ${getPriorityColor(task.priority)} shrink-0 shadow-sm">
        ${task.priority}
      </span>
      <button class="delete-task-btn p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0 ml-2" data-id="${task.id}" title="Delete Task">
        <i class="ph ph-trash text-lg"></i>
      </button>
    `;
        tasksList.appendChild(li);
    });

    // Attach listeners
    document.querySelectorAll('.checkbox-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            toggleTask(id);
        });
    });

    document.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            deleteTask(id);
        });
    });
}

function addTask(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    const priority = taskPriority.value;

    if (text) {
        tasks.push({
            id: Date.now().toString(),
            text,
            priority,
            completed: false,
            createdAt: Date.now()
        });
        taskInput.value = '';
        saveData();
        renderTasks();
    }
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderTasks();
    }
}

function deleteTask(id) {
    // Adding small animation for delete
    const btn = document.querySelector(`.delete-task-btn[data-id="${id}"]`);
    if (btn) {
        btn.closest('li').style.opacity = '0';
        btn.closest('li').style.transform = 'scale(0.95)';
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveData();
            renderTasks();
        }, 200);
    } else {
        tasks = tasks.filter(t => t.id !== id);
        saveData();
        renderTasks();
    }
}

taskForm.addEventListener('submit', addTask);
renderTasks();

// --- Settings ---
document.getElementById('btn-clear-data').addEventListener('click', () => {
    if (confirm('Are you sure you want to permanently delete ALL your notes and tasks? This cannot be undone.')) {
        notes = [];
        tasks = [];
        saveData();
        renderNotes();
        renderTasks();
        alert('All data has been cleared.');
    }
});

// --- Global Shortcuts ---
window.addEventListener('keydown', (e) => {
    // Ctrl+N for new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        switchView('notes-view');
        openNoteModal();
    }
    // Ctrl+T for new task
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        switchView('tasks-view');
        taskInput.focus();
    }
    // Escape to close modal
    if (e.key === 'Escape' && !noteModal.classList.contains('hidden')) {
        hideModal();
    }
});
