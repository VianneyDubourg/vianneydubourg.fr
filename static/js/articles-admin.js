/**
 * Articles admin page functionality
 */
let articlesListData = [], articlesFilters = { skip: 0, limit: 20, search: '' }, articlesTotal = 0;

async function loadArticlesList() {
    try {
        const params = new URLSearchParams();
        Object.entries(articlesFilters).forEach(([k, v]) => v && params.append(k, v));
        const data = await api.request(`/admin/articles?${params.toString()}`);
        articlesListData = data.items || [];
        articlesTotal = data.total || 0;
        renderArticlesList();
        updateArticlesPagination();
    } catch (error) {
        // Error handled by handleApiError
    }
}

function renderArticlesList() {
    const container = document.getElementById('articles-list-container');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-zinc-500">
                    <thead class="bg-zinc-50 text-xs uppercase text-zinc-400 font-medium">
                        <tr>
                            <th class="px-6 py-3 tracking-wider w-8"><input type="checkbox" class="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer" onchange="toggleAllArticles(this)"></th>
                            <th class="px-6 py-3 tracking-wider cursor-pointer" onclick="sortArticles('title')">Titre <span class="iconify" data-icon="lucide:arrow-up-down" data-width="12"></span></th>
                            <th class="px-6 py-3 tracking-wider">Auteur</th>
                            <th class="px-6 py-3 tracking-wider cursor-pointer" onclick="sortArticles('status')">Statut</th>
                            <th class="px-6 py-3 tracking-wider cursor-pointer" onclick="sortArticles('views')">Vues</th>
                            <th class="px-6 py-3 tracking-wider cursor-pointer" onclick="sortArticles('created_at')">Date</th>
                            <th class="px-6 py-3 tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        ${articlesListData.map(a => `
                            <tr class="hover:bg-zinc-50/50 transition">
                                <td class="px-6 py-4"><input type="checkbox" class="article-list-checkbox rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer" data-id="${a.id}" onchange="updateArticlesSelection()"></td>
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
                                <td class="px-6 py-4 text-xs">${a.views}</td>
                                <td class="px-6 py-4 text-xs">${formatDate(a.created_at)}</td>
                                <td class="px-6 py-4 text-right">
                                    <button onclick="editArticle(${a.id})" class="text-zinc-400 hover:text-zinc-900 transition mr-2">
                                        <span class="iconify" data-icon="lucide:edit-3" data-width="14"></span>
                                    </button>
                                    <button onclick="deleteArticle(${a.id})" class="text-zinc-400 hover:text-red-600 transition">
                                        <span class="iconify" data-icon="lucide:trash-2" data-width="14"></span>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <span class="text-xs text-zinc-500">Affichage ${articlesFilters.skip + 1}-${Math.min(articlesFilters.skip + articlesFilters.limit, articlesTotal)} de ${articlesTotal} articles</span>
                <div class="flex space-x-1">
                    <button onclick="changeArticlesPage('prev')" class="px-2 py-1 border border-zinc-200 rounded bg-white text-zinc-400 hover:text-zinc-900 text-xs disabled:opacity-50" ${articlesFilters.skip === 0 ? 'disabled' : ''}>Préc.</button>
                    <button onclick="changeArticlesPage('next')" class="px-2 py-1 border border-zinc-200 rounded bg-white text-zinc-600 hover:text-zinc-900 text-xs" ${articlesFilters.skip + articlesFilters.limit >= articlesTotal ? 'disabled' : ''}>Suiv.</button>
                </div>
            </div>
        </div>
    `;
}

function searchArticles() {
    articlesFilters.search = document.getElementById('articles-search').value;
    articlesFilters.skip = 0;
    loadArticlesList();
}

function sortArticles(field) {
    // Simple client-side sort for demo
    articlesListData.sort((a, b) => {
        if (field === 'title') return a.title.localeCompare(b.title);
        if (field === 'views') return b.views - a.views;
        if (field === 'created_at') return new Date(b.created_at) - new Date(a.created_at);
        return 0;
    });
    renderArticlesList();
}

function toggleAllArticles(checkbox) {
    document.querySelectorAll('.article-list-checkbox').forEach(cb => cb.checked = checkbox.checked);
    updateArticlesSelection();
}

function updateArticlesSelection() {
    const selected = Array.from(document.querySelectorAll('.article-list-checkbox:checked')).map(cb => parseInt(cb.dataset.id));
    // Could add bulk actions bar here if needed
}

function updateArticlesPagination() {
    const info = document.querySelector('#admin-section-articles .px-6.py-4.border-t span');
    const prevBtn = document.querySelector('#admin-section-articles .px-6.py-4.border-t button:first-of-type');
    const nextBtn = document.querySelector('#admin-section-articles .px-6.py-4.border-t button:last-of-type');
    if (info) info.textContent = `Affichage ${articlesFilters.skip + 1}-${Math.min(articlesFilters.skip + articlesFilters.limit, articlesTotal)} de ${articlesTotal} articles`;
    if (prevBtn) prevBtn.disabled = articlesFilters.skip === 0;
    if (nextBtn) nextBtn.disabled = articlesFilters.skip + articlesFilters.limit >= articlesTotal;
}

function changeArticlesPage(direction) {
    if (direction === 'prev' && articlesFilters.skip > 0) articlesFilters.skip -= articlesFilters.limit;
    else if (direction === 'next' && articlesFilters.skip + articlesFilters.limit < articlesTotal) articlesFilters.skip += articlesFilters.limit;
    loadArticlesList();
}

async function deleteArticle(id) {
    if (!confirm('Supprimer cet article ?')) return;
    try {
        await api.request(`/articles/${id}`, { method: 'DELETE' });
        showToast('Article supprimé', 'success');
        await loadArticlesList();
    } catch (error) {
        // Error handled by handleApiError
    }
}
