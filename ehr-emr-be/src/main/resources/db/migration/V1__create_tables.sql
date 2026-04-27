-- Patients (system of record for demographic and identity)
CREATE TABLE patients (
    id UUID PRIMARY KEY,
    mrn VARCHAR(64) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(32),
    address VARCHAR(512),
    phone VARCHAR(64),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_patients_mrn ON patients(mrn);

-- Encounters (visits / episodes of care)
CREATE TABLE encounters (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(64) NOT NULL,
    reason VARCHAR(512),
    provider_id VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX idx_encounters_encounter_date ON encounters(encounter_date);

-- Diagnoses (linked to patient and optionally to encounter)
CREATE TABLE diagnoses (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    encounter_id UUID REFERENCES encounters(id) ON DELETE SET NULL,
    code VARCHAR(64) NOT NULL,
    description VARCHAR(512),
    onset_date DATE,
    resolved_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX idx_diagnoses_encounter_id ON diagnoses(encounter_id);

-- Medications (prescriptions / current meds)
CREATE TABLE medications (
    id UUID PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    drug_name VARCHAR(255) NOT NULL,
    dose VARCHAR(128),
    route VARCHAR(64),
    frequency VARCHAR(128),
    start_date DATE,
    end_date DATE,
    prescribing_provider_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_medications_patient_id ON medications(patient_id);
