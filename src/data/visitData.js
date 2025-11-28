// src/components/data/visitData.js

export const PURPOSE_TO_OFFICE = {
  "COR/TOR": "REGISTRAR",
  "MEDICAL": "CLINIC",
  "PAYMENT": "CASHIER",
  "VISIT": "",
  "SEMINAR / WEBINAR": "",
  "Other": "",
};

export const OFFICE_STAFF_DATA = {
  REGISTRAR: [
    { name: "Ms. Uy", purpose: "COR/TOR" },
    { name: "Ms. Dela Cruz", purpose: "COR/TOR" },
  ],
  CLINIC: [
    { name: "Dr. Santos", purpose: "MEDICAL" },
    { name: "Dr. Villanueva", purpose: "MEDICAL" },
  ],
  CASHIER: [{ name: "Mr. Tan", purpose: "PAYMENT" }],
  "ADMIN OFFICE": [
    { name: "Ms. Jeanette B. Darunday" },
    { name: "Ms. Annabelle T. Pabas" },
    { name: "Ms. Maricel E. Cal" },
  ],
  "CCIS & CTAS FACULTY": [
    { name: "Ms. Sasha Isabela Uy" },
    { name: "Mrs. Cathlene Leah Gabo" },
    { name: "Mr. Raymond Cempron" },
    { name: "Mr. Emiliano Maravilla" },
    { name: "Mrs. Dhoree Maravilla" },
  ],
  "CCIS EXTENSION FACULTY": [
    { name: "Ms. Sasha Isabela Uy" },
    { name: "Mrs. Cathlene Leah Gabo" },
  ],
  "CCJ FACULTY": [
    { name: "Dr. Mary Grace M. Quino" },
    { name: "Mr. Dave Vincent G. Estrobo" },
  ],
};

export const OFFICE_TO_PURPOSE_MAP = {
  REGISTRAR: ["COR/TOR", "Other"],
  CLINIC: ["Medical Checkup", "Medical Certificate", "Dental Checkup", "Other"],
  CASHIER: ["PAYMENT", "Other"],
  "ADMIN OFFICE": ["INQUIRY", "SUBMISSION OF REQUIREMENTS", "Other"],
  "CCIS & CTAS FACULTY": ["INQUIRY", "ADVISING", "CONSULTATION", "Other"],
  "CCIS EXTENSION FACULTY": ["INQUIRY", "ADVISING", "CONSULTATION", "Other"],
  "CCJ FACULTY": ["INQUIRY", "ADVISING", "CONSULTATION", "Other"],
};

export const DEFAULT_PURPOSES = [
  "COR/TOR",
  "MEDICAL",
  "PAYMENT",
  "VISIT",
  "SEMINAR / WEBINAR",
  "Other",
];

export const OFFICES = [
  "REGISTRAR",
  "CLINIC",
  "CASHIER",
  "ADMIN OFFICE",
  "CCIS & CTAS FACULTY",
  "CCIS EXTENSION FACULTY",
  "CCJ FACULTY",
  "Other",
];
