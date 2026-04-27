"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { RequireAuth } from "@/components/auth/require-auth"
import { Sidebar } from "@/components/dashboard/sidebar"
import {
  getPatientById,
  listPatientDiagnoses,
  listPatientEncounters,
  listPatientMedications,
  updatePatientDiagnosis,
  updatePatientEncounter,
  updatePatientMedication,
  updatePatient,
} from "@/lib/api/endpoints"
import type { DiagnosisDto, EncounterDto, MedicationDto, PatientDto } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import {
  CalendarDays,
  Pill,
  Activity,
  Stethoscope,
  UserRound,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Gauge,
  Scale,
  VenusAndMars,
  IdCard,
  Pencil,
} from "lucide-react"
import { useSession } from "@/components/auth/session-provider"

type ExtractedVitals = {
  bloodPressure: string | null
  heartRate: string | null
  bmi: string | null
  cholesterol: string | null
  weight: string | null
  smoker: string | null
  activity: string | null
}

function extractFromReason(reason: string | null): ExtractedVitals {
  if (!reason) {
    return {
      bloodPressure: null,
      heartRate: null,
      bmi: null,
      cholesterol: null,
      weight: null,
      smoker: null,
      activity: null,
    }
  }

  const capture = (pattern: RegExp) => {
    const match = reason.match(pattern)
    return match?.[1]?.trim() ?? null
  }

  const bp = capture(/BP\s*=\s*([0-9]{2,3}\s*\/\s*[0-9]{2,3})/i) ?? capture(/Blood\s*Pressure\s*[:=]\s*([0-9]{2,3}\s*\/\s*[0-9]{2,3})/i)
  const hr = capture(/HR\s*=\s*([0-9]{2,3})/i) ?? capture(/Heart\s*Rate\s*[:=]\s*([0-9]{2,3})/i)
  const bmi = capture(/BMI\s*=\s*([0-9]+(?:\.[0-9]+)?)/i)
  const chol = capture(/Cholesterol\s*=\s*([0-9]+(?:\.[0-9]+)?)/i)
  const weight = capture(/Weight\s*=\s*([0-9]+(?:\.[0-9]+)?\s*(?:kg|lbs)?)/i) ?? capture(/Wt\s*=\s*([0-9]+(?:\.[0-9]+)?\s*(?:kg|lbs)?)/i)
  const smoker = capture(/Smoker\s*=\s*([^|]+)/i)
  const activity = capture(/Activity\s*=\s*([^|]+)/i)

  return {
    bloodPressure: bp,
    heartRate: hr,
    bmi,
    cholesterol: chol,
    weight,
    smoker,
    activity,
  }
}

function displayName(patient: PatientDto) {
  const fullName = `${patient.firstName ?? ""} ${patient.lastName ?? ""}`.trim()
  return fullName || `Patient ${patient.id.slice(0, 8)}`
}

