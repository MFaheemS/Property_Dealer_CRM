export type UserRole = "admin" | "agent";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "negotiation"
  | "closed"
  | "lost";

export type LeadPriority = "high" | "medium" | "low";

export type PropertyInterest =
  | "Residential Plot"
  | "Commercial Plot"
  | "House"
  | "Apartment"
  | "Farm House"
  | "Shop"
  | "Office";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface ILead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  propertyInterest: PropertyInterest;
  budget: number;
  status: LeadStatus;
  priority: LeadPriority;
  notes: string;
  assignedTo?: IUser | null;
  score: number;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IActivityLog {
  _id: string;
  leadId: string;
  action: string;
  performedBy: IUser;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export interface IFollowUp {
  _id: string;
  leadId: string;
  agentId: string | IUser;
  scheduledAt: string;
  note: string;
  isDone: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalLeads: number;
  byStatus: Partial<Record<LeadStatus, number>>;
  byPriority: Partial<Record<LeadPriority, number>>;
  agentPerformance: {
    agent: IUser;
    total: number;
    closed: number;
  }[];
  monthlyLeads: { month: string; count: number }[];
}

export interface ILeadResponse extends ILead {
  assignedTo?: IUser | null;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
