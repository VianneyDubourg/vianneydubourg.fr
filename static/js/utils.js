/**
 * Utility functions for notifications and loading states
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
        type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showLoading(element) {
    if (element) {
        element.disabled = true;
        element.innerHTML = '<span class="iconify animate-spin" data-icon="lucide:loader-2" data-width="16"></span>';
    }
}

function hideLoading(element, originalText) {
    if (element) {
        element.disabled = false;
        element.innerHTML = originalText;
    }
}

function handleApiError(error) {
    const message = error.message || 'Une erreur est survenue';
    showToast(message, 'error');
    console.error('API Error:', error);
}