function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  const hours = `${date.getHours()}`.padStart(2, "0")
  const minutes = `${date.getMinutes()}`.padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function PatientDetailPage() {
  const { canAny } = useSession()
  const params = useParams<{ id: string }>()
  const [patient, setPatient] = useState<PatientDto | null>(null)
  const [encounters, setEncounters] = useState<EncounterDto[]>([])
  const [diagnoses, setDiagnoses] = useState<DiagnosisDto[]>([])
  const [medications, setMedications] = useState<MedicationDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    mrn: "",
    firstName: "",
    lastName: "",
    dob: "",
    age: "",
    gender: "",
    address: "",
    phone: "",
    email: "",
  })
  const [error, setError] = useState<string | null>(null)
  const canEditPatient = canAny(["patient.update"])
  const canEditEncounter = canAny(["encounter.create"])
  const canEditDiagnosis = canAny(["diagnosis.create"])
  const canEditMedication = canAny(["medication.create"])
  const [isSavingEncounter, setIsSavingEncounter] = useState(false)
  const [isSavingDiagnosis, setIsSavingDiagnosis] = useState(false)
  const [isSavingMedication, setIsSavingMedication] = useState(false)
  const [editingEncounterId, setEditingEncounterId] = useState<string | null>(null)
  const [editingDiagnosisId, setEditingDiagnosisId] = useState<string | null>(null)
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null)
  const [encounterForm, setEncounterForm] = useState({
    encounterDate: "",
    type: "",
    reason: "",
    providerId: "",
    location: "",
  })
  const [diagnosisForm, setDiagnosisForm] = useState({
    code: "",
    description: "",
    onsetDate: "",
    resolvedDate: "",
    encounterId: "",
  })
  const [medicationForm, setMedicationForm] = useState({
    drugName: "",
    dose: "",
    route: "",
    frequency: "",
    startDate: "",
    endDate: "",
    prescribingProviderId: "",
  })
  const latestEncounter = useMemo(() => {
    if (!encounters.length) return null
    return [...encounters].sort((a, b) => new Date(b.encounterDate).getTime() - new Date(a.encounterDate).getTime())[0]
  }, [encounters])
  const extractedVitals = useMemo(() => extractFromReason(latestEncounter?.reason ?? null), [latestEncounter])
  const patientName = patient ? displayName(patient) : ""

  useEffect(() => {
    let isMounted = true
    async function load() {
      if (!params.id) return
      try {
        setIsLoading(true)
        setError(null)
        const [patientData, encountersData, diagnosesData, medicationsData] = await Promise.all([
          getPatientById(params.id),
          listPatientEncounters(params.id),
          listPatientDiagnoses(params.id),
          listPatientMedications(params.id),
        ])
        if (!isMounted) return
        setPatient(patientData)
        setEncounters(encountersData)
        setDiagnoses(diagnosesData)
        setMedications(medicationsData)
        setFormData({
          mrn: patientData.mrn ?? "",
          firstName: patientData.firstName ?? "",
          lastName: patientData.lastName ?? "",
          dob: patientData.dob ?? "",
          age: patientData.age !== null ? `${patientData.age}` : "",
          gender: patientData.gender ?? "",
          address: patientData.address ?? "",
          phone: patientData.phone ?? "",
          email: patientData.email ?? "",
        })
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof ApiError ? err.message : "Unable to load patient details.")
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [params.id])

  async function onSavePatient() {
    if (!patient || !canEditPatient) return
    try {
      setIsSaving(true)
      setSaveMessage(null)
      setError(null)
      const updated = await updatePatient(patient.id, {
        mrn: formData.mrn || patient.id,
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        dob: formData.dob || null,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender || patient.gender,
        address: formData.address || null,
        phone: formData.phone || null,
        email: formData.email || null,
      })
      setPatient(updated)
      setFormData({
        mrn: updated.mrn ?? "",
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        dob: updated.dob ?? "",
        age: updated.age !== null ? `${updated.age}` : "",
        gender: updated.gender ?? "",
        address: updated.address ?? "",
        phone: updated.phone ?? "",
        email: updated.email ?? "",
      })
      setIsEditing(false)
      setSaveMessage("Patient demographics updated.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update patient.")
    } finally {
      setIsSaving(false)
    }
  }

  function startEncounterEdit(encounter: EncounterDto) {
    setSaveMessage(null)
    setEditingEncounterId(encounter.id)
    setEncounterForm({
      encounterDate: toDateTimeLocal(encounter.encounterDate),
      type: encounter.type ?? "",
      reason: encounter.reason ?? "",
      providerId: encounter.providerId ?? "",
      location: encounter.location ?? "",
    })
  }

  async function onSaveEncounter() {
    if (!patient || !editingEncounterId) return
    try {
      setIsSavingEncounter(true)
      setError(null)
      setSaveMessage(null)
      const updated = await updatePatientEncounter(patient.id, editingEncounterId, {
        encounterDate: new Date(encounterForm.encounterDate).toISOString(),
        type: encounterForm.type,
        reason: encounterForm.reason,
        providerId: encounterForm.providerId,
        location: encounterForm.location,
      })
      setEncounters((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      setEditingEncounterId(null)
      setSaveMessage("Encounter updated.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update encounter.")
    } finally {
      setIsSavingEncounter(false)
    }
  }

  function startDiagnosisEdit(diagnosis: DiagnosisDto) {
    setSaveMessage(null)
    setEditingDiagnosisId(diagnosis.id)
    setDiagnosisForm({
      code: diagnosis.code ?? "",
      description: diagnosis.description ?? "",
      onsetDate: diagnosis.onsetDate ?? "",
      resolvedDate: diagnosis.resolvedDate ?? "",
      encounterId: diagnosis.encounterId ?? "",
    })
  }

  async function onSaveDiagnosis() {
    if (!patient || !editingDiagnosisId) return
    try {
      setIsSavingDiagnosis(true)
      setError(null)
      setSaveMessage(null)
      const updated = await updatePatientDiagnosis(patient.id, editingDiagnosisId, {
        code: diagnosisForm.code,
        description: diagnosisForm.description,
        onsetDate: diagnosisForm.onsetDate,
        resolvedDate: diagnosisForm.resolvedDate || null,
        encounterId: diagnosisForm.encounterId || null,
      })
      setDiagnoses((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      setEditingDiagnosisId(null)
      setSaveMessage("Diagnosis updated.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update diagnosis.")
    } finally {
      setIsSavingDiagnosis(false)
    }
  }

  function startMedicationEdit(medication: MedicationDto) {
    setSaveMessage(null)
    setEditingMedicationId(medication.id)
    setMedicationForm({
      drugName: medication.drugName ?? "",
      dose: medication.dose ?? "",
      route: medication.route ?? "",
      frequency: medication.frequency ?? "",
      startDate: medication.startDate ?? "",
      endDate: medication.endDate ?? "",
      prescribingProviderId: medication.prescribingProviderId ?? "",
    })
  }

  async function onSaveMedication() {
    if (!patient || !editingMedicationId) return
    try {
      setIsSavingMedication(true)
      setError(null)
      setSaveMessage(null)
      const updated = await updatePatientMedication(patient.id, editingMedicationId, {
        drugName: medicationForm.drugName,
        dose: medicationForm.dose,
        route: medicationForm.route,
        frequency: medicationForm.frequency,
        startDate: medicationForm.startDate,
        endDate: medicationForm.endDate || null,
        prescribingProviderId: medicationForm.prescribingProviderId,
      })
      setMedications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      setEditingMedicationId(null)
      setSaveMessage("Medication updated.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to update medication.")
    } finally {
      setIsSavingMedication(false)
    }
  }

  return (
    <RequireAuth requiredAny={["patient.read"]}>
      <div className="min-h-screen bg-[#E8EDFB]">
        <Sidebar />

        <main className="p-4 pt-16 lg:pt-6 lg:pl-[252px] lg:pr-6 lg:py-6">
          {isLoading ? (
            <div className="space-y-5">
              <div className="h-[220px] rounded-3xl border border-white/20 bg-linear-to-r from-[#0B3DAA] via-[#326BF1] to-[#5E7BF6] animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-[112px] bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 animate-pulse" />
                ))}
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-5">
                <div className="h-[320px] bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 animate-pulse" />
                <div className="h-[320px] bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              {error ? <div className="rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-700 px-4 py-3 mb-5 text-sm">{error}</div> : null}

              {patient ? (
                <>
                  <div className="relative overflow-hidden bg-linear-to-r from-[#0B3DAA] via-[#1E56D6] to-[#4A78F6] rounded-3xl p-5 lg:p-7 border border-[#3C69EA] shadow-[0_20px_60px_-24px_rgba(12,57,168,0.7)] mb-5">
                    <div className="absolute -right-10 -top-14 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute right-12 bottom-4 w-40 h-40 rounded-full bg-[#8DACFF]/20 blur-3xl" />
                    <div className="relative">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full ring-2 ring-white/40 shadow-md bg-white/15 flex items-center justify-center">
                            <UserRound className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h1 className="text-2xl lg:text-3xl font-semibold text-white">
                              {patientName}
                            </h1>
                            <p className="text-sm text-blue-100">Clinical profile and timeline</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30">
                            Patient detail
                          </span>
                          {canEditPatient ? (
                            <button
                              onClick={() => setIsEditing((prev) => !prev)}
                              className="text-xs px-2.5 py-1 rounded-full bg-white text-[#1241B9] border border-white/80 hover:bg-[#f4f8ff]"
                            >
                              {isEditing ? "Cancel edit" : "Edit patient"}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                        <div className="rounded-2xl bg-white/12 border border-white/20 px-4 py-3">
                          <p className="text-[11px] text-blue-100">MRN</p>
                          <p className="text-sm font-semibold text-white mt-1">{patient.mrn || "-"}</p>
                        </div>
                        <div className="rounded-2xl bg-white/12 border border-white/20 px-4 py-3">
                          <p className="text-[11px] text-blue-100">Age</p>
                          <p className="text-sm font-semibold text-white mt-1">{patient.age ?? "-"}</p>
                        </div>
                        <div className="rounded-2xl bg-white/12 border border-white/20 px-4 py-3">
                          <p className="text-[11px] text-blue-100">Gender</p>
                          <p className="text-sm font-semibold text-white mt-1">{patient.gender || "-"}</p>
                        </div>
                        <div className="rounded-2xl bg-white/12 border border-white/20 px-4 py-3">
                          <p className="text-[11px] text-blue-100">Latest visit</p>
                          <p className="text-sm font-semibold text-white mt-1">
                            {latestEncounter ? new Date(latestEncounter.encounterDate).toLocaleDateString() : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm text-blue-50">
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-white" /> {patient.phone || "-"}</div>
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-white" /> {patient.email || "-"}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-white" /> {patient.address || "-"}</div>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 mb-5">
                      <h2 className="text-base font-semibold text-[#1F1F1F] mb-3">Edit demographics</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input value={formData.firstName} onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))} placeholder="First name" className="rounded-xl border border-white/30 bg-white/80 px-3 py-2.5 text-sm" />
                        <input value={formData.lastName} onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))} placeholder="Last name" className="rounded-xl border border-white/30 bg-white/80 px-3 py-2.5 text-sm" />
                        <input value={formData.mrn} onChange={(e) => setFormData((prev) => ({ ...prev, mrn: e.target.value }))} placeholder="MRN" className="rounded-xl border border-white/30 bg-white/80 px-3 py-2.5 text-sm" />
                        <input value={formData.gender} onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))} placeholder="Gender" className="rounded-xl border border-white/30 bg-white/80 px-3 py-2.5 text-sm" />
                        <input value={formData.dob} onChange={(e) => setFormData((prev) => ({ ...prev, dob: e.target.value }))} placeholder="DOB (YYYY-MM-DD)" className="rounded-xl border border-white/30 bg-white/80 px-3 py-2.5 text-sm" />
                        <input value={formData.age} onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))} placeholder="Age" className="rounded-xl border border-white/30 bg-white/80 px-3 py-2.5 text-sm" />
                        <input value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="rounded-xl border border-white/30 bg-white/80 px-3 py-2.5 text-sm" />
                        <input value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} placeholder="Email" className="rounded-xl border border-white/30 bg-white/80 px-3 py-2.5 text-sm" />
                        <input value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} placeholder="Address" className="md:col-span-2 rounded-xl border border-white/30 bg-white/80 px-3 py-2.5 text-sm" />
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={onSavePatient}
                          disabled={isSaving}
                          className="px-4 py-2.5 rounded-xl bg-[#326BF1] text-white text-sm font-medium disabled:bg-[#8ba9f5]"
                        >
                          {isSaving ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2.5 rounded-xl bg-white/70 border border-white/40 text-[#1F1F1F] text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {saveMessage ? (
                    <div className="rounded-xl bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 text-emerald-700 px-4 py-3 mb-5 text-sm">
                      {saveMessage}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5 mb-5">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#989898]">Encounters</p>
                        <CalendarDays className="w-4 h-4 text-[#326BF1]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{encounters.length}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#989898]">Diagnoses</p>
                        <Activity className="w-4 h-4 text-[#326BF1]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{diagnoses.length}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#989898]">Medications</p>
                        <Pill className="w-4 h-4 text-[#326BF1]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{medications.length}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#989898]">BPM</p>
                        <HeartPulse className="w-4 h-4 text-[#326BF1]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{extractedVitals.heartRate ?? "--"}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#989898]">Weight</p>
                        <Scale className="w-4 h-4 text-[#326BF1]" />
                      </div>
                      <p className="text-2xl font-semibold text-[#1F1F1F] mt-2">{extractedVitals.weight ?? "--"}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#989898]">Blood pressure</p>
                        <Gauge className="w-4 h-4 text-[#326BF1]" />
                      </div>
                      <p className="text-xl font-semibold text-[#1F1F1F] mt-2">{extractedVitals.bloodPressure ?? "--"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-5">
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                      <h2 className="text-base font-semibold text-[#1F1F1F] mb-3">Demographic insights</h2>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between rounded-xl bg-white/70 border border-white/40 px-3 py-2.5">
                          <span className="text-[#5f6778] flex items-center gap-2"><IdCard className="w-4 h-4 text-[#326BF1]" /> ID</span>
                          <span className="text-[#1F1F1F] font-medium">{patient.id.slice(0, 8)}...</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white/70 border border-white/40 px-3 py-2.5">
                          <span className="text-[#5f6778] flex items-center gap-2"><VenusAndMars className="w-4 h-4 text-[#326BF1]" /> Gender</span>
                          <span className="text-[#1F1F1F] font-medium">{patient.gender || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white/70 border border-white/40 px-3 py-2.5">
                          <span className="text-[#5f6778]">BMI</span>
                          <span className="text-[#1F1F1F] font-medium">{extractedVitals.bmi ?? "--"}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white/70 border border-white/40 px-3 py-2.5">
                          <span className="text-[#5f6778]">Cholesterol</span>
                          <span className="text-[#1F1F1F] font-medium">{extractedVitals.cholesterol ?? "--"}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white/70 border border-white/40 px-3 py-2.5">
                          <span className="text-[#5f6778]">Smoker</span>
                          <span className="text-[#1F1F1F] font-medium">{extractedVitals.smoker ?? "--"}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white/70 border border-white/40 px-3 py-2.5">
                          <span className="text-[#5f6778]">Activity</span>
                          <span className="text-[#1F1F1F] font-medium">{extractedVitals.activity ?? "--"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 overflow-x-auto">
                      <h2 className="text-base font-semibold text-[#1F1F1F] mb-3 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-[#326BF1]" /> Encounters
                      </h2>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[#989898] border-b border-gray-100">
                            <th className="py-2 pr-4">Date</th>
                            <th className="py-2 pr-4">Type</th>
                            <th className="py-2">Reason</th>
                            {canEditEncounter ? <th className="py-2 text-right">Action</th> : null}
                          </tr>
                        </thead>
                        <tbody>
                          {encounters.slice(0, 8).map((encounter) => (
                            <tr key={encounter.id} className="border-b border-gray-50 text-[#1F1F1F]">
                              <td className="py-3 pr-4">{new Date(encounter.encounterDate).toLocaleDateString()}</td>
                              <td className="py-3 pr-4">{encounter.type}</td>
                              <td className="py-3">{encounter.reason}</td>
                              {canEditEncounter ? (
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => startEncounterEdit(encounter)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#d7def8] bg-white px-2.5 py-1 text-xs text-[#1F1F1F] hover:bg-[#f6f8ff]"
                                  >
                                    <Pencil className="w-3 h-3 text-[#326BF1]" /> Edit
                                  </button>
                                </td>
                              ) : null}
                            </tr>
                          ))}
                          {!encounters.length ? (
                            <tr>
                              <td className="py-6 text-[#989898]" colSpan={canEditEncounter ? 4 : 3}>No encounters found.</td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                      {canEditEncounter && editingEncounterId ? (
                        <div className="mt-4 rounded-xl border border-[#d7def8] bg-[#f8faff] p-3">
                          <p className="text-sm font-medium text-[#1F1F1F] mb-2">Edit encounter</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            <input type="datetime-local" value={encounterForm.encounterDate} onChange={(e) => setEncounterForm((prev) => ({ ...prev, encounterDate: e.target.value }))} className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input value={encounterForm.type} onChange={(e) => setEncounterForm((prev) => ({ ...prev, type: e.target.value }))} placeholder="Type" className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input value={encounterForm.providerId} onChange={(e) => setEncounterForm((prev) => ({ ...prev, providerId: e.target.value }))} placeholder="Provider ID" className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input value={encounterForm.location} onChange={(e) => setEncounterForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Location" className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input value={encounterForm.reason} onChange={(e) => setEncounterForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Reason" className="md:col-span-2 rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button onClick={onSaveEncounter} disabled={isSavingEncounter} className="rounded-xl bg-[#326BF1] px-3 py-2 text-white text-sm disabled:bg-[#8ba9f5]">
                              {isSavingEncounter ? "Saving..." : "Save"}
                            </button>
                            <button onClick={() => setEditingEncounterId(null)} className="rounded-xl border border-white/50 bg-white px-3 py-2 text-sm text-[#1F1F1F]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30 overflow-x-auto">
                      <h2 className="text-base font-semibold text-[#1F1F1F] mb-3 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-[#326BF1]" /> Medications
                      </h2>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[#989898] border-b border-gray-100">
                            <th className="py-2 pr-4">Drug</th>
                            <th className="py-2 pr-4">Dose</th>
                            <th className="py-2">Frequency</th>
                            {canEditMedication ? <th className="py-2 text-right">Action</th> : null}
                          </tr>
                        </thead>
                        <tbody>
                          {medications.slice(0, 8).map((medication) => (
                            <tr key={medication.id} className="border-b border-gray-50 text-[#1F1F1F]">
                              <td className="py-3 pr-4">{medication.drugName}</td>
                              <td className="py-3 pr-4">{medication.dose}</td>
                              <td className="py-3">{medication.frequency}</td>
                              {canEditMedication ? (
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => startMedicationEdit(medication)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#d7def8] bg-white px-2.5 py-1 text-xs text-[#1F1F1F] hover:bg-[#f6f8ff]"
                                  >
                                    <Pencil className="w-3 h-3 text-[#326BF1]" /> Edit
                                  </button>
                                </td>
                              ) : null}
                            </tr>
                          ))}
                          {!medications.length ? (
                            <tr>
                              <td className="py-6 text-[#989898]" colSpan={canEditMedication ? 4 : 3}>No medications found.</td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                      {canEditMedication && editingMedicationId ? (
                        <div className="mt-4 rounded-xl border border-[#d7def8] bg-[#f8faff] p-3">
                          <p className="text-sm font-medium text-[#1F1F1F] mb-2">Edit medication</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            <input value={medicationForm.drugName} onChange={(e) => setMedicationForm((prev) => ({ ...prev, drugName: e.target.value }))} placeholder="Drug name" className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input value={medicationForm.dose} onChange={(e) => setMedicationForm((prev) => ({ ...prev, dose: e.target.value }))} placeholder="Dose" className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input value={medicationForm.route} onChange={(e) => setMedicationForm((prev) => ({ ...prev, route: e.target.value }))} placeholder="Route" className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input value={medicationForm.frequency} onChange={(e) => setMedicationForm((prev) => ({ ...prev, frequency: e.target.value }))} placeholder="Frequency" className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input type="date" value={medicationForm.startDate} onChange={(e) => setMedicationForm((prev) => ({ ...prev, startDate: e.target.value }))} className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input type="date" value={medicationForm.endDate} onChange={(e) => setMedicationForm((prev) => ({ ...prev, endDate: e.target.value }))} className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                            <input value={medicationForm.prescribingProviderId} onChange={(e) => setMedicationForm((prev) => ({ ...prev, prescribingProviderId: e.target.value }))} placeholder="Prescribing provider ID" className="md:col-span-2 rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button onClick={onSaveMedication} disabled={isSavingMedication} className="rounded-xl bg-[#326BF1] px-3 py-2 text-white text-sm disabled:bg-[#8ba9f5]">
                              {isSavingMedication ? "Saving..." : "Save"}
                            </button>
                            <button onClick={() => setEditingMedicationId(null)} className="rounded-xl border border-white/50 bg-white px-3 py-2 text-sm text-[#1F1F1F]">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                    <h2 className="text-base font-semibold text-[#1F1F1F] mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#326BF1]" /> Diagnoses highlights
                    </h2>
                    {canEditDiagnosis && editingDiagnosisId ? (
                      <div className="mb-4 rounded-xl border border-[#d7def8] bg-[#f8faff] p-3">
                        <p className="text-sm font-medium text-[#1F1F1F] mb-2">Edit diagnosis</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          <input value={diagnosisForm.code} onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, code: e.target.value }))} placeholder="Code" className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                          <input type="date" value={diagnosisForm.onsetDate} onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, onsetDate: e.target.value }))} className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                          <input type="date" value={diagnosisForm.resolvedDate} onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, resolvedDate: e.target.value }))} className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                          <input value={diagnosisForm.encounterId} onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, encounterId: e.target.value }))} placeholder="Encounter ID (optional)" className="rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                          <input value={diagnosisForm.description} onChange={(e) => setDiagnosisForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Description" className="md:col-span-2 rounded-xl border border-white/30 bg-white px-3 py-2 text-sm" />
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button onClick={onSaveDiagnosis} disabled={isSavingDiagnosis} className="rounded-xl bg-[#326BF1] px-3 py-2 text-white text-sm disabled:bg-[#8ba9f5]">
                            {isSavingDiagnosis ? "Saving..." : "Save"}
                          </button>
                          <button onClick={() => setEditingDiagnosisId(null)} className="rounded-xl border border-white/50 bg-white px-3 py-2 text-sm text-[#1F1F1F]">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {diagnoses.slice(0, 9).map((diagnosis) => (
                        <div key={diagnosis.id} className="rounded-xl border border-white/40 bg-white/75 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-[#1F1F1F]">{diagnosis.code || "Uncoded diagnosis"}</p>
                            {canEditDiagnosis ? (
                              <button
                                onClick={() => startDiagnosisEdit(diagnosis)}
                                className="inline-flex items-center gap-1 rounded-lg border border-[#d7def8] bg-white px-2 py-1 text-[11px] text-[#1F1F1F] hover:bg-[#f6f8ff]"
                              >
                                <Pencil className="w-3 h-3 text-[#326BF1]" /> Edit
                              </button>
                            ) : null}
                          </div>
                          <p className="text-xs text-[#5f6778] mt-1">{diagnosis.description || "No description available."}</p>
                          <p className="text-[11px] text-[#989898] mt-2">Onset: {diagnosis.onsetDate || "-"}</p>
                        </div>
                      ))}
                      {!diagnoses.length ? (
                        <p className="text-sm text-[#989898]">No diagnoses found for this patient.</p>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/30 text-center">
                  <p className="text-sm text-[#989898]">Patient not found.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </RequireAuth>
  )
}
