
CREATE DATABASE hospital_management;
USE hospital_management;

-- ============================
-- 1. PATIENT MANAGEMENT MODULE
-- ============================


CREATE TABLE patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_code VARCHAR(20) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    gender ENUM('Male', 'Female', 'Other'),
    age INT,
    contact_number VARCHAR(15),
    address VARCHAR(255),
    email VARCHAR(100),
    date_registered DATE DEFAULT (CURRENT_DATE),
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);


CREATE TABLE appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_code VARCHAR(20) UNIQUE,
    patient_id INT,
    doctor_id INT,
    department VARCHAR(100),
    appointment_date DATE,
    appointment_time TIME,
    status ENUM('Scheduled', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    notes TEXT
);

ALTER TABLE appointments
ADD CONSTRAINT fk_appointments_patient
FOREIGN KEY (patient_id)
REFERENCES patients(patient_id)
ON DELETE CASCADE
ON UPDATE CASCADE;


CREATE TABLE medical_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    visit_date DATE,
    diagnosis TEXT,
    treatment TEXT,
    prescription TEXT,
    doctor_id INT,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);
ALTER TABLE medical_history
DROP FOREIGN KEY medical_history_ibfk_1;

ALTER TABLE medical_history
ADD CONSTRAINT medical_history_ibfk_1
FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
ON DELETE CASCADE;


CREATE TABLE patient_lab_tests (
    test_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    appointment_id INT,
    test_name VARCHAR(100),
    test_date DATE DEFAULT (CURRENT_DATE),
    result TEXT,
    remarks VARCHAR(255),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE patient_lab_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT,
    parameter_name VARCHAR(100),
    result_value VARCHAR(50),
    normal_range VARCHAR(50),
    unit VARCHAR(20),
    FOREIGN KEY (test_id) REFERENCES patient_lab_tests(test_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);




-- ============================
-- 2. DOCTOR & STAFF SCHEDULING MODULE
-- ============================


CREATE TABLE doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_code VARCHAR(20) UNIQUE,
    full_name VARCHAR(100),
    specialization VARCHAR(100),
    contact_number VARCHAR(15),
    email VARCHAR(100),
    department VARCHAR(100),
    working_hours VARCHAR(50),
    status ENUM('Available', 'On Leave') DEFAULT 'Available'
);


CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_code VARCHAR(20) UNIQUE,
    full_name VARCHAR(100),
    role ENUM('Nurse','Lab Technician','Receptionist','Pharmacist','Cleaner','Other'),
    contact_number VARCHAR(15),
    email VARCHAR(100),
    shift VARCHAR(50),
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
);


CREATE TABLE duty_shifts (
    shift_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT,
    doctor_id INT,
    shift_date DATE,
    start_time TIME,
    end_time TIME,
    remarks VARCHAR(255),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

CREATE TABLE doctor_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
    start_time TIME,
    end_time TIME,
    status ENUM('Available','Unavailable') DEFAULT 'Available',
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    description TEXT,
    head_doctor_id INT,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    FOREIGN KEY (head_doctor_id) REFERENCES doctors(doctor_id)
);


CREATE TABLE consultation_rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(20) UNIQUE,
    room_name VARCHAR(100),
    department_id INT,
    doctor_id INT,
    status ENUM('Available','Occupied','Under Maintenance') DEFAULT 'Available',
    FOREIGN KEY (department_id) REFERENCES departments(department_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);




-- ============================
-- 3. PHARMACY & INVENTORY MODULE
-- ============================

CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    contact_person VARCHAR(100),
    phone VARCHAR(15),
    email VARCHAR(100),
    address VARCHAR(255),
    status ENUM('Active', 'Inactive') DEFAULT 'Active'
) ENGINE=InnoDB;


CREATE TABLE medicines (
    medicine_id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_code VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    category VARCHAR(50),
    supplier_id INT,
    unit_price DECIMAL(10,2),
    quantity_in_stock INT,
    expiry_date DATE,
    reorder_level INT,
    status ENUM('Available','Out of Stock','Expired') DEFAULT 'Available',
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);


CREATE TABLE purchase_orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(20) UNIQUE,
    supplier_id INT,
    order_date DATE,
    total_amount DECIMAL(10,2),
    status ENUM('Pending','Received','Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);


CREATE TABLE purchase_order_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    medicine_id INT,
    quantity INT,
    unit_price DECIMAL(10,2),
    subtotal DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES purchase_orders(order_id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)
);


CREATE TABLE issued_medicines (
    issue_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    prescription_id INT,
    medicine_id INT,
    quantity INT,
    issue_date DATE DEFAULT (CURRENT_DATE),
    issued_by INT,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id),
    FOREIGN KEY (issued_by) REFERENCES staff(staff_id)
);
ALTER TABLE issued_medicines
DROP FOREIGN KEY issued_medicines_ibfk_1;

ALTER TABLE issued_medicines
ADD CONSTRAINT issued_medicines_ibfk_1
FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  message VARCHAR(255) NOT NULL,
  type ENUM('Low Stock','Expiry Alert','Stock Received') NOT NULL,
  reference_id INT NULL, -- optional: link to medicine_id or order_id
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_status TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

-- ============================
-- 4. BILLING & INSURANCE MODULE
-- ============================

CREATE TABLE billing (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_code VARCHAR(20) UNIQUE,
    patient_id INT,
    bill_date DATE DEFAULT (CURRENT_DATE),
    total_amount DECIMAL(10,2),
    payment_method ENUM('Cash','Card','Insurance'),
    status ENUM('Paid','Unpaid','Partially Paid') DEFAULT 'Unpaid',
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);
ALTER TABLE billing 
MODIFY COLUMN status ENUM('Paid', 'Unpaid', 'Pending', 'Partially Paid', 'Submitted') NOT NULL;

ALTER TABLE billing
DROP FOREIGN KEY billing_ibfk_1;

ALTER TABLE billing
ADD CONSTRAINT billing_ibfk_1
FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
ON DELETE CASCADE;


CREATE TABLE bill_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT,
    description VARCHAR(255),
    amount DECIMAL(10,2),
    FOREIGN KEY (bill_id) REFERENCES billing(bill_id)
);


CREATE TABLE insurance_claims (
    claim_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT,
    insurance_provider VARCHAR(100),
    policy_number VARCHAR(50),
    claim_amount DECIMAL(10,2),
    claim_status ENUM('Submitted','Approved','Rejected','Pending') DEFAULT 'Pending',
    submission_date DATE,
    approval_date DATE,
    FOREIGN KEY (bill_id) REFERENCES billing(bill_id)
);


CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT,
    payment_date DATE DEFAULT (CURRENT_DATE),
    amount_paid DECIMAL(10,2),
    payment_method ENUM('Cash','Card','Insurance'),
    reference_number VARCHAR(50),
    received_by INT,
    FOREIGN KEY (bill_id) REFERENCES billing(bill_id),
    FOREIGN KEY (received_by) REFERENCES staff(staff_id)
);


---------------------------------------------------------------------------------------------------------------------


-- ============================
-- 1. Patient Management Module
-- ============================
DESC patients;
DESC appointments;
DESC medical_history;

-- ============================
-- 2. Doctor & Staff Scheduling Module
-- ============================
DESC doctors;
DESC staff;
DESC duty_shifts;

-- ============================
-- 3. Pharmacy & Inventory Module
-- ============================
DESC suppliers;
DESC medicines;
DESC purchase_orders;
DESC purchase_order_items;
DESC issued_medicines;

-- ============================
-- 4. Billing & Insurance Module
-- ============================
DESC billing;
DESC bill_items;
DESC insurance_claims;
DESC payments;


-------------------------------------------------------------------------------------------------------------------------------------

