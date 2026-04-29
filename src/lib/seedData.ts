/**
 * Rich seed data for PropVault CRM demo.
 * Covers all statuses, priority tiers, overdue follow-ups, and stale leads.
 */

export const SEED_USERS = [
  { name: "Bilal Ahmed",   email: "admin@propvault.pk",  password: "admin123", role: "admin" as const },
  { name: "Zara Khan",     email: "zara@propvault.pk",   password: "agent123", role: "agent" as const },
  { name: "Hassan Raza",   email: "hassan@propvault.pk", password: "agent123", role: "agent" as const },
  { name: "Fatima Malik",  email: "fatima@propvault.pk", password: "agent123", role: "agent" as const },
];

const daysAgo     = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000);

export const SEED_LEADS = [
  // ── HIGH PRIORITY (budget ≥ 20M) ──────────────────────────────────────────
  { name: "Usman Tariq",    email: "usman.tariq@gmail.com",    phone: "0321-4567890", propertyInterest: "Residential Plot",    budget: 25_000_000, status: "new",         notes: "1 Kanal corner plot, road-facing preferred. DHA Phase 6. Very serious buyer.",          followUpDate: daysAgo(2),     createdAt: daysAgo(10) },
  { name: "Imran Malik",    email: "imran.malik@yahoo.com",    phone: "0333-9988776", propertyInterest: "Commercial Plot",     budget: 35_000_000, status: "qualified",   notes: "Corner plot on main boulevard, Gulberg. Budget flexible up to 40M.",                    followUpDate: daysFromNow(3), createdAt: daysAgo(14) },
  { name: "Farhan Qureshi", email: "farhan.q@gmail.com",       phone: "0345-6677889", propertyInterest: "Farm House",          budget: 45_000_000, status: "negotiation", notes: "4 Kanal farm house on Bedian Road. Serious buyer, finalizing price.",                   followUpDate: daysFromNow(1), createdAt: daysAgo(20) },
  { name: "Tariq Mehmood",  email: "tariq.m@gmail.com",        phone: "0300-8877665", propertyInterest: "Commercial Building", budget: 80_000_000, status: "contacted",   notes: "Investor seeking rental-income property in Gulberg. Needs 2 floors minimum.",          followUpDate: daysAgo(5),     createdAt: daysAgo(18) },
  { name: "Nawaz Sheikh",   email: "nawaz.sheikh@hotmail.com", phone: "0322-5544332", propertyInterest: "Residential Plot",    budget: 22_000_000, status: "new",         notes: "Bahria Town Phase 8. First-time buyer, needs guidance on installment plans.",         followUpDate: null,           createdAt: daysAgo(12) },
  { name: "Sara Javed",     email: "sara.javed@gmail.com",     phone: "0301-1122334", propertyInterest: "Penthouse",           budget: 55_000_000, status: "negotiation", notes: "DHA Phase 2 penthouse. CEO, flexible on price but needs luxury finishes.",             followUpDate: daysFromNow(2), createdAt: daysAgo(25) },
  { name: "Ahmed Farooq",   email: "ahmed.farooq@gmail.com",   phone: "0344-3322110", propertyInterest: "Warehouse",           budget: 30_000_000, status: "closed",      notes: "2-acre warehouse, Sundar Industrial Estate. Deal closed, full payment received.",     followUpDate: null,           createdAt: daysAgo(30) },

  // ── MEDIUM PRIORITY (10M – 20M) ────────────────────────────────────────────
  { name: "Ayesha Siddiqui", email: "ayesha.s@hotmail.com",   phone: "0300-1122334", propertyInterest: "Apartment",          budget: 12_500_000, status: "contacted",   notes: "3-bed apartment Bahria Town, ground floor, open kitchen preferred.",                  followUpDate: daysAgo(1),     createdAt: daysAgo(8)  },
  { name: "Shahbaz Ali",     email: "shahbaz.ali@gmail.com",   phone: "0321-7788990", propertyInterest: "Office",             budget: 18_000_000, status: "contacted",   notes: "2000sqft office Blue Area. IT company relocating, needs 15 parking spots.",           followUpDate: daysFromNow(5), createdAt: daysAgo(6)  },
  { name: "Nadia Akhtar",    email: "nadia.akhtar@gmail.com",  phone: "0311-7766554", propertyInterest: "House",              budget: 14_000_000, status: "qualified",   notes: "10 Marla Wapda Town. Just moved back from abroad, needs near school zone.",          followUpDate: daysFromNow(7), createdAt: daysAgo(9)  },
  { name: "Kamran Iqbal",    email: "kamran.iqbal@yahoo.com",  phone: "0332-6655443", propertyInterest: "Residential Plot",   budget: 11_000_000, status: "new",         notes: "Gulberg Greens 5 Marla. Builder, will construct and sell — needs 3-4 plots.",       followUpDate: null,           createdAt: daysAgo(15) },
  { name: "Madiha Rizwan",   email: "madiha.r@gmail.com",      phone: "0313-9988001", propertyInterest: "Duplex",             budget: 16_000_000, status: "lost",        notes: "DHA Phase 4 duplex. Went with competitor — price was slightly higher.",              followUpDate: null,           createdAt: daysAgo(22) },
  { name: "Omer Bashir",     email: "omer.bashir@gmail.com",   phone: "0323-1234567", propertyInterest: "Apartment",          budget: 19_500_000, status: "negotiation", notes: "Emaar Canyon Views, 3rd floor north-facing. Wants appliances included.",             followUpDate: daysAgo(3),     createdAt: daysAgo(16) },
  { name: "Hina Cheema",     email: "hina.cheema@hotmail.com", phone: "0346-8877665", propertyInterest: "Shop",               budget: 13_000_000, status: "closed",      notes: "Ground floor corner shop, MM Alam Road. Signed deal, registry done.",               followUpDate: null,           createdAt: daysAgo(35) },

  // ── LOW PRIORITY (< 10M) ───────────────────────────────────────────────────
  { name: "Sadia Noor",    email: "sadia.noor@gmail.com",    phone: "0311-5544332", propertyInterest: "House",            budget: 8_000_000, status: "new",       notes: "5 Marla house Gulberg. First home purchase, needs flexible payment plan.",           followUpDate: daysAgo(4),     createdAt: daysAgo(11) },
  { name: "Amna Butt",     email: "amna.butt@hotmail.com",   phone: "0302-3344556", propertyInterest: "Shop",             budget: 6_500_000, status: "closed",    notes: "Corner shop Johar Town Commercial. Deal closed. Happy client — referred a friend.", followUpDate: null,           createdAt: daysAgo(40) },
  { name: "Rabia Hussain", email: "rabia.h@gmail.com",       phone: "0312-4433221", propertyInterest: "Residential Plot", budget: 7_500_000, status: "lost",      notes: "Bahria Orchard Phase 1. Went with competitor — price slightly higher.",            followUpDate: null,           createdAt: daysAgo(28) },
  { name: "Junaid Latif",  email: "junaid.latif@gmail.com",  phone: "0335-5544112", propertyInterest: "Apartment",        budget: 9_000_000, status: "contacted", notes: "2-bed Askari 11. Army officer, wants secure gated community.",                      followUpDate: daysFromNow(4), createdAt: daysAgo(5)  },
  { name: "Zainab Rana",   email: "zainab.rana@gmail.com",   phone: "0307-2211334", propertyInterest: "House",            budget: 5_500_000, status: "new",       notes: "3 Marla LGDA Colony. Young couple, very budget-conscious.",                        followUpDate: null,           createdAt: daysAgo(13) },
  { name: "Bilal Chaudhry",email: "bilal.chd@yahoo.com",     phone: "0318-7766554", propertyInterest: "Shop",             budget: 4_500_000, status: "qualified", notes: "Commercial space Johar Town. Opening a pharmacy, ground floor only. Can close fast.", followUpDate: daysFromNow(2), createdAt: daysAgo(7)  },
];

