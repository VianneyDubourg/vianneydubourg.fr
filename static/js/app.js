/**
 * Main application JavaScript
 */
let map = null, markers = [], spotsData = [], articlesData = [];

// Load articles from API
async function loadArticles() {
    try {
        articlesData = await api.getArticles({ limit: 10 });
        renderArticles();
    } catch (error) {
        console.error('Error loading articles:', error);
        articlesData = [];
    }
}

// Render articles in the grid
function renderArticles() {
    const articlesGrid = document.querySelector('#view-home .grid');
    if (!articlesGrid || articlesData.length === 0) return;
    articlesGrid.innerHTML = articlesData.map(article => `
        <article class="group cursor-pointer">
            <div class="aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-200 relative mb-4">
                <img src="${article.cover_image || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}" 
                     alt="${article.title}" 
                     class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500">
                <div class="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold text-zinc-800">
                    ${article.category || 'Article'}
                </div>
            </div>
            <div class="flex items-center space-x-2 text-xs text-zinc-500 mb-2">
                <span>${new Date(article.published_at || article.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span class="w-1 h-1 bg-zinc-300 rounded-full"></span>
                <span>${article.reading_time} min de lecture</span>
            </div>
            <h3 class="text-lg font-semibold text-zinc-900 mb-2 leading-snug group-hover:text-zinc-600 transition-colors">
                ${article.title}
            </h3>
            <p class="text-sm text-zinc-500 line-clamp-2">${article.excerpt || ''}</p>
        </article>
    `).join('');
}

// Load spots from API
async function loadSpots() {
    try {
        spotsData = await api.getSpots({ limit: 100 });
        renderSpotsList();
        if (map) updateMapMarkers();
    } catch (error) {
        console.error('Error loading spots:', error);
        spotsData = [];
    }
}

// Render spots list in sidebar
function renderSpotsList() {
    const spotsContainer = document.querySelector('#view-spots .flex-1.overflow-y-auto');
    if (!spotsContainer) return;
    if (spotsData.length === 0) {
        spotsContainer.innerHTML = '<div class="p-4 text-center text-zinc-500 text-sm">Aucun spot disponible</div>';
        return;
    }
    spotsContainer.innerHTML = spotsData.map(spot => {
        const tags = spot.tags ? spot.tags.split(',') : [];
        return `<div class="bg-white p-3 rounded-lg border border-zinc-200 shadow-sm hover:border-zinc-300 transition cursor-pointer flex gap-3" 
                 onclick="focusSpot(${spot.id})">
            <div class="w-20 h-20 bg-zinc-200 rounded-md overflow-hidden flex-shrink-0">
                <img src="${spot.image_url || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}" 
                     class="w-full h-full object-cover">
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-start">
                    <h3 class="text-sm font-semibold text-zinc-900 truncate">${spot.name}</h3>
                    <span class="flex items-center text-xs font-medium text-amber-500">
                        ${spot.rating.toFixed(1)} <span class="iconify ml-0.5" data-icon="lucide:star" data-width="10"></span>
                    </span>
                </div>
                <p class="text-xs text-zinc-500 mt-1">${spot.location}</p>
                <div class="mt-2 flex items-center gap-2">
                    ${tags.map(tag => `<span class="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 text-[10px] font-medium border border-zinc-200">${tag.trim()}</span>`).join('')}
                </div>
            </div>
        </div>`;
    }).join('');
}

// Focus on a spot in the map
function focusSpot(spotId) {
    const spot = spotsData.find(s => s.id === spotId);
    if (spot && map) {
        map.setView([spot.latitude, spot.longitude], 10);
        const marker = markers.find(m => m._latlng.lat === spot.latitude && m._latlng.lng === spot.longitude);
        if (marker) marker.openPopup();
    }
}

// Router
const VIEWS = { 'home': 'view-home', 'spots': 'view-spots', 'admin': 'view-admin', 'guides': 'view-home' };

function switchTab(tab) {
    Object.values(VIEWS).forEach(id => document.getElementById(id)?.classList.add('hidden'));
    document.getElementById(VIEWS[tab])?.classList.remove('hidden');
    
    const footer = document.getElementById('footer-main');
    if (['spots', 'admin'].includes(tab)) footer?.classList.add('hidden');
    else footer?.classList.remove('hidden');
    
    if (tab === 'spots') {
        document.getElementById('view-spots')?.classList.add('flex');
        setTimeout(async () => {
            await initMap();
            if (map) setTimeout(() => map.invalidateSize(), 100);
        }, 100);
    } else {
        document.getElementById('view-spots')?.classList.remove('flex');
    }
    
    if (tab === 'admin') {
        loadAdminStats();
        loadAdminArticles();
    }
    window.scrollTo(0, 0);
}

// Load admin statistics
async function loadAdminStats() {
    try {
        const stats = await api.getAdminStats();
        const cards = document.querySelectorAll('#view-admin .bg-white.p-5');
        const trends = [stats.trend_views, stats.trend_spots, stats.trend_subscribers];
        if (cards.length >= 3) {
            [stats.total_views.toLocaleString(), stats.total_spots, stats.total_subscribers].forEach((v, i) => {
                cards[i].querySelector('.text-2xl').textContent = v;
                const trendEl = cards[i].querySelector('.text-emerald-600');
                if (trendEl) {
                    const trend = trends[i];
                    trendEl.innerHTML = `<span class="iconify mr-1" data-icon="lucide:${trend >= 0 ? 'trending-up' : 'trending-down'}" data-width="12"></span> ${Math.abs(trend)}%`;
                    trendEl.className = trend >= 0 ? 'text-emerald-600 font-medium flex items-center' : 'text-red-600 font-medium flex items-center';
                }
            });
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
    const newsletterForm = document.querySelector('#view-home form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            if (email) {
                try {
                    await api.subscribeNewsletter(email);
                    alert('Merci pour votre inscription !');
                    newsletterForm.querySelector('input[type="email"]').value = '';
                } catch (error) {
                    alert('Erreur lors de l\'inscription. Veuillez réessayer.');
                }
            }
        });
    }
});
