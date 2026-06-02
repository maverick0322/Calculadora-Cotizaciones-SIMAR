export interface WorkerData {
  rfc: string;
  firstName: string;
  lastName: string;
  maternalLastName?: string;
  fullName?: string;
  employeeId: string;
  employeeKey: string;
  initials: string;
  address?: string;
  email: string;
  password?: string;
  superUserKey?: string;
  role: 'admin' | 'sales';
  isActive?: boolean;
}

export interface WorkerSummary {
  id: number;
  rfc: string;
  fullName: string;
  employeeId: string;
  employeeKey: string;
  initials: string;
  email: string;
  role: 'admin' | 'sales';
  isActive: boolean;
}
