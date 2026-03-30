// ============================================
// Load Data
// ============================================
let appData = JSON.parse(localStorage.getItem('diePrimelData'));
if (!appData) {
    appData = {
        groups: [],
        dishes: []
    };
    localStorage.setItem('diePrimelData', JSON.stringify(appData));
}

let nextDishId = appData.dishes.length > 0 ? Math.max(...appData.dishes.map(d => d.id)) + 1 : 1;

// ============================================
// Sidebar Functions
// ============================================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
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
// Save Data
// ============================================
function saveData() {
    localStorage.setItem('diePrimelData', JSON.stringify(appData));
    renderDishesList();
    updateGroupSelect();
    updateEditGroupSelect();
}

// ============================================
// Update Group Selects
// ============================================
function updateGroupSelect() {
    const select = document.getElementById('dishGroupSelect');
    if (select) {
        select.innerHTML = '<option value="">Bitte wählen</option>' + 
            appData.groups.map(group => `<option value="${group.id}">${escapeHtml(group.name)}</option>`).join('');
    }
}

function updateEditGroupSelect() {
    const select = document.getElementById('editDishGroupSelect');
    if (select) {
        select.innerHTML = '<option value="">Bitte wählen</option>' + 
            appData.groups.map(group => `<option value="${group.id}">${escapeHtml(group.name)}</option>`).join('');
    }
}

// ============================================
// Render Dishes List
// ============================================
function renderDishesList() {
    const container = document.getElementById('dishesList');
    if (!container) return;
    
    if (!appData.dishes.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <p>Keine Gerichte vorhanden</p>
                <small>Fügen Sie Ihr erstes Rezept hinzu</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appData.dishes.map(dish => {
        const groupName = appData.groups.find(g => g.id === dish.groupId)?.name || 'Keine Gruppe';
        return `
            <div class="item" data-id="${dish.id}">
                <div class="item-info">
                    <strong>${escapeHtml(dish.name)}</strong>
                    <small>Kategorie: ${escapeHtml(groupName)}</small>
                    ${dish.image ? `<small>Bild: ${dish.image}</small>` : ''}
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editDish(${dish.id})">✏️ Bearbeiten</button>
                    <button class="delete-btn" onclick="deleteDish(${dish.id})">🗑️ Löschen</button>
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Add Dish
// ============================================
const addDishBtn = document.getElementById('addDishBtn');
if (addDishBtn) {
    addDishBtn.addEventListener('click', () => {
        const groupId = parseInt(document.getElementById('dishGroupSelect').value);
        const dishName = document.getElementById('dishName').value.trim();
        const dishImage = document.getElementById('dishImage').value.trim();
        const dishRecipe = document.getElementById('dishRecipe').value.trim();
        
        if (!groupId) {
            alert('Bitte wählen Sie eine Kategorie');
            return;
        }
        
        if (!dishName) {
            alert('Bitte geben Sie einen Gerichtenamen ein');
            return;
        }
        
        if (!dishRecipe) {
            alert('Bitte geben Sie das Rezept ein');
            return;
        }
        
        appData.dishes.push({
            id: nextDishId++,
            name: dishName,
            groupId: groupId,
            image: dishImage,
            recipe: dishRecipe
        });
        
        document.getElementById('dishName').value = '';
        document.getElementById('dishImage').value = '';
        document.getElementById('dishRecipe').value = '';
        
        saveData();
    });
}

// ============================================
// Edit Dish
// ============================================
let currentEditDishId = null;

window.editDish = function(id) {
    const dish = appData.dishes.find(d => d.id === id);
    if (!dish) return;
    
    currentEditDishId = id;
    
    const editCard = document.getElementById('editDishCard');
    const editGroupSelect = document.getElementById('editDishGroupSelect');
    const editNameInput = document.getElementById('editDishName');
    const editImageInput = document.getElementById('editDishImage');
    const editRecipeInput = document.getElementById('editDishRecipe');
    
    if (editCard && editGroupSelect && editNameInput && editImageInput && editRecipeInput) {
        editGroupSelect.value = dish.groupId;
        editNameInput.value = dish.name;
        editImageInput.value = dish.image || '';
        editRecipeInput.value = dish.recipe || '';
        editCard.style.display = 'block';
        editCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

const saveDishEditBtn = document.getElementById('saveDishEditBtn');
if (saveDishEditBtn) {
    saveDishEditBtn.addEventListener('click', () => {
        const newGroupId = parseInt(document.getElementById('editDishGroupSelect').value);
        const newName = document.getElementById('editDishName').value.trim();
        const newImage = document.getElementById('editDishImage').value.trim();
        const newRecipe = document.getElementById('editDishRecipe').value.trim();
        
        if (!newGroupId) {
            alert('Bitte wählen Sie eine Kategorie');
            return;
        }
        
        if (!newName) {
            alert('Bitte geben Sie einen Gerichtenamen ein');
            return;
        }
        
        if (!newRecipe) {
            alert('Bitte geben Sie das Rezept ein');
            return;
        }
        
        const dish = appData.dishes.find(d => d.id === currentEditDishId);
        if (dish) {
            dish.groupId = newGroupId;
            dish.name = newName;
            dish.image = newImage;
            dish.recipe = newRecipe;
            saveData();
        }
        
        document.getElementById('editDishCard').style.display = 'none';
        document.getElementById('editDishName').value = '';
        document.getElementById('editDishImage').value = '';
        document.getElementById('editDishRecipe').value = '';
        currentEditDishId = null;
    });
}

const cancelDishEditBtn = document.getElementById('cancelDishEditBtn');
if (cancelDishEditBtn) {
    cancelDishEditBtn.addEventListener('click', () => {
        document.getElementById('editDishCard').style.display = 'none';
        document.getElementById('editDishName').value = '';
        document.getElementById('editDishImage').value = '';
        document.getElementById('editDishRecipe').value = '';
        currentEditDishId = null;
    });
}

// ============================================
// Delete Dish
// ============================================
window.deleteDish = function(id) {
    const dish = appData.dishes.find(d => d.id === id);
    if (confirm(`Möchten Sie "${dish.name}" wirklich löschen?`)) {
        appData.dishes = appData.dishes.filter(d => d.id !== id);
        saveData();
        
        if (currentEditDishId === id) {
            document.getElementById('editDishCard').style.display = 'none';
            document.getElementById('editDishName').value = '';
            document.getElementById('editDishImage').value = '';
            document.getElementById('editDishRecipe').value = '';
            currentEditDishId = null;
        }
    }
};

// ============================================
// Initialize
// ============================================
updateGroupSelect();
updateEditGroupSelect();
renderDishesList();
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
