-- Full seeded catalogs: HIPAA (Security Rule technical specs, Safe Harbor identifiers, selected Privacy/Admin)
-- and GDPR (data-protection articles as reference + evidence hooks where automatable).
-- Duplicate-safe: skip if rows already present (idempotent re-run on partial failure).

INSERT INTO compliance_catalog_rules (framework, rule_code, legal_reference, category, title, requirement_type, description, evidence_key, automated, sort_order)
SELECT * FROM (VALUES
-- ========== HIPAA: 45 CFR 164.312 Technical safeguards ==========
('HIPAA', 'HIPAA_164_312_A2I_UNIQUE_USER', '45 CFR 164.312(a)(2)(i)', 'TECHNICAL_SAFEGUARD', 'Unique user identification', 'REQUIRED',
 'Assign a unique name and/or number for identifying and tracking user identity.', 'hipaa_access_unique_user_id', true, 10),
('HIPAA', 'HIPAA_164_312_A2II_EMERGENCY', '45 CFR 164.312(a)(2)(ii)', 'TECHNICAL_SAFEGUARD', 'Emergency access procedure', 'REQUIRED',
 'Establish procedures for obtaining necessary ePHI during an emergency.', 'hipaa_access_emergency_procedure', true, 20),
('HIPAA', 'HIPAA_164_312_A2III_LOGOFF', '45 CFR 164.312(a)(2)(iii)', 'TECHNICAL_SAFEGUARD', 'Automatic logoff', 'ADDRESSABLE',
 'Implement electronic procedures that terminate an electronic session after a predetermined time of inactivity.', 'hipaa_access_automatic_logoff', true, 30),
('HIPAA', 'HIPAA_164_312_A2IV_ENCRYPT', '45 CFR 164.312(a)(2)(iv)', 'TECHNICAL_SAFEGUARD', 'Encryption and decryption', 'ADDRESSABLE',
 'Implement a mechanism to encrypt and decrypt ePHI where reasonable and appropriate.', 'hipaa_access_encryption_decryption', true, 40),
('HIPAA', 'HIPAA_164_312_B_AUDIT', '45 CFR 164.312(b)', 'TECHNICAL_SAFEGUARD', 'Audit controls', 'REQUIRED',
 'Implement hardware, software, and/or procedural mechanisms that record and examine activity in systems with ePHI.', 'hipaa_audit_controls', true, 50),
('HIPAA', 'HIPAA_164_312_C1_INTEGRITY', '45 CFR 164.312(c)(1)', 'TECHNICAL_SAFEGUARD', 'Mechanism to authenticate ePHI', 'ADDRESSABLE',
 'Implement electronic mechanisms to corroborate that ePHI has not been altered or destroyed in an unauthorized manner.', 'hipaa_integrity_authenticate_ephi', true, 60),
('HIPAA', 'HIPAA_164_312_C2_ESIGN', '45 CFR 164.312(c)(2)', 'TECHNICAL_SAFEGUARD', 'Electronic signature (if used)', 'ADDRESSABLE',
 'Implement electronic signature mechanisms if electronic signatures are used for ePHI.', 'hipaa_integrity_electronic_signature', true, 70),
('HIPAA', 'HIPAA_164_312_D_AUTHN', '45 CFR 164.312(d)', 'TECHNICAL_SAFEGUARD', 'Person or entity authentication', 'REQUIRED',
 'Implement procedures to verify that a person or entity seeking access to ePHI is the one claimed.', 'hipaa_person_authentication', true, 80),
('HIPAA', 'HIPAA_164_312_E1_TX_INTEGRITY', '45 CFR 164.312(e)(1)', 'TECHNICAL_SAFEGUARD', 'Transmission integrity controls', 'ADDRESSABLE',
 'Implement security measures to ensure ePHI is not improperly modified without detection until disposed of.', 'hipaa_transmission_integrity', true, 90),
('HIPAA', 'HIPAA_164_312_E2_TX_ENCRYPT', '45 CFR 164.312(e)(2)', 'TECHNICAL_SAFEGUARD', 'Transmission encryption', 'ADDRESSABLE',
 'Implement a mechanism to encrypt ePHI whenever deemed appropriate.', 'hipaa_transmission_encryption', true, 100),

-- ========== HIPAA: Safe Harbor identifiers (164.514(b)(2)(i)) ==========
('HIPAA', 'HIPAA_164_514_B2_NAMES', '45 CFR 164.514(b)(2)(i)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Names removed or masked', 'REQUIRED_FOR_SAFE_HARBOR',
 'Exclude names of the individual or relatives, employers, or household members.', 'phi_safe_harbor_names', true, 200),
('HIPAA', 'HIPAA_164_514_B2_GEO', '45 CFR 164.514(b)(2)(ii)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Geographic subdivisions smaller than state', 'REQUIRED_FOR_SAFE_HARBOR',
 'Exclude geographic subdivisions smaller than a state except limited exceptions.', 'phi_safe_harbor_geographic_subdivision', true, 210),
('HIPAA', 'HIPAA_164_514_B2_DATES', '45 CFR 164.514(b)(2)(iii)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Dates (except year) related to individual', 'REQUIRED_FOR_SAFE_HARBOR',
 'Exclude all elements of dates (except year) directly related to an individual.', 'phi_safe_harbor_dates_except_year', true, 220),
('HIPAA', 'HIPAA_164_514_B2_PHONE', '45 CFR 164.514(b)(2)(iv)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Telephone numbers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude telephone numbers.', 'phi_safe_harbor_telephone', true, 230),
('HIPAA', 'HIPAA_164_514_B2_FAX', '45 CFR 164.514(b)(2)(v)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Fax numbers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude fax numbers.', 'phi_safe_harbor_fax', true, 240),
('HIPAA', 'HIPAA_164_514_B2_EMAIL', '45 CFR 164.514(b)(2)(vi)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Email addresses', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude electronic mail addresses.', 'phi_safe_harbor_email', true, 250),
('HIPAA', 'HIPAA_164_514_B2_SSN', '45 CFR 164.514(b)(2)(vii)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Social security numbers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude Social Security numbers.', 'phi_safe_harbor_ssn', true, 260),
('HIPAA', 'HIPAA_164_514_B2_MRN', '45 CFR 164.514(b)(2)(viii)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Medical record numbers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude medical record numbers.', 'phi_safe_harbor_medical_record_number', true, 270),
('HIPAA', 'HIPAA_164_514_B2_HPN', '45 CFR 164.514(b)(2)(ix)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Health plan beneficiary numbers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude health plan beneficiary numbers.', 'phi_safe_harbor_health_plan_beneficiary', true, 280),
('HIPAA', 'HIPAA_164_514_B2_ACCT', '45 CFR 164.514(b)(2)(x)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Account numbers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude account numbers.', 'phi_safe_harbor_account_numbers', true, 290),
('HIPAA', 'HIPAA_164_514_B2_CERT', '45 CFR 164.514(b)(2)(xi)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Certificate / license numbers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude certificate/license numbers.', 'phi_safe_harbor_certificate_license', true, 300),
('HIPAA', 'HIPAA_164_514_B2_VEHICLE', '45 CFR 164.514(b)(2)(xii)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Vehicle identifiers and serial numbers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude vehicle identifiers and serial numbers including license plates.', 'phi_safe_harbor_vehicle_identifiers', true, 310),
('HIPAA', 'HIPAA_164_514_B2_DEVICE', '45 CFR 164.514(b)(2)(xiii)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Device identifiers and serial numbers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude device identifiers and serial numbers.', 'phi_safe_harbor_device_serial', true, 320),
('HIPAA', 'HIPAA_164_514_B2_URL', '45 CFR 164.514(b)(2)(xiv)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Web URLs', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude Web Universal Resource Locators (URLs).', 'phi_safe_harbor_urls', true, 330),
('HIPAA', 'HIPAA_164_514_B2_IP', '45 CFR 164.514(b)(2)(xv)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'IP addresses', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude Internet Protocol (IP) address numbers.', 'phi_safe_harbor_ip_addresses', true, 340),
('HIPAA', 'HIPAA_164_514_B2_BIOMETRIC', '45 CFR 164.514(b)(2)(xvi)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Biometric identifiers', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude biometric identifiers including finger and voice prints.', 'phi_safe_harbor_biometric', true, 350),
('HIPAA', 'HIPAA_164_514_B2_PHOTO', '45 CFR 164.514(b)(2)(xvii)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Full face photographic images', 'REQUIRED_FOR_SAFE_HARBOR', 'Exclude full face photographic images and comparable images.', 'phi_safe_harbor_full_face_images', true, 360),
('HIPAA', 'HIPAA_164_514_B2_OTHER', '45 CFR 164.514(b)(2)(xviii)', 'SAFE_HARBOR_DE_IDENTIFICATION', 'Other unique identifying numbers/characteristics', 'REQUIRED_FOR_SAFE_HARBOR',
 'Exclude any other unique identifying number, characteristic, or code.', 'phi_safe_harbor_other_unique_identifiers', true, 370),

-- ========== HIPAA: Selected Privacy / Security Management (data-related) ==========
('HIPAA', 'HIPAA_164_502_B_MIN_NECESSARY', '45 CFR 164.502(b)', 'PRIVACY_RULE', 'Minimum necessary standard', 'REQUIRED',
 'Use, disclosure, and requests for PHI limited to the minimum necessary.', NULL, false, 400),
('HIPAA', 'HIPAA_164_502_E_BAA', '45 CFR 164.502(e)', 'PRIVACY_RULE', 'Business associate contracts', 'REQUIRED',
 'Obtain satisfactory assurances from business associates via contract or other arrangement.', 'hipaa_baa_documented', true, 410),
('HIPAA', 'HIPAA_164_508_TPO', '45 CFR 164.508', 'PRIVACY_RULE', 'Uses and disclosures for TPO', 'CONDITIONAL',
 'Authorization requirements for uses/disclosures outside treatment, payment, and health care operations where applicable.', NULL, false, 420),
('HIPAA', 'HIPAA_164_510_OPPORTUNITY', '45 CFR 164.510', 'PRIVACY_RULE', 'Uses and disclosures requiring opportunity to agree or object', 'CONDITIONAL', 'Facility directories and involvement in care rules.', NULL, false, 430),
('HIPAA', 'HIPAA_164_512_PUBLIC_INTEREST', '45 CFR 164.512', 'PRIVACY_RULE', 'Uses and disclosures for which consent/authorization not required', 'CONDITIONAL', 'Public interest and benefit activities (specific provisions apply).', NULL, false, 440),
('HIPAA', 'HIPAA_164_512_I_RESEARCH', '45 CFR 164.512(i)', 'PRIVACY_RULE', 'Uses and disclosures for research', 'CONDITIONAL', 'Research uses/disclosures subject to IRB/waiver or authorization rules.', NULL, false, 450),
('HIPAA', 'HIPAA_164_308_A1IIA_RISK', '45 CFR 164.308(a)(1)(ii)(A)', 'ADMINISTRATIVE_SAFEGUARD', 'Risk analysis', 'REQUIRED', 'Conduct accurate assessment of risks to ePHI.', 'hipaa_security_risk_analysis_documented', true, 460),
('HIPAA', 'HIPAA_164_308_A1IIC_SANCTION', '45 CFR 164.308(a)(1)(ii)(C)', 'ADMINISTRATIVE_SAFEGUARD', 'Sanction policy', 'REQUIRED', 'Apply sanctions against workforce members who fail to comply.', 'hipaa_workforce_sanction_policy_documented', true, 470),
('HIPAA', 'HIPAA_164_308_A5_WORKFORCE', '45 CFR 164.308(a)(5)', 'ADMINISTRATIVE_SAFEGUARD', 'Security awareness and training', 'ADDRESSABLE', 'Implement security awareness and training for workforce.', 'hipaa_workforce_security_training_program', true, 480),
('HIPAA', 'HIPAA_164_308_A6_INCIDENT', '45 CFR 164.308(a)(6)', 'ADMINISTRATIVE_SAFEGUARD', 'Security incident procedures', 'REQUIRED', 'Identify, respond to, mitigate, and document security incidents.', 'hipaa_security_incident_procedures_documented', true, 490),
('HIPAA', 'HIPAA_164_308_A7_CONTINGENCY', '45 CFR 164.308(a)(7)', 'ADMINISTRATIVE_SAFEGUARD', 'Contingency plan', 'REQUIRED', 'Data backup, disaster recovery, emergency mode operation plan.', 'hipaa_contingency_plan_documented', true, 500),

-- ========== GDPR: Principles & lawful processing (reference) ==========
('GDPR', 'GDPR_ART5_1A_LAWFUL_FAIR', 'GDPR Art. 5(1)(a)', 'PRINCIPLE', 'Processed lawfully, fairly and transparently', 'OBLIGATION', 'Personal data shall be processed lawfully, fairly and in a transparent manner.', NULL, false, 1000),
('GDPR', 'GDPR_ART5_1B_PURPOSE', 'GDPR Art. 5(1)(b)', 'PRINCIPLE', 'Purpose limitation', 'OBLIGATION', 'Collected for specified, explicit and legitimate purposes.', NULL, false, 1010),
('GDPR', 'GDPR_ART5_1C_MINIMISATION', 'GDPR Art. 5(1)(c)', 'PRINCIPLE', 'Data minimisation', 'OBLIGATION', 'Adequate, relevant and limited to what is necessary.', 'gdpr_data_minimisation_enforced_in_apis', true, 1020),
('GDPR', 'GDPR_ART5_1D_ACCURACY', 'GDPR Art. 5(1)(d)', 'PRINCIPLE', 'Accuracy', 'OBLIGATION', 'Accurate and kept up to date; inaccurate data erased or rectified.', 'gdpr_data_accuracy_process_documented', true, 1030),
('GDPR', 'GDPR_ART5_1E_STORAGE', 'GDPR Art. 5(1)(e)', 'PRINCIPLE', 'Storage limitation', 'OBLIGATION', 'Kept in a form permitting identification no longer than necessary.', 'gdpr_retention_policy_documented', true, 1040),
('GDPR', 'GDPR_ART5_1F_INTEGRITY', 'GDPR Art. 5(1)(f)', 'PRINCIPLE', 'Integrity and confidentiality', 'OBLIGATION', 'Appropriate security including against unauthorised processing, accidental loss, destruction or damage.', NULL, false, 1050),
('GDPR', 'GDPR_ART5_2_ACCOUNTABILITY', 'GDPR Art. 5(2)', 'PRINCIPLE', 'Accountability', 'OBLIGATION', 'Controller responsible for and able to demonstrate compliance.', 'gdpr_accountability_controls_documented', true, 1060),

('GDPR', 'GDPR_ART6_1A_CONSENT', 'GDPR Art. 6(1)(a)', 'LAWFUL_BASIS', 'Lawful basis: consent', 'CONDITIONAL', 'Processing based on consent of the data subject.', NULL, false, 1100),
('GDPR', 'GDPR_ART6_1B_CONTRACT', 'GDPR Art. 6(1)(b)', 'LAWFUL_BASIS', 'Lawful basis: contract', 'CONDITIONAL', 'Processing necessary for performance of a contract.', NULL, false, 1110),
('GDPR', 'GDPR_ART6_1C_LEGAL_OBLIGATION', 'GDPR Art. 6(1)(c)', 'LAWFUL_BASIS', 'Lawful basis: legal obligation', 'CONDITIONAL', 'Processing necessary for compliance with a legal obligation.', NULL, false, 1120),
('GDPR', 'GDPR_ART6_1D_VITAL', 'GDPR Art. 6(1)(d)', 'LAWFUL_BASIS', 'Lawful basis: vital interests', 'CONDITIONAL', 'Processing necessary to protect vital interests.', NULL, false, 1130),
('GDPR', 'GDPR_ART6_1E_PUBLIC_TASK', 'GDPR Art. 6(1)(e)', 'LAWFUL_BASIS', 'Lawful basis: public task', 'CONDITIONAL', 'Processing necessary for performance of a task in the public interest or official authority.', NULL, false, 1140),
('GDPR', 'GDPR_ART6_1F_LEGITIMATE', 'GDPR Art. 6(1)(f)', 'LAWFUL_BASIS', 'Lawful basis: legitimate interests', 'CONDITIONAL', 'Processing necessary for legitimate interests (balancing test applies).', NULL, false, 1150),
('GDPR', 'GDPR_ART6_LAWFUL_BASIS_DOCUMENTED', 'GDPR Art. 6', 'LAWFUL_BASIS', 'Lawful basis documented per processing activity', 'OBLIGATION',
 'For each processing activity, identify and document applicable lawful basis.', 'gdpr_lawful_basis_documented_per_activity', true, 1160),

('GDPR', 'GDPR_ART7_CONSENT_CONDITIONS', 'GDPR Art. 7', 'CONSENT', 'Conditions for consent', 'CONDITIONAL',
 'Consent demonstrable; withdrawable; clear and distinguishable from other matters.', 'gdpr_consent_mechanism_meets_art7', true, 1200),

('GDPR', 'GDPR_ART9_1_SPECIAL', 'GDPR Art. 9(1)', 'SPECIAL_CATEGORY', 'Processing of special categories', 'PROHIBITED_UNLESS_EXCEPTION',
 'Processing of personal data revealing health, etc., is prohibited unless Art. 9(2) applies.', NULL, false, 1300),
('GDPR', 'GDPR_ART9_2A_EXPLICIT', 'GDPR Art. 9(2)(a)', 'SPECIAL_CATEGORY', 'Explicit consent', 'CONDITIONAL', 'Data subject has given explicit consent (where permitted).', NULL, false, 1310),
('GDPR', 'GDPR_ART9_2H_HEALTH', 'GDPR Art. 9(2)(h)', 'SPECIAL_CATEGORY', 'Health or social care (with conditions)', 'CONDITIONAL', 'Processing necessary for health care purposes subject to professional secrecy and safeguards.', 'gdpr_health_processing_art9_2h_safeguards', true, 1320),
('GDPR', 'GDPR_ART9_2I_PUBLIC_HEALTH', 'GDPR Art. 9(2)(i)', 'SPECIAL_CATEGORY', 'Public health', 'CONDITIONAL', 'Reasons of public interest in public health.', NULL, false, 1330),
('GDPR', 'GDPR_ART9_2J_RESEARCH', 'GDPR Art. 9(2)(j)', 'SPECIAL_CATEGORY', 'Archiving, research, statistics', 'CONDITIONAL', 'Subject to Union or Member State law with safeguards.', NULL, false, 1340),

('GDPR', 'GDPR_ART12_TRANSPARENT', 'GDPR Art. 12', 'TRANSPARENCY', 'Transparent information and communication', 'OBLIGATION', 'Information provided in concise, transparent, intelligible and easily accessible form.', NULL, false, 1400),
('GDPR', 'GDPR_ART13_INFO_COLLECTION', 'GDPR Art. 13', 'TRANSPARENCY', 'Information where collected from data subject', 'OBLIGATION', 'Provide specified information at collection when data obtained from the data subject.', NULL, false, 1410),
('GDPR', 'GDPR_ART14_INFO_THIRD_PARTY', 'GDPR Art. 14', 'TRANSPARENCY', 'Information where not obtained from data subject', 'OBLIGATION', 'Provide specified information when personal data not obtained from the data subject.', NULL, false, 1420),

('GDPR', 'GDPR_ART15_ACCESS', 'GDPR Art. 15', 'DATA_SUBJECT_RIGHT', 'Right of access', 'OBLIGATION', 'Data subject right to obtain confirmation and access to personal data.', 'gdpr_right_of_access_process_implemented', true, 1500),
('GDPR', 'GDPR_ART16_RECTIFICATION', 'GDPR Art. 16', 'DATA_SUBJECT_RIGHT', 'Right to rectification', 'OBLIGATION', 'Right to obtain without undue delay rectification of inaccurate data.', 'gdpr_right_to_rectification_process_implemented', true, 1510),
('GDPR', 'GDPR_ART17_ERASURE', 'GDPR Art. 17', 'DATA_SUBJECT_RIGHT', 'Right to erasure', 'OBLIGATION', 'Right to erasure (right to be forgotten) subject to grounds.', 'gdpr_right_to_erasure_process_implemented', true, 1520),
('GDPR', 'GDPR_ART18_RESTRICTION', 'GDPR Art. 18', 'DATA_SUBJECT_RIGHT', 'Right to restriction of processing', 'OBLIGATION', 'Right to obtain restriction of processing in specified cases.', 'gdpr_right_to_restriction_process_implemented', true, 1530),
('GDPR', 'GDPR_ART19_NOTIFICATION', 'GDPR Art. 19', 'DATA_SUBJECT_RIGHT', 'Notification obligation regarding rectification/erasure/restriction', 'OBLIGATION', 'Notify recipients unless impossible or disproportionate.', 'gdpr_recipient_notification_procedure_documented', true, 1540),
('GDPR', 'GDPR_ART20_PORTABILITY', 'GDPR Art. 20', 'DATA_SUBJECT_RIGHT', 'Right to data portability', 'OBLIGATION', 'Receive personal data in structured, commonly used, machine-readable format where applicable.', 'gdpr_right_to_data_portability_implemented', true, 1550),
('GDPR', 'GDPR_ART21_OBJECT', 'GDPR Art. 21', 'DATA_SUBJECT_RIGHT', 'Right to object', 'OBLIGATION', 'Right to object to processing including profiling and direct marketing.', 'gdpr_right_to_object_process_implemented', true, 1560),
('GDPR', 'GDPR_ART22_AUTOMATED', 'GDPR Art. 22', 'DATA_SUBJECT_RIGHT', 'Automated individual decision-making, including profiling', 'CONDITIONAL',
 'Rights related to solely automated decisions with legal or similarly significant effects.', 'gdpr_art22_safeguards_if_profiling_applicable', true, 1570),

('GDPR', 'GDPR_ART25_PBDD', 'GDPR Art. 25', 'PRIVACY_BY_DESIGN', 'Data protection by design and by default', 'OBLIGATION',
 'Implement appropriate technical and organisational measures for data protection principles.', 'gdpr_privacy_by_design_measures_implemented', true, 1600),

('GDPR', 'GDPR_ART30_RECORDS', 'GDPR Art. 30', 'RECORDS', 'Records of processing activities', 'OBLIGATION',
 'Maintain records of processing activities under responsibility of controller/processor.', 'gdpr_records_of_processing_maintained', true, 1700),

('GDPR', 'GDPR_ART32_CONFIDENTIALITY', 'GDPR Art. 32(1)(b)', 'SECURITY', 'Confidentiality of processing systems', 'OBLIGATION', 'Pseudonymisation and encryption of personal data where appropriate.', 'gdpr_encryption_of_personal_data_where_appropriate', true, 1800),
('GDPR', 'GDPR_ART32_INTEGRITY', 'GDPR Art. 32(1)(b)', 'SECURITY', 'Integrity of personal data', 'OBLIGATION', 'Ability to ensure ongoing confidentiality, integrity, availability and resilience.', 'gdpr_processing_systems_resilience_documented', true, 1810),
('GDPR', 'GDPR_ART32_AVAILABILITY', 'GDPR Art. 32(1)(b)', 'SECURITY', 'Availability and access', 'OBLIGATION', 'Ability to restore availability and access in timely manner after incident.', 'gdpr_backup_restore_tested', true, 1820),
('GDPR', 'GDPR_ART32_TESTING', 'GDPR Art. 32(1)(d)', 'SECURITY', 'Testing and evaluation', 'OBLIGATION', 'Process for regularly testing, assessing and evaluating effectiveness of measures.', 'gdpr_security_testing_program_documented', true, 1830),
('GDPR', 'GDPR_ART32_ACCESS_CONTROL', 'GDPR Art. 32(1)(b)', 'SECURITY', 'Access controls', 'OBLIGATION', 'Measures to ensure security appropriate to risk (access control is typical measure).', 'gdpr_access_controls_implemented', true, 1840),

('GDPR', 'GDPR_ART33_BREACH_CTRL', 'GDPR Art. 33', 'BREACH', 'Notification to supervisory authority', 'OBLIGATION', 'Notify personal data breach to authority without undue delay where feasible within 72 hours.', 'gdpr_breach_notification_procedure_implemented', true, 1900),
('GDPR', 'GDPR_ART34_BREACH_SUBJECT', 'GDPR Art. 34', 'BREACH', 'Communication to data subject', 'CONDITIONAL', 'Communicate breach to data subject when likely high risk.', 'gdpr_breach_subject_communication_procedure_documented', true, 1910),

('GDPR', 'GDPR_ART35_DPIA', 'GDPR Art. 35', 'GOVERNANCE', 'Data protection impact assessment', 'CONDITIONAL', 'Where processing likely high risk, carry out DPIA.', 'gdpr_dpia_conducted_where_required', true, 2000),
('GDPR', 'GDPR_ART36_PRIOR', 'GDPR Art. 36', 'GOVERNANCE', 'Prior consultation', 'CONDITIONAL', 'Consult supervisory authority prior to processing if DPIA indicates high risk without mitigation.', NULL, false, 2010),

('GDPR', 'GDPR_ART37_DPO', 'GDPR Art. 37', 'GOVERNANCE', 'Designation of data protection officer', 'CONDITIONAL', 'Designate DPO where required.', 'gdpr_dpo_designated_where_required', true, 2100),
('GDPR', 'GDPR_ART28_PROCESSOR', 'GDPR Art. 28', 'PROCESSOR', 'Processor obligations and contract', 'OBLIGATION', 'Processor processes only on documented instructions; appropriate contract terms.', 'gdpr_processor_agreements_documented', true, 2200),

('GDPR', 'GDPR_ART44_TRANSFERS', 'GDPR Art. 44', 'TRANSFERS', 'General principle for transfers', 'OBLIGATION', 'Transfers to third country or international organisation only on compliance with Chapter V.', NULL, false, 2300),
('GDPR', 'GDPR_ART45_ADEQUACY', 'GDPR Art. 45', 'TRANSFERS', 'Transfers on basis of adequacy decision', 'CONDITIONAL', 'Transfer without authorisation where Commission adequacy decision.', NULL, false, 2310),
('GDPR', 'GDPR_ART46_SAFEGUARDS', 'GDPR Art. 46', 'TRANSFERS', 'Transfers subject to appropriate safeguards', 'CONDITIONAL', 'Standard contractual clauses, BCRs, codes, etc., where applicable.', 'gdpr_cross_border_transfer_mechanism_documented', true, 2320),
('GDPR', 'GDPR_ART49_DEROGATIONS', 'GDPR Art. 49', 'TRANSFERS', 'Derogations for specific situations', 'CONDITIONAL', 'Specific derogations (explicit consent, contract necessity, etc.) where applicable.', NULL, false, 2330)
) AS v(framework, rule_code, legal_reference, category, title, requirement_type, description, evidence_key, automated, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM compliance_catalog_rules c WHERE c.framework = v.framework AND c.rule_code = v.rule_code);
