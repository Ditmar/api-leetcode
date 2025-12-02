export interface Test {
  id: string;
  name: string;
  description: string;
  companyId: string | null;
  difficulty: string;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: {
    id: string;
    name: string;
    logo: string | null;
  } | null;
  questions?: Array<{
    id: string;
    type: string;
    difficulty: string;
    points?: number;
  }>;
}
