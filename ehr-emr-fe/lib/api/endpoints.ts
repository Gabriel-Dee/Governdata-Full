import { apiRequest } from "@/lib/api/client"
import type {
  AuditEventDto,
  DiagnosisDto,
  EmrImportConfigDto,
  EmrImportReportDto,
  EncounterDto,
  ImportResultDto,
  LoginResponse,
  MedicationDto,
  PageResponse,
  PatientDto,
} from "@/lib/api/types"

function normalizeListResponse<T>(response: T[] | PageResponse<T>) {
  if (Array.isArray(response)) return response
  if (response && Array.isArray(response.content)) return response.content
  return []
}

export function login(username: string, password: string) {
  return apiRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    requiresAuth: false,
    body: JSON.stringify({ username, password }),
  })
}

export function listPatients(params?: { page?: number; size?: number; lastName?: string }) {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set("page", `${params.page}`)
  if (params?.size !== undefined) query.set("size", `${params.size}`)
  if (params?.lastName) query.set("lastName", params.lastName)

  const suffix = query.toString() ? `?${query}` : ""
  return apiRequest<PageResponse<PatientDto>>(`/api/v1/patients${suffix}`)
}

export function getPatientById(patientId: string) {
  return apiRequest<PatientDto>(`/api/v1/patients/${patientId}`)
}

export function updatePatient(patientId: string, payload: Partial<PatientDto>) {
  return apiRequest<PatientDto>(`/api/v1/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

type PagingParams = { page?: number; size?: number; sort?: string }

function buildPagingQuery(params?: PagingParams) {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set("page", `${params.page}`)
  if (params?.size !== undefined) query.set("size", `${params.size}`)
  if (params?.sort) query.set("sort", params.sort)
  const queryString = query.toString()
  return queryString ? `?${queryString}` : ""
}

export function listEncounters(params?: PagingParams) {
  const suffix = buildPagingQuery(params)
  return apiRequest<PageResponse<EncounterDto>>(`/api/v1/encounters${suffix}`)
}

export function listDiagnoses(params?: PagingParams) {
  const suffix = buildPagingQuery(params)
  return apiRequest<PageResponse<DiagnosisDto>>(`/api/v1/diagnoses${suffix}`)
}

export function listMedications(params?: PagingParams) {
  const suffix = buildPagingQuery(params)
  return apiRequest<PageResponse<MedicationDto>>(`/api/v1/medications${suffix}`)
}

export function listPatientEncounters(patientId: string) {
  return apiRequest<EncounterDto[] | PageResponse<EncounterDto>>(`/api/v1/patients/${patientId}/encounters`).then(
    normalizeListResponse
  )
}

export function updatePatientEncounter(
  patientId: string,
  encounterId: string,
  payload: Pick<EncounterDto, "encounterDate" | "type" | "reason" | "providerId" | "location">
) {
  return apiRequest<EncounterDto>(`/api/v1/patients/${patientId}/encounters/${encounterId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function listPatientDiagnoses(patientId: string) {
  return apiRequest<DiagnosisDto[] | PageResponse<DiagnosisDto>>(`/api/v1/patients/${patientId}/diagnoses`).then(
    normalizeListResponse
  )
}

export function updatePatientDiagnosis(
  patientId: string,
  diagnosisId: string,
  payload: Pick<DiagnosisDto, "code" | "description" | "onsetDate"> & Partial<Pick<DiagnosisDto, "resolvedDate" | "encounterId">>
) {
  return apiRequest<DiagnosisDto>(`/api/v1/patients/${patientId}/diagnoses/${diagnosisId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function listPatientMedications(patientId: string) {
  return apiRequest<MedicationDto[] | PageResponse<MedicationDto>>(`/api/v1/patients/${patientId}/medications`).then(
    normalizeListResponse
  )
}

export function updatePatientMedication(
  patientId: string,
  medicationId: string,
  payload: Pick<MedicationDto, "drugName" | "dose" | "route" | "frequency" | "startDate" | "prescribingProviderId"> &
    Partial<Pick<MedicationDto, "endDate">>
) {
  return apiRequest<MedicationDto>(`/api/v1/patients/${patientId}/medications/${medicationId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function triggerImport() {
  return apiRequest<ImportResultDto>("/api/v1/admin/import/healthcare-data", {
    method: "POST",
  })
}

export function getEmrImportConfig() {
  return apiRequest<EmrImportConfigDto>("/api/v1/admin/import/healthcare-emr-config")
}

export function runEmrCsvImport(replace = true) {
  return apiRequest<EmrImportReportDto>(`/api/v1/admin/import/healthcare-emr-data?replace=${encodeURIComponent(replace)}`, {
    method: "POST",
  })
}

export function listAuditEvents(params?: { page?: number; size?: number; resourceType?: string; actorUserId?: string }) {
  const query = new URLSearchParams()
  if (params?.page !== undefined) query.set("page", `${params.page}`)
  if (params?.size !== undefined) query.set("size", `${params.size}`)
  if (params?.resourceType) query.set("resourceType", params.resourceType)
  if (params?.actorUserId) query.set("actorUserId", params.actorUserId)

  const suffix = query.toString() ? `?${query}` : ""
  return apiRequest<PageResponse<AuditEventDto>>(`/api/v1/admin/audit-events${suffix}`)
}
