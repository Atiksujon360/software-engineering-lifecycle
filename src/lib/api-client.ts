/**
 * API client for backend integration
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json() as ApiError;
      throw new Error(error.detail || error.title);
    }

    return response.json();
  }

  async login(password: string): Promise<{ id: number }> {
    return this.request<{ id: number }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async logout(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    });
  }

  async me(): Promise<{ id: number }> {
    return this.request<{ id: number }>('/api/auth/me');
  }

  async getProjects(): Promise<any[]> {
    return this.request<any[]>('/api/projects');
  }

  async createProject(project: any): Promise<any> {
    return this.request<any>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async getProject(slug: string): Promise<any> {
    return this.request<any>(`/api/projects/${slug}`);
  }

  async updateProject(slug: string, project: any): Promise<any> {
    return this.request<any>(`/api/projects/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(project),
    });
  }

  async deleteProject(slug: string): Promise<void> {
    return this.request<void>(`/api/projects/${slug}`, {
      method: 'DELETE',
    });
  }

  async toggleTask(slug: string, taskId: string, checked: boolean): Promise<any> {
    return this.request<any>(`/api/projects/${slug}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ checked }),
    });
  }

  async updateNote(slug: string, phaseId: number, body: string): Promise<any> {
    return this.request<any>(`/api/projects/${slug}/notes/${phaseId}`, {
      method: 'PUT',
      body: JSON.stringify({ body }),
    });
  }

  async getProjectProgress(slug: string): Promise<any> {
    return this.request<any>(`/api/projects/${slug}/progress`);
  }

  async getProjectWithState(slug: string): Promise<any> {
    return this.request<any>(`/api/projects/${slug}/progress`);
  }

  async exportProject(slug: string): Promise<any> {
    return this.request<any>(`/api/projects/${slug}/export`);
  }

  async importProject(data: any): Promise<any> {
    return this.request<any>('/api/projects/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
