// API Client for Cortex Arsenal Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        const defaultHeaders = {
            'Content-Type': 'application/json',
            // TODO: Add Authorization header with JWT token
        };

        const config: RequestInit = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Request failed' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Submissions API
    submissions = {
        getAll: (status?: string) => {
            const query = status ? `?status=${encodeURIComponent(status)}` : '';
            return this.request(`/submissions${query}`);
        },

        approve: (id: string, publishImmediately: boolean = true) => {
            return this.request(`/submissions/${id}/approve`, {
                method: 'POST',
                body: JSON.stringify({ publish_immediately: publishImmediately }),
            });
        },

        reject: (id: string, reason: string, notes?: string) => {
            return this.request(`/submissions/${id}/reject`, {
                method: 'POST',
                body: JSON.stringify({ reason, notes }),
            });
        },

        requestChanges: (id: string, notes: string) => {
            return this.request(`/submissions/${id}/request-changes`, {
                method: 'POST',
                body: JSON.stringify({ notes }),
            });
        },
    };

    // Admin API
    admin = {
        nominateForIncubation: (projectId: string, target: string, notes?: string) => {
            return this.request('/admin/incubation/nominate', {
                method: 'POST',
                body: JSON.stringify({ project_id: projectId, target, notes }),
            });
        },

        updateIncubation: (id: string, updates: { status?: string; maturity_score?: number; notes?: string }) => {
            return this.request(`/admin/incubation/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(updates),
            });
        },

        getIncubationProjects: () => {
            return this.request('/admin/incubation');
        },

        getAuditLog: (limit: number = 50, offset: number = 0) => {
            return this.request(`/admin/audit?limit=${limit}&offset=${offset}`);
        },
    };

    // Projects API
    projects = {
        getAll: (filters?: { product?: string; theatre?: string; status?: string; search?: string }) => {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value);
                });
            }
            const query = params.toString() ? `?${params}` : '';
            return this.request(`/projects${query}`);
        },

        getById: (id: string) => {
            return this.request(`/projects/${id}`);
        },

        create: (projectData: any) => {
            return this.request('/projects', {
                method: 'POST',
                body: JSON.stringify(projectData),
            });
        },
    };

    // Users API
    users = {
        getAll: () => {
            return this.request('/users');
        },

        getById: (id: string) => {
            return this.request(`/users/${id}`);
        },
    };
}

// Export singleton instance
export const api = new ApiClient();
export default api;
