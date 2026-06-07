const SUPABASE_URL = "https://wohyuqiqvvrdhqgxovyt.supabase.co";
const SUPABASE_KEY = "PUT_YOUR_ANON_KEY_HERE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let prompts = [];
let categories = [];
let notifications = [];

// ================= START =================
window.onload = async () => {
    await loadAll();
    fillCategories();
    render();
};

// ================= LOAD =================
async function loadAll() {
    const { data: p } = await supabase.from("prompts").select("*").order("id", { ascending: false });
    const { data: c } = await supabase.from("categories").select("*");
    const { data: n } = await supabase.from("notifications").select("*");

    prompts = p || [];
    categories = c || [];
    notifications = n || [];
}

// ================= ADD PROMPT =================
async function savePrompt() {

    let imageUrl = document.getElementById("image").value;
    const file = document.getElementById("imageUpload").files[0];

    // رفع صورة
    if (file) {
        const fileName = Date.now() + "_" + file.name;

        const { error } = await supabase.storage
            .from("images")
            .upload(fileName, file);

        if (!error) {
            imageUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
        }
    }

    const obj = {
        title: document.getElementById("title").value,
        image: imageUrl,
        category: document.getElementById("category").value,
        prompt: document.getElementById("prompt").value,
        desc: document.getElementById("desc").value,
        platform: document.getElementById("platform").value,
        video_link: document.getElementById("videoLink").value,
        show_home: document.getElementById("showHome").checked
    };

    const { error } = await supabase.from("prompts").insert([obj]);

    if (error) {
        alert("Error: " + error.message);
        return;
    }

    await loadAll();
    render();
    toggleForm();
}

// ================= DELETE =================
async function deletePrompt(id) {
    await supabase.from("prompts").delete().eq("id", id);
    await loadAll();
    render();
}

// ================= CATEGORY =================
async function addCategory() {
    const name = document.getElementById("catName").value;

    await supabase.from("categories").insert([{ name }]);

    await loadAll();
    fillCategories();
    render();
}

// ================= NOTIFICATION =================
async function addNotification() {
    const title = document.getElementById("notifTitle").value;
    const desc = document.getElementById("notifDesc").value;

    await supabase.from("notifications").insert([{
        title,
        description: desc
    }]);

    await loadAll();
    render();
}

// ================= RENDER =================
function render() {

    document.getElementById("stats").innerHTML = `
        <div class="stat-card">
            <h3>${prompts.length}</h3>
            <p>البرومبتات</p>
        </div>
    `;

    // HOME
    document.getElementById("homeGrid").innerHTML =
        prompts.filter(p => p.show_home).map(p => `
            <div class="card">
                <img src="${p.image || ''}">
                <div class="card-content">
                    <h3>${p.title}</h3>
                    <p>${p.category || ''}</p>
                </div>
            </div>
        `).join("");

    // LIST
    document.getElementById("list").innerHTML =
        prompts.map(p => `
            <div class="card">
                <h3>${p.title}</h3>
                <p>${p.category || ''}</p>
                <button onclick="deletePrompt(${p.id})">حذف</button>
            </div>
        `).join("");

    // CATEGORIES
    document.getElementById("catList").innerHTML =
        categories.map(c => `
            <div class="card">
                ${c.name}
            </div>
        `).join("");

    // NOTIFICATIONS
    document.getElementById("notifList").innerHTML =
        notifications.map(n => `
            <div class="card">
                <h3>${n.title}</h3>
                <p>${n.description || ''}</p>
            </div>
        `).join("");
}

// ================= FORM =================
function toggleForm() {
    document.getElementById("form").classList.toggle("hidden");
}

// ================= CATEGORIES SELECT =================
function fillCategories() {
    const select = document.getElementById("category");
    if (!select) return;

    select.innerHTML = categories.map(c =>
        `<option value="${c.name}">${c.name}</option>`
    ).join("");
}

// ================= TABS =================
function showTab(id) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}