INSERT INTO patients (patient_code, first_name, last_name, gender, age, contact_number, address, email, status) VALUES
('PAT-001','Kasun','Perera','Male',35,'0712345678','Colombo','kasunp@gmail.com','Active'),
('PAT-002','Nimali','Fernando','Female',29,'0771234567','Galle','nimali.fernando@gmail.com','Active'),
('PAT-003','Sajith','Silva','Male',42,'0758765432','Kandy','sajith.silva@gmail.com','Active'),
('PAT-004','Tharushi','Jayawardena','Female',25,'0761122334','Matara','tharushi.jay@gmail.com','Active'),
('PAT-005','Ravindu','Senanayake','Male',31,'0719988776','Negombo','ravindu.s@gmail.com','Active'),
('PAT-006','Isuru','De Alwis','Male',40,'0772233445','Kurunegala','isurud@gmail.com','Active'),
('PAT-007','Bimsara','Gunasekara','Male',27,'0753344556','Kegalle','bimsarag@gmail.com','Active'),
('PAT-008','Dilani','Weerasinghe','Female',33,'0714455667','Kalutara','dilaniw@gmail.com','Active'),
('PAT-009','Chathura','Abeykoon','Male',45,'0775566778','Anuradhapura','chathuraa@gmail.com','Active'),
('PAT-010','Nadeesha','Rathnayake','Female',37,'0766677889','Polonnaruwa','nadeesha.r@gmail.com','Active'),
('PAT-011','Madushan','Karunaratne','Male',50,'0717788990','Gampaha','madushan.k@gmail.com','Active'),
('PAT-012','Kavindi','Dias','Female',24,'0778899001','Colombo','kavindid@gmail.com','Active'),
('PAT-013','Niroshan','Bandara','Male',39,'0759900112','Kandy','niroshanb@gmail.com','Active'),
('PAT-014','Harini','Wickramasinghe','Female',28,'0710011223','Matara','hariniw@gmail.com','Active'),
('PAT-015','Dinesh','Jayasekara','Male',44,'0771122334','Kurunegala','dineshj@gmail.com','Active'),
('PAT-016','Pavithra','Ekanayake','Female',31,'0752233445','Kalutara','pavithrae@gmail.com','Active'),
('PAT-017','Ruwan','Fonseka','Male',48,'0713344556','Galle','ruwanf@gmail.com','Active'),
('PAT-018','Yasara','Samarasinghe','Female',29,'0774455667','Colombo','yasaras@gmail.com','Active'),
('PAT-019','Suren','Hettiarachchi','Male',35,'0755566778','Negombo','surene@gmail.com','Active'),
('PAT-020','Anjalee','Jayawardena','Female',32,'0716677889','Kandy','anjalee.j@gmail.com','Active');

INSERT INTO appointments (appointment_code, patient_id, doctor_id, department, appointment_date, appointment_time, status, notes) VALUES
('APT-001',1,1,'Cardiology','2025-10-01','09:00:00','Completed','Regular checkup'),
('APT-002',2,2,'Dermatology','2025-10-02','10:00:00','Completed','Skin rash evaluation'),
('APT-003',3,3,'Orthopedics','2025-10-03','11:00:00','Completed','Knee pain assessment'),
('APT-004',4,4,'Pediatrics','2025-10-04','09:30:00','Completed','Child vaccination'),
('APT-005',5,5,'Neurology','2025-10-05','14:00:00','Scheduled','Migraine follow-up'),
('APT-006',6,6,'Gynecology','2025-10-06','10:30:00','Completed','Routine checkup'),
('APT-007',7,7,'Surgery','2025-10-07','13:00:00','Completed','Pre-op consultation'),
('APT-008',8,8,'ENT','2025-10-08','09:45:00','Completed','Ear infection treatment'),
('APT-009',9,9,'Ophthalmology','2025-10-09','15:00:00','Completed','Vision test'),
('APT-010',10,10,'Psychiatry','2025-10-10','16:00:00','Completed','Counseling session'),
('APT-011',11,1,'Cardiology','2025-10-11','09:15:00','Scheduled','Follow-up consultation'),
('APT-012',12,2,'Dermatology','2025-10-12','10:20:00','Completed','Acne treatment'),
('APT-013',13,3,'Orthopedics','2025-10-13','11:30:00','Completed','Lower back pain'),
('APT-014',14,4,'Pediatrics','2025-10-14','09:45:00','Completed','Child checkup'),
('APT-015',15,5,'Neurology','2025-10-15','14:30:00','Scheduled','Headache review'),
('APT-016',16,6,'Gynecology','2025-10-16','10:40:00','Completed','Pregnancy follow-up'),
('APT-017',17,7,'Surgery','2025-10-17','13:15:00','Completed','Post-surgery evaluation'),
('APT-018',18,8,'ENT','2025-10-18','09:50:00','Completed','Throat infection'),
('APT-019',19,9,'Ophthalmology','2025-10-19','15:10:00','Completed','Vision correction'),
('APT-020',20,10,'Psychiatry','2025-10-20','16:20:00','Completed','Therapy session');


INSERT INTO medical_history (patient_id, visit_date, diagnosis, treatment, prescription, doctor_id) VALUES
(1,'2025-10-01','Hypertension','Advice on diet and exercise','Tablet A - 1/day',1),
(2,'2025-10-02','Eczema','Topical cream','Cream B - apply twice daily',2),
(3,'2025-10-03','Knee arthritis','Physiotherapy','Painkiller C - 2/day',3),
(4,'2025-10-04','Fever','Rest and hydration','Paracetamol 500mg - 3/day',4),
(5,'2025-10-05','Migraine','Lifestyle changes','Migraine tablet D - 1/day',5),
(6,'2025-10-06','Routine gynecological check','Observation','None',6),
(7,'2025-10-07','Appendicitis pre-op','Scheduled surgery','Painkiller E - 2/day',7),
(8,'2025-10-08','Otitis media','Antibiotics course','Antibiotic F - 3/day',8),
(9,'2025-10-09','Myopia','Prescription update','Eye drops G - 2/day',9),
(10,'2025-10-10','Anxiety disorder','Counseling and therapy','Tablet H - 1/day',10),
(11,'2025-10-11','Hypertension follow-up','Adjust medication','Tablet A - 1/day',1),
(12,'2025-10-12','Acne','Topical treatment','Cream B - apply twice daily',2),
(13,'2025-10-13','Lower back pain','Physiotherapy','Painkiller C - 2/day',3),
(14,'2025-10-14','Child vaccination','Immunization','Vaccine I',4),
(15,'2025-10-15','Migraine','Medication review','Migraine tablet D - 1/day',5),
(16,'2025-10-16','Pregnancy check-up','Observation','None',6),
(17,'2025-10-17','Post-surgery follow-up','Wound care','Painkiller E - 2/day',7),
(18,'2025-10-18','Throat infection','Antibiotics','Antibiotic F - 3/day',8),
(19,'2025-10-19','Vision correction','Prescription glasses','Eye drops G - 2/day',9),
(20,'2025-10-20','Counseling','Therapy sessions','Tablet H - 1/day',10);

INSERT INTO medical_history (patient_id, visit_date, diagnosis, treatment, prescription, doctor_id) VALUES
('PAT-001','2025-10-01','Hypertension','Advice on diet and exercise','Tablet A - 1/day',1);

