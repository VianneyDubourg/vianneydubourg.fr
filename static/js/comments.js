/**
 * Comments moderation functionality
 */
let commentsData = [];

async function loadComments() {
    try {
        commentsData = await api.request('/admin/comments');
        renderComments();
        updateCommentsBadge();
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

function renderComments() {
    const container = document.getElementById('comments-container');
    if (!container) return;
    const pending = commentsData.filter(c => !c.is_approved);
    container.innerHTML = `
        <div class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-zinc-200 bg-zinc-50/30">
                <h3 class="text-sm font-semibold text-zinc-900">Commentaires en attente (${pending.length})</h3>
            </div>
            <div class="divide-y divide-zinc-100">
                ${pending.map(c => `
                    <div class="p-4 hover:bg-zinc-50/50 transition">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-sm font-medium text-zinc-900">${c.author}</span>
                                    <span class="text-xs text-zinc-500">sur</span>
                                    <a href="#" class="text-xs text-blue-600 hover:underline">${c.article_title}</a>
                                </div>
                                <p class="text-sm text-zinc-600 mb-2">${c.content}</p>
                                <span class="text-xs text-zinc-400">${new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div class="flex gap-2 ml-4">
                                <button onclick="approveComment(${c.id})" class="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700">Approuver</button>
                                <button onclick="deleteComment(${c.id})" class="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700">Supprimer</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

async function approveComment(id) {
    try {
        await api.request(`/admin/comments/${id}/approve`, { method: 'POST' });
        await loadComments();
    } catch (error) {
        alert('Erreur lors de l\'approbation');
    }
}

async function deleteComment(id) {
    if (!confirm('Supprimer ce commentaire ?')) return;
    try {
        await api.request(`/admin/comments/${id}`, { method: 'DELETE' });
        await loadComments();
    } catch (error) {
        alert('Erreur lors de la suppression');
    }
}

function updateCommentsBadge() {
    const pending = commentsData.filter(c => !c.is_approved).length;
    const badge = document.getElementById('comments-badge');
    if (badge) badge.textContent = pending;
}
