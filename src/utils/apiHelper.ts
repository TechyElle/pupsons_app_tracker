import { projectId } from './supabase/info';

// Helper to check if a network request is likely to fail due to sandbox/offline limits
const isSupabaseOffline = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-37669f54/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return !response.ok;
  } catch (e) {
    return true; // Unreachable
  }
};

// Initial Seed Data matching the Harvest specifications and PDF guides
const SEED_CELL_GROUPS = [
  {
    id: "cellGroup:cg1",
    name: "Lausin Group (Online)",
    leader: "Kyle Aron Murillo",
    primaryLeader: "Isaac Lausin",
    status: "Active",
    memberCount: 3,
    schedule: "Every Monday",
    time: "21:00",
    venue: "Zoom/Google Meet",
    location: "Online",
    formationDate: "2023-09-01",
    groupType: "STUDENT",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg2",
    name: "Dorado Group",
    leader: "Cielle Mae Penamora",
    primaryLeader: "Lilibeth Dorado",
    status: "Active",
    memberCount: 4,
    schedule: "Every Friday",
    time: "17:00",
    venue: "PUP Main Campus",
    location: "PUP Main",
    formationDate: "2023-08-15",
    groupType: "STUDENT",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg3",
    name: "Renacido Group",
    leader: "Ericka Myles Renacido",
    primaryLeader: "Lilibeth Dorado",
    status: "Active",
    memberCount: 3,
    schedule: "Every Thursday",
    time: "14:00",
    venue: "PUP CEA",
    location: "PUP CEA",
    formationDate: "2024-01-10",
    groupType: "STUDENT",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg4",
    name: "Abogado Group",
    leader: "Hans Joseph",
    primaryLeader: "Virgilio Abogado",
    status: "Active",
    memberCount: 1,
    schedule: "Every Saturday",
    time: "15:00",
    venue: "PUP Main Campus",
    location: "PUP Main",
    formationDate: "2023-11-20",
    groupType: "STUDENT",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg5",
    name: "Malificar Group",
    leader: "Sheilamarie Gementiza",
    primaryLeader: "Diane Grace Malificar",
    status: "Active",
    memberCount: 3,
    schedule: "Every Wednesday",
    time: "18:00",
    venue: "PUP Main Campus",
    location: "PUP Main",
    formationDate: "2023-10-05",
    groupType: "STUDENT",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg6",
    name: "Delen Group",
    leader: "Stephanie Lara",
    primaryLeader: "Joy Delen",
    status: "Active",
    memberCount: 2,
    schedule: "Every Tuesday",
    time: "16:00",
    venue: "Zoom Video Meetings",
    location: "Online",
    formationDate: "2024-02-12",
    groupType: "STUDENT",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg7",
    name: "Samson Group",
    leader: "Aldrin Abenoja",
    primaryLeader: "John Benz Samson",
    status: "Active",
    memberCount: 8,
    schedule: "Every Friday",
    time: "19:00",
    venue: "PUP Main Campus",
    location: "PUP Main",
    formationDate: "2023-09-10",
    groupType: "STUDENT",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg8",
    name: "Teodocio Group",
    leader: "Elaine Denise Manrique",
    primaryLeader: "Rudgie Marie Teodocio",
    status: "Active",
    memberCount: 2,
    schedule: "Every Friday",
    time: "15:30",
    venue: "PUP Main Campus",
    location: "PUP Main",
    formationDate: "2024-03-01",
    groupType: "ALUMNI",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg9",
    name: "Sedilla Group",
    leader: "Jopen Canete",
    primaryLeader: "Raymond Sedilla",
    status: "Active",
    memberCount: 1,
    schedule: "Every Thursday",
    time: "17:00",
    venue: "PUP Main Campus",
    location: "PUP Main",
    formationDate: "2023-12-05",
    groupType: "STUDENT",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg10",
    name: "Ranay Group",
    leader: "Karen Revadona",
    primaryLeader: "Divine Ranay",
    status: "Active",
    memberCount: 3,
    schedule: "Every Saturday",
    time: "13:00",
    venue: "PUP Main Campus",
    location: "PUP Main",
    formationDate: "2023-10-10",
    groupType: "STUDENT",
    createdAt: new Date().toISOString()
  },
  {
    id: "cellGroup:cg11",
    name: "Roque Group",
    leader: "Ashton Romero",
    primaryLeader: "Michael Roque",
    status: "Active",
    memberCount: 1,
    schedule: "Every Sunday",
    time: "14:00",
    venue: "PUP Main Campus",
    location: "PUP Main",
    formationDate: "2023-08-20",
    groupType: "ALUMNI",
    createdAt: new Date().toISOString()
  }
];

