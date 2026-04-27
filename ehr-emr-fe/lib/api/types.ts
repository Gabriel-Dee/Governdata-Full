export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresInSeconds: number
  userId: string
  username: string
  roles: string[]
  permissions: string[]
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface PatientDto {
  id: string
  mrn: string
  firstName: string | null
  lastName: string | null
  dob: string | null
  age: number | null
  gender: string
  address: string | null
  phone: string | null
  email: string | null
  createdAt: string
  updatedAt: string
}

export interface EncounterDto {
  id: string
  patientId: string
  encounterDate: string
  type: string
  reason: string
  providerId: string
  location: string
  createdAt: string
  updatedAt: string
}

export interface DiagnosisDto {
  id: string
  patientId: string
  encounterId?: string | null
  code: string
  description: string
  onsetDate: string
  resolvedDate?: string | null
  createdAt: string
  updatedAt: string
}

export interface MedicationDto {
  id: string
  patientId: string
  drugName: string
  dose: string
  route: string
  frequency: string
  startDate: string
  endDate?: string | null
  prescribingProviderId: string
  createdAt: string
  updatedAt: string
}

export interface AuditEventDto {
  id: string
  occurredAt: string
  actorUserId: string
  action: string
  resourceType: string
  resourceId?: string | null
  patientId?: string | null
  beforeStateHash?: string | null
  afterStateHash?: string | null
}

export interface ImportResultDto {
  processedRows: number
  insertedPatients: number
  insertedEncounters: number
  invalidRows: number
}

export interface EmrImportConfigDto {
  healthcareCsvPath: string
  emrMaxRows: number
  emrMaxRowsUnlimited: boolean
  importHint: string
}

export interface EmrImportReportDto {
  rowsRead: number
  patientsInserted: number
  encountersInserted: number
  diagnosesInserted: number
  medicationsInserted: number
  skippedRows: number
  replacedExistingData: boolean
}

export interface ErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors?: Array<{ field: string; message: string }>
}
