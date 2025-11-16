export interface Test {
  id: string;
  name: string;
  description: string;
  companyId: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
