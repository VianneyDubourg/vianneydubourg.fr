/**
 * API client for LUMIÈRE backend
 */
const API_BASE_URL = 'http://localhost:8000/api';

class LumièreAPI {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
                throw new Error(error.detail || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Articles
    async getArticles(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.skip) queryParams.append('skip', params.skip);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.category) queryParams.append('category', params.category);
        
        const query = queryParams.toString();
        return this.request(`/articles/${query ? '?' + query : ''}`);
    }

    async getArticle(id) {
        return this.request(`/articles/${id}`);
    }

    async getArticleBySlug(slug) {
        return this.request(`/articles/slug/${slug}`);
    }

    async createArticle(article) {
        return this.request('/articles', {
            method: 'POST',
            body: JSON.stringify(article)
        });
    }

    async updateArticle(id, article) {
        return this.request(`/articles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(article)
        });
    }

    // Spots
    async getSpots(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.skip) queryParams.append('skip', params.skip);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.category) queryParams.append('category', params.category);
        if (params.search) queryParams.append('search', params.search);
        
        const query = queryParams.toString();
        return this.request(`/spots/${query ? '?' + query : ''}`);
    }

    async getSpot(id) {
        return this.request(`/spots/${id}`);
    }

    async createSpot(spot) {
        return this.request('/spots', {
            method: 'POST',
            body: JSON.stringify(spot)
        });
    }

    async updateSpot(id, spot) {
        return this.request(`/spots/${id}`, {
            method: 'PUT',
            body: JSON.stringify(spot)
        });
    }

    // Auth
    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        this.token = data.access_token;
        localStorage.setItem('auth_token', this.token);
        return data;
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    logout() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    // Newsletter
    async subscribeNewsletter(email) {
        return this.request('/auth/newsletter/subscribe', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    // Admin
    async getAdminStats() {
        return this.request('/admin/stats');
    }

    async getAllArticles() {
        return this.request('/admin/articles');
    }

    async getAllArticles() {
        return this.request('/admin/articles');
    }

    async getComments() {
        return this.request('/admin/comments');
    }
}

// Global API instance
const api = new LumièreAPI();
