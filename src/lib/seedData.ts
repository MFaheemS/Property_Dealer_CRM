/**
 * Sample seed data — run via /api/seed (dev only) to populate MongoDB.
 * Gives a realistic demo of the PropVault CRM with Pakistani property data.
 */

export const SEED_USERS = [
  {
    name:     "Bilal Ahmed",
    email:    "admin@propvault.pk",
    password: "admin123",
    role:     "admin" as const,
  },
  {
    name:     "Zara Khan",
    email:    "zara@propvault.pk",
    password: "agent123",
    role:     "agent" as const,
  },
  {
    name:     "Hassan Raza",
    email:    "hassan@propvault.pk",
    password: "agent123",
    role:     "agent" as const,
  },
];

export const SEED_LEADS = [
  {
    name:             "Usman Tariq",
    email:            "usman.tariq@gmail.com",
    phone:            "0321-4567890",
    propertyInterest: "Residential Plot",
    budget:           25_000_000,
    status:           "new",
    notes:            "Looking for 1 kanal plot in DHA Phase 6.",
  },
  {
    name:             "Ayesha Siddiqui",
    email:            "ayesha.s@hotmail.com",
    phone:            "0300-1122334",
    propertyInterest: "Apartment",
    budget:           12_500_000,
    status:           "contacted",
    notes:            "Wants 3-bed apartment in Bahria Town, ground floor preferred.",
  },
  {
    name:             "Imran Malik",
    email:            "imran.malik@yahoo.com",
    phone:            "0333-9988776",
    propertyInterest: "Commercial Plot",
    budget:           35_000_000,
    status:           "qualified",
    notes:            "Corner plot on main boulevard. Budget is flexible.",
  },
  {
    name:             "Sadia Noor",
    email:            "sadia.noor@gmail.com",
    phone:            "0311-5544332",
    propertyInterest: "House",
    budget:           8_000_000,
    status:           "new",
    notes:            "5 marla house in Gulberg or Model Town.",
  },
  {
    name:             "Farhan Qureshi",
    email:            "farhan.q@gmail.com",
    phone:            "0345-6677889",
    propertyInterest: "Farm House",
    budget:           45_000_000,
    status:           "negotiation",
    notes:            "Looking for 4-kanal farm house on Bedian Road.",
  },
  {
    name:             "Amna Butt",
    email:            "amna.butt@hotmail.com",
    phone:            "0302-3344556",
    propertyInterest: "Shop",
    budget:           6_500_000,
    status:           "closed",
    notes:            "Corner shop in a commercial area. Deal closed successfully.",
  },
  {
    name:             "Shahbaz Ali",
    email:            "shahbaz.ali@gmail.com",
    phone:            "0321-7788990",
    propertyInterest: "Office",
    budget:           18_000_000,
    status:           "contacted",
    notes:            "2000 sqft office space in Blue Area or Gulberg III.",
  },
  {
    name:             "Rabia Hussain",
    email:            "rabia.h@gmail.com",
    phone:            "0312-4433221",
    propertyInterest: "Residential Plot",
    budget:           15_000_000,
    status:           "lost",
    notes:            "Was interested in Bahria Orchard but went with a competitor.",
  },
];
