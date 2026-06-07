const SUPABASE_URL = "https://wohyuqiqvvrdhqgxovyt.supabase.co";
const SUPABASE_KEY = "PUT_YOUR_ANON_KEY_HERE";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let prompts = [];
let categories = [];
let notifications = [];

window.onload = async () => {
    await loadAll();
    handleImageUpload();
    render();
};

// ===== LOAD =====
async function loadAll() {
    const { data: p } = await supabase.from("prompts").select("*");
    const { data: c } = await supabase.from("categories").select("*");
    const { data: n } = await supabase.from("notifications").select("*");

    prompts = p || [];
    categories = c || [];
    notifications = n || [];
}

// ===== SAVE PROMPT + IMAGE =====
async function savePrompt() {

    let imageUrl = document.getElementById("image").value;
    const file = document.getElementById("imageUpload").files[0];

    if (file) {
        const fileName = Date.now() + "_" + file.name;

        await supabase.storage
            .from("images")
            .upload(fileName, file);

        imageUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${fileName}`;
    }

    const obj = {
        title: document.getElementById("title").value,
        image: imageUrl,
        category: document.getElementById("category").value,
        prompt: document.getElementById("prompt").value,
        created_at: new Date()
    };

    await supabase.from("prompts").insert([obj]);

    await loadAll();
    render();
    toggleForm();
}

// ===== CATEGORY =====
async function addCategory() {
    const name = document.getElementById("catName").value;

    await supabase.from("categories").insert([{ name }]);

    await loadAll();
    render();
}

// ===== NOTIFICATION =====
async function addNotification() {
    const title = document.getElementById("notifTitle").value;
    const desc = document.getElementById("notifDesc").value;

    await supabase.from("notifications").insert([{ title, description: desc }]);

    await loadAll();
    render();
}

// ===== DELETE =====
async function deletePrompt(id) {
    await supabase.from("prompts").delete().eq("id", id);
    await loadAll();
    render();
}

// ===== RENDER =====
function render() {

    document.getElementById("stats").innerHTML =
        `Prompts: ${prompts.length}`;

    document.getElementById("homeGrid").innerHTML =
        prompts.map(p => `
            <div>
                <img src="${p.image}" width="120">
                <h3>${p.title}</h3>
            </div>
        `).join("");

    document.getElementById("list").innerHTML =
        prompts.map(p => `
            <div>
                <h3>${p.title}</h3>
                <button onclick="deletePrompt(${p.id})">حذف</button>
            </div>
        `).join("");

    document.getElementById("catList").innerHTML =
        categories.map(c => `<p>${c.name}</p>`).join("");

    document.getElementById("notifList").innerHTML =
        notifications.map(n => `<p>${n.title}</p>`).join("");
}

// ===== FORM =====
function toggleForm() {
    document.getElementById("form").classList.toggle("hidden");
}

// ===== IMAGE =====
function handleImageUpload() {
    document.getElementById("imageUpload").addEventListener("change", e => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById("image").value = file.name;
        }
    });
}

// ===== TABS =====
function showTab(id) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}
