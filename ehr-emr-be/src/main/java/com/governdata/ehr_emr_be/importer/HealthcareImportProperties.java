package com.governdata.ehr_emr_be.importer;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ehr.import")
public class HealthcareImportProperties {

    private String healthcareCsvPath = "data/Healthcare data.csv";

    /**
     * Max CSV rows to load into EMR tables (0 = no limit). Use a small number in local dev for faster runs.
     */
    private int emrMaxRows = 0;

    public String getHealthcareCsvPath() {
        return healthcareCsvPath;
    }

    public void setHealthcareCsvPath(String healthcareCsvPath) {
        this.healthcareCsvPath = healthcareCsvPath;
    }

    public int getEmrMaxRows() {
        return emrMaxRows;
    }

    public void setEmrMaxRows(int emrMaxRows) {
        this.emrMaxRows = emrMaxRows;
    }
}
