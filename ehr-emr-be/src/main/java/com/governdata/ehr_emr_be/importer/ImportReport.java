package com.governdata.ehr_emr_be.importer;

public record ImportReport(
        int processedRows,
        int insertedPatients,
        int insertedEncounters,
        int invalidRows
) {
}
