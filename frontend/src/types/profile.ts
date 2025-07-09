export interface StudentProfile {
  id: number;
  userId: number;
  student_id?: string;
  year_level?: string;
  major?: string;
  bio?: string;
  profilePhotoId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: number;
  studentProfileId: number;
  type: "short_term" | "long_term" | "academic" | "personal";
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  targetDate?: string;
  status: "active" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: number;
  studentProfileId: number;
  category: "technical" | "soft" | "language" | "tools";
  name: string;
  proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  isVerified: boolean;
  acquiredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interest {
  id: number;
  studentProfileId: number;
  category: "academic" | "extracurricular" | "hobby" | "industry";
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreateGoalRequest {
  type: "short_term" | "long_term" | "academic" | "personal";
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  targetDate?: string;
}

export interface CreateSkillRequest {
  category: "technical" | "soft" | "language" | "tools";
  name: string;
  proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  acquiredDate?: string;
}

export interface CreateInterestRequest {
  category: "academic" | "extracurricular" | "hobby" | "industry";
  name: string;
  description?: string;
}

export interface UpdateProfileRequest {
  student_id?: string;
  year_level?: string;
  major?: string;
  bio?: string;
}
