/**
 * Users admin page functionality
 */
let usersData = [], usersFilters = { skip: 0, limit: 20, search: '' };

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

async function loadUsers() {
    try {
        const params = new URLSearchParams();
        Object.entries(usersFilters).forEach(([k, v]) => v && params.append(k, v));
        usersData = await api.request(`/admin/users?${params.toString()}`);
        renderUsers();
    } catch (error) {
        // Error handled by handleApiError
    }
}

function renderUsers() {
    const container = document.getElementById('users-container');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-zinc-500">
                    <thead class="bg-zinc-50 text-xs uppercase text-zinc-400 font-medium">
                        <tr>
                            <th class="px-6 py-3 tracking-wider">Avatar</th>
                            <th class="px-6 py-3 tracking-wider">Username</th>
                            <th class="px-6 py-3 tracking-wider">Email</th>
                            <th class="px-6 py-3 tracking-wider">Nom</th>
                            <th class="px-6 py-3 tracking-wider">Rôle</th>
                            <th class="px-6 py-3 tracking-wider">Articles</th>
                            <th class="px-6 py-3 tracking-wider">Date</th>
                            <th class="px-6 py-3 tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        ${usersData.map(u => `
                            <tr class="hover:bg-zinc-50/50 transition">
                                <td class="px-6 py-4">
                                    <div class="h-10 w-10 rounded-full bg-zinc-300 flex items-center justify-center text-xs text-zinc-600 font-bold">
                                        ${(u.full_name || u.username).substring(0, 2).toUpperCase()}
                                    </div>
                                </td>
                                <td class="px-6 py-4 font-medium text-zinc-900">${u.username}</td>
                                <td class="px-6 py-4 text-xs">${u.email}</td>
                                <td class="px-6 py-4 text-xs">${u.full_name || '-'}</td>
                                <td class="px-6 py-4">
                                    ${u.is_admin ? '<span class="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-medium">Admin</span>' : '<span class="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600">User</span>'}
                                </td>
                                <td class="px-6 py-4 text-xs">${u.articles_count || 0}</td>
                                <td class="px-6 py-4 text-xs">${formatDate(u.created_at)}</td>
                                <td class="px-6 py-4 text-right">
                                    <button onclick="editUser(${u.id})" class="text-zinc-400 hover:text-zinc-900 transition mr-2">
                                        <span class="iconify" data-icon="lucide:edit-3" data-width="14"></span>
                                    </button>
                                    ${!u.is_admin ? `<button onclick="toggleUserAdmin(${u.id})" class="text-zinc-400 hover:text-blue-600 transition mr-2" title="Rendre admin">
                                        <span class="iconify" data-icon="lucide:shield" data-width="14"></span>
                                    </button>` : ''}
                                    <button onclick="deleteUser(${u.id})" class="text-zinc-400 hover:text-red-600 transition">
                                        <span class="iconify" data-icon="lucide:trash-2" data-width="14"></span>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function searchUsers() {
    usersFilters.search = document.getElementById('users-search').value;
    usersFilters.skip = 0;
    loadUsers();
}

async function editUser(id) {
    try {
        const user = await api.request(`/admin/users/${id}`);
        document.getElementById('user-username').value = user.username;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-fullname').value = user.full_name || '';
        document.getElementById('user-is-admin').checked = user.is_admin;
        currentEditUser = id;
        document.getElementById('user-modal').classList.remove('hidden');
    } catch (error) {
        // Error handled by handleApiError
    }
}

let currentEditUser = null;

async function saveUser() {
    if (!currentEditUser) return;
    try {
        await api.request(`/admin/users/${currentEditUser}`, {
            method: 'PUT',
            body: JSON.stringify({
                email: document.getElementById('user-email').value,
                full_name: document.getElementById('user-fullname').value
            })
        });
        showToast('Utilisateur modifié', 'success');
        await loadUsers();
        closeUserModal();
    } catch (error) {
        // Error handled by handleApiError
    }
}

function closeUserModal() {
    document.getElementById('user-modal')?.classList.add('hidden');
    currentEditUser = null;
}

async function toggleUserAdmin(id) {
    if (!confirm('Changer le rôle admin de cet utilisateur ?')) return;
    try {
        await api.request(`/admin/users/${id}/toggle-admin`, { method: 'POST' });
        showToast('Rôle modifié', 'success');
        await loadUsers();
    } catch (error) {
        // Error handled by handleApiError
    }
}

async function deleteUser(id) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
        await api.request(`/admin/users/${id}`, { method: 'DELETE' });
        showToast('Utilisateur supprimé', 'success');
        await loadUsers();
    } catch (error) {
        // Error handled by handleApiError
    }
}