// 20 unassigned leads — admin assigns them to agents
export const UNASSIGNED_LEADS = [
  { name: "Asad Mehmood",    email: "asad.m@gmail.com",        phone: "0321-1010101", propertyInterest: "Residential Plot",    budget: 28_000_000, notes: "1 Kanal east-facing plot, DHA Phase 7.",                          createdAt: daysAgo(1) },
  { name: "Mehwish Anwar",   email: "mehwish.a@hotmail.com",   phone: "0300-2020202", propertyInterest: "Apartment",           budget: 13_500_000, notes: "3-bed Gulberg, higher floor, wants gym facility.",                createdAt: daysAgo(2) },
  { name: "Shoaib Akhtar",   email: "shoaib.akhtar@gmail.com", phone: "0333-3030303", propertyInterest: "Commercial Plot",     budget: 42_000_000, notes: "4 marla commercial, main road facing, Main Market Gulberg.",      createdAt: daysAgo(1) },
  { name: "Fariha Saeed",    email: "fariha.s@gmail.com",      phone: "0311-4040404", propertyInterest: "House",               budget: 17_000_000, notes: "10 Marla Bahria Town. Relocating from Karachi, needs fast.",      createdAt: daysAgo(3) },
  { name: "Umar Dawood",     email: "umar.d@yahoo.com",        phone: "0345-5050505", propertyInterest: "Farm House",          budget: 32_000_000, notes: "2 Kanal Raiwind Road, wants fruit orchard space included.",       createdAt: daysAgo(2) },
  { name: "Sana Mirza",      email: "sana.mirza@gmail.com",    phone: "0302-6060606", propertyInterest: "Apartment",           budget: 9_500_000,  notes: "2-bed Bahria Heights, investment purchase — will rent out.",      createdAt: daysAgo(4) },
  { name: "Khalid Mahmood",  email: "khalid.mah@gmail.com",    phone: "0322-7070707", propertyInterest: "Office",              budget: 21_000_000, notes: "1500sqft Cavalry Ground, law firm, needs 10 parking spots.",      createdAt: daysAgo(1) },
  { name: "Noor Fatima",     email: "noor.f@hotmail.com",      phone: "0313-8080808", propertyInterest: "Residential Plot",    budget: 8_500_000,  notes: "5 Marla Lahore Smart City, first-time buyer, installment plan.",  createdAt: daysAgo(5) },
  { name: "Tariq Hassan",    email: "tariq.h@gmail.com",        phone: "0344-9090909", propertyInterest: "Commercial Building", budget: 65_000_000, notes: "Ferozepur Road full building, hotel conversion plan.",            createdAt: daysAgo(2) },
  { name: "Aisha Malik",     email: "aisha.malik@gmail.com",   phone: "0335-1111222", propertyInterest: "House",               budget: 11_000_000, notes: "5 Marla Model Town, single storey, near park preferred.",         createdAt: daysAgo(3) },
  { name: "Rizwan Siddiqui", email: "rizwan.s@gmail.com",      phone: "0321-2223334", propertyInterest: "Penthouse",           budget: 48_000_000, notes: "Emaar The Views. Corporate exec, high-end finishes required.",    createdAt: daysAgo(1) },
  { name: "Huma Baig",       email: "huma.baig@yahoo.com",     phone: "0300-3334445", propertyInterest: "Shop",                budget: 7_000_000,  notes: "Liberty Market area boutique, foot traffic is priority.",          createdAt: daysAgo(6) },
  { name: "Danish Rehman",   email: "danish.r@gmail.com",      phone: "0333-4445556", propertyInterest: "Warehouse",           budget: 38_000_000, notes: "Quaid-e-Azam Industrial. Import/export business, needs dock.",    createdAt: daysAgo(2) },
  { name: "Samina Qureshi",  email: "samina.q@hotmail.com",    phone: "0311-5556667", propertyInterest: "Apartment",           budget: 22_500_000, notes: "4-bed Lahore Towers. Large family, needs maid room and storage.", createdAt: daysAgo(4) },
  { name: "Fahad Chaudhry",  email: "fahad.ch@gmail.com",      phone: "0345-6667778", propertyInterest: "Residential Plot",    budget: 19_000_000, notes: "DHA Phase 9 Prism 10 Marla. Builder, will construct G+2.",        createdAt: daysAgo(1) },
  { name: "Lubna Iqbal",     email: "lubna.iq@gmail.com",      phone: "0302-7778889", propertyInterest: "House",               budget: 55_000_000, notes: "1 Kanal Canal Road, corner house, double road facing required.",  createdAt: daysAgo(3) },
  { name: "Adeel Zafar",     email: "adeel.z@yahoo.com",       phone: "0322-8889990", propertyInterest: "Commercial Plot",     budget: 14_000_000, notes: "Valencia Town, petrol pump site, needs main road access.",        createdAt: daysAgo(5) },
  { name: "Rukhsana Pervez", email: "rukhsana.p@gmail.com",    phone: "0313-9990001", propertyInterest: "Apartment",           budget: 6_000_000,  notes: "1-bed Askari 10. Elderly couple, ground floor essential.",        createdAt: daysAgo(2) },
  { name: "Zulfiqar Ali",    email: "zulfiqar.a@gmail.com",    phone: "0344-0001112", propertyInterest: "Farm House",          budget: 75_000_000, notes: "6 Kanal Bedian Road, wants swimming pool and guest house.",       createdAt: daysAgo(1) },
  { name: "Maryam Nawaz",    email: "maryam.n@hotmail.com",    phone: "0335-1112223", propertyInterest: "Office",              budget: 26_000_000, notes: "3000sqft MM Alam Road. Medical clinic, separate entry/exit.",     createdAt: daysAgo(4) },
];
