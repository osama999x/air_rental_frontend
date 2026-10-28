export type PortalRole = "OWNER" | "TENANT" | "MANAGER";

export type PortalProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: PortalRole[];
  activeRole: PortalRole;
  avatarStamp?: string;
};

export type PortalUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredLanguage?: string | null;
  preferredPortalRole?: PortalRole | null;
};

export type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  user: PortalUser;
  roles?: PortalRole[];
};

export type FormState = {
  status: "idle" | "error" | "success";
  message: string;
};

export const idleForm: FormState = { status: "idle", message: "" };

export type OwnerDashboard = {
  properties: number;
  rented: number;
  vacant: number;
  activeTenancies: number;
  overdueRent: number;
  pendingProofs: number;
  openMaintenance: number;
};

export type NamedRecord = {
  id: string;
  name?: string;
  title?: string;
  code?: string;
  visibleCode?: string;
  propertyType?: string;
  status?: string;
  addressLine?: string;
  area?: string;
  region?: string;
  amount?: string;
  currencyCode?: string;
  dueDate?: string;
  periodYear?: number;
  periodMonth?: number;
  propertyId?: string;
  tenancyId?: string;
  confirmedAmount?: string;
  remaining?: string;
  description?: string;
  category?: string;
  email?: string;
  createdAt?: string;
  body?: string;
  question?: string;
  answer?: string;
  providerName?: string;
  policyNumber?: string;
  endDate?: string;
  monthlyRent?: string;
  expiryDate?: string;
  startDate?: string;
  consumerNumber?: string;
  holderRole?: string;
  [key: string]: unknown;
};