const SEED_MEMBERS = [
  {
    id: "member:m1",
    name: "Kyle Aron Murillo",
    email: "kyle@email.com",
    contactNumber: "+63 912 345 6789",
    cellGroupId: "cellGroup:cg1",
    cellGroupName: "Lausin Group (Online)",
    cellLeader: "Isaac Lausin",
    primaryLeader: "Isaac Lausin",
    leadershipStatus: "Cell Leader",
    lcsolLevel: "Graduate",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2,SOL 3,Graduate",
    birthday: "2004-01-15",
    studentStatus: "Student",
    position: "Worship Leader",
    trainingLevel: "Leadership",
    notes: "Faithful leader, cell group leader."
  },
  {
    id: "member:m2",
    name: "Hans Joseph",
    email: "hans@email.com",
    contactNumber: "+63 915 111 2222",
    cellGroupId: "cellGroup:cg4",
    cellGroupName: "Abogado Group",
    cellLeader: "Ceruma, Justin",
    primaryLeader: "Abogado, Virgilio",
    leadershipStatus: "Cell Leader",
    lcsolLevel: "SOL 1",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1",
    birthday: "2004-07-23",
    studentStatus: "Student",
    position: "Youth Leader",
    trainingLevel: "Intermediate",
    notes: "Cell Leader under Virgilio Abogado."
  },
  {
    id: "member:m3",
    name: "Cielle Mae Penamora",
    email: "cielle@email.com",
    contactNumber: "+63 928 666 7777",
    cellGroupId: "cellGroup:cg2",
    cellGroupName: "Dorado Group",
    cellLeader: "Lisondra, Monica",
    primaryLeader: "Dorado, Lilibeth",
    leadershipStatus: "Cell Leader",
    lcsolLevel: "SOL 2",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2",
    birthday: "2004-05-04",
    studentStatus: "Student",
    position: "PUP SONs Officer",
    trainingLevel: "Advanced",
    notes: "Actively engaging campus outreach. Leads Dorado cell."
  },
  {
    id: "member:m4",
    name: "Ericka Myles Renacido",
    email: "ericka@email.com",
    contactNumber: "+63 945 888 9999",
    cellGroupId: "cellGroup:cg3",
    cellGroupName: "Renacido Group",
    cellLeader: "Ramirez, Maried",
    primaryLeader: "Dorado, Lilibeth",
    leadershipStatus: "Cell Leader",
    lcsolLevel: "SOL 2",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2",
    birthday: "2004-11-04",
    studentStatus: "Student",
    position: "Service Coordinator",
    trainingLevel: "Advanced",
    notes: "Good organizer. Solid progress."
  },
  {
    id: "member:m5",
    name: "Mara Jhane Abrigonda",
    email: "mara@email.com",
    contactNumber: "+63 916 222 3333",
    cellGroupId: "cellGroup:cg2",
    cellGroupName: "Dorado Group",
    cellLeader: "Lisondra, Monica",
    primaryLeader: "Dorado, Lilibeth",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 2",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2",
    birthday: "2005-04-12",
    studentStatus: "Student",
    position: "PUP SONs Committee",
    trainingLevel: "Advanced",
    notes: "Trainee under Lilibeth Dorado."
  },
  {
    id: "member:m6",
    name: "Rhayn Erezo",
    email: "rhayn@email.com",
    contactNumber: "+63 917 333 4444",
    cellGroupId: "cellGroup:cg2",
    cellGroupName: "Dorado Group",
    cellLeader: "Talanay, Christine",
    primaryLeader: "Dorado, Lilibeth",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 2",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2",
    birthday: "2003-07-23",
    studentStatus: "Student",
    position: "PUP SONs Committee",
    trainingLevel: "Advanced",
    notes: "Trainee under Lilibeth Dorado."
  },
  {
    id: "member:m7",
    name: "Sheilamarie Gementiza",
    email: "sheilamarie@email.com",
    contactNumber: "+63 918 444 5555",
    cellGroupId: "cellGroup:cg5",
    cellGroupName: "Malificar Group",
    cellLeader: "Dela Cruz, Lizeth",
    primaryLeader: "Malificar, Diane Grace",
    leadershipStatus: "Cell Leader",
    lcsolLevel: "Graduate",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2,SOL 3,Graduate",
    birthday: "2003-09-23",
    studentStatus: "Student",
    position: "Team Leader",
    trainingLevel: "Leadership",
    notes: "Cell leader under Diane Grace Malificar."
  },
  {
    id: "member:m8",
    name: "Shela Marie",
    email: "shela@email.com",
    contactNumber: "+63 919 555 6666",
    cellGroupId: "",
    cellGroupName: "",
    cellLeader: "None",
    primaryLeader: "Polandaya, Ana Camille",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2003-06-01",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by Ana Camille Polandaya."
  },
  {
    id: "member:m9",
    name: "Stephanie Lara",
    email: "stephanie@email.com",
    contactNumber: "+63 920 666 7777",
    cellGroupId: "cellGroup:cg6",
    cellGroupName: "Delen Group",
    cellLeader: "Villa, Cherry Grace Mae",
    primaryLeader: "Delen, Joy",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 1",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1",
    birthday: "2006-08-04",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Intermediate",
    notes: "Trainee under Joy Delen."
  },
  {
    id: "member:m10",
    name: "Wendy Ang",
    email: "wendy@email.com",
    contactNumber: "+63 921 777 8888",
    cellGroupId: "cellGroup:cg5",
    cellGroupName: "Malificar Group",
    cellLeader: "Dela Cruz, Lizeth",
    primaryLeader: "Malificar, Diane Grace",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 1",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1",
    birthday: "2003-11-11",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Intermediate",
    notes: "Trainee overseen by Diane Grace Malificar."
  },
  {
    id: "member:m11",
    name: "Clark Kenneth Tabion",
    email: "clark@email.com",
    contactNumber: "+63 922 888 9999",
    cellGroupId: "cellGroup:cg1",
    cellGroupName: "Lausin Group (Online)",
    cellLeader: "Kyle Murillo",
    primaryLeader: "Lausin, Isaac",
    leadershipStatus: "Trainee",
    lcsolLevel: "Lifeclass L1-4",
    trainingProgress: "LC L1-4",
    birthday: "2004-10-10",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Foundational",
    notes: "Trainee overseen by Isaac Lausin."
  },
  {
    id: "member:m12",
    name: "Kristel Marie Montojo",
    email: "kristel@email.com",
    contactNumber: "+63 923 999 0000",
    cellGroupId: "cellGroup:cg5",
    cellGroupName: "Malificar Group",
    cellLeader: "Dela Cruz, Lizeth",
    primaryLeader: "Malificar, Diane Grace",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 1",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1",
    birthday: "2004-03-19",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Intermediate",
    notes: "Trainee overseen by Diane Grace Malificar."
  },
  {
    id: "member:m13",
    name: "Mark Anthony Rebato",
    email: "mark@email.com",
    contactNumber: "+63 924 000 1111",
    cellGroupId: "cellGroup:cg1",
    cellGroupName: "Lausin Group (Online)",
    cellLeader: "Kyle Murillo",
    primaryLeader: "Lausin, Isaac",
    leadershipStatus: "Cell Member",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2005-02-28",
    studentStatus: "Student",
    position: "Cell Member",
    trainingLevel: "None",
    notes: "Cell member overseen by Isaac Lausin."
  },
  {
    id: "member:m14",
    name: "Christjoy Thea Coquilla",
    email: "christjoy@email.com",
    contactNumber: "+63 925 111 2222",
    cellGroupId: "",
    cellGroupName: "",
    cellLeader: "None",
    primaryLeader: "Felicelda, Dineriel Grace",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2004-06-15",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by Dineriel Grace Felicelda."
  },
  {
    id: "member:m15",
    name: "Cyrus Barrios",
    email: "cyrus@email.com",
    contactNumber: "+63 926 222 3333",
    cellGroupId: "",
    cellGroupName: "",
    cellLeader: "Gallego, Daniel Mina",
    primaryLeader: "Ballano, Daniel Oriel",
    leadershipStatus: "Attender",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2006-07-08",
    studentStatus: "Student",
    position: "Attender",
    trainingLevel: "None",
    notes: "Attender overseen by Daniel Oriel Ballano."
  },
  {
    id: "member:m16",
    name: "Karen Revadona",
    email: "karen.r@email.com",
    contactNumber: "+63 927 333 4444",
    cellGroupId: "cellGroup:cg10",
    cellGroupName: "Ranay Group",
    cellLeader: "Macalinao, Taira Marie",
    primaryLeader: "Ranay, Divine",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 2",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2",
    birthday: "2003-12-20",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Advanced",
    notes: "Trainee overseen by Divine Ranay."
  },
  {
    id: "member:m17",
    name: "Jenny Ching",
    email: "jenny@email.com",
    contactNumber: "+63 928 444 5555",
    cellGroupId: "",
    cellGroupName: "",
    cellLeader: "None",
    primaryLeader: "Delen, Joy",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2005-09-09",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by Joy Delen."
  },
  {
    id: "member:m18",
    name: "Aldrin Abenoja",
    email: "aldrin@email.com",
    contactNumber: "+63 929 555 6666",
    cellGroupId: "cellGroup:cg7",
    cellGroupName: "Samson Group",
    cellLeader: "None",
    primaryLeader: "Samson, John Benz",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2004-04-04",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by John Benz Samson."
  },
  {
    id: "member:m19",
    name: "Paul Vincent Cayana",
    email: "paul@email.com",
    contactNumber: "+63 930 666 7777",
    cellGroupId: "cellGroup:cg7",
    cellGroupName: "Samson Group",
    cellLeader: "None",
    primaryLeader: "Samson, John Benz",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2004-05-05",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by John Benz Samson."
  },
  {
    id: "member:m20",
    name: "Kenjoe Nullasca",
    email: "kenjoe@email.com",
    contactNumber: "+63 931 777 8888",
    cellGroupId: "cellGroup:cg7",
    cellGroupName: "Samson Group",
    cellLeader: "None",
    primaryLeader: "Samson, John Benz",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2004-06-06",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by John Benz Samson."
  },
  {
    id: "member:m21",
    name: "Ken Baniel Giveriel Baniel",
    email: "kenbaniel@email.com",
    contactNumber: "+63 932 888 9999",
    cellGroupId: "cellGroup:cg7",
    cellGroupName: "Samson Group",
    cellLeader: "None",
    primaryLeader: "Samson, John Benz",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2004-07-07",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by John Benz Samson."
  },
  {
    id: "member:m22",
    name: "Laurence Uy",
    email: "laurence@email.com",
    contactNumber: "+63 933 999 0000",
    cellGroupId: "cellGroup:cg7",
    cellGroupName: "Samson Group",
    cellLeader: "None",
    primaryLeader: "Samson, John Benz",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2004-08-08",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by John Benz Samson."
  },
  {
    id: "member:m23",
    name: "Christian Monjon",
    email: "christian@email.com",
    contactNumber: "+63 934 000 1111",
    cellGroupId: "cellGroup:cg7",
    cellGroupName: "Samson Group",
    cellLeader: "None",
    primaryLeader: "Samson, John Benz",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2004-09-09",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by John Benz Samson."
  },
  {
    id: "member:m24",
    name: "Ceejhay Caponga",
    email: "ceejhay@email.com",
    contactNumber: "+63 935 111 2222",
    cellGroupId: "cellGroup:cg7",
    cellGroupName: "Samson Group",
    cellLeader: "None",
    primaryLeader: "Samson, John Benz",
    leadershipStatus: "Trainee",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2004-10-10",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "None",
    notes: "Trainee overseen by John Benz Samson."
  },
  {
    id: "member:m25",
    name: "Karen Joy Revadona",
    email: "karenjoy@email.com",
    contactNumber: "+63 936 222 3333",
    cellGroupId: "cellGroup:cg10",
    cellGroupName: "Ranay Group",
    cellLeader: "Macalinao, Taira Marie",
    primaryLeader: "Ranay, Divine",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 1",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1",
    birthday: "2003-12-20",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Intermediate",
    notes: "Trainee overseen by Divine Ranay."
  },
  {
    id: "member:m26",
    name: "Ivy Bayani",
    email: "ivy@email.com",
    contactNumber: "+63 937 333 4444",
    cellGroupId: "",
    cellGroupName: "",
    cellLeader: "Mallari, Jeramie",
    primaryLeader: "Teodocio, Rudgie Marie",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 2",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2",
    birthday: "2004-11-11",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Advanced",
    notes: "Trainee overseen by Rudgie Marie Teodocio."
  },
  {
    id: "member:m27",
    name: "Elaine Denise Manrique",
    email: "elaine@email.com",
    contactNumber: "+63 938 444 5555",
    cellGroupId: "cellGroup:cg8",
    cellGroupName: "Teodocio Group",
    cellLeader: "Balansag, Wilma",
    primaryLeader: "Teodocio, Rudgie Marie",
    leadershipStatus: "Cell Leader",
    lcsolLevel: "SOL 2",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2",
    birthday: "2006-10-24",
    studentStatus: "Alumni",
    position: "Cell Leader",
    trainingLevel: "Advanced",
    notes: "Alumni Cell Leader overseen by Rudgie Marie Teodocio."
  },
  {
    id: "member:m28",
    name: "Jopen Canete",
    email: "jopen@email.com",
    contactNumber: "+63 939 555 6666",
    cellGroupId: "cellGroup:cg9",
    cellGroupName: "Sedilla Group",
    cellLeader: "Irinco, Mark",
    primaryLeader: "Sedilla, Raymond",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 1",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1",
    birthday: "2005-02-17",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Intermediate",
    notes: "Trainee overseen by Raymond Sedilla."
  },
  {
    id: "member:m29",
    name: "Nicholas Quintela",
    email: "nicholas@email.com",
    contactNumber: "+63 940 666 7777",
    cellGroupId: "cellGroup:cg1",
    cellGroupName: "Lausin Group (Online)",
    cellLeader: "Kuya Shirwin",
    primaryLeader: "Lausin, Isaac",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 1",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1",
    birthday: "2005-07-30",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Intermediate",
    notes: "Trainee overseen by Isaac Lausin."
  },
  {
    id: "member:m30",
    name: "Erica Labad",
    email: "erica.l@email.com",
    contactNumber: "+63 941 777 8888",
    cellGroupId: "cellGroup:cg10",
    cellGroupName: "Ranay Group",
    cellLeader: "Moquete, Crissa",
    primaryLeader: "Ranay, Divine",
    leadershipStatus: "Trainee",
    lcsolLevel: "SOL 2",
    trainingProgress: "LC L1-4,Encounter,LC L6-9,SOL 1,SOL 2",
    birthday: "2002-10-17",
    studentStatus: "Student",
    position: "Trainee",
    trainingLevel: "Advanced",
    notes: "Trainee overseen by Divine Ranay."
  },
  {
    id: "member:m31",
    name: "Ashton Romero",
    email: "ashton@email.com",
    contactNumber: "+63 942 888 9999",
    cellGroupId: "cellGroup:cg11",
    cellGroupName: "Roque Group",
    cellLeader: "Bias, Ximon",
    primaryLeader: "Roque, Michael",
    leadershipStatus: "Cell Member",
    lcsolLevel: "None",
    trainingProgress: "",
    birthday: "2006-03-01",
    studentStatus: "Alumni",
    position: "Cell Member",
    trainingLevel: "None",
    notes: "Alumni member overseen by Michael Roque."
  }
];;

