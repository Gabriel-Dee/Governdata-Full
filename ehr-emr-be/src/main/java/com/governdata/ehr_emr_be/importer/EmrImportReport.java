package com.governdata.ehr_emr_be.importer;

public record EmrImportReport(
        int rowsRead,
        int patientsInserted,
        int encountersInserted,
        int diagnosesInserted,
        int medicationsInserted,
        int skippedRows,
        boolean replacedExistingData
) {
}
