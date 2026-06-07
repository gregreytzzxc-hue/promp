const SUPABASE_URL = "https://wohyuqiqvvrdhqgxovyt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvaHl1cWlxdnZyZGhxZ3hvdnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NjU5NjIsImV4cCI6MjA5NjM0MTk2Mn0.h_-Kx-K9sdY-IHUsmrWbU79M9bv8bLQFKpvki3mrz80";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let prompts = [];
let categories = [];
let notifications = [];

// ========== START ==========
window.onload = async () => {
    await loadAll();
    handleImageUpload();
    render();
};

// ========== LOAD ==========
async function loadAll() {
    const { data: p } = await supabase.from("prompts").select("*");
    const { data: c } = await supabase.from("categories").select("*");
    const { data: n } = await supabase.from("notifications").select("*");

    prompts = p || [];
    categories = c || [];
    notifications = n || [];
}

// ========== ADD PROMPT ==========
async function savePrompt() {

    let imageUrl = document.getElementById("image").value;
    const file = document.getElementById("imageUpload").files[0];

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
        console.log(error);
        alert("Error saving prompt");
        return;
    }

    await loadAll();
    render();
    toggleForm();
}

// ========== CATEGORY ==========
async function addCategory() {
    const name = document.getElementById("catName").value;

    await supabase.from("categories").insert([{ name }]);

    await loadAll();
    render();
}

// ========== NOTIFICATIONS ==========
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

// ========== DELETE ==========
async function deletePrompt(id) {
    await supabase.from("prompts").delete().eq("id", id);
    await loadAll();
    render();
}

// ========== RENDER ==========
function render() {

    document.getElementById("stats").innerHTML =
        `<div>عدد البرومبتات: ${prompts.length}</div>`;

    document.getElementById("homeGrid").innerHTML =
        prompts.filter(p => p.show_home).map(p => `
            <div class="card">
                <img src="${p.image || ''}">
                <h3>${p.title}</h3>
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
            <div class="card">
                ${c.name}
            </div>
        `).join("");

    document.getElementById("notifList").innerHTML =
        notifications.map(n => `
            <div class="card">
                ${n.title}
            </div>
        `).join("");
}

// ========== FORM ==========
function toggleForm() {
    document.getElementById("form").classList.toggle("hidden");
}

// ========== IMAGE UPLOAD ==========
function handleImageUpload() {
    document.getElementById("imageUpload").addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById("image").value = file.name;
        }
    });
}

// ========== TABS ==========
function showTab(id) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}