INSERT INTO patient_lab_tests 
(patient_id, appointment_id, test_name, test_date, result, remarks)
VALUES
(1, 1, 'Full Blood Count', '2025-10-01', 'Normal', 'Routine health check'),
(2, 2, 'Lipid Profile', '2025-10-02', 'Slightly high cholesterol', 'Dietary advice given'),
(3, 3, 'Blood Sugar (Fasting)', '2025-10-03', 'Normal', 'No signs of diabetes'),
(4, 4, 'Urine Routine Test', '2025-10-04', 'Mild infection', 'Prescribed antibiotics'),
(5, 5, 'Thyroid Profile (TSH, T3, T4)', '2025-10-05', 'Normal', 'No abnormalities'),
(6, 6, 'Pregnancy Test', '2025-10-06', 'Positive', 'Referred for ultrasound'),
(7, 7, 'ECG Test', '2025-10-07', 'Normal', 'No cardiac irregularities'),
(8, 8, 'Ear Swab Culture', '2025-10-08', 'Bacterial growth present', 'Antibiotic prescribed'),
(9, 9, 'Vision Screening', '2025-10-09', 'Short-sightedness', 'Prescription glasses advised'),
(10, 10, 'Mental Health Evaluation', '2025-10-10', 'Mild anxiety', 'Counselling suggested'),
(11, 11, 'Full Blood Count', '2025-10-11', 'Normal', 'Follow-up in 6 months'),
(12, 12, 'Skin Allergy Test', '2025-10-12', 'Positive for dust allergy', 'Avoid triggers'),
(13, 13, 'X-Ray (Lower Back)', '2025-10-13', 'No fracture', 'Physiotherapy advised'),
(14, 14, 'Child Immunization Check', '2025-10-14', 'All vaccines up to date', 'No issues'),
(15, 15, 'Migraine Scan (CT)', '2025-10-15', 'Normal', 'Medication adjusted'),
(16, 16, 'Pregnancy Ultrasound', '2025-10-16', 'Healthy fetus', 'Next scan in 2 weeks'),
(17, 17, 'Post-Surgery Wound Check', '2025-10-17', 'Healing well', 'No infection signs'),
(18, 18, 'Throat Swab Test', '2025-10-18', 'Strep infection', 'Antibiotics given'),
(19, 19, 'Eye Pressure Test', '2025-10-19', 'Normal', 'No glaucoma detected'),
(20, 20, 'Psychiatric Assessment', '2025-10-20', 'Improving', 'Continue therapy');


INSERT INTO patient_lab_results 
(test_id, parameter_name, result_value, normal_range, unit)
VALUES
(1, 'Hemoglobin', '13.8', '12-16', 'g/dL'),
(1, 'WBC Count', '7200', '4000-11000', '/µL'),
(1, 'Platelets', '250000', '150000-400000', '/µL'),

(2, 'Total Cholesterol', '220', '<200', 'mg/dL'),
(2, 'HDL', '42', '40-60', 'mg/dL'),
(2, 'LDL', '145', '<130', 'mg/dL'),

(3, 'Fasting Glucose', '85', '70-100', 'mg/dL'),

(4, 'Leukocytes', 'Moderate', 'None', ''),
(4, 'Protein', 'Trace', 'Negative', ''),
(4, 'RBC', 'Few', 'None', ''),

(5, 'TSH', '2.1', '0.4-4.0', 'mIU/L'),
(5, 'T3', '1.4', '0.8-2.0', 'ng/mL'),
(5, 'T4', '7.5', '5.0-12.0', 'µg/dL'),

(6, 'hCG Level', 'Positive', 'Negative', ''),

(8, 'Bacteria', 'Present', 'None', ''),
(8, 'Culture Type', 'Staphylococcus aureus', 'None', ''),

(9, 'Left Eye Power', '-1.25', '0', 'D'),
(9, 'Right Eye Power', '-1.00', '0', 'D'),

(10, 'Anxiety Score', '18', '<20', 'GAD-7'),

(18, 'Strep Test', 'Positive', 'Negative', '');



INSERT INTO doctors (doctor_code, full_name, specialization, contact_number, email, department, working_hours, status) VALUES
('DOC-001','Dr. Nimal Perera','Cardiology','0711234567','nimal.perera@example.com','Cardiology','08:00-16:00','Available'),
('DOC-002','Dr. Malsha Silva','Dermatology','0712345678','malsha.silva@example.com','Dermatology','09:00-17:00','Available'),
('DOC-003','Dr. Kamal Fernando','Orthopedics','0713456789','kamal.fernando@example.com','Orthopedics','08:30-16:30','Available'),
('DOC-004','Dr. Sanduni Jayawardena','Pediatrics','0714567890','sanduni.j@example.com','Pediatrics','09:00-17:00','Available'),
('DOC-005','Dr. Ruwan Dias','Neurology','0715678901','ruwan.dias@example.com','Neurology','08:00-16:00','Available'),
('DOC-006','Dr. Chamari Perera','Gynecology','0716789012','chamari.perera@example.com','Gynecology','09:00-17:00','Available'),
('DOC-007','Dr. Asela Kumara','Surgery','0717890123','asela.kumara@example.com','Surgery','08:30-16:30','Available'),
('DOC-008','Dr. Nadeesha Silva','ENT','0718901234','nadeesha.silva@example.com','ENT','09:00-17:00','Available'),
('DOC-009','Dr. Priyantha de Silva','Ophthalmology','0719012345','priyantha.silva@example.com','Ophthalmology','08:00-16:00','Available'),
('DOC-010','Dr. Ishara Perera','Psychiatry','0710123456','ishara.perera@example.com','Psychiatry','09:00-17:00','Available'),
('DOC-011','Dr. Anuradha Wijesinghe','Cardiology','0711111111','anuradha.w@example.com','Cardiology','08:00-16:00','Available'),
('DOC-012','Dr. Roshan Fernando','Dermatology','0712222222','roshan.f@example.com','Dermatology','09:00-17:00','Available'),
('DOC-013','Dr. Harsha Silva','Orthopedics','0713333333','harsha.silva@example.com','Orthopedics','08:30-16:30','Available'),
('DOC-014','Dr. Umesha Jayasuriya','Pediatrics','0714444444','umesha.j@example.com','Pediatrics','09:00-17:00','Available'),
('DOC-015','Dr. Kasun Perera','Neurology','0715555555','kasun.perera@example.com','Neurology','08:00-16:00','Available'),
('DOC-016','Dr. Chaminda Silva','Gynecology','0716666666','chaminda.s@example.com','Gynecology','09:00-17:00','Available'),
('DOC-017','Dr. Upul Jayawardena','Surgery','0717777777','upul.j@example.com','Surgery','08:30-16:30','Available'),
('DOC-018','Dr. Sanduni Fernando','ENT','0718888888','sanduni.f@example.com','ENT','09:00-17:00','Available'),
('DOC-019','Dr. Nishan Perera','Ophthalmology','0719999999','nishan.p@example.com','Ophthalmology','08:00-16:00','Available'),
('DOC-020','Dr. Ishara Silva','Psychiatry','0710000000','ishara.s@example.com','Psychiatry','09:00-17:00','Available');


INSERT INTO staff (staff_code, full_name, role, contact_number, email, shift, status) VALUES
('STF-001','Nadeeka Perera','Nurse','0771234567','nadeeka.p@example.com','Morning','Active'),
('STF-002','Roshan Silva','Lab Technician','0772345678','roshan.s@example.com','Morning','Active'),
('STF-003','Chamari Fernando','Receptionist','0773456789','chamari.f@example.com','Evening','Active'),
('STF-004','Kasun Perera','Pharmacist','0774567890','kasun.p@example.com','Morning','Active'),
('STF-005','Nishan Silva','Cleaner','0775678901','nishan.s@example.com','Night','Active'),
('STF-006','Dilani Jayawardena','Nurse','0776789012','dilani.j@example.com','Morning','Active'),
('STF-007','Asela Fernando','Lab Technician','0777890123','asela.f@example.com','Evening','Active'),
('STF-008','Sanduni Perera','Receptionist','0778901234','sanduni.p@example.com','Morning','Active'),
('STF-009','Upul Silva','Pharmacist','0779012345','upul.s@example.com','Evening','Active'),
('STF-010','Chaminda Jayasuriya','Cleaner','0770123456','chaminda.j@example.com','Night','Active'),
('STF-011','Ishara Perera','Nurse','0771111111','ishara.p@example.com','Morning','Active'),
('STF-012','Harsha Silva','Lab Technician','0772222222','harsha.s@example.com','Evening','Active'),
('STF-013','Umesha Fernando','Receptionist','0773333333','umesha.f@example.com','Morning','Active'),
('STF-014','Ruwan Perera','Pharmacist','0774444444','ruwan.p@example.com','Morning','Active'),
('STF-015','Priyantha Silva','Cleaner','0775555555','priyantha.s@example.com','Night','Active'),
('STF-016','Anuradha Jayawardena','Nurse','0776666666','anuradha.j@example.com','Morning','Active'),
('STF-017','Roshan Perera','Lab Technician','0777777777','roshan.p@example.com','Evening','Active'),
('STF-018','Nadeeka Silva','Receptionist','0778888888','nadeeka.s@example.com','Morning','Active'),
('STF-019','Kasun Fernando','Pharmacist','0779999999','kasun.f@example.com','Evening','Active'),
('STF-020','Dilani Silva','Cleaner','0770000000','dilani.s@example.com','Night','Active');


