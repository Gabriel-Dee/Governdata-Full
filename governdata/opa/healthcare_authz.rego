package healthcare.authz
import rego.v1

default result := {
  "allow": false,
  "reason": "denied: no matching policy rule"
}

ctx := input.context

is_doctor if {
  lower(ctx.subjectRole) == "doctor"
}

is_admin if {
  lower(ctx.subjectRole) == "admin"
}

is_research if {
  lower(ctx.subjectRole) == "researcher"
}

is_patient_read if {
  lower(ctx.resourceType) == "patientrecord"
  upper(ctx.action) == "READ"
}

is_patient_write if {
  lower(ctx.resourceType) == "patientrecord"
  upper(ctx.action) == "WRITE"
}

is_same_department if {
  lower(ctx.subjectDepartment) == lower(object.get(ctx.attributes, "recordDepartment", ctx.subjectDepartment))
}

is_hipaa_treatment if {
  startswith(upper(object.get(ctx, "legalBasis", "")), "HIPAA")
  lower(ctx.purpose) == "treatment"
}

is_gdpr_consent if {
  startswith(upper(object.get(ctx, "legalBasis", "")), "GDPR")
  lower(object.get(ctx, "region", "")) == "eu"
  object.get(ctx, "consentGranted", false) == true
}

valid_clinician_legal_context if {
  is_hipaa_treatment
}

valid_clinician_legal_context if {
  is_gdpr_consent
}

result := {"allow": true, "reason": "allow: clinician treatment access"} if {
  is_doctor
  is_patient_read
  is_same_department
  valid_clinician_legal_context
}

result := {"allow": false, "reason": "deny: cross-department access"} if {
  is_doctor
  is_patient_read
  not is_same_department
}

result := {"allow": false, "reason": "deny: research requires GDPR consent"} if {
  is_research
  is_patient_read
  not is_gdpr_consent
}

result := {"allow": true, "reason": "allow: emergency admin write"} if {
  is_admin
  is_patient_write
  object.get(ctx, "emergencyAccess", false) == true
}
