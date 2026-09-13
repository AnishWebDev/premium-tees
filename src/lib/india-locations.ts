/** Sentinel value when the customer's city is not in the curated list. */
export const OTHER_CITY = "__other__";

export const OTHER_CITY_LABEL = "Other (type below)";

/** Sentinel when the state/UT is not in the curated list. */
export const OTHER_STATE = "__other_state__";

export const OTHER_STATE_LABEL = "Other (type below)";

export type IndiaRegion = {
  state: string;
  cities: string[];
};

/**
 * States/UTs with major cities for checkout dropdowns.
 * "Other" allows smaller towns not listed — common for India e-commerce.
 */
export const INDIA_REGIONS: IndiaRegion[] = [
  {
    state: "Andaman and Nicobar Islands",
    cities: ["Port Blair", "Diglipur", "Mayabunder"],
  },
  {
    state: "Andhra Pradesh",
    cities: [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Kurnool",
      "Tirupati",
      "Kakinada",
      "Rajahmundry",
      "Amaravati",
    ],
  },
  {
    state: "Arunachal Pradesh",
    cities: ["Itanagar", "Tawang", "Pasighat", "Ziro"],
  },
  {
    state: "Assam",
    cities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur", "Dispur"],
  },
  {
    state: "Bihar",
    cities: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"],
  },
  {
    state: "Chandigarh",
    cities: ["Chandigarh"],
  },
  {
    state: "Chhattisgarh",
    cities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
  },
  {
    state: "Dadra and Nagar Haveli and Daman and Diu",
    cities: ["Daman", "Diu", "Silvassa"],
  },
  {
    state: "Delhi",
    cities: ["New Delhi", "Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  },
  {
    state: "Goa",
    cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  },
  {
    state: "Gujarat",
    cities: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Bhavnagar",
      "Jamnagar",
      "Gandhinagar",
      "Junagadh",
    ],
  },
  {
    state: "Haryana",
    cities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Rohtak", "Hisar"],
  },
  {
    state: "Himachal Pradesh",
    cities: ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Manali"],
  },
  {
    state: "Jammu and Kashmir",
    cities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
  },
  {
    state: "Jharkhand",
    cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
  },
  {
    state: "Karnataka",
    cities: [
      "Bengaluru",
      "Mysuru",
      "Mangaluru",
      "Hubballi",
      "Belagavi",
      "Kalaburagi",
      "Davanagere",
      "Ballari",
      "Shivamogga",
      "Tumakuru",
    ],
  },
  {
    state: "Kerala",
    cities: [
      "Thiruvananthapuram",
      "Kochi",
      "Kozhikode",
      "Thrissur",
      "Kollam",
      "Alappuzha",
      "Kannur",
      "Palakkad",
    ],
  },
  {
    state: "Ladakh",
    cities: ["Leh", "Kargil"],
  },
  {
    state: "Lakshadweep",
    cities: ["Kavaratti", "Agatti"],
  },
  {
    state: "Madhya Pradesh",
    cities: ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa"],
  },
  {
    state: "Maharashtra",
    cities: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Thane",
      "Aurangabad",
      "Solapur",
      "Kolhapur",
      "Navi Mumbai",
      "Amravati",
    ],
  },
  {
    state: "Manipur",
    cities: ["Imphal", "Thoubal", "Bishnupur"],
  },
  {
    state: "Meghalaya",
    cities: ["Shillong", "Tura", "Jowai"],
  },
  {
    state: "Mizoram",
    cities: ["Aizawl", "Lunglei", "Champhai"],
  },
  {
    state: "Nagaland",
    cities: ["Kohima", "Dimapur", "Mokokchung"],
  },
  {
    state: "Odisha",
    cities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
  },
  {
    state: "Puducherry",
    cities: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  },
  {
    state: "Punjab",
    cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  },
  {
    state: "Rajasthan",
    cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar"],
  },
  {
    state: "Sikkim",
    cities: ["Gangtok", "Namchi", "Gyalshing"],
  },
  {
    state: "Tamil Nadu",
    cities: [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Tiruchirappalli",
      "Salem",
      "Tirunelveli",
      "Erode",
      "Vellore",
    ],
  },
  {
    state: "Telangana",
    cities: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam"],
  },
  {
    state: "Tripura",
    cities: ["Agartala", "Udaipur", "Dharmanagar"],
  },
  {
    state: "Uttar Pradesh",
    cities: [
      "Lucknow",
      "Kanpur",
      "Ghaziabad",
      "Agra",
      "Varanasi",
      "Meerut",
      "Prayagraj",
      "Noida",
      "Bareilly",
      "Aligarh",
    ],
  },
  {
    state: "Uttarakhand",
    cities: ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Nainital"],
  },
  {
    state: "West Bengal",
    cities: ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol", "Kharagpur", "Darjeeling"],
  },
];

export const INDIA_STATE_NAMES = INDIA_REGIONS.map((r) => r.state).sort((a, b) =>
  a.localeCompare(b)
);

export const INDIA_STATE_OPTIONS = [...INDIA_STATE_NAMES, OTHER_STATE];

export function getCitiesForState(state: string): string[] {
  if (!state || state === OTHER_STATE) return [OTHER_CITY];
  const region = INDIA_REGIONS.find((r) => r.state === state);
  if (!region) return [OTHER_CITY];
  return [...region.cities, OTHER_CITY];
}

export function resolveStateValue(state: string, stateOther?: string): string {
  if (state === OTHER_STATE) {
    return stateOther?.trim() ?? "";
  }
  return state.trim();
}

export function resolveCityValue(city: string, cityOther?: string): string {
  if (city === OTHER_CITY) {
    return cityOther?.trim() ?? "";
  }
  return city.trim();
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function matchStateFromValue(value: string): {
  state: string;
  stateOther: string;
} {
  const trimmed = value.trim();
  if (!trimmed) return { state: "", stateOther: "" };
  const exact = INDIA_STATE_NAMES.find((s) => s.toLowerCase() === trimmed.toLowerCase());
  if (exact) return { state: exact, stateOther: "" };
  const partial = INDIA_STATE_NAMES.find((s) =>
    s.toLowerCase().includes(trimmed.toLowerCase())
  );
  if (partial) return { state: partial, stateOther: "" };
  return { state: OTHER_STATE, stateOther: trimmed };
}

export function matchCityForState(state: string, city: string): {
  city: string;
  cityOther: string;
} {
  const trimmed = city.trim();
  if (!trimmed) return { city: "", cityOther: "" };
  const options = getCitiesForState(state).filter((c) => c !== OTHER_CITY);
  const exact = options.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exact) return { city: exact, cityOther: "" };
  return { city: OTHER_CITY, cityOther: trimmed };
}