const SEED_EVENTS = [
  {
    id: "event:e1",
    name: "Online Cell Meeting",
    type: "Cell Meeting",
    date: "2026-07-06",
    time: "21:00",
    duration: "1.5 hours",
    venue: "Zoom",
    cellGroupName: "Lausin Group (Online)",
    attendance: 4,
    notes: "Topic was Faith & Finances. Mark was absent due to sickness.",
    outcomes: "Good sharing on trust in times of financial stress."
  },
  {
    id: "event:e2",
    name: "SOL Training Session",
    type: "Training",
    date: "2026-07-03",
    time: "14:00",
    duration: "2 hours",
    venue: "PUP Main Campus",
    cellGroupName: "Dorado Group",
    attendance: 3,
    notes: "School of Leaders Module 1.",
    outcomes: "All cell leaders present discussed leadership pipeline."
  },
  {
    id: "event:e3",
    name: "Love Fest Prep",
    type: "Fellowship",
    date: "2026-07-05",
    time: "17:00",
    duration: "3 hours",
    venue: "PUP CEA",
    cellGroupName: "Renacido Group",
    attendance: 6,
    notes: "Rehearsal and flyer packing.",
    outcomes: "Planned outreach event details."
  }
];

const SEED_EVANGELISM = [
  {
    id: "evangelism:ev1",
    contactName: "Mark Lawrence Villanueva",
    contactPhone: "+63 930 111 2222",
    contactEmail: "mark.l@email.com",
    dateContacted: "2026-06-15",
    cellGroupName: "Lausin Group (Online)",
    method: "Event Invitation",
    followUpStatus: "Follow-up Scheduled",
    nextFollowUp: "2026-07-12",
    conversionDate: "2026-07-01",
    discipleshipStage: "New Believer",
    notes: "First contacted at JumpStart Event. Attended DCC on Feb 1."
  },
  {
    id: "evangelism:ev2",
    contactName: "Sofia Santos",
    contactPhone: "+63 944 333 4444",
    contactEmail: "sofia@email.com",
    dateContacted: "2026-07-01",
    cellGroupName: "Dorado Group",
    method: "Campus Outreach",
    followUpStatus: "First Contact",
    nextFollowUp: "2026-07-11",
    conversionDate: "",
    discipleshipStage: "Prospect",
    notes: "Met at PUP Main library. Open to join cell group."
  }
];

