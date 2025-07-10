import {
  type LoginRequest,
  type RegisterRequest,
  type AuthResponse,
  type User,
} from "../types/auth";
import {
  type StudentProfile,
  type Goal,
  type Skill,
  type Interest,
  type CreateGoalRequest,
  type CreateSkillRequest,
  type CreateInterestRequest,
  type UpdateProfileRequest,
  type UploadedFile,
} from "../types/profile";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Important for session cookies
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>("/auth/me");
  }

  async changePassword(passwords: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwords),
    });
  }

  // Profile endpoints
  async getProfile(): Promise<{
    profile: StudentProfile;
    goals: Goal[];
    skills: Skill[];
    interests: Interest[];
  }> {
    return this.request<{
      profile: StudentProfile;
      goals: Goal[];
      skills: Skill[];
      interests: Interest[];
    }>('/student/profile');
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{
    message: string;
    profile: StudentProfile;
  }> {
    return this.request<{
      message: string;
      profile: StudentProfile;
    }>('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addGoal(data: CreateGoalRequest): Promise<{
    message: string;
    goal: Goal;
  }> {
    return this.request<{
      message: string;
      goal: Goal;
    }>('/student/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: number, data: Partial<Goal>): Promise<{
    message: string;
    goal: Goal;
  }> {
    return this.request<{
      message: string;
      goal: Goal;
    }>(`/student/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/student/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async addSkill(data: CreateSkillRequest): Promise<{
    message: string;
    skill: Skill;
  }> {
    return this.request<{
      message: string;
      skill: Skill;
    }>('/student/skills', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSkill(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/student/skills/${id}`, {
      method: 'DELETE',
    });
  }

  async addInterest(data: CreateInterestRequest): Promise<{
    message: string;
    interest: Interest;
  }> {
    return this.request<{
      message: string;
      interest: Interest;
    }>('/student/interests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteInterest(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/student/interests/${id}`, {
      method: 'DELETE',
    });
  }

  // File endpoints
  async uploadResume(file: File): Promise<{
    message: string;
    file: UploadedFile;
  }> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/files/upload/resume`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  }

  async getResumes(): Promise<{
    files: UploadedFile[];
  }> {
    return this.request<{
      files: UploadedFile[];
    }>('/files/resumes');
  }

  async downloadFile(fileId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Download failed');
    }

    return response.blob();
  }

  async deleteFile(fileId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async setPrimaryResume(fileId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/files/${fileId}/primary`, {
      method: 'PUT',
    });
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    database: string;
  }> {
    const url = "http://localhost:3001/health";
    const response = await fetch(url);
    return response.json();
  }
}

export const apiService = new ApiService();
export default apiService;
