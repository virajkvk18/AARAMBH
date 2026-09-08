/**
 * MAHARASHTRA STATE INDUSTRIAL POLICY & INCENTIVE RULES ENGINE
 * Ingests Official Government Resolutions (GRs):
 * 1. Maharashtra Industrial Policy 2019 / Package Scheme of Incentives (PSI 2019) [GR No. PSI-2019/CR 46/IND-8]
 * 2. Maharashtra Electric Vehicle Policy 2021 [GR No. MSEVP-2021/CR 25/TC-4]
 * 3. Maharashtra Logistics Policy 2024 [Industries Dept]
 * 4. Maharashtra Aerospace & Defence Manufacturing Policy 2018 [GR IDL-2017/CR 188/IND-2]
 * 5. Maharashtra FinTech Policy 2018 & 2018 Addendum [GR No. DIT-2018/CR 17/D-1/39]
 * 6. Maharashtra State Textile Policy 2018-23 [GR No. Policy 2017/CR 6/Text-5]
 */

export type PSIAreaCategory = "A" | "B" | "C" | "D" | "D+" | "NO_INDUSTRY" | "NAXAL_AFFECTED" | "ASPIRATIONAL";
export type EnterpriseScale = "MICRO" | "SMALL" | "MEDIUM" | "LSI" | "MEGA" | "ULTRA_MEGA";

export interface DistrictTalukaMapping {
  district: string;
  division: "KONKAN" | "PUNE" | "NASHIK" | "AURANGABAD" | "AMRAVATI" | "NAGPUR";
  talukas: {
    name: string;
    category: PSIAreaCategory;
    isMMR?: boolean;
    isPMR?: boolean;
    isNaxal?: boolean;
    isAspirational?: boolean;
    isCottonBelt?: boolean;
  }[];
}

/**
 * Complete Taluka-wise Area Classification as per Annexure-I of PSI 2019
 */
