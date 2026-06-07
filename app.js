const SUPABASE_URL = "https://wohyuqiqvvrdhqgxovyt.supabase.co";
const SUPABASE_KEY = "PUT_YOUR_ANON_KEY_HERE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let prompts = [];
let categories = [];
let notifications = [];

/* ===== START ===== */
window.onload = async () => {
    await loadAll();
    handleImageUpload();
    render();
};

/* ===== LOAD ===== */
async function loadAll() {
    const { data: p } = await supabase.from("prompts").select("*");
    const { data: c } = await supabase.from("categories").select("*");
    const { data: n } = await supabase.from("notifications").select("*");

    prompts = p || [];
    categories = c || [];
    notifications = n || [];

    fillCategories();
}

/* ===== SAVE PROMPT ===== */
async function addPrompt() {
    const file = document.getElementById("imageUpload").files[0];
    let imageUrl = document.getElementById("image").value;

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
        description: document.getElementById("desc").value,
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

/* ===== CATEGORY ===== */
async function addCategory() {
    const name = document.getElementById("catName").value;

    await supabase.from("categories").insert([{ name }]);

    await loadAll();
    render();
}

/* ===== NOTIFICATIONS ===== */
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

/* ===== DELETE ===== */
async function deletePrompt(id) {
    await supabase.from("prompts").delete().eq("id", id);
    await loadAll();
    render();
}

/* ===== RENDER ===== */
function render() {

    document.getElementById("stats").innerHTML =
        `<div class="stat-card">${prompts.length} برومبت</div>`;

    document.getElementById("homeGrid").innerHTML =
        prompts.filter(p => p.show_home).map(p => `
            <div class="card">
                <img src="${p.image || ''}">
                <div class="card-content">
                    <h3>${p.title}</h3>
                </div>
            </div>
        `).join("");

    document.getElementById("list").innerHTML =
        prompts.map(p => `
            <div class="card">
                <h3>${p.title}</h3>
                <button onclick="deletePrompt(${p.id})">حذف</button>
            </div>
        `).join("");

    document.getElementById("catList").innerHTML =
        categories.map(c => `
            <div class="card">${c.name}</div>
        `).join("");

    document.getElementById("notifList").innerHTML =
        notifications.map(n => `
            <div class="card">${n.title}</div>
        `).join("");
}

/* ===== FORM ===== */
function toggleForm() {
    document.getElementById("form").classList.toggle("hidden");
}

/* ===== IMAGE ===== */
function handleImageUpload() {
    document.getElementById("imageUpload").addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById("image").value = file.name;
        }
    });
}

/* ===== FILL CATEGORIES ===== */
function fillCategories() {
    const select = document.getElementById("category");
    if (!select) return;

    select.innerHTML = categories.map(c =>
        `<option value="${c.name}">${c.name}</option>`
    ).join("");
}

/* ===== TABS ===== */
function showTab(id) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}