INSERT INTO duty_shifts (staff_id, doctor_id, shift_date, start_time, end_time, remarks) VALUES
(1,1,'2025-10-01','08:00:00','16:00:00','Morning shift'),
(2,2,'2025-10-01','08:00:00','16:00:00','Morning shift'),
(3,3,'2025-10-01','16:00:00','00:00:00','Evening shift'),
(4,4,'2025-10-01','08:00:00','16:00:00','Morning shift'),
(5,5,'2025-10-01','00:00:00','08:00:00','Night shift'),
(6,6,'2025-10-02','08:00:00','16:00:00','Morning shift'),
(7,7,'2025-10-02','16:00:00','00:00:00','Evening shift'),
(8,8,'2025-10-02','08:00:00','16:00:00','Morning shift'),
(9,9,'2025-10-02','16:00:00','00:00:00','Evening shift'),
(10,10,'2025-10-02','00:00:00','08:00:00','Night shift'),
(11,11,'2025-10-03','08:00:00','16:00:00','Morning shift'),
(12,12,'2025-10-03','16:00:00','00:00:00','Evening shift'),
(13,13,'2025-10-03','08:00:00','16:00:00','Morning shift'),
(14,14,'2025-10-03','08:00:00','16:00:00','Morning shift'),
(15,15,'2025-10-03','00:00:00','08:00:00','Night shift'),
(16,16,'2025-10-04','08:00:00','16:00:00','Morning shift'),
(17,17,'2025-10-04','16:00:00','00:00:00','Evening shift'),
(18,18,'2025-10-04','08:00:00','16:00:00','Morning shift'),
(19,19,'2025-10-04','16:00:00','00:00:00','Evening shift'),
(20,20,'2025-10-04','00:00:00','08:00:00','Night shift');

INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, status) VALUES
(1, 'Monday', '08:00:00', '12:00:00', 'Available'),
(1, 'Wednesday', '13:00:00', '17:00:00', 'Available'),
(2, 'Tuesday', '09:00:00', '13:00:00', 'Available'),
(2, 'Thursday', '09:00:00', '13:00:00', 'Available'),
(3, 'Monday', '10:00:00', '14:00:00', 'Available'),
(3, 'Friday', '08:00:00', '12:00:00', 'Unavailable'),
(4, 'Tuesday', '14:00:00', '18:00:00', 'Available'),
(4, 'Thursday', '09:00:00', '13:00:00', 'Available'),
(5, 'Monday', '09:00:00', '13:00:00', 'Available'),
(5, 'Wednesday', '08:30:00', '12:30:00', 'Available'),
(6, 'Tuesday', '10:00:00', '14:00:00', 'Available'),
(6, 'Friday', '09:00:00', '13:00:00', 'Available'),
(7, 'Monday', '08:00:00', '12:00:00', 'Available'),
(7, 'Thursday', '13:00:00', '17:00:00', 'Available'),
(8, 'Wednesday', '09:00:00', '13:00:00', 'Available'),
(8, 'Saturday', '09:00:00', '12:00:00', 'Available'),
(9, 'Tuesday', '08:30:00', '12:30:00', 'Unavailable'),
(9, 'Friday', '13:00:00', '17:00:00', 'Available'),
(10, 'Monday', '10:00:00', '15:00:00', 'Available'),
(10, 'Thursday', '09:00:00', '12:00:00', 'Available');

INSERT INTO departments (department_code, name, description, head_doctor_id, status) VALUES
('DEP-001', 'Cardiology', 'Heart and vascular system related treatments.', 1, 'Active'),
('DEP-002', 'Dermatology', 'Skin and hair disorder treatments.', 2, 'Active'),
('DEP-003', 'Orthopedics', 'Bone and muscle related treatments.', 3, 'Active'),
('DEP-004', 'Pediatrics', 'Child health and growth monitoring.', 4, 'Active'),
('DEP-005', 'Neurology', 'Brain and nervous system treatments.', 5, 'Active'),
('DEP-006', 'Gynecology', 'Women’s reproductive health.', 6, 'Active'),
('DEP-007', 'Surgery', 'General and specialized surgical operations.', 7, 'Active'),
('DEP-008', 'ENT', 'Ear, Nose and Throat treatments.', 8, 'Active'),
('DEP-009', 'Ophthalmology', 'Eye examinations and treatments.', 9, 'Active'),
('DEP-010', 'Psychiatry', 'Mental health and therapy.', 10, 'Active'),
('DEP-011', 'Radiology', 'Imaging and diagnostic scanning.', 1, 'Active'),
('DEP-012', 'Dental', 'Dental care and oral surgery.', 2, 'Active'),
('DEP-013', 'Physiotherapy', 'Physical rehabilitation services.', 3, 'Active'),
('DEP-014', 'Oncology', 'Cancer treatment and chemotherapy.', 4, 'Active'),
('DEP-015', 'Urology', 'Urinary tract and male reproductive system.', 5, 'Active'),
('DEP-016', 'Nephrology', 'Kidney-related treatments.', 6, 'Active'),
('DEP-017', 'Endocrinology', 'Hormonal disorders and diabetes management.', 7, 'Active'),
('DEP-018', 'Gastroenterology', 'Digestive system diseases.', 8, 'Active'),
('DEP-019', 'Pulmonology', 'Lung and respiratory diseases.', 9, 'Active'),
('DEP-020', 'Emergency', '24/7 emergency and trauma care.', 10, 'Active');

INSERT INTO consultation_rooms (room_code, room_name, department_id, doctor_id, status) VALUES
('RM-001', 'Cardiology Room 1', 1, 1, 'Available'),
('RM-002', 'Dermatology Room 1', 2, 2, 'Available'),
('RM-003', 'Ortho Room 1', 3, 3, 'Occupied'),
('RM-004', 'Pediatrics Room 1', 4, 4, 'Available'),
('RM-005', 'Neuro Room 1', 5, 5, 'Under Maintenance'),
('RM-006', 'Gynecology Room 1', 6, 6, 'Available'),
('RM-007', 'Surgery Prep Room', 7, 7, 'Available'),
('RM-008', 'ENT Clinic', 8, 8, 'Occupied'),
('RM-009', 'Eye Care Room', 9, 9, 'Available'),
('RM-010', 'Psychiatry Room', 10, 10, 'Available'),
('RM-011', 'Radiology Room', 11, 1, 'Available'),
('RM-012', 'Dental Clinic', 12, 2, 'Available'),
('RM-013', 'Physio Center', 13, 3, 'Occupied'),
('RM-014', 'Oncology Suite', 14, 4, 'Available'),
('RM-015', 'Urology Room', 15, 5, 'Available'),
('RM-016', 'Nephrology Lab', 16, 6, 'Under Maintenance'),
('RM-017', 'Endocrine Clinic', 17, 7, 'Available'),
('RM-018', 'Gastro Clinic', 18, 8, 'Available'),
('RM-019', 'Pulmonology Unit', 19, 9, 'Occupied'),
('RM-020', 'Emergency Bay', 20, 10, 'Available');



