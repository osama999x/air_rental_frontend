export type AdminProfile = {
  id: string;
  email: string;
  displayName: string;
};

export type UserStatus = "ACTIVE" | "SUSPENDED" | "DEACTIVATED";

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: UserStatus;
  createdAt: string;
  mfaEnabled: boolean;
  preferredLanguage?: string | null;
  timezone?: string | null;
  preferredPortalRole?: string | null;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
};

export type OrganizationRow = {
  id: string;
  name: string;
  organizationType?: string | null;
  email?: string | null;
  phone?: string | null;
  addressLine?: string | null;
  cityId?: string | null;
  countryId?: string | null;
  createdByUserId?: string | null;
  createdAt: string;
};

export type PropertyRow = {
  id: string;
  visibleCode: string;
  name: string;
  propertyType: string;
  status: string;
  ownerUserId?: string | null;
  countryId?: string | null;
  cityId?: string | null;
  createdAt: string;
};

export type SubscriptionRow = {
  id: string;
  accountUserId: string;
  status: string;
  planCode?: string | null;
  activeUnitCount: number;
  trialUsed?: boolean;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
};

export type ProviderRow = {
  id: string;
  code: string;
  name: string;
  category: string;
  capability: string;
  enabled: boolean;
  countryIso2?: string | null;
  lastError?: string | null;
  lastSuccessAt?: string | null;
  retryPolicy?: string | null;
  authRequirements?: string | null;
};

export type IntegrationFailure = {
  id: string;
  integrationCode: string;
  operation: string;
  status: string;
  errorMessage?: string | null;
  createdAt: string;
  finishedAt?: string | null;
};

export type IntegrationsSnapshot = {
  jobs: { dead: number; pending: number };
  failures: IntegrationFailure[];
};

export type SupportTicketRow = {
  id: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  createdAt: string;
  userId?: string | null;
};

export type AuditLogRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorType: string;
  outcome: string;
  createdAt: string;
  ipAddress?: string | null;
  actorAdminId?: string | null;
  actorUserId?: string | null;
  activeRole?: string | null;
  propertyId?: string | null;
  tenancyId?: string | null;
  requestId?: string | null;
  metadata?: Record<string, string | number | boolean | null> | null;
};

export type PlatformSettingRow = {
  key: string;
  value: string | number | boolean;
  updatedAt: string;
};

export type DashboardMetrics = {
  totalUsers: number;
  activeOwners: number;
  activeTenants: number;
  managers: number;
  properties: number;
  activeTenancies: number;
  activeSubscriptions: number;
  overdueIntegrationJobs: number;
  pendingJobs: number;
  platformErrors: number;
  definitions: Record<string, string>;
};

export type LoginChallenge =
  | { mfaSetupRequired: true; setupToken: string; otpauthUrl: string }
  | { mfaRequired: true; mfaToken: string };

export type AdminSessionPayload = {
  accessToken: string;
  refreshToken: string;
  admin: AdminProfile;
};

export type AdminResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export type FormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export type LoginState = FormState & {
  step: "credentials" | "mfa";
  otpauthUrl?: string;
};

export const userStatuses: UserStatus[] = ["ACTIVE", "SUSPENDED", "DEACTIVATED"];

export const dashboardMetrics: { key: keyof Omit<DashboardMetrics, "definitions">; label: string }[] = [
  { key: "totalUsers", label: "Total users" },
  { key: "activeOwners", label: "Active owners" },
  { key: "activeTenants", label: "Active tenants" },
  { key: "managers", label: "Managers" },
  { key: "properties", label: "Properties" },
  { key: "activeTenancies", label: "Active tenancies" },
  { key: "activeSubscriptions", label: "Active subscriptions" },
  { key: "overdueIntegrationJobs", label: "Dead jobs" },
  { key: "pendingJobs", label: "Pending jobs" },
  { key: "platformErrors", label: "Platform errors" },
];