export const MAHARASHTRA_DISTRICT_TALUKAS: DistrictTalukaMapping[] = [
  // 1. KONKAN DIVISION
  {
    district: "Greater Mumbai",
    division: "KONKAN",
    talukas: [{ name: "Mumbai City / Suburban", category: "A", isMMR: true }],
  },
  {
    district: "Thane",
    division: "KONKAN",
    talukas: [
      { name: "Thane", category: "A", isMMR: true },
      { name: "Kalyan", category: "A", isMMR: true },
      { name: "Ulhasnagar", category: "A", isMMR: true },
      { name: "Ambernath", category: "A", isMMR: true },
      { name: "Bhiwandi (MMR)", category: "A", isMMR: true },
      { name: "Murbad", category: "B" },
      { name: "Bhiwandi (Non-MMR)", category: "C" },
      { name: "Shahapur", category: "C" },
    ],
  },
  {
    district: "Palghar",
    division: "KONKAN",
    talukas: [
      { name: "Vasai", category: "A", isMMR: true },
      { name: "Palghar", category: "A", isMMR: true },
      { name: "Dahanu", category: "B" },
      { name: "Jawhar", category: "D+" },
      { name: "Mokhada", category: "D+" },
      { name: "Talasari", category: "D+" },
      { name: "Wada", category: "D+" },
      { name: "Vikramgad", category: "D+" },
    ],
  },
  {
    district: "Raigad",
    division: "KONKAN",
    talukas: [
      { name: "Alibag (MMR)", category: "A", isMMR: true },
      { name: "Uran", category: "A", isMMR: true },
      { name: "Panvel", category: "A", isMMR: true },
      { name: "Karjat (MMR)", category: "A", isMMR: true },
      { name: "Khalapur", category: "A", isMMR: true },
      { name: "Pen", category: "A", isMMR: true },
      { name: "Roha", category: "A" },
      { name: "Alibag (Non-MMR)", category: "B" },
      { name: "Sudhagad", category: "B" },
      { name: "Karjat (Non-MMR)", category: "C" },
      { name: "Mahad", category: "C" },
      { name: "Mangaon", category: "C" },
      { name: "Murud", category: "C" },
      { name: "Shrivardhan", category: "D" },
      { name: "Poladpur", category: "D+" },
      { name: "Mhasala", category: "D+" },
      { name: "Tala", category: "D+" },
    ],
  },
  {
    district: "Ratnagiri",
    division: "KONKAN",
    talukas: [
      { name: "Ratnagiri", category: "C" },
      { name: "Chiplun", category: "C" },
      { name: "Khed", category: "D" },
      { name: "Guhagar", category: "D+" },
      { name: "Dapoli", category: "D+" },
      { name: "Lanja", category: "D+" },
      { name: "Mandangad", category: "D+" },
      { name: "Rajapur", category: "D+" },
      { name: "Sangameshwar", category: "D+" },
    ],
  },
  {
    district: "Sindhudurg",
    division: "KONKAN",
    talukas: [
      { name: "Vengurla", category: "D" },
      { name: "Kankavli", category: "D+" },
      { name: "Kudal", category: "D+" },
      { name: "Sawantwadi", category: "D+" },
      { name: "Malvan", category: "D+" },
      { name: "Deogad", category: "D+" },
      { name: "Vaibhavwadi", category: "D+" },
      { name: "Doda Marg", category: "D+" },
    ],
  },

  // 2. PUNE DIVISION
  {
    district: "Pune",
    division: "PUNE",
    talukas: [
      { name: "Pune City", category: "A", isPMR: true },
      { name: "Maval", category: "A", isPMR: true },
      { name: "Haveli", category: "A", isPMR: true },
      { name: "Bhor (PMR)", category: "A", isPMR: true },
      { name: "Daund (PMR)", category: "A", isPMR: true },
      { name: "Shirur (PMR)", category: "A", isPMR: true },
      { name: "Khed (Chakan PMR)", category: "A", isPMR: true },
      { name: "Mulshi", category: "A", isPMR: true },
      { name: "Purandar (PMR)", category: "A", isPMR: true },
      { name: "Velhe (PMR)", category: "A", isPMR: true },
      { name: "Shirur (Non-PMR)", category: "C" },
      { name: "Daund (Non-PMR)", category: "C" },
      { name: "Bhor (Non-PMR)", category: "C" },
      { name: "Khed (Non-PMR)", category: "C" },
      { name: "Indapur", category: "C" },
      { name: "Baramati", category: "C" },
      { name: "Purandar (Non-PMR)", category: "C" },
      { name: "Ambegaon", category: "D" },
      { name: "Junnar", category: "D" },
      { name: "Velhe (Non-PMR)", category: "D+" },
    ],
  },
  {
    district: "Solapur",
    division: "PUNE",
    talukas: [
      { name: "Solapur (North)", category: "D" },
      { name: "Pandharpur", category: "D" },
      { name: "Malshiras", category: "D" },
      { name: "Barshi", category: "D+" },
      { name: "Akkalkot", category: "D+" },
      { name: "Solapur (South)", category: "D+" },
      { name: "Mohol", category: "D+" },
      { name: "Mangalwedhe", category: "D+" },
      { name: "Sangole", category: "D+" },
      { name: "Karmala", category: "D+" },
      { name: "Madha", category: "D+" },
    ],
  },
  {
    district: "Satara",
    division: "PUNE",
    talukas: [
      { name: "Satara", category: "D" },
      { name: "Khandala", category: "D" },
      { name: "Koregaon", category: "D" },
      { name: "Phaltan", category: "D" },
      { name: "Khatav", category: "D" },
      { name: "Karad", category: "D" },
      { name: "Mahabaleshwar", category: "D" },
      { name: "Wai", category: "D+" },
      { name: "Man", category: "D+" },
      { name: "Patan", category: "D+" },
      { name: "Jaoli", category: "D+" },
    ],
  },
  {
    district: "Sangli",
    division: "PUNE",
    talukas: [
      { name: "Miraj", category: "D" },
      { name: "Tasgaon", category: "D+" },
      { name: "Khanapur", category: "D+" },
      { name: "Atapadi", category: "D+" },
      { name: "Jat", category: "D+" },
      { name: "Kavathe Mahankal", category: "D+" },
      { name: "Walwa", category: "D+" },
      { name: "Shirala", category: "D+" },
      { name: "Kadegaon", category: "D+" },
      { name: "Palus", category: "D+" },
    ],
  },
  {
    district: "Kolhapur",
    division: "PUNE",
    talukas: [
      { name: "Karveer", category: "D" },
      { name: "Panhala", category: "D" },
      { name: "Hatkanangale (Ichalkaranji)", category: "D" },
      { name: "Shirol", category: "D" },
      { name: "Kagal", category: "D+" },
      { name: "Gadhinglaj", category: "D+" },
      { name: "Chandgad", category: "D+" },
      { name: "Ajra", category: "D+" },
      { name: "Bhudargad", category: "D+" },
      { name: "Radhanagari", category: "D+" },
      { name: "Bavada", category: "D+" },
      { name: "Shahuwadi", category: "D+" },
    ],
  },

  // 3. NASHIK DIVISION
  {
    district: "Nashik",
    division: "NASHIK",
    talukas: [
      { name: "Nashik", category: "B" },
      { name: "Niphad", category: "C" },
      { name: "Sinnar", category: "C" },
      { name: "Dindori", category: "D" },
      { name: "Yeola", category: "D" },
      { name: "Igatpuri", category: "D" },
      { name: "Peth", category: "D+" },
      { name: "Surgana", category: "D+" },
      { name: "Kalwan", category: "D+" },
      { name: "Baglan", category: "D+" },
      { name: "Chandwad", category: "D+" },
      { name: "Nandgaon", category: "D+" },
      { name: "Trimbakeshwar", category: "D+" },
      { name: "Deola", category: "D+" },
      { name: "Malegaon", category: "D+" },
    ],
  },
  {
    district: "Ahmednagar",
    division: "NASHIK",
    talukas: [
      { name: "Nagar", category: "D" },
      { name: "Rahuri", category: "D" },
      { name: "Shrirampur", category: "D" },
      { name: "Newasa", category: "D" },
      { name: "Karjat", category: "D" },
      { name: "Shrigonda", category: "D" },
      { name: "Akole", category: "D" },
      { name: "Sangamner", category: "D" },
      { name: "Kopergaon", category: "D" },
      { name: "Rahata", category: "D" },
      { name: "Shevgaon", category: "D+" },
      { name: "Pathardi", category: "D+" },
      { name: "Jamkhed", category: "D+" },
      { name: "Parner", category: "D+" },
    ],
  },
  {
    district: "Dhule",
    division: "NASHIK",
    talukas: [
      { name: "Dhule", category: "D" },
      { name: "Sakri", category: "D+" },
      { name: "Shirpur", category: "D+" },
      { name: "Shindkheda", category: "D+" },
    ],
  },
  {
    district: "Nandurbar",
    division: "NASHIK",
    talukas: [
      { name: "Nandurbar", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Nawapur", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Shahade", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Talode", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Akrani", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Akkalkuva", category: "ASPIRATIONAL", isAspirational: true },
    ],
  },
  {
    district: "Jalgaon",
    division: "NASHIK",
    talukas: [
      { name: "Jalgaon", category: "D", isCottonBelt: true },
      { name: "Yawal", category: "D", isCottonBelt: true },
      { name: "Chalisgaon", category: "D", isCottonBelt: true },
      { name: "Amalner", category: "D", isCottonBelt: true },
      { name: "Dharangaon", category: "D", isCottonBelt: true },
      { name: "Chopada", category: "D+", isCottonBelt: true },
      { name: "Raver", category: "D+", isCottonBelt: true },
      { name: "Edalabad (Muktainagar)", category: "D+", isCottonBelt: true },
      { name: "Bhusawal", category: "D+", isCottonBelt: true },
      { name: "Jamner", category: "D+", isCottonBelt: true },
      { name: "Pachora", category: "D+", isCottonBelt: true },
      { name: "Bhadgaon", category: "D+", isCottonBelt: true },
      { name: "Parola", category: "D+", isCottonBelt: true },
      { name: "Erandol", category: "D+", isCottonBelt: true },
      { name: "Bodwad", category: "D+", isCottonBelt: true },
    ],
  },

  // 4. AURANGABAD / MARATHWADA DIVISION
  {
    district: "Chhatrapati Sambhaji Nagar (Aurangabad)",
    division: "AURANGABAD",
    talukas: [
      { name: "Aurangabad (Waluj / Shendra)", category: "D", isCottonBelt: true },
      { name: "Khuldabad", category: "D+", isCottonBelt: true },
      { name: "Kannad", category: "D+", isCottonBelt: true },
      { name: "Soegaon", category: "D+", isCottonBelt: true },
      { name: "Sillod", category: "D+", isCottonBelt: true },
      { name: "Paithan", category: "D+", isCottonBelt: true },
      { name: "Gangapur", category: "D+", isCottonBelt: true },
      { name: "Vaijapur", category: "D+", isCottonBelt: true },
      { name: "Phulambri", category: "D+", isCottonBelt: true },
    ],
  },
  {
    district: "Jalna",
    division: "AURANGABAD",
    talukas: [
      { name: "Jalna", category: "D+", isCottonBelt: true },
      { name: "Ambad", category: "D+", isCottonBelt: true },
      { name: "Jafferabad", category: "D+", isCottonBelt: true },
      { name: "Partur", category: "D+", isCottonBelt: true },
      { name: "Bhokardan", category: "D+", isCottonBelt: true },
      { name: "Badnapur", category: "D+", isCottonBelt: true },
      { name: "Ghangsavangi", category: "D+", isCottonBelt: true },
      { name: "Mantha", category: "D+", isCottonBelt: true },
    ],
  },
  {
    district: "Beed",
    division: "AURANGABAD",
    talukas: [
      { name: "Beed", category: "D+", isCottonBelt: true },
      { name: "Georai", category: "D+", isCottonBelt: true },
      { name: "Majalgaon", category: "D+", isCottonBelt: true },
      { name: "Ambejogai", category: "D+", isCottonBelt: true },
      { name: "Kaij", category: "D+", isCottonBelt: true },
      { name: "Patoda", category: "D+", isCottonBelt: true },
      { name: "Ashti", category: "D+", isCottonBelt: true },
      { name: "Parli", category: "D+", isCottonBelt: true },
    ],
  },
  {
    district: "Dharashiv (Osmanabad)",
    division: "AURANGABAD",
    talukas: [
      { name: "Osmanabad / Dharashiv", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Kalamb", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Omerga", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Tuljapur", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Paranda", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Bhum", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Washi", category: "ASPIRATIONAL", isAspirational: true },
      { name: "Lohara", category: "ASPIRATIONAL", isAspirational: true },
    ],
  },
  {
    district: "Nanded",
    division: "AURANGABAD",
    talukas: [
      { name: "Nanded", category: "D+", isCottonBelt: true },
      { name: "Kinwat", category: "NAXAL_AFFECTED", isNaxal: true, isCottonBelt: true },
      { name: "Bhokar", category: "D+", isCottonBelt: true },
      { name: "Hadgaon", category: "D+", isCottonBelt: true },
      { name: "Deglur", category: "D+", isCottonBelt: true },
      { name: "Mukhed", category: "D+", isCottonBelt: true },
      { name: "Kandhar", category: "D+", isCottonBelt: true },
      { name: "Loha", category: "D+", isCottonBelt: true },
    ],
  },
  {
    district: "Hingoli",
    division: "AURANGABAD",
    talukas: [
      { name: "Hingoli (No Industry)", category: "NO_INDUSTRY" },
      { name: "Basmath", category: "NO_INDUSTRY" },
      { name: "Kalamnuri", category: "NO_INDUSTRY" },
      { name: "Aundha Nagnath", category: "NO_INDUSTRY" },
      { name: "Sengaon", category: "NO_INDUSTRY" },
    ],
  },
  {
    district: "Latur",
    division: "AURANGABAD",
    talukas: [
      { name: "Latur", category: "D+" },
      { name: "Ahmedpur", category: "D+" },
      { name: "Udgir", category: "D+" },
      { name: "Nilanga", category: "D+" },
      { name: "Ausa", category: "D+" },
    ],
  },
  {
    district: "Parbhani",
    division: "AURANGABAD",
    talukas: [
      { name: "Parbhani", category: "D+", isCottonBelt: true },
      { name: "Gangakhed", category: "D+", isCottonBelt: true },
      { name: "Jintur", category: "D+", isCottonBelt: true },
      { name: "Selu", category: "D+", isCottonBelt: true },
    ],
  },

  // 5. AMRAVATI DIVISION (VIDARBHA COTTON BELT)
  {
    district: "Amravati",
    division: "AMRAVATI",
    talukas: [
      { name: "Amravati", category: "D+", isCottonBelt: true },
      { name: "Achalpur", category: "D+", isCottonBelt: true },
      { name: "Chandur Bazar", category: "D+", isCottonBelt: true },
      { name: "Morshi", category: "D+", isCottonBelt: true },
      { name: "Warud", category: "D+", isCottonBelt: true },
      { name: "Daryapur", category: "D+", isCottonBelt: true },
      { name: "Anjangaon Surji", category: "D+", isCottonBelt: true },
      { name: "Chikhaldara", category: "D+", isCottonBelt: true },
    ],
  },
  {
    district: "Akola",
    division: "AMRAVATI",
    talukas: [
      { name: "Akola", category: "D+", isCottonBelt: true },
      { name: "Akot", category: "D+", isCottonBelt: true },
      { name: "Telhara", category: "D+", isCottonBelt: true },
      { name: "Balapur", category: "D+", isCottonBelt: true },
      { name: "Patur", category: "D+", isCottonBelt: true },
      { name: "Murtijapur", category: "D+", isCottonBelt: true },
    ],
  },
  {
    district: "Washim",
    division: "AMRAVATI",
    talukas: [
      { name: "Washim", category: "ASPIRATIONAL", isAspirational: true, isCottonBelt: true },
      { name: "Malegaon", category: "ASPIRATIONAL", isAspirational: true, isCottonBelt: true },
      { name: "Risod", category: "ASPIRATIONAL", isAspirational: true, isCottonBelt: true },
      { name: "Mangrulpir", category: "ASPIRATIONAL", isAspirational: true, isCottonBelt: true },
      { name: "Karanja", category: "ASPIRATIONAL", isAspirational: true, isCottonBelt: true },
    ],
  },
  {
    district: "Buldhana",
    division: "AMRAVATI",
    talukas: [
      { name: "Buldhana", category: "D+", isCottonBelt: true },
      { name: "Chikhali", category: "D+", isCottonBelt: true },
      { name: "Shegaon", category: "D+", isCottonBelt: true },
      { name: "Malkapur", category: "D+", isCottonBelt: true },
      { name: "Khamgaon", category: "D+", isCottonBelt: true },
      { name: "Mehkar", category: "D+", isCottonBelt: true },
    ],
  },
  {
    district: "Yavatmal",
    division: "AMRAVATI",
    talukas: [
      { name: "Yavatmal", category: "D+", isCottonBelt: true },
      { name: "Pandharkawda (Kelapur)", category: "NAXAL_AFFECTED", isNaxal: true, isCottonBelt: true },
      { name: "Wani", category: "NAXAL_AFFECTED", isNaxal: true, isCottonBelt: true },
      { name: "Zari-Jamdi", category: "NAXAL_AFFECTED", isNaxal: true, isCottonBelt: true },
      { name: "Ghatanji", category: "NAXAL_AFFECTED", isNaxal: true, isCottonBelt: true },
      { name: "Arni", category: "NAXAL_AFFECTED", isNaxal: true, isCottonBelt: true },
      { name: "Pusad", category: "D+", isCottonBelt: true },
      { name: "Umarkhed", category: "D+", isCottonBelt: true },
    ],
  },

  // 6. NAGPUR DIVISION (VIDARBHA)
  {
    district: "Nagpur",
    division: "NAGPUR",
    talukas: [
      { name: "Nagpur City (MIHAN)", category: "D" },
      { name: "Nagpur Rural", category: "D+" },
      { name: "Kamptee", category: "D+" },
      { name: "Hingna", category: "D+" },
      { name: "Katol", category: "D+" },
      { name: "Savner", category: "D+" },
      { name: "Kalmeshwar", category: "D+" },
      { name: "Ramtek", category: "D+" },
      { name: "Umred", category: "D+" },
      { name: "Butibori", category: "D+" },
    ],
  },
  {
    district: "Wardha",
    division: "NAGPUR",
    talukas: [
      { name: "Wardha", category: "D+", isCottonBelt: true },
      { name: "Deoli", category: "D+", isCottonBelt: true },
      { name: "Seloo", category: "D+", isCottonBelt: true },
      { name: "Arvi", category: "D+", isCottonBelt: true },
      { name: "Karanja", category: "D+", isCottonBelt: true },
      { name: "Hinganghat", category: "D+", isCottonBelt: true },
      { name: "Samudrapur", category: "D+", isCottonBelt: true },
    ],
  },
  {
    district: "Bhandara",
    division: "NAGPUR",
    talukas: [
      { name: "Bhandara", category: "D+" },
      { name: "Tumsar", category: "D+" },
      { name: "Sakoli", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Lakhandur", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Lakhani", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Pauni", category: "D+" },
    ],
  },
  {
    district: "Gondia",
    division: "NAGPUR",
    talukas: [
      { name: "Gondia", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Tirora", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Goregaon", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Arjuni Morgaon", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Deori", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Sadakarjuni", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Amgaon", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Salekasa", category: "NAXAL_AFFECTED", isNaxal: true },
    ],
  },
  {
    district: "Chandrapur",
    division: "NAGPUR",
    talukas: [
      { name: "Chandrapur", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Ballarpur", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Warora", category: "D+" },
      { name: "Bhadravati", category: "D+" },
      { name: "Rajura", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Gondpipri", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Korpana", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Mul", category: "NAXAL_AFFECTED", isNaxal: true },
      { name: "Sawali", category: "NAXAL_AFFECTED", isNaxal: true },
    ],
  },
  {
    district: "Gadchiroli",
    division: "NAGPUR",
    talukas: [
      { name: "Gadchiroli (Aspirational & Naxal)", category: "ASPIRATIONAL", isAspirational: true, isNaxal: true },
      { name: "Aheri", category: "ASPIRATIONAL", isAspirational: true, isNaxal: true },
      { name: "Chamorshi", category: "ASPIRATIONAL", isAspirational: true, isNaxal: true },
      { name: "Kurkheda", category: "ASPIRATIONAL", isAspirational: true, isNaxal: true },
      { name: "Armori", category: "ASPIRATIONAL", isAspirational: true, isNaxal: true },
      { name: "Dhanora", category: "ASPIRATIONAL", isAspirational: true, isNaxal: true },
      { name: "Etapalli", category: "ASPIRATIONAL", isAspirational: true, isNaxal: true },
      { name: "Sironcha", category: "ASPIRATIONAL", isAspirational: true, isNaxal: true },
    ],
  },
];

/**
 * Sector Rule Definition Schema
 */
export interface SectorIncentiveRule {
  sectorKey: string;
  displayName: string;
  isThrustSector: boolean;
  governingPolicy: "PSI_2019" | "EV_POLICY_2021" | "LOGISTICS_POLICY_2024" | "AEROSPACE_DEFENCE_2018" | "FINTECH_POLICY_2018" | "TEXTILE_POLICY_2018";
  grReference: string;
  specialBenefits: string[];
  powerTariffSubsidyRateInr?: number;
  interestSubsidyPct?: number;
  stampDutyWaiverPct?: number;
  electricityDutyExemptionYears?: number;
}

export const SECTOR_POLICY_REGISTRY: Record<string, SectorIncentiveRule> = {
  ev_manufacturing: {
    sectorKey: "ev_manufacturing",
    displayName: "Electric Vehicle & Battery Ecosystem",
    isThrustSector: true,
    governingPolicy: "EV_POLICY_2021",
    grReference: "MSEVP-2021/CR 25/TC-4",
    specialBenefits: [
      "Treated under 'D+' category Mega Project benefits across entire Maharashtra irrespective of location",
      "Special ACC Gigafactory fiscal package for battery cell manufacturing",
      "Demand subsidy passed to OEM: ₹5,000/kWh for 2W (cap ₹10,000) & 4W (cap ₹1.5L)",
      "Early bird incentive of +₹5,000/kWh up to ₹1,00,000",
      "100% Road Tax & Motor Vehicle Registration Fee Exemption",
      "Vehicle scrappage incentive (₹7,000 to ₹25,000 per vehicle)",
    ],
    powerTariffSubsidyRateInr: 1.0,
    interestSubsidyPct: 5.0,
    stampDutyWaiverPct: 100,
  },
  aerospace_defence: {
    sectorKey: "aerospace_defence",
    displayName: "Aerospace & Defence Manufacturing",
    isThrustSector: true,
    governingPolicy: "AEROSPACE_DEFENCE_2018",
    grReference: "IDL-2017/CR 188/IND-2",
    specialBenefits: [
      "Incentives graded one scale higher than taluka classification (Zone B gets Zone C, Zone C gets Zone D benefits)",
      "Lowered Mega threshold: ₹250 Cr FCI / 500 jobs in A&B, ₹100 Cr FCI / 250 jobs in rest of Maharashtra",
      "Admissible FCI includes Test Range & Storage (up to 20% of project cost or ₹100 Cr)",
      "Technical Know-how capitalized up to 20% of FCI (max ₹100 Cr)",
      "Anchor Units get 25% to 50% MIDC land rebate (for order book > $100M)",
      "Green Category MPCB fast-track consent within 10 days for assembly (<100 workers)",
      "Declared Essential Service under MESMA with 24x7 continuous power status",
    ],
    stampDutyWaiverPct: 100,
    powerTariffSubsidyRateInr: 1.0,
  },
  fintech: {
    sectorKey: "fintech",
    displayName: "FinTech & Digital Financial Services",
    isThrustSector: true,
    governingPolicy: "FINTECH_POLICY_2018",
    grReference: "DIT-2018/CR 17/D-1/39",
    specialBenefits: [
      "Smart FinTech Center: Up to 200% additional FSI (road >= 18m); FSI up to 4 in NMMC (>=50 acres)",
      "Startups (turnover <= ₹25 Cr): Internet & electricity reimbursement up to ₹3 Lakh/yr for 3 years",
      "Cloud hosting infrastructure reimbursement up to ₹3 Lakh/yr for 3 years on empanelled CSPs",
      "State GST full reimbursement for startups <= ₹5 Cr turnover (up to ₹4 Lakh/yr for 3 years)",
      "Office rent reimbursement in co-working spaces up to ₹4 Lakh/yr for 3 years",
      "Global exhibition participation reimbursement (50% up to ₹5 Lakh)",
      "Top 20 rated startups receive ₹10 Lakh grant per year",
      "Regulatory sandbox access with RBI, SEBI, IRDAI, PFRDA",
    ],
    stampDutyWaiverPct: 100,
  },
  logistics_warehousing: {
    sectorKey: "logistics_warehousing",
    displayName: "Logistics, Cold Chain & Warehousing Parks",
    isThrustSector: true,
    governingPolicy: "LOGISTICS_POLICY_2024",
    grReference: "Maharashtra Logistics Policy 2024",
    specialBenefits: [
      "Accorded Industry & Infrastructure status with industrial power tariff rates",
      "Capital Subsidy (Zone 1 & 2): Small Park (20% cap ₹2 Cr), Large (15% cap ₹15 Cr), Mega (15% cap ₹30 Cr), Ultra-Mega (10% cap ₹40 Cr)",
      "Integrated Truck Terminals: 20% capital subsidy (cap ₹1 Cr, 25% land cost admissible in FCI)",
      "Standalone MSME Warehouses (inside park): 3% interest subsidy (cap ₹75L/yr for 5 yrs) + 75% Stamp duty exemption",
      "Technology adoption reimbursement: 25% of investment in AI/Robotics/Blockchain up to ₹1 Cr",
      "Ease of Doing Business: Green/White logistics <= ₹50 Cr can start immediately on land possession (1-year compliance grace)",
      "Permissible FSI up to 3 to 5 with 75% ground coverage and 24x7 operations",
      "100% Road Tax Exemption for fleet of 50+ EV/Hybrid cargo carriers (>1MT)",
    ],
    powerTariffSubsidyRateInr: 1.0,
    stampDutyWaiverPct: 75,
  },
  textiles_garmenting: {
    sectorKey: "textiles_garmenting",
    displayName: "Textiles, Garmenting, Spinning & Technical Textiles",
    isThrustSector: true,
    governingPolicy: "TEXTILE_POLICY_2018",
    grReference: "Policy 2017/CR 6/Text-5",
    specialBenefits: [
      "Capital Subsidy in lieu of Interest: 25% to 45% of machinery (45% for SC/ST/Minority in processing/garmenting)",
      "+10% additional subsidy for non-conventional yarn (bamboo, banana, ambadi, coir)",
      "+10% to 20% additional capital subsidy in Vidarbha, Marathwada and North Maharashtra cotton growing belts",
      "+5% pioneer taluka bonus for first textile unit with investment >= ₹500 Cr",
      "Power Tariff Subsidy: ₹3/unit for co-op spinning mills (3 yrs); ₹2/unit for powerlooms (>200 HP) and spinning/processing (>107 HP)",
      "No cross-subsidy surcharge on open access electricity",
      "Textile Parks grant: ₹9 Cr or 9% of project cost",
      "Effluent treatment plant (ETP/CETP/ZLD) machinery eligible for full capital subsidy",
    ],
    powerTariffSubsidyRateInr: 2.0,
    stampDutyWaiverPct: 100,
  },
  agro_food_processing: {
    sectorKey: "agro_food_processing",
    displayName: "Agro & Food Processing (Secondary & Tertiary)",
    isThrustSector: true,
    governingPolicy: "PSI_2019",
    grReference: "PSI-2019/CR 46/IND-8 (Para 4.1.b & 19.2)",
    specialBenefits: [
      "+20% additional fiscal assistance over and above the standard taluka FCI ceiling",
      "+2 years additional eligibility period for incentives",
      "Mini Food Parks (MFPs) on min 10 acres eligible for land pooling & special cluster grants",
      "Cold storages integrated in manufacturing fully eligible as Fixed Capital Investment",
    ],
    powerTariffSubsidyRateInr: 1.0,
    interestSubsidyPct: 5.0,
    stampDutyWaiverPct: 100,
  },
  industry_4_0_ai: {
    sectorKey: "industry_4_0_ai",
    displayName: "Industry 4.0, Robotics, AI & Nanotechnology",
    isThrustSector: true,
    governingPolicy: "PSI_2019",
    grReference: "PSI-2019/CR 46/IND-8 (Para 8.3 & 19.2)",
    specialBenefits: [
      "+20% additional fiscal assistance over taluka FCI ceiling and +2 years eligibility period",
      "R&D facilities & technical know-how royalties capitalized into FCI (up to 25% of FCI / max ₹100 Cr)",
      "Patent registration subsidy: 75% reimbursement (up to ₹10 Lakh national, ₹20 Lakh international)",
      "Technology up-gradation capital subsidy: 5% (max ₹25 Lakh)",
    ],
    powerTariffSubsidyRateInr: 1.0,
    interestSubsidyPct: 5.0,
    stampDutyWaiverPct: 100,
  },
  green_energy_biofuel: {
    sectorKey: "green_energy_biofuel",
    displayName: "Green Energy, Solar & Bio-Fuel Production",
    isThrustSector: true,
    governingPolicy: "PSI_2019",
    grReference: "PSI-2019/CR 46/IND-8 (Para 8.11 & 11)",
    specialBenefits: [
      "+20% additional fiscal assistance and +2 years additional eligibility period",
      "Captive solar/renewable power plants admissible in FCI (when >=80% power utilized on-site)",
      "Cultivation & harvesting of non-edible oilseeds permitted in degraded forest/tribal zones",
      "Green Industrialization Assistance for waste management, ETP, STP, and water conservation",
    ],
    powerTariffSubsidyRateInr: 1.0,
    interestSubsidyPct: 5.0,
    stampDutyWaiverPct: 100,
  },
  general_manufacturing: {
    sectorKey: "general_manufacturing",
    displayName: "General Industrial Manufacturing & Engineering",
    isThrustSector: false,
    governingPolicy: "PSI_2019",
    grReference: "PSI-2019/CR 46/IND-8",
    specialBenefits: [
      "Standard Package Scheme of Incentives based on Taluka Classification (A to D+)",
      "100% Gross SGST refund under Industrial Promotion Subsidy (IPS) for first sale within Maharashtra",
      "Electricity Duty exemption for full eligibility period in Group C, D, D+ and Aspirational areas",
      "Power tariff subsidy for 3 years (₹1.00/unit in Vidarbha/Marathwada/Konkan; ₹0.50/unit elsewhere)",
    ],
    powerTariffSubsidyRateInr: 0.5,
    interestSubsidyPct: 5.0,
    stampDutyWaiverPct: 100,
  },
};

/**
 * Enterprise Evaluation Request
 */
export interface EvaluationRequest {
  sector: string;
  district: string;
  taluka?: string;
  capexCr: number;
  workforceSize: number;
  powerLoadKw?: number;
  isScStOrWoman?: boolean;
  isExpansion?: boolean;
  isGreenCertified?: boolean;
}

export interface CalculatedIncentives {
  category: PSIAreaCategory;
  scale: EnterpriseScale;
  governingPolicy: string;
  grReference: string;
  isThrustSector: boolean;
  fciCeilingPct: number;
  maxIncentiveAmountCr: number;
  eligibilityYears: number;
  annualDisbursementCapCr: number;
  sgstIpsRefundPct: number;
  powerSubsidyRatePerUnit: number;
  interestSubsidyPct: number;
  stampDutyWaiverPct: number;
  electricityDutyExempt: boolean;
  specialPerks: string[];
  scaleCriteriaNotes: string;
}

/**
 * Evaluates full statutory incentives based on GR rule definitions
 */
export function evaluatePolicyIncentives(input: EvaluationRequest): CalculatedIncentives {
  const districtObj = MAHARASHTRA_DISTRICT_TALUKAS.find(
    (d) => d.district.toLowerCase() === input.district.toLowerCase()
  ) || MAHARASHTRA_DISTRICT_TALUKAS[0];

  let talukaObj = districtObj.talukas.find(
    (t) => input.taluka && t.name.toLowerCase().includes(input.taluka.toLowerCase())
  );
  if (!talukaObj) {
    talukaObj = districtObj.talukas[0];
  }

  let effectiveCategory = talukaObj.category;
  const sectorRule = SECTOR_POLICY_REGISTRY[input.sector] || SECTOR_POLICY_REGISTRY.general_manufacturing;

  // Aerospace & Defence upgrade rule: graded 1 tier higher
  if (sectorRule.governingPolicy === "AEROSPACE_DEFENCE_2018") {
    if (effectiveCategory === "B") effectiveCategory = "C";
    else if (effectiveCategory === "C") effectiveCategory = "D";
    else if (effectiveCategory === "D") effectiveCategory = "D+";
  }

  // Determine Scale: Micro, Small, Medium, LSI, Mega, Ultra-Mega
  let scale: EnterpriseScale = "MSME" as any;
  let scaleCriteriaNotes = "";

  if (input.capexCr >= 4000 || input.workforceSize >= 4000) {
    scale = "ULTRA_MEGA";
    scaleCriteriaNotes = "Qualifies as Ultra-Mega Project (>= ₹4000 Cr FCI or >= 4000 direct employees)";
  } else if (
    (effectiveCategory === "A" && (input.capexCr >= 1500 || input.workforceSize >= 2000)) ||
    (effectiveCategory === "B" && (input.capexCr >= 1500 || input.workforceSize >= 2000)) ||
    (effectiveCategory === "C" && (input.capexCr >= 1000 || input.workforceSize >= 1500)) ||
    (effectiveCategory === "D" && (input.capexCr >= 750 || input.workforceSize >= 1000)) ||
    (effectiveCategory === "D+" && (input.capexCr >= 500 || input.workforceSize >= 750)) ||
    (["NO_INDUSTRY", "NAXAL_AFFECTED", "ASPIRATIONAL"].includes(effectiveCategory) && (input.capexCr >= 200 || input.workforceSize >= 350))
  ) {
    scale = "MEGA";
    scaleCriteriaNotes = `Qualifies as Mega Project for ${effectiveCategory} zone threshold`;
  } else if (input.capexCr > 50) {
    scale = "LSI";
    scaleCriteriaNotes = "Large Scale Industry (FCI > ₹50 Cr up to Mega threshold)";
  } else if (input.capexCr > 10) {
    scale = "MEDIUM";
    scaleCriteriaNotes = "Medium Enterprise (FCI ₹10 Cr to ₹50 Cr)";
  } else if (input.capexCr > 1) {
    scale = "SMALL";
    scaleCriteriaNotes = "Small Enterprise (FCI ₹1 Cr to ₹10 Cr)";
  } else {
    scale = "MICRO";
    scaleCriteriaNotes = "Micro Enterprise (FCI <= ₹1 Cr)";
  }

  // Calculate Base Ceiling and Years
  let baseCeilingPct = 0;
  let eligibilityYears = 0;

  switch (effectiveCategory) {
    case "A":
      baseCeilingPct = scale === "LSI" || scale === "MEGA" || scale === "ULTRA_MEGA" ? 25 : 0;
      eligibilityYears = scale === "MEGA" ? 8 : 7;
      break;
    case "B":
      baseCeilingPct = 30;
      eligibilityYears = 7;
      break;
    case "C":
      baseCeilingPct = 40;
      eligibilityYears = 7;
      break;
    case "D":
      baseCeilingPct = 50;
      eligibilityYears = scale === "MICRO" || scale === "SMALL" || scale === "MEDIUM" ? 10 : 7;
      break;
    case "D+":
      baseCeilingPct = 60;
      eligibilityYears = scale === "MICRO" || scale === "SMALL" || scale === "MEDIUM" ? 10 : 7;
      break;
    case "NO_INDUSTRY":
    case "NAXAL_AFFECTED":
    case "ASPIRATIONAL":
      baseCeilingPct = 100;
      eligibilityYears = 10;
      break;
    default:
      baseCeilingPct = 40;
      eligibilityYears = 7;
  }

  // Vidarbha/Marathwada/Ratnagiri/Sindhudurg/Dhule special 80% rule
  const isSpecialRegion = ["AMRAVATI", "NAGPUR", "AURANGABAD"].includes(districtObj.division) ||
    ["Ratnagiri", "Sindhudurg", "Dhule"].includes(districtObj.district);

  if (isSpecialRegion && baseCeilingPct < 80) {
    baseCeilingPct = 80;
    eligibilityYears = 10;
  }

  // Thrust Sector Multiplier (+20% ceiling, +2 years)
  let finalCeilingPct = baseCeilingPct;
  if (["agro_food_processing", "industry_4_0_ai", "green_energy_biofuel"].includes(input.sector)) {
    finalCeilingPct = Math.min(100, baseCeilingPct + 20);
    eligibilityYears += 2;
  }

  // Expansion unit reduction (80% of new unit benefits, -1 year)
  if (input.isExpansion) {
    finalCeilingPct = Math.round(finalCeilingPct * 0.8);
    eligibilityYears = Math.max(3, eligibilityYears - 1);
  }

  // Max eligible incentive amount
  const maxIncentiveAmountCr = Number(((input.capexCr * finalCeilingPct) / 100).toFixed(2));
  const annualDisbursementCapCr = eligibilityYears > 0 ? Number((maxIncentiveAmountCr / eligibilityYears).toFixed(2)) : 0;

  // SGST IPS %
  const sgstIpsRefundPct = scale === "LSI" || scale === "MEGA" || scale === "ULTRA_MEGA" ? 50 : 100;

  // Power Tariff Subsidy
  let powerSubsidyRate = 0;
  if (effectiveCategory !== "A") {
    powerSubsidyRate = isSpecialRegion || ["Raigad", "Ratnagiri", "Sindhudurg"].includes(districtObj.district) ? 1.0 : 0.5;
  }

  // Electricity Duty
  const electricityDutyExempt = !["A", "B"].includes(effectiveCategory) || sectorRule.governingPolicy === "FINTECH_POLICY_2018";

  return {
    category: effectiveCategory,
    scale,
    governingPolicy: sectorRule.governingPolicy,
    grReference: sectorRule.grReference,
    isThrustSector: sectorRule.isThrustSector,
    fciCeilingPct: finalCeilingPct,
    maxIncentiveAmountCr,
    eligibilityYears,
    annualDisbursementCapCr,
    sgstIpsRefundPct,
    powerSubsidyRatePerUnit: sectorRule.powerTariffSubsidyRateInr || powerSubsidyRate,
    interestSubsidyPct: sectorRule.interestSubsidyPct || 5.0,
    stampDutyWaiverPct: sectorRule.stampDutyWaiverPct || (effectiveCategory === "A" || effectiveCategory === "B" ? 0 : 100),
    electricityDutyExempt,
    specialPerks: sectorRule.specialBenefits,
    scaleCriteriaNotes,
  };
}