INSERT INTO suppliers (supplier_code, name, contact_person, phone, email, address, status) VALUES
('SUP-001','Ragama Pharmaceuticals','Sunil Perera','0711234567','sunil.p@example.com','Ragama, Colombo','Active'),
('SUP-002','Lanka Medicals','Malsha Silva','0712345678','malsha.s@example.com','Gampaha, Colombo','Active'),
('SUP-003','Ceylon Drugs','Kamal Fernando','0713456789','kamal.f@example.com','Kandy','Active'),
('SUP-004','HealthPlus','Sanduni Jayawardena','0714567890','sanduni.j@example.com','Colombo 07','Active'),
('SUP-005','CareMed','Ruwan Dias','0715678901','ruwan.d@example.com','Matara','Active'),
('SUP-006','MediTrust','Chamari Perera','0716789012','chamari.p@example.com','Galle','Active'),
('SUP-007','Pharma Lanka','Asela Kumara','0717890123','asela.k@example.com','Kurunegala','Active'),
('SUP-008','LifeCare','Nadeesha Silva','0718901234','nadeesha.s@example.com','Negombo','Active'),
('SUP-009','CureMed','Priyantha de Silva','0719012345','priyantha.s@example.com','Jaffna','Active'),
('SUP-010','Wellness Pharma','Ishara Perera','0710123456','ishara.p@example.com','Kegalle','Active'),
('SUP-011','Arogya Pharmaceuticals','Anuradha Wijesinghe','0711111111','anuradha.w@example.com','Colombo','Active'),
('SUP-012','Medicure','Roshan Fernando','0712222222','roshan.f@example.com','Galle','Active'),
('SUP-013','HealWell','Harsha Silva','0713333333','harsha.s@example.com','Matale','Active'),
('SUP-014','PharmaCare','Umesha Jayasuriya','0714444444','umesha.j@example.com','Colombo','Active'),
('SUP-015','BioMed Lanka','Kasun Perera','0715555555','kasun.p@example.com','Kandy','Active'),
('SUP-016','LifePharma','Chaminda Silva','0716666666','chaminda.s@example.com','Kalutara','Active'),
('SUP-017','Ceylon Medics','Upul Jayawardena','0717777777','upul.j@example.com','Trincomalee','Active'),
('SUP-018','MediCare','Sanduni Fernando','0718888888','sanduni.f@example.com','Matara','Active'),
('SUP-019','WellMed','Nishan Perera','0719999999','nishan.p@example.com','Colombo','Active'),
('SUP-020','CarePlus','Ishara Silva','0710000000','ishara.s@example.com','Gampaha','Active');


INSERT INTO medicines (medicine_code, name, category, supplier_id, unit_price, quantity_in_stock, expiry_date, reorder_level, status) VALUES
('MED-001','Paracetamol','Painkiller',1,25.00,500,'2026-12-31',50,'Available'),
('MED-002','Amoxicillin','Antibiotic',2,50.00,300,'2026-10-30',30,'Available'),
('MED-003','Cetirizine','Antihistamine',3,35.00,200,'2025-11-15',20,'Available'),
('MED-004','Vitamin C','Supplement',4,20.00,150,'2026-01-20',15,'Available'),
('MED-005','Aspirin','Painkiller',5,40.00,250,'2025-12-10',25,'Available'),
('MED-006','Insulin','Hormone',6,500.00,100,'2026-05-30',10,'Available'),
('MED-007','Omeprazole','Antacid',7,60.00,180,'2025-12-25',20,'Available'),
('MED-008','Metformin','Diabetes',8,80.00,120,'2026-03-15',15,'Available'),
('MED-009','Salbutamol','Respiratory',9,150.00,90,'2026-08-30',10,'Available'),
('MED-010','Diclofenac','Painkiller',10,55.00,200,'2025-11-20',20,'Available'),
('MED-011','Azithromycin','Antibiotic',11,120.00,80,'2026-06-30',10,'Available'),
('MED-012','Ibuprofen','Painkiller',12,30.00,400,'2026-02-28',40,'Available'),
('MED-013','Loratadine','Antihistamine',13,45.00,150,'2025-10-31',15,'Available'),
('MED-014','Folic Acid','Supplement',14,25.00,200,'2026-04-30',20,'Available'),
('MED-015','Captopril','Cardiology',15,70.00,100,'2025-12-31',10,'Available'),
('MED-016','Warfarin','Blood Thinner',16,100.00,60,'2026-01-31',10,'Available'),
('MED-017','Levothyroxine','Hormone',17,150.00,80,'2026-05-15',10,'Available'),
('MED-018','Flu Vaccine','Vaccine',18,500.00,50,'2025-10-30',10,'Available'),
('MED-019','Eye Drops','Ophthalmology',19,200.00,70,'2026-02-28',10,'Available'),
('MED-020','Migraine Tablet','Neurology',20,250.00,90,'2026-03-30',10,'Available');

INSERT INTO purchase_orders (order_code, supplier_id, order_date, total_amount, status) VALUES
('PO-001',1,'2025-09-01',12500.00,'Received'),
('PO-002',2,'2025-09-03',15000.00,'Received'),
('PO-003',3,'2025-09-05',7000.00,'Pending'),
('PO-004',4,'2025-09-07',5000.00,'Pending'),
('PO-005',5,'2025-09-09',10000.00,'Received'),
('PO-006',6,'2025-09-11',20000.00,'Pending'),
('PO-007',7,'2025-09-13',8000.00,'Received'),
('PO-008',8,'2025-09-15',12000.00,'Pending'),
('PO-009',9,'2025-09-17',9000.00,'Received'),
('PO-010',10,'2025-09-19',11000.00,'Pending');


INSERT INTO purchase_order_items (order_id, medicine_id, quantity, unit_price, subtotal) VALUES
(1,1,200,25.00,5000.00),
(1,2,100,50.00,5000.00),
(2,3,100,35.00,3500.00),
(2,4,50,20.00,1000.00),
(3,5,150,40.00,6000.00),
(4,6,30,500.00,15000.00),
(5,7,80,60.00,4800.00),
(5,8,50,80.00,4000.00),
(6,9,40,150.00,6000.00),
(6,10,100,55.00,5500.00),
(7,11,50,120.00,6000.00),
(7,12,100,30.00,3000.00),
(8,13,80,45.00,3600.00),
(8,14,100,25.00,2500.00),
(9,15,50,70.00,3500.00),
(9,16,30,100.00,3000.00),
(10,17,40,150.00,6000.00),
(10,18,20,500.00,10000.00),
(10,19,30,200.00,6000.00),
(10,20,20,250.00,5000.00);


INSERT INTO issued_medicines 
(patient_id, prescription_id, medicine_id, quantity, issue_date, issued_by)
VALUES
(1,1,21,10,'2025-10-01',4),
(2,2,22,5,'2025-10-02',4),
(3,3,23,8,'2025-10-03',4),
(4,4,24,3,'2025-10-04',4),
(5,5,25,7,'2025-10-05',4),
(6,6,26,2,'2025-10-06',4),
(7,7,27,4,'2025-10-07',4),
(8,8,28,5,'2025-10-08',4),
(9,9,29,6,'2025-10-09',4),
(10,10,30,2,'2025-10-10',4);


INSERT INTO billing (bill_code, patient_id, bill_date, total_amount, payment_method, status) VALUES
('BILL-001',1,'2025-10-01',2500.00,'Cash','Paid'),
('BILL-002',2,'2025-10-02',1800.00,'Card','Paid'),
('BILL-003',3,'2025-10-03',3200.00,'Insurance','Partially Paid'),
('BILL-004',4,'2025-10-04',1500.00,'Cash','Paid'),
('BILL-005',5,'2025-10-05',4000.00,'Insurance','Unpaid'),
('BILL-006',6,'2025-10-06',2200.00,'Card','Paid'),
('BILL-007',7,'2025-10-07',3500.00,'Insurance','Submitted'),
('BILL-008',8,'2025-10-08',2800.00,'Cash','Paid'),
('BILL-009',9,'2025-10-09',3100.00,'Card','Partially Paid'),
('BILL-010',10,'2025-10-10',2000.00,'Insurance','Pending'),
('BILL-011',11,'2025-10-11',2700.00,'Cash','Paid'),
('BILL-012',12,'2025-10-12',1900.00,'Card','Paid'),
('BILL-013',13,'2025-10-13',3300.00,'Insurance','Unpaid'),
('BILL-014',14,'2025-10-14',1600.00,'Cash','Paid'),
('BILL-015',15,'2025-10-15',4200.00,'Insurance','Submitted'),
('BILL-016',16,'2025-10-16',2300.00,'Card','Paid'),
('BILL-017',17,'2025-10-17',3600.00,'Insurance','Pending'),
('BILL-018',18,'2025-10-18',2900.00,'Cash','Paid'),
('BILL-019',19,'2025-10-19',3100.00,'Card','Partially Paid'),
('BILL-020',20,'2025-10-20',2100.00,'Insurance','Unpaid');