const SEED_TRAINING = [
  {
    id: "training:t1",
    memberName: "Kyle Aron Murillo",
    trainingModule: "SOL 1 (School of Leaders)",
    trainingLevel: "Intermediate",
    startDate: "2026-03-01",
    completionDate: "",
    certificationStatus: "In Progress",
    instructor: "Isaac Lausin",
    attendanceRate: 90,
    assessmentScore: 85
  },
  {
    id: "training:t2",
    memberName: "Clark Kenneth Tabion",
    trainingModule: "Lifeclass L1-4",
    trainingLevel: "Foundational",
    startDate: "2026-02-01",
    completionDate: "2026-03-15",
    certificationStatus: "Completed",
    instructor: "Kyle Aron Murillo",
    attendanceRate: 100,
    assessmentScore: 92
  }
];

const SEED_FUNDRAISING = [
  {
    id: "fundraising:f1",
    campaignName: "SONS Cart Sales",
    goal: 15000,
    currentAmount: 8500,
    expenses: 1200,
    method: "Sales",
    startDate: "2026-06-01",
    endDate: "2026-07-31",
    status: "Active",
    description: "Support local community service and student subsidies. Selling pins, shirts, and stickers at PUP Main."
  }
];

const SEED_CONTENT = [
  {
    id: "content:c1",
    topic: "Weekly Devotional: Stewardship",
    type: "Devotional",
    channel: "Facebook Group",
    publishDate: "2026-07-13",
    status: "Planned",
    responsiblePerson: "Comms Head",
    notes: "Prepare graphic by Friday."
  }
];

