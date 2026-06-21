export interface Technique {
  id: string;
  userId: string;
  name: string;
  group: string;
  description?: string;
  progress: number; // Progress percent from 0 to 100
  videoUrl?: string;
  testedInSparring: boolean;
  createdAt: string; // ISO date string saved securely
  updatedAt: string; // ISO date string
}

export type TechniqueGroup =
  | 'Guarda Fechada & Aberta'
  | 'Passagem de Guarda'
  | 'Raspagens (Sweeps)'
  | 'Finalizações (Submissions)'
  | 'Quedas & Projeções (Takedowns)'
  | 'Defesas & Escapes (Escapes)'
  | 'Controles & Posições (Positions)'
  | 'Outros';

export const DEFAULT_GROUPS: TechniqueGroup[] = [
  'Guarda Fechada & Aberta',
  'Passagem de Guarda',
  'Raspagens (Sweeps)',
  'Finalizações (Submissions)',
  'Quedas & Projeções (Takedowns)',
  'Defesas & Escapes (Escapes)',
  'Controles & Posições (Positions)',
  'Outros'
];

export type OperationType = 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
