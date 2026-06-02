export interface User {
  id: number;
  central_id: string | null;
  full_name: string;
  employee_key?: string | null;
  initials?: string | null;
  email: string;
  role: string;
  is_active: number | boolean;
}