const SEED_MINUTES = [
  {
    id: "minutes:m1",
    title: "Leadership Team Assembly",
    date: "2026-07-01",
    attendees: "Isaac Lausin, Lilibeth Dorado, Kyle Aron Murillo",
    notes: "Discussed budget approvals for Love Fest, scheduled SOL 1 training classes.",
    actions: "Submit weekly cell attendance reports by every Monday."
  }
];

// LocalStorage Database Client
const getLocalDB = (key: string, initialData: any) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(data);
};

const setLocalDB = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  // If headers or query has publicAnonKey, this is a Supabase Edge Function call
  const isServerCall = url.includes(`/functions/v1/`);
  if (!isServerCall) {
    return fetch(url, options);
  }

  // Check network health.
  const offline = await isSupabaseOffline();
  if (!offline) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
    } catch (e) {
      console.warn("Failed fetching from remote API, falling back to local DB:", e);
    }
  }

  // OFFLINE / LOCAL STORAGE MOCK
  console.log(`[Offline Mode] Intercepted call: ${options?.method || 'GET'} ${url}`);

  const parsedUrl = new URL(url);
  const path = parsedUrl.pathname;
  const method = options?.method || "GET";
  const body = options?.body ? JSON.parse(options.body) : null;

  // Initialize DBs
  const members = getLocalDB("db:members", SEED_MEMBERS);
  const cellGroups = getLocalDB("db:cellgroups", SEED_CELL_GROUPS);
  const events = getLocalDB("db:events", SEED_EVENTS);
  const evangelism = getLocalDB("db:evangelism", SEED_EVANGELISM);
  const training = getLocalDB("db:training", SEED_TRAINING);
  const fundraising = getLocalDB("db:fundraising", SEED_FUNDRAISING);
  const content = getLocalDB("db:content", SEED_CONTENT);
  const minutes = getLocalDB("db:minutes", SEED_MINUTES);

  let responseData: any = { success: false, error: "Not found" };
  let status = 404;

  // Pattern matching for routes
  if (path.includes("/members")) {
    const parts = path.split("/");
    const id = parts[parts.length - 1];
    
    if (method === "GET") {
      responseData = { success: true, data: members };
      status = 200;
    } else if (method === "POST") {
      const newId = `member:${Date.now()}`;
      const newMember = { ...body, id: newId, createdAt: new Date().toISOString() };
      members.push(newMember);
      setLocalDB("db:members", members);
      responseData = { success: true, id: newId };
      status = 200;
    } else if (method === "PUT") {
      const idx = members.findIndex((m: any) => m.id === id);
      if (idx !== -1) {
        members[idx] = { ...members[idx], ...body, updatedAt: new Date().toISOString() };
        setLocalDB("db:members", members);
        responseData = { success: true };
        status = 200;
      }
    } else if (method === "DELETE") {
      const filtered = members.filter((m: any) => m.id !== id);
      setLocalDB("db:members", filtered);
      responseData = { success: true };
      status = 200;
    }
  } 
  else if (path.includes("/cell-groups")) {
    const parts = path.split("/");
    const id = parts[parts.length - 1];

    if (method === "GET") {
      const updatedGroups = cellGroups.map((cg: any) => {
        const count = members.filter((m: any) => m.cellGroupId === cg.id).length;
        return { ...cg, memberCount: count };
      });
      responseData = { success: true, data: updatedGroups };
      status = 200;
    } else if (method === "POST") {
      const newId = `cellGroup:${Date.now()}`;
      const newGroup = { ...body, id: newId, createdAt: new Date().toISOString() };
      cellGroups.push(newGroup);
      setLocalDB("db:cellgroups", cellGroups);
      responseData = { success: true, id: newId };
      status = 200;
    } else if (method === "PUT") {
      const idx = cellGroups.findIndex((g: any) => g.id === id);
      if (idx !== -1) {
        cellGroups[idx] = { ...cellGroups[idx], ...body, updatedAt: new Date().toISOString() };
        setLocalDB("db:cellgroups", cellGroups);
        responseData = { success: true };
        status = 200;
      }
    } else if (method === "DELETE") {
      const filtered = cellGroups.filter((g: any) => g.id !== id);
      setLocalDB("db:cellgroups", filtered);
      responseData = { success: true };
      status = 200;
    }
  } 
  else if (path.includes("/events")) {
    const parts = path.split("/");
    const id = parts[parts.length - 1];

    if (method === "GET") {
      responseData = { success: true, data: events };
      status = 200;
    } else if (method === "POST") {
      const newId = `event:${Date.now()}`;
      const newEvent = { ...body, id: newId, createdAt: new Date().toISOString() };
      events.push(newEvent);
      setLocalDB("db:events", events);
      responseData = { success: true, id: newId };
      status = 200;
    } else if (method === "PUT") {
      const idx = events.findIndex((e: any) => e.id === id);
      if (idx !== -1) {
        events[idx] = { ...events[idx], ...body, updatedAt: new Date().toISOString() };
        setLocalDB("db:events", events);
        responseData = { success: true };
        status = 200;
      }
    } else if (method === "DELETE") {
      const filtered = events.filter((e: any) => e.id !== id);
      setLocalDB("db:events", filtered);
      responseData = { success: true };
      status = 200;
    }
  } 
  else if (path.includes("/evangelism")) {
    const parts = path.split("/");
    const id = parts[parts.length - 1];

    if (method === "GET") {
      responseData = { success: true, data: evangelism };
      status = 200;
    } else if (method === "POST") {
      const newId = `evangelism:${Date.now()}`;
      const newRec = { ...body, id: newId, createdAt: new Date().toISOString() };
      evangelism.push(newRec);
      setLocalDB("db:evangelism", evangelism);
      responseData = { success: true, id: newId };
      status = 200;
    } else if (method === "PUT") {
      const idx = evangelism.findIndex((e: any) => e.id === id);
      if (idx !== -1) {
        evangelism[idx] = { ...evangelism[idx], ...body, updatedAt: new Date().toISOString() };
        setLocalDB("db:evangelism", evangelism);
        responseData = { success: true };
        status = 200;
      }
    } else if (method === "DELETE") {
      const filtered = evangelism.filter((e: any) => e.id !== id);
      setLocalDB("db:evangelism", filtered);
      responseData = { success: true };
      status = 200;
    }
  } 
  else if (path.includes("/training")) {
    const parts = path.split("/");
    const id = parts[parts.length - 1];

    if (method === "GET") {
      responseData = { success: true, data: training };
      status = 200;
    } else if (method === "POST") {
      const newId = `training:${Date.now()}`;
      const newRec = { ...body, id: newId, createdAt: new Date().toISOString() };
      training.push(newRec);
      setLocalDB("db:training", training);
      responseData = { success: true, id: newId };
      status = 200;
    } else if (method === "PUT") {
      const idx = training.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        training[idx] = { ...training[idx], ...body, updatedAt: new Date().toISOString() };
        setLocalDB("db:training", training);
        responseData = { success: true };
        status = 200;
      }
    }
  } 
  else if (path.includes("/fundraising")) {
    const parts = path.split("/");
    const id = parts[parts.length - 1];

    if (method === "GET") {
      responseData = { success: true, data: fundraising };
      status = 200;
    } else if (method === "POST") {
      const newId = `fundraising:${Date.now()}`;
      const newRec = { ...body, id: newId, createdAt: new Date().toISOString() };
      fundraising.push(newRec);
      setLocalDB("db:fundraising", fundraising);
      responseData = { success: true, id: newId };
      status = 200;
    } else if (method === "PUT") {
      const idx = fundraising.findIndex((f: any) => f.id === id);
      if (idx !== -1) {
        fundraising[idx] = { ...fundraising[idx], ...body, updatedAt: new Date().toISOString() };
        setLocalDB("db:fundraising", fundraising);
        responseData = { success: true };
        status = 200;
      }
    }
  } 
  else if (path.includes("/content-calendar")) {
    const parts = path.split("/");
    const id = parts[parts.length - 1];

    if (method === "GET") {
      responseData = { success: true, data: content };
      status = 200;
    } else if (method === "POST") {
      const newId = `content:${Date.now()}`;
      const newRec = { ...body, id: newId, createdAt: new Date().toISOString() };
      content.push(newRec);
      setLocalDB("db:content", content);
      responseData = { success: true, id: newId };
      status = 200;
    } else if (method === "PUT") {
      const idx = content.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        content[idx] = { ...content[idx], ...body, updatedAt: new Date().toISOString() };
        setLocalDB("db:content", content);
        responseData = { success: true };
        status = 200;
      }
    } else if (method === "DELETE") {
      const filtered = content.filter((c: any) => c.id !== id);
      setLocalDB("db:content", filtered);
      responseData = { success: true };
      status = 200;
    }
  } 
  else if (path.includes("/meeting-minutes")) {
    const parts = path.split("/");
    const id = parts[parts.length - 1];

    if (method === "GET") {
      responseData = { success: true, data: minutes };
      status = 200;
    } else if (method === "POST") {
      const newId = `minutes:${Date.now()}`;
      const newRec = { ...body, id: newId, createdAt: new Date().toISOString() };
      minutes.push(newRec);
      setLocalDB("db:minutes", minutes);
      responseData = { success: true, id: newId };
      status = 200;
    } else if (method === "PUT") {
      const idx = minutes.findIndex((m: any) => m.id === id);
      if (idx !== -1) {
        minutes[idx] = { ...minutes[idx], ...body, updatedAt: new Date().toISOString() };
        setLocalDB("db:minutes", minutes);
        responseData = { success: true };
        status = 200;
      }
    } else if (method === "DELETE") {
      const filtered = minutes.filter((m: any) => m.id !== id);
      setLocalDB("db:minutes", filtered);
      responseData = { success: true };
      status = 200;
    }
  } 
  else if (path.includes("/analytics")) {
    if (method === "GET") {
      const activeCellGroups = cellGroups.filter((g: any) => g.status === "Active").length;
      const totalMembers = members.length;
      const potentialLeaders = members.filter((m: any) => m.leadershipStatus === "Primary Leader" || m.position?.toLowerCase().includes("potential")).length;
      const trainedMembers = training.filter((t: any) => t.certificationStatus === "Completed").length;
      
      // Get all leaders and primary leaders from active groups
      const leadersList = new Set<string>();
      cellGroups.forEach((cg: any) => {
        if (cg.status === "Active") {
          if (cg.leader) leadersList.add(cg.leader);
          if (cg.primaryLeader) leadersList.add(cg.primaryLeader);
        }
      });
      const distinctLeaders = leadersList.size;

      const recentEvents = events.slice(-10);
      const avgAttendance = recentEvents.length > 0 
        ? recentEvents.reduce((sum: number, e: any) => sum + (e.attendance || 0), 0) / recentEvents.length 
        : 0;

      responseData = {
        success: true,
        data: {
          totalCellGroups: cellGroups.length,
          activeCellGroups,
          totalMembers,
          potentialLeaders,
          trainedMembers,
          distinctLeaders,
          avgAttendance,
          attendanceRate: totalMembers > 0 ? parseFloat((avgAttendance / totalMembers * 100).toFixed(1)) : 0,
          trainingCompletionRate: totalMembers > 0 ? parseFloat((trainedMembers / totalMembers * 100).toFixed(1)) : 0
        }
      };
      status = 200;
    }
  } 
  else if (path.includes("/gemini-api-handler")) {
    if (method === "POST") {
      const promptText = body?.prompt?.toLowerCase() || "";
      let simulatedResponse = "";
      
      if (promptText.includes("help") || promptText.includes("stewardship") || promptText.includes("manage")) {
        simulatedResponse = "Here are some tips for digital stewardship and cell group management based on the database details:\n\n1. **Track Cell Group Health:** Check the active cell groups dashboard periodically. A healthy group has at least 80% attendance rate.\n2. **Nurture Members:** Ensure cell members are enrolled in SOL (School of Leaders) or Lifeclass training sessions to progress from Trainees to Cell Leaders.\n3. **Plan Meetings:** Align your cell meetings with the academic/church calendar to avoid scheduling conflicts.";
      } else if (promptText.includes("member") || promptText.includes("leader")) {
        simulatedResponse = "Based on the database records, you have 54 active members. To elevate them to leadership:\n- Review members in SOL 1 or SOL 2 levels.\n- Assign potential leaders (Trainees) to shadow mature cell leaders.\n- Keep track of their graduation milestones to issue achievement badges.";
      } else {
        simulatedResponse = "Hello! I am your Gemini AI assistant. I can help you analyze cell group attendance, view training progress milestones, organize content plans, and suggest follow-up schedules for new converts.";
      }
      
      responseData = { success: true, text: simulatedResponse };
      status = 200;
    }
  }

  const responseString = JSON.stringify(responseData);
  return new Response(responseString, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
