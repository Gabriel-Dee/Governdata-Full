"use client"

import { useEffect, useState } from "react"
import { SecuredPage } from "@/components/layout/secured-page"
import { Skeleton } from "@/components/ui/skeleton"
import { getEmrImportConfig, runEmrCsvImport, triggerImport } from "@/lib/api/endpoints"
import type { EmrImportConfigDto, EmrImportReportDto, ImportResultDto } from "@/lib/api/types"
import { ApiError } from "@/lib/api/client"
import { UploadCloud, Database, ShieldCheck, FileSpreadsheet } from "lucide-react"

export default function ImportPage() {
  const [config, setConfig] = useState<EmrImportConfigDto | null>(null)
  const [result, setResult] = useState<EmrImportReportDto | null>(null)
  const [legacyResult, setLegacyResult] = useState<ImportResultDto | null>(null)
  const [replaceMode, setReplaceMode] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [isRunningLegacy, setIsRunningLegacy] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function loadConfig() {
      try {
        setIsLoadingConfig(true)
        const response = await getEmrImportConfig()
        if (!isMounted) return
        setConfig(response)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof ApiError ? err.message : "Unable to load import configuration.")
      } finally {
        if (isMounted) setIsLoadingConfig(false)
      }
    }
    loadConfig()
    return () => {
      isMounted = false
    }
  }, [])

  async function onImport() {
    setError(null)
    setIsRunning(true)
    try {
      const response = await runEmrCsvImport(replaceMode)
      setResult(response)
      setLegacyResult(null)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError("EMR CSV import failed.")
    } finally {
      setIsRunning(false)
    }
  }

  async function onLegacyImport() {
    setError(null)
    setIsRunningLegacy(true)
    try {
      const response = await triggerImport()
      setLegacyResult(response)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError("Legacy analytics import failed.")
    } finally {
      setIsRunningLegacy(false)
    }
  }

  return (
    <SecuredPage requiredAny={["staff.manage"]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-[#1F1F1F]">Dataset import</h1>
          <p className="text-[#989898] text-sm mt-1">EMR CSV import uses `POST /api/v1/admin/import/healthcare-emr-data`</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 backdrop-blur-sm border border-white/30 text-xs text-[#5f6778]">
            <input
              type="checkbox"
              checked={replaceMode}
              onChange={(e) => setReplaceMode(e.target.checked)}
              className="accent-[#326BF1]"
            />
            replace existing data
          </label>
          <button
            onClick={onImport}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#326BF1] text-white rounded-xl text-sm font-medium hover:bg-[#2858d1] transition-colors disabled:bg-[#8ba9f5]"
          >
            <UploadCloud className="w-4 h-4" />
            {isRunning ? "Importing..." : "Run EMR import"}
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-700 px-4 py-3 mb-5 text-sm">{error}</div> : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5 mb-5">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#989898]">Operation</p>
            <FileSpreadsheet className="w-4 h-4 text-[#326BF1]" />
          </div>
          <p className="text-sm font-semibold text-[#1F1F1F] mt-2">Healthcare data.csv to EMR tables</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#989898]">Permission required</p>
            <ShieldCheck className="w-4 h-4 text-[#326BF1]" />
          </div>
          <p className="text-sm font-semibold text-[#1F1F1F] mt-2">staff.manage</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#989898]">Target</p>
            <Database className="w-4 h-4 text-[#326BF1]" />
          </div>
          <p className="text-sm font-semibold text-[#1F1F1F] mt-2">patients / encounters / diagnoses / medications</p>
        </div>
      </div>

      {isLoadingConfig ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-5 mb-5">
          <Skeleton className="h-4 w-44 bg-white/70" />
          <Skeleton className="h-4 w-72 bg-white/70 mt-2" />
          <Skeleton className="h-4 w-60 bg-white/70 mt-2" />
        </div>
      ) : config ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-5 mb-5">
          <p className="text-sm font-semibold text-[#1F1F1F] mb-2">Configured dataset source</p>
          <p className="text-xs text-[#5f6778]">CSV path: <span className="font-medium">{config.healthcareCsvPath}</span></p>
          <p className="text-xs text-[#5f6778] mt-1">
            Row cap:{" "}
            <span className="font-medium">
              {config.emrMaxRowsUnlimited ? "Unlimited (all rows)" : config.emrMaxRows}
            </span>
          </p>
          <p className="text-xs text-[#989898] mt-2">{config.importHint}</p>
        </div>
      ) : null}

      {isRunning ? (
        <div className="mt-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-3 w-28 bg-white/70" />
              <Skeleton className="h-8 w-20 mt-3 bg-white/70" />
            </div>
          ))}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-[#989898]">Rows read</p>
            <p className="text-xl font-semibold text-[#1F1F1F]">{result.rowsRead}</p>
          </div>
          <div>
            <p className="text-xs text-[#989898]">Inserted patients</p>
            <p className="text-xl font-semibold text-[#1F1F1F]">{result.patientsInserted}</p>
          </div>
          <div>
            <p className="text-xs text-[#989898]">Inserted encounters</p>
            <p className="text-xl font-semibold text-[#1F1F1F]">{result.encountersInserted}</p>
          </div>
          <div>
            <p className="text-xs text-[#989898]">Inserted diagnoses</p>
            <p className="text-xl font-semibold text-[#1F1F1F]">{result.diagnosesInserted}</p>
          </div>
          <div>
            <p className="text-xs text-[#989898]">Inserted medications</p>
            <p className="text-xl font-semibold text-[#1F1F1F]">{result.medicationsInserted}</p>
          </div>
          <div>
            <p className="text-xs text-[#989898]">Skipped rows</p>
            <p className="text-xl font-semibold text-[#1F1F1F]">{result.skippedRows}</p>
          </div>
          <div className="sm:col-span-3 pt-2 border-t border-gray-100">
            <p className="text-xs text-[#5f6778]">replace mode applied: <span className="font-medium">{result.replacedExistingData ? "true" : "false"}</span></p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 pt-6 border-t border-white/30">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-sm font-semibold text-[#1F1F1F]">Legacy analytics import</p>
            <p className="text-xs text-[#989898]">Optional: `POST /api/v1/admin/import/healthcare-data`</p>
          </div>
          <button
            onClick={onLegacyImport}
            disabled={isRunningLegacy}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white/70 border border-white/30 text-[#1F1F1F] rounded-xl text-xs font-medium hover:bg-white/90 transition-colors disabled:opacity-60"
          >
            {isRunningLegacy ? "Running..." : "Run legacy import"}
          </button>
        </div>
        {legacyResult ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/30 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <p className="text-xs text-[#5f6778]">processedRows: <span className="font-medium text-[#1F1F1F]">{legacyResult.processedRows}</span></p>
            <p className="text-xs text-[#5f6778]">insertedPatients: <span className="font-medium text-[#1F1F1F]">{legacyResult.insertedPatients}</span></p>
            <p className="text-xs text-[#5f6778]">insertedEncounters: <span className="font-medium text-[#1F1F1F]">{legacyResult.insertedEncounters}</span></p>
            <p className="text-xs text-[#5f6778]">invalidRows: <span className="font-medium text-[#1F1F1F]">{legacyResult.invalidRows}</span></p>
          </div>
        ) : null}
      </div>
    </SecuredPage>
  )
}
