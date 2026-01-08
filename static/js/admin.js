/**
 * Admin dashboard functionality
 */
let adminArticles = [];

const STATUS_COLORS = {
    'published': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'draft': 'bg-zinc-50 text-zinc-700 border-zinc-100',
    'review': 'bg-amber-50 text-amber-700 border-amber-100'
};

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    const today = new Date();
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Aujourd\'hui';
    if (diff === 1) return 'Hier';
    if (diff < 7) return `Il y a ${diff} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function loadAdminArticles() {
    try {
        adminArticles = await api.getAllArticles();
        renderAdminArticles();
    } catch (error) {
        console.error('Error loading admin articles:', error);
    }
}

function renderAdminArticles() {
    const tbody = document.querySelector('#view-admin tbody');
    if (!tbody) return;
    tbody.innerHTML = adminArticles.map(a => `
        <tr class="hover:bg-zinc-50/50 transition">
            <td class="px-6 py-4"><input type="checkbox" class="article-checkbox rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer" data-id="${a.id}" onchange="updateSelection()"></td>
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded bg-zinc-200 mr-3 flex-shrink-0 overflow-hidden">
                        ${a.cover_image ? `<img src="${a.cover_image}" class="h-full w-full object-cover">` : `<div class="h-full w-full flex items-center justify-center text-[10px] text-zinc-600">${a.author_initials}</div>`}
                    </div>
                    <span class="font-medium text-zinc-900 truncate max-w-[200px]">${a.title}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="h-5 w-5 rounded-full bg-zinc-300 mr-2 flex items-center justify-center text-[10px] text-zinc-600 font-bold">${a.author_initials}</div>
                    <span>${a.author}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[a.status] || STATUS_COLORS.draft}">
                    ${a.status === 'published' ? 'Publié' : a.status === 'review' ? 'Relecture' : 'Brouillon'}
                </span>
            </td>
            <td class="px-6 py-4 text-xs">${formatDate(a.created_at)}</td>
            <td class="px-6 py-4 text-right">
                <button class="text-zinc-400 hover:text-zinc-900 transition" onclick="editArticle(${a.id})">
                    <span class="iconify" data-icon="lucide:edit-3" data-width="14"></span>
                </button>
            </td>
        </tr>
    `).join('');
    const headerCheckbox = document.querySelector('#view-admin thead input[type="checkbox"]');
    if (headerCheckbox) headerCheckbox.onchange = (e) => {
        document.querySelectorAll('.article-checkbox').forEach(cb => cb.checked = e.target.checked);
        updateSelection();
    };
}

function updateSelection() {
    const selected = Array.from(document.querySelectorAll('.article-checkbox:checked')).map(cb => parseInt(cb.dataset.id));
    const bar = document.getElementById('bulk-actions-bar');
    if (selected.length > 0) {
        if (!bar) {
            const table = document.querySelector('#view-admin .bg-white.border');
            if (table) {
                table.insertAdjacentHTML('afterbegin', `
                    <div id="bulk-actions-bar" class="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
                        <span class="text-sm text-blue-900 font-medium">${selected.length} article(s) sélectionné(s)</span>
                        <button onclick="bulkDeleteArticles()" class="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700">
                            Supprimer
                        </button>
                    </div>
                `);
            }
        } else {
            bar.querySelector('span').textContent = `${selected.length} article(s) sélectionné(s)`;
        }
    } else if (bar) bar.remove();
}

async function bulkDeleteArticles() {
    const selected = Array.from(document.querySelectorAll('.article-checkbox:checked')).map(cb => parseInt(cb.dataset.id));
    if (!selected.length || !confirm(`Supprimer ${selected.length} article(s) ?`)) return;
    try {
        await api.bulkDeleteArticles(selected);
        await loadAdminArticles();
        updateSelection();
    } catch (error) {
        alert('Erreur lors de la suppression');
    }
}

function editArticle(id) {
    console.log('Edit article:', id);
    // TODO: Implement edit modal
}
