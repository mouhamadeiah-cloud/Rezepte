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

let nextGroupId = appData.groups.length > 0 ? Math.max(...appData.groups.map(g => g.id)) + 1 : 1;

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
    renderGroupsList();
}

// ============================================
// Render Groups List
// ============================================
function renderGroupsList() {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    if (!appData.groups.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">📭</div>
                <p>Keine Gruppen vorhanden</p>
                <small>Fügen Sie Ihre erste Gruppe hinzu</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appData.groups.map(group => {
        const dishCount = appData.dishes.filter(d => d.groupId === group.id).length;
        return `
            <div class="item" data-id="${group.id}">
                <div class="item-info">
                    <strong>${escapeHtml(group.name)}</strong>
                    <small>${dishCount} Rezept${dishCount !== 1 ? 'e' : ''} in dieser Gruppe</small>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" onclick="editGroup(${group.id})">✏️ Bearbeiten</button>
                    <button class="delete-btn" onclick="deleteGroup(${group.id})">🗑️ Löschen</button>
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
// Add Group
// ============================================
const addGroupBtn = document.getElementById('addGroupBtn');
if (addGroupBtn) {
    addGroupBtn.addEventListener('click', () => {
        const groupName = document.getElementById('groupName').value.trim();
        if (!groupName) {
            alert('Bitte geben Sie einen Gruppennamen ein');
            return;
        }
        
        appData.groups.push({
            id: nextGroupId++,
            name: groupName
        });
        
        document.getElementById('groupName').value = '';
        saveData();
    });
}

// ============================================
// Edit Group
// ============================================
let currentEditGroupId = null;

window.editGroup = function(id) {
    const group = appData.groups.find(g => g.id === id);
    if (!group) return;
    
    currentEditGroupId = id;
    
    const editCard = document.getElementById('editGroupCard');
    const editNameInput = document.getElementById('editGroupName');
    
    if (editCard && editNameInput) {
        editNameInput.value = group.name;
        editCard.style.display = 'block';
        editCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

const saveGroupEditBtn = document.getElementById('saveGroupEditBtn');
if (saveGroupEditBtn) {
    saveGroupEditBtn.addEventListener('click', () => {
        const newName = document.getElementById('editGroupName').value.trim();
        
        if (!newName) {
            alert('Bitte geben Sie einen Gruppennamen ein');
            return;
        }
        
        const group = appData.groups.find(g => g.id === currentEditGroupId);
        if (group) {
            group.name = newName;
            saveData();
        }
        
        document.getElementById('editGroupCard').style.display = 'none';
        document.getElementById('editGroupName').value = '';
        currentEditGroupId = null;
    });
}

const cancelGroupEditBtn = document.getElementById('cancelGroupEditBtn');
if (cancelGroupEditBtn) {
    cancelGroupEditBtn.addEventListener('click', () => {
        document.getElementById('editGroupCard').style.display = 'none';
        document.getElementById('editGroupName').value = '';
        currentEditGroupId = null;
    });
}

// ============================================
// Delete Group
// ============================================
window.deleteGroup = function(id) {
    const group = appData.groups.find(g => g.id === id);
    const dishCount = appData.dishes.filter(d => d.groupId === id).length;
    
    let message = `Möchten Sie die Gruppe "${group.name}" wirklich löschen?`;
    if (dishCount > 0) {
        message = `Die Gruppe "${group.name}" enthält ${dishCount} Rezept(e). Möchten Sie die Gruppe UND alle zugehörigen Rezepte löschen?`;
    }
    
    if (confirm(message)) {
        appData.groups = appData.groups.filter(g => g.id !== id);
        appData.dishes = appData.dishes.filter(d => d.groupId !== id);
        saveData();
        
        if (currentEditGroupId === id) {
            document.getElementById('editGroupCard').style.display = 'none';
            document.getElementById('editGroupName').value = '';
            currentEditGroupId = null;
        }
    }
};

// ============================================
// Initialize
// ============================================
renderGroupsList();