/**
 * Admin dashboard functionality
 */
let adminArticles = [], adminFilters = { skip: 0, limit: 20 }, adminTotal = 0;

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
        const params = new URLSearchParams();
        Object.entries(adminFilters).forEach(([k, v]) => v && params.append(k, v));
        const data = await api.request(`/admin/articles?${params.toString()}`);
        adminArticles = data.items || [];
        adminTotal = data.total || 0;
        renderAdminArticles();
        updatePagination();
    } catch (error) {
        console.error('Error loading admin articles:', error);
    }
}

function applyFilters() {
    adminFilters.skip = 0;
    loadAdminArticles();
}

function showFilters() {
    const modal = document.getElementById('filters-modal');
    if (modal) {
        modal.classList.remove('hidden');
        if (adminFilters.status) document.getElementById('filter-status').value = adminFilters.status;
        if (adminFilters.category) document.getElementById('filter-category').value = adminFilters.category;
    }
}

function closeFilters() {
    document.getElementById('filters-modal')?.classList.add('hidden');
}

function renderAdminArticles() {
    const tbody = document.querySelector('#view-admin tbody');
    if (!tbody) return;
    tbody.innerHTML = adminArticles.map(a => {
        const authorName = a.author || a.author_name || 'Auteur';
        const authorInitials = a.author_initials || authorName.substring(0, 2).toUpperCase();
        return `
        <tr class="hover:bg-zinc-50/50 transition">
            <td class="px-6 py-4"><input type="checkbox" class="article-checkbox rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer" data-id="${a.id}" onchange="updateSelection()"></td>
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="h-8 w-8 rounded bg-zinc-200 mr-3 flex-shrink-0 overflow-hidden">
                        ${a.cover_image ? `<img src="${a.cover_image}" class="h-full w-full object-cover">` : `<div class="h-full w-full flex items-center justify-center text-[10px] text-zinc-600">${authorInitials}</div>`}
                    </div>
                    <span class="font-medium text-zinc-900 truncate max-w-[200px]">${a.title}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="h-5 w-5 rounded-full bg-zinc-300 mr-2 flex items-center justify-center text-[10px] text-zinc-600 font-bold">${authorInitials}</div>
                    <span>${authorName}</span>
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
    `;
    }).join('');).join('');
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
        showToast(`${selected.length} article(s) supprimé(s)`, 'success');
        await loadAdminArticles();
        updateSelection();
    } catch (error) {
        // Error handled by handleApiError
    }
}

let currentEditArticle = null;

async function editArticle(id) {
    try {
        const article = await api.getArticle(id);
        currentEditArticle = article;
        document.getElementById('edit-title').value = article.title;
        document.getElementById('edit-excerpt').value = article.excerpt || '';
        document.getElementById('edit-content').value = article.content || '';
        document.getElementById('edit-category').value = article.category || '';
        document.getElementById('edit-status').value = article.status;
        document.getElementById('edit-cover-image').value = article.cover_image || '';
        document.getElementById('edit-modal').classList.remove('hidden');
    } catch (error) {
        alert('Erreur lors du chargement de l\'article');
    }
}

function closeEditModal() {
    document.getElementById('edit-modal')?.classList.add('hidden');
    currentEditArticle = null;
    document.querySelector('#edit-modal h3').textContent = 'Éditer l\'article';
}

function exportArticles() {
    const csv = ['Titre,Auteur,Statut,Vues,Date'].concat(
        adminArticles.map(a => `"${a.title}","${a.author}","${a.status}",${a.views},"${a.created_at}"`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `articles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function createArticle() {
    currentEditArticle = null;
    document.getElementById('edit-title').value = '';
    document.getElementById('edit-excerpt').value = '';
    document.getElementById('edit-content').value = '';
    document.getElementById('edit-category').value = '';
    document.getElementById('edit-status').value = 'draft';
    document.getElementById('edit-cover-image').value = '';
    document.getElementById('edit-modal').classList.remove('hidden');
    document.querySelector('#edit-modal h3').textContent = 'Créer un article';
}

async function saveArticle() {
    const data = {
        title: document.getElementById('edit-title').value,
        excerpt: document.getElementById('edit-excerpt').value,
        content: document.getElementById('edit-content').value,
        category: document.getElementById('edit-category').value,
        status: document.getElementById('edit-status').value,
        cover_image: document.getElementById('edit-cover-image').value
    };
    try {
        if (currentEditArticle) {
            await api.updateArticle(currentEditArticle.id, data);
            showToast('Article modifié avec succès', 'success');
        } else {
            await api.createArticle(data);
            showToast('Article créé avec succès', 'success');
        }
        await loadAdminArticles();
        closeEditModal();
    } catch (error) {
        // Error handled by handleApiError
    }
}

function updatePagination() {
    const info = document.querySelector('#view-admin .px-6.py-4.border-t span');
    const prevBtn = document.querySelector('#view-admin .px-6.py-4.border-t button:first-of-type');
    const nextBtn = document.querySelector('#view-admin .px-6.py-4.border-t button:last-of-type');
    if (info) info.textContent = `Affichage ${adminFilters.skip + 1}-${Math.min(adminFilters.skip + adminFilters.limit, adminTotal)} de ${adminTotal} articles`;
    if (prevBtn) prevBtn.disabled = adminFilters.skip === 0;
    if (nextBtn) nextBtn.disabled = adminFilters.skip + adminFilters.limit >= adminTotal;
}

function changePage(direction) {
    if (direction === 'prev' && adminFilters.skip > 0) adminFilters.skip -= adminFilters.limit;
    else if (direction === 'next' && adminFilters.skip + adminFilters.limit < adminTotal) adminFilters.skip += adminFilters.limit;
    loadAdminArticles();
}

function switchAdminSection(section) {
    document.querySelectorAll('[id^="admin-section-"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(`admin-section-${section}`)?.classList.remove('hidden');
    document.querySelectorAll('#view-admin a').forEach(el => {
        el.classList.remove('bg-white', 'text-zinc-900', 'shadow-sm', 'border', 'border-zinc-200');
        el.classList.add('text-zinc-500');
    });
    const activeLink = event?.target?.closest('a') || document.querySelector(`#view-admin a[onclick*="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('bg-white', 'text-zinc-900', 'shadow-sm', 'border', 'border-zinc-200');
        activeLink.classList.remove('text-zinc-500');
    }
    if (section === 'overview') loadAdminArticles();
    else if (section === 'articles') loadArticlesList();
    else if (section === 'spots') loadSpotsList();
    else if (section === 'comments') loadComments();
    else if (section === 'users') loadUsers();
}
