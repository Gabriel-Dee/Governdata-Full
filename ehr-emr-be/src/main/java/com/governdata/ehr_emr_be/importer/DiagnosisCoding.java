package com.governdata.ehr_emr_be.importer;

/**
 * Demo ICD-10–style codes for CSV {@code Diagnosis} labels (not for billing).
 */
public final class DiagnosisCoding {

    private DiagnosisCoding() {}

    public static String labelToCode(String label) {
        if (label == null || label.isBlank()) {
            return "Z00.00";
        }
        return switch (label.trim().toLowerCase()) {
            case "follow-up" -> "Z09";
            case "routine check" -> "Z00.00";
            case "emergency" -> "Z71.9";
            case "infection" -> "B99.9";
            default -> "R69";
        };
    }
}
