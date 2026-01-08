/**
 * Spots admin page functionality
 */
let spotsListData = [], spotsFilters = { skip: 0, limit: 20, search: '' }, spotsTotal = 0, currentEditSpot = null;

async function loadSpotsList() {
    try {
        const params = new URLSearchParams();
        Object.entries(spotsFilters).forEach(([k, v]) => v && params.append(k, v));
        const data = await api.getSpots(Object.fromEntries(params));
        spotsListData = Array.isArray(data) ? data : [];
        spotsTotal = spotsListData.length;
        renderSpotsList();
    } catch (error) {
        // Error handled by handleApiError
    }
}

function renderSpotsList() {
    const container = document.getElementById('spots-list-container');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-zinc-500">
                    <thead class="bg-zinc-50 text-xs uppercase text-zinc-400 font-medium">
                        <tr>
                            <th class="px-6 py-3 tracking-wider w-8"><input type="checkbox" class="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer" onchange="toggleAllSpots(this)"></th>
                            <th class="px-6 py-3 tracking-wider">Image</th>
                            <th class="px-6 py-3 tracking-wider">Nom</th>
                            <th class="px-6 py-3 tracking-wider">Localisation</th>
                            <th class="px-6 py-3 tracking-wider">Coordonnées</th>
                            <th class="px-6 py-3 tracking-wider">Catégorie</th>
                            <th class="px-6 py-3 tracking-wider">Note</th>
                            <th class="px-6 py-3 tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                        ${spotsListData.map(s => `
                            <tr class="hover:bg-zinc-50/50 transition">
                                <td class="px-6 py-4"><input type="checkbox" class="spot-checkbox rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer" data-id="${s.id}" onchange="updateSpotsSelection()"></td>
                                <td class="px-6 py-4">
                                    <div class="h-12 w-12 rounded bg-zinc-200 overflow-hidden">
                                        ${s.image_url ? `<img src="${s.image_url}" class="h-full w-full object-cover">` : '<div class="h-full w-full flex items-center justify-center text-[10px] text-zinc-600">N/A</div>'}
                                    </div>
                                </td>
                                <td class="px-6 py-4 font-medium text-zinc-900">${s.name}</td>
                                <td class="px-6 py-4 text-xs">${s.location}</td>
                                <td class="px-6 py-4 text-xs text-zinc-400">${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-600">${s.category || 'N/A'}</span>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="flex items-center text-xs text-amber-500">
                                        ${s.rating.toFixed(1)} <span class="iconify ml-0.5" data-icon="lucide:star" data-width="10"></span>
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button onclick="editSpot(${s.id})" class="text-zinc-400 hover:text-zinc-900 transition mr-2">
                                        <span class="iconify" data-icon="lucide:edit-3" data-width="14"></span>
                                    </button>
                                    <button onclick="deleteSpot(${s.id})" class="text-zinc-400 hover:text-red-600 transition">
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

function searchSpots() {
    spotsFilters.search = document.getElementById('spots-search').value;
    spotsFilters.skip = 0;
    loadSpotsList();
}

function toggleAllSpots(checkbox) {
    document.querySelectorAll('.spot-checkbox').forEach(cb => cb.checked = checkbox.checked);
    updateSpotsSelection();
}

function updateSpotsSelection() {
    const selected = Array.from(document.querySelectorAll('.spot-checkbox:checked')).map(cb => parseInt(cb.dataset.id));
}

async function deleteSpot(id) {
    if (!confirm('Supprimer ce spot ?')) return;
    try {
        await api.request(`/spots/${id}`, { method: 'DELETE' });
        showToast('Spot supprimé', 'success');
        await loadSpotsList();
    } catch (error) {
        // Error handled by handleApiError
    }
}

function createSpot() {
    currentEditSpot = null;
    document.getElementById('spot-name').value = '';
    document.getElementById('spot-location').value = '';
    document.getElementById('spot-lat').value = '';
    document.getElementById('spot-lng').value = '';
    document.getElementById('spot-category').value = '';
    document.getElementById('spot-rating').value = '0';
    document.getElementById('spot-tags').value = '';
    document.getElementById('spot-image').value = '';
    document.getElementById('spot-modal').classList.remove('hidden');
    document.querySelector('#spot-modal h3').textContent = 'Créer un spot';
}

async function editSpot(id) {
    try {
        const spot = await api.getSpot(id);
        currentEditSpot = spot;
        document.getElementById('spot-name').value = spot.name;
        document.getElementById('spot-location').value = spot.location;
        document.getElementById('spot-lat').value = spot.latitude;
        document.getElementById('spot-lng').value = spot.longitude;
        document.getElementById('spot-category').value = spot.category || '';
        document.getElementById('spot-rating').value = spot.rating;
        document.getElementById('spot-tags').value = spot.tags || '';
        document.getElementById('spot-image').value = spot.image_url || '';
        document.getElementById('spot-modal').classList.remove('hidden');
        document.querySelector('#spot-modal h3').textContent = 'Éditer le spot';
    } catch (error) {
        // Error handled by handleApiError
    }
}

async function saveSpot() {
    const data = {
        name: document.getElementById('spot-name').value,
        location: document.getElementById('spot-location').value,
        latitude: parseFloat(document.getElementById('spot-lat').value),
        longitude: parseFloat(document.getElementById('spot-lng').value),
        category: document.getElementById('spot-category').value,
        rating: parseFloat(document.getElementById('spot-rating').value),
        tags: document.getElementById('spot-tags').value,
        image_url: document.getElementById('spot-image').value
    };
    try {
        if (currentEditSpot) {
            await api.updateSpot(currentEditSpot.id, data);
        } else {
            await api.createSpot(data);
        }
        showToast(currentEditSpot ? 'Spot modifié' : 'Spot créé', 'success');
        await loadSpotsList();
        closeSpotModal();
    } catch (error) {
        // Error handled by handleApiError
    }
}

function closeSpotModal() {
    document.getElementById('spot-modal')?.classList.add('hidden');
    currentEditSpot = null;
    document.querySelector('#spot-modal h3').textContent = 'Créer un spot';
}
