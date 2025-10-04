import { Request } from 'express';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'customer' | 'technician' | 'trainee' | 'admin';
  credential_code?: string;
  is_active: boolean;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface Machine {
  id: string;
  serial_number: string;
  model: string;
  installation_date?: Date;
  location?: string;
  customer_id?: string;
  status: string;
}

export interface ServiceTicket {
  id: string;
  ticket_number: string;
  machine_id: string;
  created_by: string;
  assigned_to?: string;
  title: string;
  description?: string;
  error_code?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution?: string;
  created_at: Date;
  resolved_at?: Date;
}

export interface KBEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  error_codes?: string[];
  tags?: string[];
  created_by: string;
  requires_credential: boolean;
  credential_level?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description?: string;
  type: 'operator' | 'technician';
  content?: string;
  video_url?: string;
  duration_minutes?: number;
  order_index?: number;
}

export interface ProductionMetric {
  id: string;
  machine_id: string;
  metric_type: string;
  metric_value: number;
  unit?: string;
  recorded_at: Date;
  shift?: string;
}
