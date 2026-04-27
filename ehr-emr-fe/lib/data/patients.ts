export interface Medication {
  name: string
  dosage: string
  color: string
  schedule: {
    [day: string]: { morning?: number; evening?: number }
  }
}

export interface Appointment {
  id: string
  category: string
  categoryIcon: string
  doctor: string
  doctorImage: string
  date: string
  results: string
  resultsStatus: 'blue' | 'red' | 'green'
  progress: number
}

export interface WeightRecord {
  period: string
  weight: number
  isActive?: boolean
}

export interface Patient {
  id: string
  name: string
  age: number
  image: string
  address: string
  lastAppointment: string
  phone: string
  allergies: string[]
  latestWeight: number
  targetWeight: string
  height: string
  heartRate: number
  stressLevel: string
  weightRecords: WeightRecord[]
  medications: Medication[]
  appointments: Appointment[]
}

export const patients: Patient[] = [
  {
    id: "1",
    name: "Avram Korni",
    age: 37,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    address: "1234 Elm Street, Apt 5B, Los Angeles, CA 90001, USA",
    lastAppointment: "23 August 2023",
    phone: "+1 252-436-1123",
    allergies: ["Pollen", "Dust Mites", "Lactose", "Animal Dander"],
    latestWeight: 68,
    targetWeight: "62 KG -65 KG",
    height: "180 cm",
    heartRate: 98,
    stressLevel: "47% down",
    weightRecords: [
      { period: "01-07", weight: 67 },
      { period: "08-15", weight: 65, isActive: true },
      { period: "16-23", weight: 68 },
      { period: "24-31", weight: 70 },
    ],
    medications: [
      {
        name: "Omega 3",
        dosage: "50 ml",
        color: "#F97316",
        schedule: {
          "Wed 09": { morning: 1 },
          "Fri 11": { morning: 1 },
          "Sat 12": { morning: 1 },
        },
      },
      {
        name: "Vitamin D",
        dosage: "100 ml",
        color: "#EAB308",
        schedule: {
          "Tue 08": { morning: 1, evening: 2 },
          "Wed 09": { morning: 1, evening: 2 },
          "Thu 10": { morning: 1, evening: 2 },
          "Fri 11": { evening: 2 },
          "Sun 13": { evening: 2 },
        },
      },
      {
        name: "Aspirin",
        dosage: "30 ml",
        color: "#F87171",
        schedule: {
          "Thu 10": { morning: 2 },
          "Fri 11": { evening: 2 },
          "Sat 12": { morning: 2 },
        },
      },
      {
        name: "Omega 3",
        dosage: "50 ml",
        color: "#F97316",
        schedule: {
          "Fri 11": { morning: 2, evening: 2 },
          "Sat 12": { morning: 2, evening: 2 },
          "Sun 13": { evening: 2 },
        },
      },
      {
        name: "Vitamin D",
        dosage: "100 ml",
        color: "#EAB308",
        schedule: {
          "Sat 12": { evening: 2 },
          "Sun 13": { evening: 2 },
        },
      },
    ],
    appointments: [
      {
        id: "1",
        category: "Ophthalmologist",
        categoryIcon: "eye",
        doctor: "Dr. James Nilson",
        doctorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
        date: "July, 20, 14:30",
        results: "Docs12",
        resultsStatus: "blue",
        progress: 45,
      },
      {
        id: "2",
        category: "Psychologist",
        categoryIcon: "brain",
        doctor: "Dr. Kerry Star",
        doctorImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
        date: "July, 1, 11:20",
        results: "Important",
        resultsStatus: "red",
        progress: 65,
      },
      {
        id: "3",
        category: "Allergist",
        categoryIcon: "allergist",
        doctor: "Dr. Mike Cuper",
        doctorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
        date: "July, 11, 12:00",
        results: "Record2012",
        resultsStatus: "blue",
        progress: 55,
      },
      {
        id: "4",
        category: "Immunologist",
        categoryIcon: "syringe",
        doctor: "Dr. Elli Jou",
        doctorImage: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face",
        date: "June, 25, 9:00",
        results: "Visit224",
        resultsStatus: "blue",
        progress: 75,
      },
      {
        id: "5",
        category: "Bariatrician",
        categoryIcon: "scale",
        doctor: "Dr. Erika Rich",
        doctorImage: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&h=100&fit=crop&crop=face",
        date: "May, 21, 7:00",
        results: "Control",
        resultsStatus: "blue",
        progress: 85,
      },
    ],
  },
  {
    id: "2",
    name: "Sarah Mitchell",
    age: 29,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    address: "567 Oak Avenue, Suite 12, New York, NY 10001, USA",
    lastAppointment: "15 September 2023",
    phone: "+1 312-555-0189",
    allergies: ["Penicillin", "Shellfish"],
    latestWeight: 58,
    targetWeight: "55 KG -58 KG",
    height: "165 cm",
    heartRate: 72,
    stressLevel: "23% down",
    weightRecords: [
      { period: "01-07", weight: 59 },
      { period: "08-15", weight: 58, isActive: true },
      { period: "16-23", weight: 57 },
      { period: "24-31", weight: 58 },
    ],
    medications: [
      {
        name: "Iron Supplement",
        dosage: "25 mg",
        color: "#8B5CF6",
        schedule: {
          "Mon 07": { morning: 1 },
          "Wed 09": { morning: 1 },
          "Fri 11": { morning: 1 },
        },
      },
      {
        name: "Vitamin B12",
        dosage: "500 mcg",
        color: "#EC4899",
        schedule: {
          "Tue 08": { morning: 1 },
          "Thu 10": { morning: 1 },
          "Sat 12": { morning: 1 },
        },
      },
    ],
    appointments: [
      {
        id: "1",
        category: "Cardiologist",
        categoryIcon: "heart",
        doctor: "Dr. Amanda Chen",
        doctorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
        date: "August, 10, 10:00",
        results: "ECG Report",
        resultsStatus: "blue",
        progress: 100,
      },
      {
        id: "2",
        category: "Dermatologist",
        categoryIcon: "skin",
        doctor: "Dr. Robert Kim",
        doctorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
        date: "July, 28, 14:00",
        results: "Biopsy",
        resultsStatus: "green",
        progress: 100,
      },
    ],
  },
  {
    id: "3",
    name: "Michael Johnson",
    age: 52,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    address: "890 Pine Road, Chicago, IL 60601, USA",
    lastAppointment: "02 October 2023",
    phone: "+1 415-555-0234",
    allergies: ["Aspirin", "Ibuprofen", "NSAIDs"],
    latestWeight: 92,
    targetWeight: "85 KG -88 KG",
    height: "185 cm",
    heartRate: 88,
    stressLevel: "15% up",
    weightRecords: [
      { period: "01-07", weight: 94 },
      { period: "08-15", weight: 93 },
      { period: "16-23", weight: 92, isActive: true },
      { period: "24-31", weight: 91 },
    ],
    medications: [
      {
        name: "Metformin",
        dosage: "500 mg",
        color: "#10B981",
        schedule: {
          "Mon 07": { morning: 1, evening: 1 },
          "Tue 08": { morning: 1, evening: 1 },
          "Wed 09": { morning: 1, evening: 1 },
          "Thu 10": { morning: 1, evening: 1 },
          "Fri 11": { morning: 1, evening: 1 },
          "Sat 12": { morning: 1, evening: 1 },
          "Sun 13": { morning: 1, evening: 1 },
        },
      },
      {
        name: "Lisinopril",
        dosage: "10 mg",
        color: "#3B82F6",
        schedule: {
          "Mon 07": { morning: 1 },
          "Tue 08": { morning: 1 },
          "Wed 09": { morning: 1 },
          "Thu 10": { morning: 1 },
          "Fri 11": { morning: 1 },
          "Sat 12": { morning: 1 },
          "Sun 13": { morning: 1 },
        },
      },
    ],
    appointments: [
      {
        id: "1",
        category: "Endocrinologist",
        categoryIcon: "gland",
        doctor: "Dr. Patricia Wong",
        doctorImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
        date: "September, 15, 09:30",
        results: "A1C Test",
        resultsStatus: "red",
        progress: 30,
      },
      {
        id: "2",
        category: "Cardiologist",
        categoryIcon: "heart",
        doctor: "Dr. Steven Park",
        doctorImage: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face",
        date: "September, 01, 11:00",
        results: "Stress Test",
        resultsStatus: "blue",
        progress: 60,
      },
      {
        id: "3",
        category: "Nutritionist",
        categoryIcon: "nutrition",
        doctor: "Dr. Lisa Green",
        doctorImage: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&h=100&fit=crop&crop=face",
        date: "August, 20, 15:00",
        results: "Diet Plan",
        resultsStatus: "green",
        progress: 100,
      },
    ],
  },
  {
    id: "4",
    name: "Emily Davis",
    age: 41,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    address: "234 Maple Lane, San Francisco, CA 94102, USA",
    lastAppointment: "18 August 2023",
    phone: "+1 628-555-0156",
    allergies: ["Latex", "Soy"],
    latestWeight: 63,
    targetWeight: "60 KG -63 KG",
    height: "170 cm",
    heartRate: 68,
    stressLevel: "32% down",
    weightRecords: [
      { period: "01-07", weight: 64 },
      { period: "08-15", weight: 63, isActive: true },
      { period: "16-23", weight: 63 },
      { period: "24-31", weight: 62 },
    ],
    medications: [
      {
        name: "Synthroid",
        dosage: "50 mcg",
        color: "#F59E0B",
        schedule: {
          "Mon 07": { morning: 1 },
          "Tue 08": { morning: 1 },
          "Wed 09": { morning: 1 },
          "Thu 10": { morning: 1 },
          "Fri 11": { morning: 1 },
          "Sat 12": { morning: 1 },
          "Sun 13": { morning: 1 },
        },
      },
    ],
    appointments: [
      {
        id: "1",
        category: "Gynecologist",
        categoryIcon: "female",
        doctor: "Dr. Rachel Adams",
        doctorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
        date: "July, 30, 10:30",
        results: "Annual Exam",
        resultsStatus: "green",
        progress: 100,
      },
      {
        id: "2",
        category: "Endocrinologist",
        categoryIcon: "gland",
        doctor: "Dr. Mark Taylor",
        doctorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
        date: "June, 15, 14:00",
        results: "Thyroid Panel",
        resultsStatus: "blue",
        progress: 80,
      },
    ],
  },
  {
    id: "5",
    name: "James Wilson",
    age: 65,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    address: "456 Cedar Court, Boston, MA 02101, USA",
    lastAppointment: "05 September 2023",
    phone: "+1 617-555-0198",
    allergies: ["Codeine", "Morphine", "Eggs"],
    latestWeight: 78,
    targetWeight: "75 KG -78 KG",
    height: "175 cm",
    heartRate: 76,
    stressLevel: "8% down",
    weightRecords: [
      { period: "01-07", weight: 79 },
      { period: "08-15", weight: 78 },
      { period: "16-23", weight: 78, isActive: true },
      { period: "24-31", weight: 77 },
    ],
    medications: [
      {
        name: "Atorvastatin",
        dosage: "20 mg",
        color: "#DC2626",
        schedule: {
          "Mon 07": { evening: 1 },
          "Tue 08": { evening: 1 },
          "Wed 09": { evening: 1 },
          "Thu 10": { evening: 1 },
          "Fri 11": { evening: 1 },
          "Sat 12": { evening: 1 },
          "Sun 13": { evening: 1 },
        },
      },
      {
        name: "Amlodipine",
        dosage: "5 mg",
        color: "#7C3AED",
        schedule: {
          "Mon 07": { morning: 1 },
          "Tue 08": { morning: 1 },
          "Wed 09": { morning: 1 },
          "Thu 10": { morning: 1 },
          "Fri 11": { morning: 1 },
          "Sat 12": { morning: 1 },
          "Sun 13": { morning: 1 },
        },
      },
      {
        name: "Omega 3",
        dosage: "1000 mg",
        color: "#F97316",
        schedule: {
          "Mon 07": { morning: 1 },
          "Wed 09": { morning: 1 },
          "Fri 11": { morning: 1 },
        },
      },
    ],
    appointments: [
      {
        id: "1",
        category: "Cardiologist",
        categoryIcon: "heart",
        doctor: "Dr. William Brown",
        doctorImage: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&h=100&fit=crop&crop=face",
        date: "August, 25, 09:00",
        results: "Echo",
        resultsStatus: "blue",
        progress: 50,
      },
      {
        id: "2",
        category: "Ophthalmologist",
        categoryIcon: "eye",
        doctor: "Dr. Nancy Lee",
        doctorImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
        date: "August, 10, 11:30",
        results: "Vision Test",
        resultsStatus: "green",
        progress: 100,
      },
      {
        id: "3",
        category: "Urologist",
        categoryIcon: "kidney",
        doctor: "Dr. Thomas Clark",
        doctorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
        date: "July, 15, 14:30",
        results: "PSA Test",
        resultsStatus: "blue",
        progress: 70,
      },
    ],
  },
  {
    id: "6",
    name: "Olivia Martinez",
    age: 33,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    address: "789 Birch Street, Miami, FL 33101, USA",
    lastAppointment: "28 September 2023",
    phone: "+1 305-555-0167",
    allergies: ["Gluten", "Dairy"],
    latestWeight: 55,
    targetWeight: "53 KG -56 KG",
    height: "162 cm",
    heartRate: 65,
    stressLevel: "52% down",
    weightRecords: [
      { period: "01-07", weight: 56 },
      { period: "08-15", weight: 55, isActive: true },
      { period: "16-23", weight: 55 },
      { period: "24-31", weight: 54 },
    ],
    medications: [
      {
        name: "Probiotics",
        dosage: "1 cap",
        color: "#22C55E",
        schedule: {
          "Mon 07": { morning: 1 },
          "Tue 08": { morning: 1 },
          "Wed 09": { morning: 1 },
          "Thu 10": { morning: 1 },
          "Fri 11": { morning: 1 },
          "Sat 12": { morning: 1 },
          "Sun 13": { morning: 1 },
        },
      },
      {
        name: "Vitamin D3",
        dosage: "2000 IU",
        color: "#EAB308",
        schedule: {
          "Mon 07": { morning: 1 },
          "Wed 09": { morning: 1 },
          "Fri 11": { morning: 1 },
          "Sun 13": { morning: 1 },
        },
      },
    ],
    appointments: [
      {
        id: "1",
        category: "Gastroenterologist",
        categoryIcon: "stomach",
        doctor: "Dr. Carlos Rivera",
        doctorImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
        date: "September, 20, 10:00",
        results: "Endoscopy",
        resultsStatus: "blue",
        progress: 40,
      },
      {
        id: "2",
        category: "Nutritionist",
        categoryIcon: "nutrition",
        doctor: "Dr. Maria Santos",
        doctorImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
        date: "September, 05, 15:30",
        results: "Meal Plan",
        resultsStatus: "green",
        progress: 100,
      },
    ],
  },
]

export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id)
}
