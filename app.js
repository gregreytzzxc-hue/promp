let prompts = [];
let categories = [];
let notifications = [];
let currentEditIndex = null;
let isDarkMode = false;

function loadData() {
    prompts = JSON.parse(localStorage.getItem('prompts')) || [];
    categories = JSON.parse(localStorage.getItem('categories')) || [];
    notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    isDarkMode = localStorage.getItem('theme') === 'dark';
    document.body.classList.toggle('dark', isDarkMode);
}

function saveData() {
    localStorage.setItem('prompts', JSON.stringify(prompts));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2800);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.getElementById('theme-btn').textContent = isDarkMode ? '☀️' : '🌙';
}

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    render();
}

function toggleForm(editIndex = null) {
    const form = document.getElementById('form');
    form.classList.toggle('hidden');

    if (editIndex !== null) {
        currentEditIndex = editIndex;
        const p = prompts[editIndex];
        document.getElementById('title').value = p.title || '';
        document.getElementById('image').value = p.image || '';
        document.getElementById('category').value = p.category || 'ترند';
        document.getElementById('prompt').value = p.prompt || '';
        document.getElementById('desc').value = p.desc || '';
        document.getElementById('platform').value = p.platform || 'YouTube';
        document.getElementById('videoLink').value = p.video || '';
        document.getElementById('showHome').checked = !!p.showHome;
    } else {
        currentEditIndex = null;
        clearForm();
    }
}

function handleImageUpload() {
    const fileInput = document.getElementById('imageUpload');
    const urlInput = document.getElementById('image');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                urlInput.value = ev.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

function addPrompt() {
    const title = document.getElementById('title').value.trim();
    if (!title) return showToast('يرجى كتابة العنوان', 'error');

    const newPrompt = {
        title,
        image: document.getElementById('image').value.trim(),
        category: document.getElementById('category').value,
        prompt: document.getElementById('prompt').value.trim(),
        desc: document.getElementById('desc').value.trim(),
        platform: document.getElementById('platform').value,
        video: document.getElementById('videoLink').value.trim(),
        showHome: document.getElementById('showHome').checked,
        date: new Date().toISOString()
    };

    if (currentEditIndex !== null) {
        prompts[currentEditIndex] = newPrompt;
        showToast('تم التعديل بنجاح');
    } else {
        prompts.unshift(newPrompt);
        showToast('تم الإضافة بنجاح');
    }

    saveData();
    clearForm();
    toggleForm();
    render();
}

function deletePrompt(index) {
    if (confirm('حذف هذا البرومبت؟')) {
        prompts.splice(index, 1);
        saveData();
        render();
        showToast('تم الحذف');
    }
}

function copyPrompt(index) {
    navigator.clipboard.writeText(prompts[index].prompt).then(() => {
        showToast('تم نسخ البرومبت');
    });
}

function editPromptInHome(index) {
    showTab('prompts');
    setTimeout(() => toggleForm(index), 100);
}

function render() {
    // Stats
    document.getElementById('stats').innerHTML = `
        <div class="stat-card"><h3>${prompts.length}</h3><p>إجمالي البرومبتات</p></div>
        <div class="stat-card"><h3>${prompts.filter(p => p.showHome).length}</h3><p>في الرئيسية</p></div>
        <div class="stat-card"><h3>${categories.length}</h3><p>الأقسام</p></div>
    `;

    // Home Grid
    const homeGrid = document.getElementById('homeGrid');
    homeGrid.innerHTML = '';
    prompts.filter(p => p.showHome).forEach((p, i) => {
        const originalIndex = prompts.indexOf(p);
        homeGrid.innerHTML += `
            <div class="card">
                ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}
                <div class="card-content">
                    <h3>${p.title}</h3>
                    <p>${p.category}</p>
                    <div class="actions" style="margin-top:12px">
                        <button class="btn secondary" onclick="copyPrompt(${originalIndex})">📋 نسخ</button>
                        <button class="btn primary" onclick="editPromptInHome(${originalIndex})">تعديل</button>
                    </div>
                </div>
            </div>
        `;
    });

    // Prompts List
    const list = document.getElementById('list');
    list.innerHTML = prompts.map((p, i) => `
        <div class="card">
            ${p.image ? `<img src="${p.image}" alt="${p.title}">` : ''}
            <div class="card-content">
                <h3>${p.title}</h3>
                <p>${p.category} • ${p.platform}</p>
                ${p.desc ? `<p>${p.desc}</p>` : ''}
                <div class="actions" style="margin-top:12px">
                    <button class="btn secondary" onclick="copyPrompt(${i})">📋 نسخ</button>
                    <button class="btn primary" onclick="toggleForm(${i})">تعديل</button>
                    <button class="btn" style="background:#ef4444;color:white" onclick="deletePrompt(${i})">حذف</button>
                </div>
            </div>
        </div>
    `).join('');

    renderCategories();
    renderNotifications();
}

function addCategory() {
    const name = document.getElementById('catName').value.trim();
    if (name) {
        categories.push(name);
        saveData();
        render();
        document.getElementById('catName').value = '';
        showToast('تم إضافة القسم');
    }
}

function renderCategories() {
    const container = document.getElementById('catList');
    container.innerHTML = categories.map((cat, i) => `
        <div class="card">
            <h3>${cat}</h3>
            <div style="margin-top:10px">
                <button onclick="editCategory(${i})" class="btn primary">تعديل</button>
                <button onclick="deleteCategory(${i})" class="btn" style="background:#ef4444;color:white">حذف</button>
            </div>
        </div>
    `).join('');
}

function editCategory(i) {
    const newName = prompt("تعديل اسم القسم:", categories[i]);
    if (newName && newName.trim()) {
        categories[i] = newName.trim();
        saveData();
        render();
    }
}

function deleteCategory(i) {
    if (confirm('حذف القسم؟')) {
        categories.splice(i, 1);
        saveData();
        render();
    }
}

// Notifications
function addNotification() {
    const title = document.getElementById('notifTitle').value.trim();
    const desc = document.getElementById('notifDesc').value.trim();
    if (title) {
        notifications.unshift({ title, desc, date: new Date().toISOString() });
        saveData();
        renderNotifications();
        document.getElementById('notifTitle').value = '';
        document.getElementById('notifDesc').value = '';
        showToast('تم إضافة الإشعار');
    }
}

function renderNotifications() {
    const container = document.getElementById('notifList');
    container.innerHTML = notifications.map(n => `
        <div class="card">
            <h3>${n.title}</h3>
            <p>${n.desc || ''}</p>
        </div>
    `).join('');
}

function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('image').value = '';
    document.getElementById('imageUpload').value = '';
    document.getElementById('prompt').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('videoLink').value = '';
    document.getElementById('showHome').checked = false;
}

window.onload = () => {
    loadData();
    handleImageUpload();
    render();
    document.getElementById('theme-btn').textContent = isDarkMode ? '☀️' : '🌙';
};