INSERT INTO bill_items (bill_id, description, amount) VALUES
(1,'Consultation Fee',1000.00),
(1,'Medicine Charges',1500.00),
(2,'Consultation Fee',800.00),
(2,'Lab Tests',1000.00),
(3,'Consultation Fee',1200.00),
(3,'Medicine Charges',2000.00),
(4,'Vaccination Fee',1500.00),
(5,'MRI Scan',4000.00),
(6,'Consultation Fee',1200.00),
(6,'X-Ray',1000.00),
(7,'Surgery Charges',3500.00),
(8,'Consultation Fee',1000.00),
(8,'Lab Tests',1800.00),
(9,'Consultation Fee',1500.00),
(9,'Medicine Charges',1600.00),
(10,'Therapy Session',2000.00),
(11,'Consultation Fee',1200.00),
(11,'Medicine Charges',1500.00),
(12,'Lab Tests',1900.00),
(13,'Surgery Charges',3300.00);


INSERT INTO insurance_claims (bill_id, insurance_provider, policy_number, claim_amount, claim_status, submission_date, approval_date) VALUES
(3,'Ceylinco Life','POL-001',3200.00,'Submitted','2025-10-03',NULL),
(5,'HNB Insurance','POL-002',4000.00,'Pending','2025-10-05',NULL),
(7,'Union Assurance','POL-003',3500.00,'Submitted','2025-10-07',NULL),
(10,'Ceylinco Life','POL-004',2000.00,'Pending','2025-10-10',NULL),
(13,'HNB Insurance','POL-005',3300.00,'Unpaid','2025-10-13',NULL),
(15,'Union Assurance','POL-006',4200.00,'Submitted','2025-10-15',NULL),
(17,'Ceylinco Life','POL-007',3600.00,'Pending','2025-10-17',NULL),
(20,'HNB Insurance','POL-008',2100.00,'Unpaid','2025-10-20',NULL),
(9,'Union Assurance','POL-009',3100.00,'Submitted','2025-10-09',NULL),
(3,'Ceylinco Life','POL-010',3200.00,'Approved','2025-10-03','2025-10-05');

INSERT INTO payments (bill_id, payment_date, amount_paid, payment_method, reference_number, received_by) VALUES
(21,'2025-10-01',2500.00,'Cash','RCPT-001',1),
(22,'2025-10-02',1800.00,'Card','RCPT-002',2),
(23,'2025-10-03',1200.00,'Insurance','RCPT-003',3),
(24,'2025-10-04',1500.00,'Cash','RCPT-004',4),
(26,'2025-10-06',2200.00,'Card','RCPT-005',1),
(28,'2025-10-08',2800.00,'Cash','RCPT-006',2),
(29,'2025-10-09',1500.00,'Card','RCPT-007',3),
(30,'2025-10-11',2700.00,'Cash','RCPT-008',4),
(31,'2025-10-12',1900.00,'Card','RCPT-009',1),
(32,'2025-10-14',1600.00,'Cash','RCPT-010',2);


--------- view data in tables----------------------

select * from patients; 
select * from appointments;
select * from medical_history; 
select * from doctors; 
select * from staff; 
select * from doctor_availability; 
select * from departments; 
select * from consultation_rooms;
select * from duty_shifts; 
select * from medicines; 
select * from suppliers; 
select * from purchase_orders; 
select * from purchase_order_items; 
select * from issued_medicines; 
select * from billing; 
select * from bill_items; 
select * from insurance_claims; 
select * from payments; 
select * from patient_lab_tests; 
select * from patient_lab_results;
select * from users;
SELECT medicine_id, name FROM medicines;
 


show tables;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- store hashed passwords in production
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    role ENUM('Admin', 'Accountant', 'Pharmacist') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO users (username, password, full_name, role, email) VALUES
('admin', SHA2('Admin@123', 256), 'Saman Kumara', 'Admin', 'admin@example.com');

DELETE FROM users WHERE username = 'admin';
DELETE FROM users WHERE username = 'pharmacist';
DELETE FROM users WHERE username = 'accountant';



INSERT INTO users (username, password, full_name, email, role)
VALUES (
    'admin',
    '$2b$12$UFyjrwufSwCm5iB.EkbS0uVXqqC1ZQcyU3BCrWHNFrPhA3G7re2vm',
    'Admin User',
    'admin@example.com',
    'Admin'
);


SELECT username, password FROM users WHERE username='admin';
SELECT username, password FROM users WHERE username='pharmacist';
SELECT username, password FROM users WHERE username='accountant';


INSERT INTO users (username, password, full_name, email, role)
VALUES (
  'pharmacist',
  '$2b$10$FlrLXDWzGNMKl84E.zCNkuOoSFzrkXkylWegvP9VjkkMMfhE2nrJ6',
  'Nimasha Perera',
  'pharmacist@example.com',
  'Pharmacist'
);

INSERT INTO users (username, password, full_name, email, role)
VALUES (
  'accountant',
  '$2b$10$cfbrE7K9UyqhwRUaHZdZAOp9EcMBQ7iYUGlpBvwpRH3xzqH.XIPqi',
  'Kasun Jayawardena',
  'accountant@example.com',
  'Accountant'
);

-- 📊 DAILY REVENUE REPORT VIEW
CREATE OR REPLACE VIEW daily_revenue_report AS
SELECT 
    DATE(b.bill_date) AS report_date,
    SUM(b.total_amount) AS total_billed,
    SUM(CASE WHEN b.status = 'Paid' THEN b.total_amount ELSE 0 END) AS total_paid,
    SUM(CASE WHEN b.status = 'Unpaid' THEN b.total_amount ELSE 0 END) AS total_unpaid,
    SUM(CASE WHEN b.payment_method = 'Cash' THEN b.total_amount ELSE 0 END) AS cash_total,
    SUM(CASE WHEN b.payment_method = 'Card' THEN b.total_amount ELSE 0 END) AS card_total,
    SUM(CASE WHEN b.payment_method = 'Insurance' THEN b.total_amount ELSE 0 END) AS insurance_total
FROM billing b
GROUP BY DATE(b.bill_date)
ORDER BY report_date DESC;

-- 📅 MONTHLY REVENUE REPORT VIEW
CREATE OR REPLACE VIEW monthly_revenue_report AS
SELECT 
    DATE_FORMAT(b.bill_date, '%Y-%m') AS report_month,
    SUM(b.total_amount) AS total_billed,
    SUM(CASE WHEN b.status = 'Paid' THEN b.total_amount ELSE 0 END) AS total_paid,
    SUM(CASE WHEN b.status = 'Unpaid' THEN b.total_amount ELSE 0 END) AS total_unpaid,
    SUM(CASE WHEN b.payment_method = 'Cash' THEN b.total_amount ELSE 0 END) AS cash_total,
    SUM(CASE WHEN b.payment_method = 'Card' THEN b.total_amount ELSE 0 END) AS card_total,
    SUM(CASE WHEN b.payment_method = 'Insurance' THEN b.total_amount ELSE 0 END) AS insurance_total
FROM billing b
GROUP BY DATE_FORMAT(b.bill_date, '%Y-%m')
ORDER BY report_month DESC;

SELECT * FROM daily_revenue_report;
SELECT * FROM monthly_revenue_report;


# Trigger: Auto-Update Billing Status After Payment
# -------------------------------------------------------
DELIMITER $$

