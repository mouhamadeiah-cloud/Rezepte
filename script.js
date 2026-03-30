// ============================================
// PWA Installation
// ============================================
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('beforeinstallprompt fired');
    showInstallButton();
});

function showInstallButton() {
    if (document.getElementById('installBtn')) return;
    
    const installBtn = document.createElement('button');
    installBtn.id = 'installBtn';
    installBtn.innerHTML = '📱 App installieren';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #d4af37, #f5d742);
        color: #0a2a0a;
        border: none;
        padding: 12px 24px;
        border-radius: 50px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        font-size: 0.9rem;
        font-family: inherit;
    `;
    
    installBtn.onclick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
        installBtn.remove();
    };
    
    document.body.appendChild(installBtn);
    
    setTimeout(() => {
        if (installBtn.parentNode) installBtn.remove();
    }, 15000);
}

window.addEventListener('appinstalled', () => {
    console.log('App wurde installiert!');
    const btn = document.getElementById('installBtn');
    if (btn) btn.remove();
});

// ============================================
// Initialize data
// ============================================
let appData = JSON.parse(localStorage.getItem('diePrimelData'));
if (!appData) {
    appData = {
        groups: [],
        dishes: []
    };
    localStorage.setItem('diePrimelData', JSON.stringify(appData));
}

let selectedGroupId = null;

// ============================================
// Sidebar Functions
// ============================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openSidebar);
}
if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
}

document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', closeSidebar);
});

// ============================================
// Render Groups in Sidebar
// ============================================
function renderGroups() {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    if (!appData.groups.length) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 1rem;">
                <div class="icon">📭</div>
                <p>Keine Kategorien</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appData.groups.map(group => {
        const dishCount = appData.dishes.filter(d => d.groupId === group.id).length;
        const isActive = selectedGroupId === group.id;
        return `
            <button class="group-sidebar-btn ${isActive ? 'active' : ''}" data-id="${group.id}">
                ${escapeHtml(group.name)}
                <span style="display: block; font-size: 0.75rem; color: #9abf9a; margin-top: 4px;">
                    ${dishCount} Rezept${dishCount !== 1 ? 'e' : ''}
                </span>
            </button>
        `;
    }).join('');
    
    document.querySelectorAll('.group-sidebar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedGroupId = parseInt(btn.dataset.id);
            renderGroups();
            renderDishes();
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
}

// ============================================
// Render Dishes
// ============================================
function renderDishes() {
    const container = document.getElementById('dishesContainer');
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryDescription = document.getElementById('categoryDescription');
    
    if (!container) return;
    
    if (!selectedGroupId) {
        if (categoryTitle) categoryTitle.textContent = 'Willkommen';
        if (categoryDescription) categoryDescription.textContent = 'Wählen Sie eine Kategorie aus';
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="icon">👈</div>
                <p>Bitte wählen Sie eine Kategorie aus</p>
            </div>
        `;
        return;
    }
    
    const group = appData.groups.find(g => g.id === selectedGroupId);
    const groupDishes = appData.dishes.filter(d => d.groupId === selectedGroupId);
    
    if (group) {
        if (categoryTitle) categoryTitle.textContent = group.name;
        if (categoryDescription) categoryDescription.textContent = `${groupDishes.length} Rezept${groupDishes.length !== 1 ? 'e' : ''}`;
    }
    
    if (!groupDishes.length) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="icon">📭</div>
                <p>Keine Rezepte in dieser Kategorie</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = groupDishes.map(dish => `
        <div class="dish-card" data-id="${dish.id}">
            <div class="dish-icon">🍨</div>
            <h4>${escapeHtml(dish.name)}</h4>
        </div>
    `).join('');
    
    document.querySelectorAll('.dish-card').forEach(card => {
        card.addEventListener('click', () => {
            const dishId = parseInt(card.dataset.id);
            const dish = appData.dishes.find(d => d.id === dishId);
            if (dish) showModal(dish);
        });
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Modal Functions
// ============================================
function showModal(dish) {
    const modal = document.getElementById('recipeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalRecipe = document.getElementById('modalRecipe');
    const modalImage = document.getElementById('modalImage');
    
    if (!modal) return;
    
    modalTitle.textContent = dish.name;
    modalRecipe.textContent = dish.recipe || 'Keine Rezeptbeschreibung verfügbar';
    
    if (dish.image && dish.image.trim() !== '') {
        modalImage.src = dish.image;
        modalImage.alt = dish.name;
        modalImage.style.display = 'block';
    } else {
        modalImage.style.display = 'none';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('recipeModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

const modalElement = document.getElementById('recipeModal');
const closeModalBtn = document.getElementById('closeModalBtn');

if (modalElement) {
    modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement) closeModal();
    });
}
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

// ============================================
// Service Worker Registration
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registriert:', registration);
            })
            .catch(error => {
                console.log('Service Worker Registrierung fehlgeschlagen:', error);
            });
    });
}

// ============================================
// Initialize
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    renderGroups();
    renderDishes();
});
// ============================================
// Image Picker - Select image from device
// ============================================

// Create hidden file input
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

// Function to get file path
function getFilePath(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Create a temporary URL
            const tempUrl = URL.createObjectURL(file);
            // For local files, we need to get the full path
            // On Android, we can use file:// URI
            if (window.isSecureContext) {
                // Use file API to get path
                resolve(tempUrl);
            } else {
                resolve(tempUrl);
            }
        };
        reader.readAsDataURL(file);
    });
}

// Function to get Android file path
function getAndroidFilePath(file) {
    // On Android, files are stored in /storage/emulated/0/
    // We need to construct the path from the file name
    const fileName = file.name;
    const lastModified = file.lastModified;
    
    // Ask user where the file is located
    const path = prompt(
        "Bitte geben Sie den Pfad zur Bilddatei ein:\n" +
        "Beispiel: /storage/emulated/0/Pictures/PrimelRezepte/stracciatella.jpg\n\n" +
        "Oder klicken Sie OK, um den Dateinamen zu verwenden:",
        "/storage/emulated/0/Pictures/PrimelRezepte/" + fileName
    );
    
    return path ? path : "file://" + path;
}

// Select image button for new dish
const selectImageBtn = document.getElementById('selectImageBtn');
if (selectImageBtn) {
    selectImageBtn.addEventListener('click', () => {
        fileInput.click();
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Get the file path
                const path = getAndroidFilePath(file);
                document.getElementById('dishImage').value = path;
            }
            fileInput.value = ''; // Reset input
        };
    });
}

// Select image button for edit dish
const editSelectImageBtn = document.getElementById('editSelectImageBtn');
if (editSelectImageBtn) {
    editSelectImageBtn.addEventListener('click', () => {
        fileInput.click();
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const path = getAndroidFilePath(file);
                document.getElementById('editDishImage').value = path;
            }
            fileInput.value = '';
        };
    });
}
