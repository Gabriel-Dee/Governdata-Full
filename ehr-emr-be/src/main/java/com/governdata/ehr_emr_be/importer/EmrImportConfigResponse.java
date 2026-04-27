package com.governdata.ehr_emr_be.importer;

/**
 * Read-only settings for the admin UI before triggering {@code POST .../healthcare-emr-data}.
 */
public record EmrImportConfigResponse(
        /** Configured path to {@code Healthcare data.csv} (see {@code ehr.import.healthcare-csv-path}). */
        String healthcareCsvPath,
        /**
         * Max CSV data rows to load (0 = no limit). From {@code ehr.import.emr-max-rows}.
         */
        int emrMaxRows,
        /** True when {@code emrMaxRows == 0} (full file). */
        boolean emrMaxRowsUnlimited,
        /** Short hint for the UI (duration / row cap). */
        String importHint
) {
    public static EmrImportConfigResponse from(HealthcareImportProperties p) {
        int max = p.getEmrMaxRows();
        String hint = max == 0
                ? "Full CSV will be imported (can take several minutes for ~51k rows)."
                : "Only the first " + max + " data rows after the header will be imported (faster dev).";
        return new EmrImportConfigResponse(p.getHealthcareCsvPath(), max, max == 0, hint);
    }
}