CREATE TRIGGER trg_update_billing_status
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
  DECLARE totalPaid DECIMAL(10,2);
  DECLARE totalBill DECIMAL(10,2);

  -- Get total paid so far
  SELECT SUM(amount_paid)
  INTO totalPaid
  FROM payments
  WHERE bill_id = NEW.bill_id;

  -- Get bill total
  SELECT total_amount
  INTO totalBill
  FROM billing
  WHERE bill_id = NEW.bill_id;

  IF totalPaid >= totalBill THEN
    UPDATE billing SET status = 'Paid' WHERE bill_id = NEW.bill_id;
  ELSEIF totalPaid > 0 THEN
    UPDATE billing SET status = 'Partially Paid' WHERE bill_id = NEW.bill_id;
  ELSE
    UPDATE billing SET status = 'Unpaid' WHERE bill_id = NEW.bill_id;
  END IF;
END$$

DELIMITER ;

# Function: Get Outstanding Balance
DELIMITER $$

CREATE FUNCTION get_outstanding_balance(billId INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
  DECLARE totalBill DECIMAL(10,2);
  DECLARE totalPaid DECIMAL(10,2);

  SELECT total_amount INTO totalBill FROM billing WHERE bill_id = billId;
  SELECT IFNULL(SUM(amount_paid), 0) INTO totalPaid FROM payments WHERE bill_id = billId;

  RETURN totalBill - totalPaid;
END$$

DELIMITER ;

# Stored Procedure: Generate Bill
DELIMITER $$

CREATE PROCEDURE sp_generate_bill(
  IN p_patient_id INT,
  IN p_bill_code VARCHAR(20),
  IN p_payment_method ENUM('Cash','Card','Insurance'),
  IN p_items JSON
)
BEGIN
  DECLARE newBillId INT;
  DECLARE total DECIMAL(10,2) DEFAULT 0.00;
  DECLARE i INT DEFAULT 0;
  DECLARE itemCount INT;

  -- Count number of items
  SET itemCount = JSON_LENGTH(p_items);

  START TRANSACTION;

  -- Step 1: Insert into billing
  INSERT INTO billing (bill_code, patient_id, total_amount, payment_method, status)
  VALUES (p_bill_code, p_patient_id, 0, p_payment_method, 'Unpaid');

  SET newBillId = LAST_INSERT_ID();

  -- Step 2: Loop through items JSON array
  WHILE i < itemCount DO
    SET @desc = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', i, '].description')));
    SET @amount = JSON_UNQUOTE(JSON_EXTRACT(p_items, CONCAT('$[', i, '].amount')));
    SET total = total + @amount;

    INSERT INTO bill_items (bill_id, description, amount)
    VALUES (newBillId, @desc, @amount);

    SET i = i + 1;
  END WHILE;

  -- Step 3: Update total amount in billing
  UPDATE billing SET total_amount = total WHERE bill_id = newBillId;

  COMMIT;
END$$

DELIMITER ;

# Stored Procedure: Submit Insurance Claim
DELIMITER $$

CREATE PROCEDURE sp_submit_insurance_claim(
  IN p_bill_id INT,
  IN p_insurance_provider VARCHAR(100),
  IN p_policy_number VARCHAR(50),
  IN p_claim_amount DECIMAL(10,2)
)
BEGIN
  INSERT INTO insurance_claims (
    bill_id,
    insurance_provider,
    policy_number,
    claim_amount,
    claim_status,
    submission_date
  )
  VALUES (p_bill_id, p_insurance_provider, p_policy_number, p_claim_amount, 'Submitted', CURDATE());
END$$

DELIMITER ;

# View: Billing Summary View
CREATE OR REPLACE VIEW billing_summary_view AS
SELECT 
  b.bill_id,
  b.bill_code,
  CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
  b.bill_date,
  b.total_amount,
  IFNULL(SUM(pay.amount_paid), 0) AS total_paid,
  (b.total_amount - IFNULL(SUM(pay.amount_paid), 0)) AS outstanding_balance,
  b.status,
  b.payment_method
FROM billing b
LEFT JOIN payments pay ON b.bill_id = pay.bill_id
LEFT JOIN patients p ON b.patient_id = p.patient_id
GROUP BY b.bill_id;

# medical history implementation
# -------------------------------------


# Trigger: Update last_visit_date in patients
DELIMITER $$

CREATE TRIGGER trg_update_last_visit
AFTER INSERT ON medical_history
FOR EACH ROW
BEGIN
    UPDATE patients
    SET last_visit_date = NEW.visit_date
    WHERE patient_id = NEW.patient_id;
END$$

DELIMITER ;

# View: Latest medical history per patient
CREATE OR REPLACE VIEW latest_medical_history AS
SELECT mh.*
FROM medical_history mh
INNER JOIN (
    SELECT patient_id, MAX(visit_date) AS last_visit
    FROM medical_history
    GROUP BY patient_id
) latest ON mh.patient_id = latest.patient_id AND mh.visit_date = latest.last_visit;


# Staff module
# -------------------

# Stored Procedures
# ----Add New Staff--------
DELIMITER //

CREATE PROCEDURE sp_addStaff(
    IN p_staff_code VARCHAR(20),
    IN p_full_name VARCHAR(100),
    IN p_role ENUM('Nurse','Lab Technician','Receptionist','Pharmacist','Cleaner','Other'),
    IN p_contact_number VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_shift VARCHAR(50),
    IN p_status ENUM('Active','Inactive')
)
BEGIN
    IF EXISTS (SELECT 1 FROM staff WHERE staff_code = p_staff_code) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Staff code already exists';
    ELSE
        INSERT INTO staff(staff_code, full_name, role, contact_number, email, shift, status)
        VALUES (p_staff_code, p_full_name, p_role, p_contact_number, p_email, p_shift, p_status);
    END IF;
END;
//

DELIMITER ;

#-----Update Staff------
DELIMITER //

CREATE PROCEDURE sp_updateStaff(
    IN p_staff_id INT,
    IN p_full_name VARCHAR(100),
    IN p_role ENUM('Nurse','Lab Technician','Receptionist','Pharmacist','Cleaner','Other'),
    IN p_contact_number VARCHAR(15),
    IN p_email VARCHAR(100),
    IN p_shift VARCHAR(50),
    IN p_status ENUM('Active','Inactive')
)
BEGIN
    UPDATE staff
    SET full_name = p_full_name,
        role = p_role,
        contact_number = p_contact_number,
        email = p_email,
        shift = p_shift,
        status = p_status
    WHERE staff_id = p_staff_id;
    
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Staff not found';
    END IF;
END;
//

DELIMITER ;

#------Delete Staff--------
DELIMITER //

CREATE PROCEDURE sp_deleteStaff(IN p_staff_id INT)
BEGIN
    DELETE FROM staff WHERE staff_id = p_staff_id;
    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Staff not found';
    END IF;
END;
//

DELIMITER ;

# Triggers
#--------Log Staff Deactivation or Deletion---------
CREATE TABLE staff_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT,
    action ENUM('INSERT','UPDATE','DELETE','DEACTIVATE'),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    old_status ENUM('Active','Inactive'),
    new_status ENUM('Active','Inactive'),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- Trigger for status update
DELIMITER //
CREATE TRIGGER trg_staff_update
AFTER UPDATE ON staff
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO staff_log(staff_id, action, old_status, new_status)
        VALUES (OLD.staff_id, 'DEACTIVATE', OLD.status, NEW.status);
    END IF;
END;
//
DELIMITER ;

# Views
#---------Active Staff View---------
CREATE VIEW v_active_staff AS
SELECT staff_id, staff_code, full_name, role, contact_number, email, shift
FROM staff
WHERE status = 'Active';

#---------Staff Count by Role----------
CREATE VIEW v_staff_role_summary AS
SELECT role, COUNT(*) AS total_staff
FROM staff
GROUP BY role;

# Staff & Doctor Shift Management
# --------------------------------------

# Stored Procedure for Assigning a Shift
DELIMITER $$

