/**
 * Map functionality
 */
const MAP_CONFIG = {
    center: [45.0, 10.0],
    zoom: 3,
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};

async function initMap() {
    if (map) return;
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView(MAP_CONFIG.center, MAP_CONFIG.zoom);
    L.tileLayer(MAP_CONFIG.tileUrl, { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    await loadSpots();
    updateMapMarkers();
}

function updateMapMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
    if (spotsData.length === 0) return;
    
    spotsData.forEach(spot => {
        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="width:32px;height:32px;border-radius:50%;background:#18181b;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                </svg>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16]
        });
        
        const tags = spot.tags ? spot.tags.split(',').map(t => t.trim()) : [];
        const popupContent = `<div style="min-width:200px;font-family:'Inter',sans-serif">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <h3 style="margin:0;font-size:14px;font-weight:600;color:#18181b">${spot.name}</h3>
                <span style="display:flex;align-items:center;gap:2px;color:#f59e0b;font-size:12px;font-weight:500">
                    ${(spot.rating || 0).toFixed(1)} 
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </span>
            </div>
            <p style="margin:0 0 8px 0;font-size:12px;color:#71717a">${spot.location}</p>
            <div style="display:flex;gap:4px;flex-wrap:wrap">
                ${tags.map(tag => `<span style="padding:2px 6px;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:4px;font-size:10px;color:#71717a;font-weight:500">${tag}</span>`).join('')}
            </div>
        </div>`;
        
        if (spot.latitude && spot.longitude) {
            const marker = L.marker([spot.latitude, spot.longitude], { icon: customIcon })
                .addTo(map).bindPopup(popupContent);
            markers.push(marker);
        }
    });
    
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.3));
    }
}
