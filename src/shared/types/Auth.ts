export interface User {
  id: number;
  central_id: string | null;
  full_name: string;
  email: string;
  role: string;
  is_active: number | boolean;
}