CREATE PROCEDURE sp_assignShift(
    IN p_staff_id INT,
    IN p_doctor_id INT,
    IN p_shift_date DATE,
    IN p_start_time TIME,
    IN p_end_time TIME,
    IN p_remarks VARCHAR(255)
)
BEGIN
    -- Check overlapping shift for the same staff or doctor
    IF EXISTS (
        SELECT 1 FROM duty_shifts
        WHERE (staff_id = p_staff_id OR doctor_id = p_doctor_id)
          AND shift_date = p_shift_date
          AND ((start_time BETWEEN p_start_time AND p_end_time)
               OR (end_time BETWEEN p_start_time AND p_end_time)
               OR (p_start_time BETWEEN start_time AND end_time))
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Shift overlaps with existing assignment';
    ELSE
        INSERT INTO duty_shifts (staff_id, doctor_id, shift_date, start_time, end_time, remarks)
        VALUES (p_staff_id, p_doctor_id, p_shift_date, p_start_time, p_end_time, p_remarks);
    END IF;
END $$

DELIMITER ;

# Indexes for Pharmacy & Inventory module
CREATE INDEX idx_medicine_code ON medicines(medicine_code);
CREATE INDEX idx_medicine_expiry ON medicines(expiry_date);
CREATE INDEX idx_order_date ON purchase_orders(order_date);
CREATE INDEX idx_issue_date ON issued_medicines(issue_date);

# Trigger for Automatic Stock Update
DELIMITER //
CREATE TRIGGER trg_update_stock_after_receive
AFTER UPDATE ON purchase_orders
FOR EACH ROW
BEGIN
  IF NEW.status = 'Received' THEN
    UPDATE medicines m
    JOIN purchase_order_items i ON i.medicine_id = m.medicine_id
    SET m.quantity_in_stock = m.quantity_in_stock + i.quantity
    WHERE i.order_id = NEW.order_id;
  END IF;
END;
//
DELIMITER ;

#Trigger for Low Stock / Expiry Status
DELIMITER //
CREATE TRIGGER trg_auto_medicine_status
BEFORE UPDATE ON medicines
FOR EACH ROW
BEGIN
  IF NEW.expiry_date < CURDATE() THEN
    SET NEW.status = 'Expired';
  ELSEIF NEW.quantity_in_stock <= NEW.reorder_level THEN
    SET NEW.status = 'Out of Stock';
  ELSE
    SET NEW.status = 'Available';
  END IF;
END;
//
DELIMITER ;

# handle total bill
DELIMITER $$

CREATE TRIGGER update_purchase_order_total
AFTER INSERT ON purchase_order_items
FOR EACH ROW
BEGIN
  UPDATE purchase_orders
  SET total_amount = (
    SELECT SUM(subtotal)
    FROM purchase_order_items
    WHERE order_id = NEW.order_id
  )
  WHERE order_id = NEW.order_id;
END $$

DELIMITER ;

#------------------------------
# /////Patient Management
#------------------------------


#-------------Stored Procedures-------------------

# Add new patient
DELIMITER //
CREATE PROCEDURE sp_add_patient (
    IN p_patient_code VARCHAR(20),
    IN p_first_name VARCHAR(50),
    IN p_last_name VARCHAR(50),
    IN p_gender ENUM('Male', 'Female', 'Other'),
    IN p_age INT,
    IN p_contact_number VARCHAR(15),
    IN p_address VARCHAR(255),
    IN p_email VARCHAR(100)
)
BEGIN
    INSERT INTO patients (patient_code, first_name, last_name, gender, age, contact_number, address, email)
    VALUES (p_patient_code, p_first_name, p_last_name, p_gender, p_age, p_contact_number, p_address, p_email);
END //
DELIMITER ;

#Schedule Appointment
DELIMITER //
CREATE PROCEDURE sp_schedule_appointment (
    IN p_appointment_code VARCHAR(20),
    IN p_patient_id INT,
    IN p_doctor_id INT,
    IN p_department VARCHAR(100),
    IN p_appointment_date DATE,
    IN p_appointment_time TIME,
    IN p_notes TEXT
)
BEGIN
    INSERT INTO appointments (
        appointment_code, patient_id, doctor_id, department, appointment_date, appointment_time, notes
    ) VALUES (
        p_appointment_code, p_patient_id, p_doctor_id, p_department, p_appointment_date, p_appointment_time, p_notes
    );
END //
DELIMITER ;

# Stored Procedure: Add medical history
DELIMITER $$

CREATE PROCEDURE sp_add_medical_history (
    IN p_patient_id INT,
    IN p_visit_date DATE,
    IN p_diagnosis TEXT,
    IN p_treatment TEXT,
    IN p_prescription TEXT,
    IN p_doctor_id INT
)
BEGIN
    INSERT INTO medical_history (patient_id, visit_date, diagnosis, treatment, prescription, doctor_id)
    VALUES (p_patient_id, IFNULL(p_visit_date, CURDATE()), p_diagnosis, p_treatment, p_prescription, p_doctor_id);
END$$

DELIMITER ;

#----------Triggers---------------
#Auto-generate patient_code (e.g., “PAT001”)
DELIMITER //
CREATE TRIGGER trg_generate_patient_code
BEFORE INSERT ON patients
FOR EACH ROW
BEGIN
    DECLARE next_id INT;
    SELECT IFNULL(MAX(patient_id), 0) + 1 INTO next_id FROM patients;
    SET NEW.patient_code = CONCAT('PAT', LPAD(next_id, 3, '0'));
END //
DELIMITER ;

#Auto-generate appointment_code (e.g., “APT001”)
DELIMITER //
CREATE TRIGGER trg_generate_appointment_code
BEFORE INSERT ON appointments
FOR EACH ROW
BEGIN
    DECLARE next_id INT;
    SELECT IFNULL(MAX(appointment_id), 0) + 1 INTO next_id FROM appointments;
    SET NEW.appointment_code = CONCAT('APT', LPAD(next_id, 3, '0'));
END //
DELIMITER ;

#Auto-update patient’s status → Inactive if all appointments are cancelled
DELIMITER //
CREATE TRIGGER trg_auto_inactivate_patient
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    IF (NEW.status = 'Cancelled') THEN
        IF NOT EXISTS (
            SELECT 1 FROM appointments
            WHERE patient_id = NEW.patient_id AND status != 'Cancelled'
        ) THEN
            UPDATE patients SET status = 'Inactive' WHERE patient_id = NEW.patient_id;
        END IF;
    END IF;
END //
DELIMITER ;

#-----------Events---------------
#Auto-delete old cancelled appointments (older than 30 days)
SET GLOBAL event_scheduler = ON;

DELIMITER //
CREATE EVENT ev_cleanup_old_appointments
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    DELETE FROM appointments 
    WHERE status = 'Cancelled'
    AND appointment_date < CURDATE() - INTERVAL 30 DAY;
END //
DELIMITER ;

#---------------Views---------------------
#View – Upcoming Appointments
CREATE OR REPLACE VIEW view_upcoming_appointments AS
SELECT 
    a.appointment_id,
    a.appointment_code,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    d.full_name AS doctor_name,
    a.department,
    a.appointment_date,
    a.appointment_time,
    a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
JOIN doctors d ON a.doctor_id = d.doctor_id
WHERE a.appointment_date >= CURDATE()
ORDER BY a.appointment_date, a.appointment_time;

#View – Patient Summary with last visit and total appointments
CREATE OR REPLACE VIEW view_patient_summary AS
SELECT 
    p.patient_id,
    CONCAT(p.first_name, ' ', p.last_name) AS patient_name,
    p.gender,
    p.age,
    p.status,
    COUNT(a.appointment_id) AS total_appointments,
    MAX(a.appointment_date) AS last_appointment
FROM patients p
LEFT JOIN appointments a ON p.patient_id = a.patient_id
GROUP BY p.patient_id;


#-------------- Indexes (for performance)--------------
CREATE INDEX idx_patient_name ON patients(first_name, last_name);
CREATE INDEX idx_appointment_date ON appointments(appointment_date);
CREATE INDEX idx_doctor_department ON doctors(department);





