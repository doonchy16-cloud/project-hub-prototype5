"use client";

import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Compass,
  CreditCard,
  FolderKanban,
  Globe,
  Heart,
  House,
  Lock,
  Mail,
  MapPin,
  Moon,
  PenSquare,
  Phone,
  Plus,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  Tag,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Script from "next/script";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark";
type AppStage = "signin_details" | "signin_payment" | "signin_confirmation" | "app";
type PageKey =
  | "home"
  | "favorites"
  | "projects"
  | "settings"
  | "account_info"
  | "answers_summary"
  | "questionnaire"
  | "project_detail";
type PlanKey = "starter" | "pro" | "skip";
type ProjectsTabKey = "projects" | "my_projects";

type Question = {
  id: string;
  category: string;
  type: "select" | "textarea";
  label: string;
  options?: string[];
  placeholder?: string;
};

type ThemeStyles = {
  appBg: string;
  panel: string;
  card: string;
  border: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  pill: string;
  shadow: string;
};

type RegionData = {
  name: string;
  cities: string[];
};

type CountryData = {
  regionLabel: string;
  cityLabel?: string;
  regions: RegionData[];
};

type LocationData = Record<string, Record<string, CountryData>>;

type BaseProject = {
  id: number;
  title: string;
  creator: string;
  category: string;
  location: string;
  state: string;
  country: string;
  continent: string;
  city: string;
  description: string;
  tags: string[];
  thumbnail?: string;
  lat: number;
  lng: number;
};

type SharedProject = BaseProject & {
  profileKeywords: string[];
  score?: number;
  reasons?: string[];
};

type UserProject = BaseProject & {
  visibility: "private" | "public";
};

type Project = SharedProject | UserProject;
type MapMode = "mini" | "full";

type LeafletMapProps = {
  projects: SharedProject[];
  highlightedIds: number[];
  activeProjectId: number | null;
  onSelectProject?: (project: SharedProject) => void;
  mode: MapMode;
  isReady: boolean;
};

const LOCATION_DATA: LocationData = {
  Africa: {
    Egypt: {
      regionLabel: "Governorate",
      cityLabel: "City",
      regions: [
        { name: "Cairo Governorate", cities: ["Cairo", "Heliopolis", "Nasr City"] },
        { name: "Alexandria Governorate", cities: ["Alexandria", "Borg El Arab"] },
      ],
    },
    Kenya: {
      regionLabel: "County",
      cityLabel: "City / Town",
      regions: [
        { name: "Nairobi County", cities: ["Nairobi", "Karen", "Westlands"] },
        { name: "Mombasa County", cities: ["Mombasa", "Likoni"] },
      ],
    },
    Morocco: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Casablanca-Settat", cities: ["Casablanca", "Mohammedia"] },
        { name: "Marrakesh-Safi", cities: ["Marrakesh", "Essaouira"] },
      ],
    },
    Nigeria: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "Lagos", cities: ["Lagos", "Ikeja", "Lekki"] },
        { name: "Abuja FCT", cities: ["Abuja"] },
      ],
    },
    "South Africa": {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Gauteng", cities: ["Johannesburg", "Pretoria"] },
        { name: "Western Cape", cities: ["Cape Town", "Stellenbosch"] },
      ],
    },
  },
  Asia: {
    India: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "Maharashtra", cities: ["Mumbai", "Pune"] },
        { name: "Karnataka", cities: ["Bengaluru", "Mysuru"] },
      ],
    },
    Indonesia: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Jakarta", cities: ["Jakarta"] },
        { name: "Bali", cities: ["Denpasar", "Ubud"] },
      ],
    },
    Israel: {
      regionLabel: "District",
      cityLabel: "City",
      regions: [
        { name: "Tel Aviv District", cities: ["Tel Aviv", "Herzliya"] },
        { name: "Jerusalem District", cities: ["Jerusalem"] },
        { name: "Northern District", cities: ["Haifa", "Nazareth"] },
      ],
    },
    Japan: {
      regionLabel: "Prefecture",
      cityLabel: "City",
      regions: [
        { name: "Tokyo", cities: ["Tokyo", "Shibuya", "Shinjuku"] },
        { name: "Osaka", cities: ["Osaka"] },
      ],
    },
    Singapore: {
      regionLabel: "Region",
      cityLabel: "Area / City",
      regions: [
        { name: "Central Region", cities: ["Singapore", "Orchard"] },
        { name: "East Region", cities: ["Tampines"] },
      ],
    },
    "South Korea": {
      regionLabel: "Province / Metro",
      cityLabel: "City",
      regions: [
        { name: "Seoul", cities: ["Seoul", "Gangnam"] },
        { name: "Busan", cities: ["Busan"] },
      ],
    },
    Thailand: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Bangkok", cities: ["Bangkok"] },
        { name: "Chiang Mai", cities: ["Chiang Mai"] },
      ],
    },
    "United Arab Emirates": {
      regionLabel: "Emirate",
      cityLabel: "City",
      regions: [
        { name: "Dubai", cities: ["Dubai"] },
        { name: "Abu Dhabi", cities: ["Abu Dhabi"] },
      ],
    },
  },
  Europe: {
    France: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Île-de-France", cities: ["Paris"] },
        { name: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice"] },
      ],
    },
    Germany: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "Bavaria", cities: ["Munich", "Nuremberg"] },
        { name: "Berlin", cities: ["Berlin"] },
      ],
    },
    Italy: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Lazio", cities: ["Rome"] },
        { name: "Lombardy", cities: ["Milan"] },
      ],
    },
    Netherlands: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "North Holland", cities: ["Amsterdam"] },
        { name: "South Holland", cities: ["Rotterdam", "The Hague"] },
      ],
    },
    Portugal: {
      regionLabel: "District",
      cityLabel: "City",
      regions: [
        { name: "Lisbon District", cities: ["Lisbon", "Cascais"] },
        { name: "Porto District", cities: ["Porto"] },
      ],
    },
    Spain: {
      regionLabel: "Autonomous Community",
      cityLabel: "City",
      regions: [
        { name: "Catalonia", cities: ["Barcelona"] },
        { name: "Community of Madrid", cities: ["Madrid"] },
      ],
    },
    Sweden: {
      regionLabel: "County",
      cityLabel: "City",
      regions: [
        { name: "Stockholm County", cities: ["Stockholm"] },
        { name: "Skåne County", cities: ["Malmö"] },
      ],
    },
        "United Kingdom": {
      regionLabel: "Nation / Region",
      cityLabel: "City",
      regions: [
        { name: "England", cities: ["London", "Manchester"] },
        { name: "Scotland", cities: ["Edinburgh", "Glasgow"] },
      ],
    },
  },
  "North America": {
    Bahamas: {
      regionLabel: "Island / District",
      cityLabel: "City / Town",
      regions: [
        { name: "New Providence", cities: ["Nassau"] },
        { name: "Grand Bahama", cities: ["Freeport"] },
      ],
    },
    Canada: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Ontario", cities: ["Toronto", "Ottawa"] },
        { name: "British Columbia", cities: ["Vancouver", "Victoria"] },
        { name: "Quebec", cities: ["Montreal"] },
      ],
    },
    "Costa Rica": {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "San José", cities: ["San José"] },
        { name: "Guanacaste", cities: ["Liberia", "Tamarindo"] },
      ],
    },
    "Dominican Republic": {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Distrito Nacional", cities: ["Santo Domingo"] },
        { name: "La Altagracia", cities: ["Punta Cana"] },
      ],
    },
    Guatemala: {
      regionLabel: "Department",
      cityLabel: "City",
      regions: [
        { name: "Guatemala", cities: ["Guatemala City"] },
        { name: "Sacatepéquez", cities: ["Antigua Guatemala"] },
      ],
    },
    Jamaica: {
      regionLabel: "Parish",
      cityLabel: "City / Town",
      regions: [
        { name: "Kingston", cities: ["Kingston"] },
        { name: "Saint James", cities: ["Montego Bay"] },
      ],
    },
    Mexico: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "Mexico City", cities: ["Mexico City"] },
        { name: "Jalisco", cities: ["Guadalajara", "Puerto Vallarta"] },
        { name: "Nuevo León", cities: ["Monterrey"] },
      ],
    },
    Panama: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Panamá", cities: ["Panama City"] },
        { name: "Chiriquí", cities: ["David", "Boquete"] },
      ],
    },
    "United States": {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "California", cities: ["San Diego", "Los Angeles", "San Francisco", "Joshua Tree"] },
        { name: "Texas", cities: ["Austin", "Dallas", "Houston"] },
        { name: "New York", cities: ["New York City", "Buffalo"] },
        { name: "Florida", cities: ["Miami", "Orlando"] },
        { name: "Washington", cities: ["Seattle"] },
        { name: "Oregon", cities: ["Portland"] },
        { name: "Colorado", cities: ["Denver", "Boulder"] },
      ],
    },
  },
  Oceania: {
    Australia: {
      regionLabel: "State / Territory",
      cityLabel: "City",
      regions: [
        { name: "New South Wales", cities: ["Sydney"] },
        { name: "Victoria", cities: ["Melbourne"] },
        { name: "Queensland", cities: ["Brisbane"] },
      ],
    },
    Fiji: {
      regionLabel: "Division",
      cityLabel: "City / Town",
      regions: [
        { name: "Central Division", cities: ["Suva"] },
        { name: "Western Division", cities: ["Nadi"] },
      ],
    },
    "New Zealand": {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Auckland", cities: ["Auckland"] },
        { name: "Wellington", cities: ["Wellington"] },
      ],
    },
  },
  "South America": {
    Argentina: {
      regionLabel: "Province",
      cityLabel: "City",
      regions: [
        { name: "Buenos Aires", cities: ["Buenos Aires"] },
        { name: "Córdoba", cities: ["Córdoba"] },
      ],
    },
    Brazil: {
      regionLabel: "State",
      cityLabel: "City",
      regions: [
        { name: "São Paulo", cities: ["São Paulo"] },
        { name: "Rio de Janeiro", cities: ["Rio de Janeiro"] },
      ],
    },
    Chile: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Santiago Metropolitan", cities: ["Santiago"] },
        { name: "Valparaíso", cities: ["Valparaíso"] },
      ],
    },
    Colombia: {
      regionLabel: "Department",
      cityLabel: "City",
      regions: [
        { name: "Bogotá D.C.", cities: ["Bogotá"] },
        { name: "Antioquia", cities: ["Medellín"] },
      ],
    },
    Peru: {
      regionLabel: "Region",
      cityLabel: "City",
      regions: [
        { name: "Lima", cities: ["Lima"] },
        { name: "Cusco", cities: ["Cusco"] },
      ],
    },
    Uruguay: {
      regionLabel: "Department",
      cityLabel: "City",
      regions: [{ name: "Montevideo", cities: ["Montevideo"] }],
    },
  },
};

const PLAN_OPTIONS: {
  key: PlanKey;
  title: string;
  price: string;
  subtitle: string;
}[] = [
  {
    key: "starter",
    title: "Starter Plan",
    price: "$1",
    subtitle: "One-time starter access for prototype testing.",
  },
  {
    key: "pro",
    title: "Pro Plan",
    price: "$10/month",
    subtitle: "Monthly plan for extended access and future premium features.",
  },
  {
    key: "skip",
    title: "Skip for Now",
    price: "$0 now",
    subtitle: "Continue through the prototype without entering payment details.",
  },
];

const sharedProjectsSeed: SharedProject[] = [
  {
    id: 1,
    title: "San Diego Family Garden Co-op",
    creator: "Ava Chen",
    category: "Community Living",
    city: "San Diego",
    state: "California",
    country: "United States",
    continent: "North America",
    location: "San Diego, California, United States, North America",
    description:
      "A family-friendly garden and skills-sharing group focused on food growing, homeschooling meetups, and weekend build days.",
    tags: ["family", "gardening", "homeschool", "community"],
    profileKeywords: ["family", "garden", "homeschool", "community", "teaching", "kids"],
    thumbnail: "SD",
    lat: 32.7157,
    lng: -117.1611,
  },
  {
    id: 2,
    title: "Joshua Tree Off-Grid Build Camp",
    creator: "Marcus Lee",
    category: "Off-Grid",
    city: "Joshua Tree",
    state: "California",
    country: "United States",
    continent: "North America",
    location: "Joshua Tree, California, United States, North America",
    description:
      "A hands-on off-grid project building solar-ready tiny structures, water systems, and a shared maker yard in the desert.",
    tags: ["off-grid", "solar", "building", "tiny home"],
    profileKeywords: ["off-grid", "solar", "build", "land", "construction", "independence"],
    thumbnail: "JT",
    lat: 34.1347,
    lng: -116.3131,
  },
  {
    id: 3,
    title: "Portland Creative Homestead Circle",
    creator: "Lina Patel",
    category: "Creative Community",
    city: "Portland",
    state: "Oregon",
    country: "United States",
    continent: "North America",
    location: "Portland, Oregon, United States, North America",
    description:
      "A small homestead network for artists, gardeners, and families who want shared meals, workshops, and creative studio days.",
    tags: ["art", "homestead", "families", "workshops"],
    profileKeywords: ["creative", "art", "music", "homestead", "community", "family"],
    thumbnail: "PC",
    lat: 45.5152,
    lng: -122.6784,
  },
  {
    id: 4,
    title: "Austin Remote Work + Build Collective",
    creator: "Daniel Ross",
    category: "Hybrid Living",
    city: "Austin",
    state: "Texas",
    country: "United States",
    continent: "North America",
    location: "Austin, Texas, United States, North America",
    description:
      "A community for people balancing remote work with intentional living, weekend building projects, and shared land planning.",
    tags: ["remote work", "building", "land", "planning"],
    profileKeywords: ["remote", "operations", "tech", "building", "planning", "community"],
    thumbnail: "AT",
    lat: 30.2672,
    lng: -97.7431,
  },
  {
    id: 5,
    title: "Toronto Learning Exchange Village",
    creator: "Sofia Alvarez",
    category: "Education",
    city: "Toronto",
    state: "Ontario",
    country: "Canada",
    continent: "North America",
    location: "Toronto, Ontario, Canada, North America",
    description:
      "A learning-focused village for families who want shared education, outdoor routines, and practical skills workshops.",
    tags: ["education", "family", "learning", "village"],
    profileKeywords: ["education", "family", "village", "nature", "teaching", "kids"],
    thumbnail: "TO",
    lat: 43.6532,
    lng: -79.3832,
  },
  {
    id: 6,
    title: "Northern California Regenerative Farm Hub",
    creator: "Priya Singh",
    category: "Regenerative Farming",
    city: "San Francisco",
    state: "California",
    country: "United States",
    continent: "North America",
    location: "San Francisco, California, United States, North America",
    description:
      "A regenerative farm startup looking for growers, builders, and families interested in long-term community life on shared land.",
    tags: ["farming", "regenerative", "land", "families"],
    profileKeywords: ["farm", "land", "family", "off-grid", "growing", "healing"],
    thumbnail: "NC",
    lat: 37.7749,
    lng: -122.4194,
  },
  {
    id: 7,
    title: "Monterrey Maker Homestead",
    creator: "Carlos Medina",
    category: "Creative Community",
    city: "Monterrey",
    state: "Nuevo León",
    country: "Mexico",
    continent: "North America",
    location: "Monterrey, Nuevo León, Mexico, North America",
    description:
      "A bilingual maker and family homestead network blending design, food growing, workshops, and shared tools.",
    tags: ["maker", "family", "bilingual", "community"],
    profileKeywords: ["creative", "family", "community", "making", "building", "teaching"],
    thumbnail: "MX",
    lat: 25.6866,
    lng: -100.3161,
  },
  {
    id: 8,
    title: "Miami Wellness + Community Harbor",
    creator: "Jasmine Cole",
    category: "Hybrid Living",
    city: "Miami",
    state: "Florida",
    country: "United States",
    continent: "North America",
    location: "Miami, Florida, United States, North America",
    description:
      "A warm-climate project for remote workers, wellness practitioners, and families seeking a flexible shared lifestyle.",
    tags: ["wellness", "remote", "family", "warm climate"],
    profileKeywords: ["wellness", "remote", "family", "care", "community", "work"],
    thumbnail: "MI",
    lat: 25.7617,
    lng: -80.1918,
  },
];

const myProjectCategories = [
  "Community Living",
  "Off-Grid",
  "Creative Community",
  "Hybrid Living",
  "Education",
  "Regenerative Farming",
  "General",
] as const;

const navItems: {
  key: Exclude<PageKey, "questionnaire" | "project_detail">;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "home", label: "Home", icon: House },
  { key: "favorites", label: "Favorites", icon: Heart },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "settings", label: "Settings", icon: Settings },
  { key: "account_info", label: "Account Info", icon: User },
  { key: "answers_summary", label: "Answers Summary", icon: Compass },
];

const categoryOrder = [
  "Status",
  "Location + Timing",
  "Project Preferences",
  "Lifestyle",
  "Work + Finances",
  "Skills + Abilities",
  "Commitment + Fit",
] as const;

function uniqueProjectList(projects: SharedProject[]): SharedProject[] {
  const seen = new Set<number>();
  return projects.filter((project) => {
    if (seen.has(project.id)) return false;
    seen.add(project.id);
    return true;
  });
}

function getAdaptiveQuestions(
  currentLocation: string,
  answers: Record<string, string>
): Question[] {
  const locationLower = currentLocation.toLowerCase();
  const inCalifornia =
    locationLower.includes("california") ||
    locationLower.includes("san diego") ||
    locationLower.includes("los angeles");

  const householdType = answers.household_type || "";
  const projectType = answers.project_type || "community";
  const primaryStrength = answers.primary_strength || "your main strength";
  const timeline = answers.timeline || "sometime soon";

  const shouldAskHouseholdSize =
    householdType !== "Individual" && householdType !== "Couple";

  const householdSizeLabel =
    householdType === "Friends / group"
      ? "How many people are in your group?"
      : "How many people are in your household?";

  return [
    {
      id: "household_type",
      category: "Status",
      type: "select",
      label: "Which best describes your current household status?",
      options: [
        "Individual",
        "Couple",
        "Family with kids",
        "Family without kids",
        "Friends / group",
      ],
    },
    ...(shouldAskHouseholdSize
      ? [
          {
            id: "household_size",
            category: "Status",
            type: "select",
            label: householdSizeLabel,
            options: ["1", "2", "3-4", "5-6", "7+"],
          } as Question,
        ]
      : []),
    {
      id: "timeline",
      category: "Location + Timing",
      type: "select",
      label: "How soon are you realistically hoping to make a move or join a project?",
      options: [
        "Just researching",
        "Within 6-12 months",
        "Within 3-6 months",
        "Within 1-3 months",
        "Ready now",
      ],
    },
    {
      id: "distance_preference",
      category: "Location + Timing",
      type: "select",
      label: `How far from ${currentLocation || "your current location"} would you consider going?`,
      options: inCalifornia
        ? [
            "Stay very local",
            "Anywhere in California",
            "Western U.S.",
            "Anywhere in the U.S.",
            "Open internationally",
          ]
        : [
            "Stay very local",
            "Within my region",
            "Anywhere in my state",
            "Anywhere in the U.S.",
            "Open internationally",
          ],
    },
    {
      id: "project_type",
      category: "Project Preferences",
      type: "select",
      label: "What kind of project are you most drawn to right now?",
      options: [
        "Off-grid build",
        "Family community",
        "Creative homestead",
        "Regenerative farm",
        "Remote-work community",
        "Education village",
      ],
    },
    {
      id: "climate_preference",
      category: "Project Preferences",
      type: "select",
      label: `Based on being in ${currentLocation || "your location"}, what climate or environment feels best for you?`,
      options: inCalifornia
        ? [
            "Coastal / mild",
            "Mountain / forest",
            "Desert / dry",
            "Rural farmland",
            "No strong preference",
          ]
        : [
            "Warm / sunny",
            "Cool / forested",
            "Dry / desert",
            "Rural farmland",
            "No strong preference",
          ],
    },
    {
      id: "community_style",
      category: "Lifestyle",
      type: "select",
      label: "How much community interaction do you want in daily life?",
      options: [
        "Mostly private",
        "Small circle",
        "Balanced mix",
        "Highly communal",
        "Flexible / depends on project",
      ],
    },
    {
      id: "housing_style",
      category: "Lifestyle",
      type: "select",
      label: `For a ${projectType.toLowerCase()} setup, what housing style feels like the best fit?`,
      options: [
        "Private house",
        "Cabin / tiny home",
        "Shared land with separate homes",
        "Intentional shared housing",
        "Still exploring",
      ],
    },
    {
      id: "work_style",
      category: "Work + Finances",
      type: "select",
      label: "What best describes your current work or income style?",
      options: [
        "Remote work",
        "Local job / business",
        "Self-employed",
        "Homemaker / caretaker",
        "Mixed / transitioning",
      ],
    },
    {
      id: "budget_status",
      category: "Work + Finances",
      type: "select",
      label: "What is your current financial readiness for joining or building something?",
      options: [
        "Very limited right now",
        "Modest budget",
        "Can contribute steadily",
        "Can invest meaningfully",
        "Need flexible arrangements",
      ],
    },
    {
      id: "build_readiness",
      category: "Skills + Abilities",
      type: "select",
      label: "How ready are you for physical building, setup, or hands-on project work?",
      options: [
        "Prefer non-physical roles",
        "Can help lightly",
        "Can help regularly",
        "Strong hands-on contributor",
        "Depends on the project",
      ],
    },
    {
      id: "family_fit",
      category: "Lifestyle",
      type: "select",
      label: householdType.toLowerCase().includes("family")
        ? "What kind of child and family support matters most to you?"
        : "How important is it that the project be family-friendly or child-compatible?",
      options: [
        "Very important",
        "Helpful but not essential",
        "Neutral",
        "Only if the fit is right",
        "Not important",
      ],
    },
    {
      id: "food_lifestyle",
      category: "Project Preferences",
      type: "select",
      label: "Which lifestyle element matters most in the project’s daily culture?",
      options: [
        "Gardening / food growing",
        "Health / wellness",
        "Learning / education",
        "Creativity / arts",
        "Building / making",
      ],
    },
    {
      id: "accessibility_needs",
      category: "Status",
      type: "select",
      label: "What best describes your accessibility, health, or energy considerations right now?",
      options: [
        "No major constraints",
        "Need moderate flexibility",
        "Need strong accessibility support",
        "Need lower-physical-intensity roles",
        "Prefer not to say",
      ],
    },
    {
      id: "primary_strength",
      category: "Skills + Abilities",
      type: "select",
      label: "What is your strongest contribution to a community or project?",
      options: [
        "Teaching / mentoring",
        "Building / construction",
        "Gardening / farming",
        "Operations / organizing",
        "Creative / arts",
        "Wellness / care",
      ],
    },
    {
      id: "secondary_strength",
      category: "Skills + Abilities",
      type: "select",
      label: `What is your second-strongest contribution alongside ${primaryStrength.toLowerCase()}?`,
      options: [
        "Teaching / mentoring",
        "Building / construction",
        "Gardening / farming",
        "Operations / organizing",
        "Creative / arts",
        "Wellness / care",
      ],
    },
    {
      id: "role_preference",
      category: "Commitment + Fit",
      type: "select",
      label: "What role do you naturally want in a community?",
      options: [
        "Leader / initiator",
        "Reliable builder",
        "Organizer / systems person",
        "Caregiver / support role",
        "Explorer / still figuring it out",
      ],
    },
    {
      id: "deal_breakers",
      category: "Commitment + Fit",
      type: "textarea",
      label: `What are your biggest deal-breakers for a ${projectType.toLowerCase()} project?`,
      placeholder:
        "For example: too isolated, too crowded, not enough privacy, bad school fit, unclear ownership...",
    },
    {
      id: "relocation_readiness",
      category: "Location + Timing",
      type: "select",
      label: `Given your timeline of ${timeline.toLowerCase()}, how ready are you for real-world relocation steps?`,
      options: [
        "Not ready yet",
        "Collecting information",
        "Can start planning soon",
        "Actively preparing",
        "Already taking action",
      ],
    },
    {
      id: "success_definition",
      category: "Commitment + Fit",
      type: "textarea",
      label: "What would success look like for you one year after joining the right project?",
      placeholder:
        "Describe the life, rhythm, environment, and sense of belonging you want.",
    },
  ];
}

function ThemeButton({
  children,
  active,
  onClick,
  themeStyles,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  themeStyles: ThemeStyles;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-95 ${className}`}
      style={{
        backgroundColor: active ? themeStyles.primary : themeStyles.card,
        color: active ? themeStyles.primaryText : themeStyles.text,
        borderColor: active ? themeStyles.primary : themeStyles.border,
      }}
    >
      {children}
    </button>
  );
}

function ThemeInput({
  value,
  onChange,
  placeholder,
  themeStyles,
  multiline = false,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  themeStyles: ThemeStyles;
  multiline?: boolean;
}) {
  const sharedProps = {
    value,
    onChange,
    placeholder,
    className:
      "w-full rounded-2xl border px-4 py-3 text-sm outline-none placeholder:text-slate-400",
    style: {
      backgroundColor: themeStyles.panel,
      color: themeStyles.text,
      borderColor: themeStyles.border,
    },
  };

  if (multiline) return <textarea rows={4} {...sharedProps} />;
  return <input {...sharedProps} />;
}

function ThemeSelect({
  value,
  onChange,
  options,
  placeholder,
  themeStyles,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  themeStyles: ThemeStyles;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
      style={{
        backgroundColor: themeStyles.panel,
        color: themeStyles.text,
        borderColor: themeStyles.border,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function uniqueProjectList(projects: SharedProject[]): SharedProject[] {
  const seen = new Set<number>();
  return projects.filter((project) => {
    if (seen.has(project.id)) return false;
    seen.add(project.id);
    return true;
  });
}

function getAdaptiveQuestions(
  currentLocation: string,
  answers: Record<string, string>
): Question[] {
  const locationLower = currentLocation.toLowerCase();
  const inCalifornia =
    locationLower.includes("california") ||
    locationLower.includes("san diego") ||
    locationLower.includes("los angeles");

  const householdType = answers.household_type || "";
  const projectType = answers.project_type || "community";
  const primaryStrength = answers.primary_strength || "your main strength";
  const timeline = answers.timeline || "sometime soon";

  const shouldAskHouseholdSize =
    householdType !== "Individual" && householdType !== "Couple";

  const householdSizeLabel =
    householdType === "Friends / group"
      ? "How many people are in your group?"
      : "How many people are in your household?";

  return [
    {
      id: "household_type",
      category: "Status",
      type: "select",
      label: "Which best describes your current household status?",
      options: [
        "Individual",
        "Couple",
        "Family with kids",
        "Family without kids",
        "Friends / group",
      ],
    },
    ...(shouldAskHouseholdSize
      ? [
          {
            id: "household_size",
            category: "Status",
            type: "select",
            label: householdSizeLabel,
            options: ["1", "2", "3-4", "5-6", "7+"],
          } as Question,
        ]
      : []),
    {
      id: "timeline",
      category: "Location + Timing",
      type: "select",
      label: "How soon are you realistically hoping to make a move or join a project?",
      options: [
        "Just researching",
        "Within 6-12 months",
        "Within 3-6 months",
        "Within 1-3 months",
        "Ready now",
      ],
    },
    {
      id: "distance_preference",
      category: "Location + Timing",
      type: "select",
      label: `How far from ${currentLocation || "your current location"} would you consider going?`,
      options: inCalifornia
        ? [
            "Stay very local",
            "Anywhere in California",
            "Western U.S.",
            "Anywhere in the U.S.",
            "Open internationally",
          ]
        : [
            "Stay very local",
            "Within my region",
            "Anywhere in my state",
            "Anywhere in the U.S.",
            "Open internationally",
          ],
    },
    {
      id: "project_type",
      category: "Project Preferences",
      type: "select",
      label: "What kind of project are you most drawn to right now?",
      options: [
        "Off-grid build",
        "Family community",
        "Creative homestead",
        "Regenerative farm",
        "Remote-work community",
        "Education village",
      ],
    },
    {
      id: "climate_preference",
      category: "Project Preferences",
      type: "select",
      label: `Based on being in ${currentLocation || "your location"}, what climate or environment feels best for you?`,
      options: inCalifornia
        ? [
            "Coastal / mild",
            "Mountain / forest",
            "Desert / dry",
            "Rural farmland",
            "No strong preference",
          ]
        : [
            "Warm / sunny",
            "Cool / forested",
            "Dry / desert",
            "Rural farmland",
            "No strong preference",
          ],
    },
    {
      id: "community_style",
      category: "Lifestyle",
      type: "select",
      label: "How much community interaction do you want in daily life?",
      options: [
        "Mostly private",
        "Small circle",
        "Balanced mix",
        "Highly communal",
        "Flexible / depends on project",
      ],
    },
    {
      id: "housing_style",
      category: "Lifestyle",
      type: "select",
      label: `For a ${projectType.toLowerCase()} setup, what housing style feels like the best fit?`,
      options: [
        "Private house",
        "Cabin / tiny home",
        "Shared land with separate homes",
        "Intentional shared housing",
        "Still exploring",
      ],
    },
    {
      id: "work_style",
      category: "Work + Finances",
      type: "select",
      label: "What best describes your current work or income style?",
      options: [
        "Remote work",
        "Local job / business",
        "Self-employed",
        "Homemaker / caretaker",
        "Mixed / transitioning",
      ],
    },
    {
      id: "budget_status",
      category: "Work + Finances",
      type: "select",
      label: "What is your current financial readiness for joining or building something?",
      options: [
        "Very limited right now",
        "Modest budget",
        "Can contribute steadily",
        "Can invest meaningfully",
        "Need flexible arrangements",
      ],
    },
    {
      id: "build_readiness",
      category: "Skills + Abilities",
      type: "select",
      label: "How ready are you for physical building, setup, or hands-on project work?",
      options: [
        "Prefer non-physical roles",
        "Can help lightly",
        "Can help regularly",
        "Strong hands-on contributor",
        "Depends on the project",
      ],
    },
    {
      id: "family_fit",
      category: "Lifestyle",
      type: "select",
      label: householdType.toLowerCase().includes("family")
        ? "What kind of child and family support matters most to you?"
        : "How important is it that the project be family-friendly or child-compatible?",
      options: [
        "Very important",
        "Helpful but not essential",
        "Neutral",
        "Only if the fit is right",
        "Not important",
      ],
    },
    {
      id: "food_lifestyle",
      category: "Project Preferences",
      type: "select",
      label: "Which lifestyle element matters most in the project’s daily culture?",
      options: [
        "Gardening / food growing",
        "Health / wellness",
        "Learning / education",
        "Creativity / arts",
        "Building / making",
      ],
    },
    {
      id: "accessibility_needs",
      category: "Status",
      type: "select",
      label: "What best describes your accessibility, health, or energy considerations right now?",
      options: [
        "No major constraints",
        "Need moderate flexibility",
        "Need strong accessibility support",
        "Need lower-physical-intensity roles",
        "Prefer not to say",
      ],
    },
    {
      id: "primary_strength",
      category: "Skills + Abilities",
      type: "select",
      label: "What is your strongest contribution to a community or project?",
      options: [
        "Teaching / mentoring",
        "Building / construction",
        "Gardening / farming",
        "Operations / organizing",
        "Creative / arts",
        "Wellness / care",
      ],
    },
    {
      id: "secondary_strength",
      category: "Skills + Abilities",
      type: "select",
      label: `What is your second-strongest contribution alongside ${primaryStrength.toLowerCase()}?`,
      options: [
        "Teaching / mentoring",
        "Building / construction",
        "Gardening / farming",
        "Operations / organizing",
        "Creative / arts",
        "Wellness / care",
      ],
    },
    {
      id: "role_preference",
      category: "Commitment + Fit",
      type: "select",
      label: "What role do you naturally want in a community?",
      options: [
        "Leader / initiator",
        "Reliable builder",
        "Organizer / systems person",
        "Caregiver / support role",
        "Explorer / still figuring it out",
      ],
    },
    {
      id: "deal_breakers",
      category: "Commitment + Fit",
      type: "textarea",
      label: `What are your biggest deal-breakers for a ${projectType.toLowerCase()} project?`,
      placeholder:
        "For example: too isolated, too crowded, not enough privacy, bad school fit, unclear ownership...",
    },
    {
      id: "relocation_readiness",
      category: "Location + Timing",
      type: "select",
      label: `Given your timeline of ${timeline.toLowerCase()}, how ready are you for real-world relocation steps?`,
      options: [
        "Not ready yet",
        "Collecting information",
        "Can start planning soon",
        "Actively preparing",
        "Already taking action",
      ],
    },
    {
      id: "success_definition",
      category: "Commitment + Fit",
      type: "textarea",
      label: "What would success look like for you one year after joining the right project?",
      placeholder:
        "Describe the life, rhythm, environment, and sense of belonging you want.",
    },
  ];
}

function ThemeButton({
  children,
  active,
  onClick,
  themeStyles,
  className = "",
  type = "button",
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  themeStyles: ThemeStyles;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition hover:opacity-95 ${className}`}
      style={{
        backgroundColor: active ? themeStyles.primary : themeStyles.card,
        color: active ? themeStyles.primaryText : themeStyles.text,
        borderColor: active ? themeStyles.primary : themeStyles.border,
      }}
    >
      {children}
    </button>
  );
}

function ThemeInput({
  value,
  onChange,
  placeholder,
  themeStyles,
  multiline = false,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  themeStyles: ThemeStyles;
  multiline?: boolean;
}) {
  const sharedProps = {
    value,
    onChange,
    placeholder,
    className:
      "w-full rounded-2xl border px-4 py-3 text-sm outline-none placeholder:text-slate-400",
    style: {
      backgroundColor: themeStyles.panel,
      color: themeStyles.text,
      borderColor: themeStyles.border,
    },
  };

  if (multiline) return <textarea rows={4} {...sharedProps} />;
  return <input {...sharedProps} />;
}

function ThemeSelect({
  value,
  onChange,
  options,
  placeholder,
  themeStyles,
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  themeStyles: ThemeStyles;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border px-4 py-3 text-sm outline-none"
      style={{
        backgroundColor: themeStyles.panel,
        color: themeStyles.text,
        borderColor: themeStyles.border,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function InfoCard({
  children,
  themeStyles,
  className = "",
}: {
  children: ReactNode;
  themeStyles: ThemeStyles;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border ${className}`}
      style={{
        backgroundColor: themeStyles.card,
        borderColor: themeStyles.border,
        boxShadow: themeStyles.shadow,
      }}
    >
      {children}
    </div>
  );
}

function LeafletStyles() {
  return (
    <style jsx global>{`
      .leaflet-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #dbeafe;
        outline: 0;
      }

      .leaflet-pane,
      .leaflet-tile,
      .leaflet-marker-icon,
      .leaflet-marker-shadow,
      .leaflet-tile-container,
      .leaflet-pane > svg,
      .leaflet-pane > canvas,
      .leaflet-zoom-box,
      .leaflet-image-layer,
      .leaflet-layer {
        position: absolute;
        left: 0;
        top: 0;
      }

      .leaflet-map-pane {
        z-index: 1;
      }

      .leaflet-tile-pane {
        z-index: 2;
      }

      .leaflet-overlay-pane {
        z-index: 4;
      }

      .leaflet-shadow-pane {
        z-index: 5;
      }

      .leaflet-marker-pane {
        z-index: 6;
      }

      .leaflet-tooltip-pane {
        z-index: 650;
      }

      .leaflet-popup-pane {
        z-index: 700;
      }

      .leaflet-control {
        position: relative;
        z-index: 800;
        pointer-events: auto;
      }

      .leaflet-top,
      .leaflet-bottom {
        position: absolute;
        z-index: 900;
        pointer-events: none;
      }

      .leaflet-top {
        top: 0;
      }

      .leaflet-bottom {
        bottom: 0;
      }

      .leaflet-left {
        left: 0;
      }

      .leaflet-right {
        right: 0;
      }

      .leaflet-top .leaflet-control {
        margin-top: 12px;
      }

      .leaflet-bottom .leaflet-control {
        margin-bottom: 12px;
      }

      .leaflet-left .leaflet-control {
        margin-left: 12px;
      }

      .leaflet-right .leaflet-control {
        margin-right: 12px;
      }

      .leaflet-control-zoom {
        border: 1px solid rgba(15, 23, 42, 0.15);
        border-radius: 12px;
        overflow: hidden;
        background: white;
      }

      .leaflet-control-zoom a {
        width: 32px;
        height: 32px;
        display: block;
        line-height: 32px;
        text-align: center;
        text-decoration: none;
        color: #0f172a;
        background: white;
      }

      .leaflet-control-attribution {
        padding: 4px 8px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 8px;
        font-size: 11px;
      }

      .leaflet-container img,
      .leaflet-container .leaflet-tile {
        max-width: none !important;
        max-height: none !important;
      }

      .leaflet-container .leaflet-tile {
        width: 256px !important;
        height: 256px !important;
      }
    `}</style>
  );
}

function LeafletMap({
  projects,
  highlightedIds,
  activeProjectId,
  onSelectProject,
  mode,
  isReady,
}: LeafletMapProps) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!mapElRef.current) return;
    if (mapRef.current) return;
    if (typeof window === "undefined") return;

    const L = (window as any).L;
    if (!L) return;

    const el = mapElRef.current;

    const map = L.map(el, {
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      crossOrigin: true,
    }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    map.setView([39.5, -98.35], mode === "mini" ? 3 : 4);

    const invalidate = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize(false);
      }
    };

    requestAnimationFrame(invalidate);
    setTimeout(invalidate, 100);
    setTimeout(invalidate, 300);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserverRef.current = new ResizeObserver(() => {
        invalidate();
      });
      resizeObserverRef.current.observe(el);
    }

    const onWindowResize = () => invalidate();
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, [isReady, mode]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    const L = typeof window !== "undefined" ? (window as any).L : null;

    if (!isReady || !map || !layer || !L) return;

    layer.clearLayers();

    const bounds: [number, number][] = [];

    projects.forEach((project) => {
      const isActive = activeProjectId === project.id;
      const isHighlighted = highlightedIds.includes(project.id);

      const marker = L.circleMarker([project.lat, project.lng], {
        radius: isActive ? 10 : isHighlighted ? 9 : 7,
        color: isActive ? "#1d4ed8" : isHighlighted ? "#f97316" : "#fb7185",
        fillColor: isActive ? "#3b82f6" : isHighlighted ? "#fb923c" : "#fb7185",
        fillOpacity: 0.95,
        weight: isActive || isHighlighted ? 3 : 2,
      });

      marker.on("click", () => {
        onSelectProject?.(project);
      });

      marker.addTo(layer);
      bounds.push([project.lat, project.lng]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: mode === "mini" ? 6 : 7,
      });
    } else {
      map.setView([39.5, -98.35], mode === "mini" ? 3 : 4);
    }

    requestAnimationFrame(() => {
      map.invalidateSize(false);
    });
    setTimeout(() => {
      map.invalidateSize(false);
    }, 100);
  }, [projects, highlightedIds, activeProjectId, onSelectProject, mode, isReady]);

  if (!isReady) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-200 text-sm text-slate-600">
        Loading map...
      </div>
    );
  }

  return <div ref={mapElRef} className="h-full w-full rounded-2xl" />;
}

export default function Prototype5() {
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).L) {
      setLeafletReady(true);
    }
  }, []);

  const [appStage, setAppStage] = useState<AppStage>("signin_details");
  const [page, setPage] = useState<PageKey>("home");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [favoriteProjectIds, setFavoriteProjectIds] = useState<number[]>([1, 2]);
  const [recentActivity, setRecentActivity] = useState<string[]>([
    "Opened Prototype 5",
    "Saved Joshua Tree Off-Grid Build Camp",
    "Viewed San Diego Family Garden Co-op",
  ]);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [selectedContinent, setSelectedContinent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [selectedPlan, setSelectedPlan] = useState<PlanKey | "">("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});
  const [questionnaireStep, setQuestionnaireStep] = useState(0);

  const [userProjects, setUserProjects] = useState<UserProject[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectCategory, setProjectCategory] =
    useState<(typeof myProjectCategories)[number]>("Community Living");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTags, setProjectTags] = useState("");
  const [projectVisibility, setProjectVisibility] = useState<"private" | "public">("private");

  const [projectsTab, setProjectsTab] = useState<ProjectsTabKey>("projects");
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [fullscreenMapOpen, setFullscreenMapOpen] = useState(false);
  const [activeMapProject, setActiveMapProject] = useState<SharedProject | null>(null);

  const isDark = theme === "dark";

  const themeStyles: ThemeStyles = isDark
    ? {
        appBg: "#0b1220",
        panel: "#0f172a",
        card: "#111c34",
        border: "#24324b",
        text: "#e5eefc",
        muted: "#9cb0cf",
        primary: "#7aa2ff",
        primaryText: "#08111f",
        pill: "#15233f",
        shadow: "0 18px 40px rgba(0,0,0,0.35)",
      }
    : {
        appBg: "#f4f7fb",
        panel: "#ffffff",
        card: "#ffffff",
        border: "#dbe4f0",
        text: "#0f172a",
        muted: "#5b6b82",
        primary: "#5b8cff",
        primaryText: "#ffffff",
        pill: "#eef4ff",
        shadow: "0 18px 40px rgba(15,23,42,0.08)",
      };
    const shellTextClass = isDark ? "text-slate-100" : "text-slate-900";
  const mutedTextClass = isDark ? "text-slate-300" : "text-slate-600";
  const placeholderClass = isDark
    ? "placeholder:text-slate-500"
    : "placeholder:text-slate-400";

  const countriesForSelectedContinent = useMemo(() => {
    if (!selectedContinent || !LOCATION_DATA[selectedContinent]) return [];
    return Object.keys(LOCATION_DATA[selectedContinent]).sort();
  }, [selectedContinent]);

  const selectedCountryData = useMemo<CountryData | null>(() => {
    if (!selectedContinent || !selectedCountry) return null;
    return LOCATION_DATA[selectedContinent]?.[selectedCountry] ?? null;
  }, [selectedContinent, selectedCountry]);

  const regionsForSelectedCountry = useMemo(() => {
    if (!selectedCountryData) return [];
    return selectedCountryData.regions.map((region) => region.name);
  }, [selectedCountryData]);

  const selectedRegionData = useMemo<RegionData | null>(() => {
    if (!selectedCountryData || !selectedRegion) return null;
    return selectedCountryData.regions.find((region) => region.name === selectedRegion) ?? null;
  }, [selectedCountryData, selectedRegion]);

  const citiesForSelectedRegion = useMemo(() => {
    if (!selectedRegionData) return [];
    return selectedRegionData.cities;
  }, [selectedRegionData]);

  const regionLabel = selectedCountryData?.regionLabel || "State / Province / Region";
  const cityLabel = selectedCountryData?.cityLabel || "City";

  const currentLocation = useMemo(() => {
    if (!selectedCity || !selectedRegion || !selectedCountry || !selectedContinent) return "";
    return `${selectedCity}, ${selectedRegion}, ${selectedCountry}, ${selectedContinent}`;
  }, [selectedCity, selectedRegion, selectedCountry, selectedContinent]);

  const signInDetailsReady =
    email.trim() !== "" &&
    phone.trim() !== "" &&
    selectedContinent !== "" &&
    selectedCountry !== "" &&
    selectedRegion !== "" &&
    selectedCity !== "";

  const signInPaymentReady = selectedPlan !== "";

  const planLabel = useMemo(() => {
    if (selectedPlan === "starter") return "Starter Plan — $1";
    if (selectedPlan === "pro") return "Pro Plan — $10/month";
    if (selectedPlan === "skip") return "Skip for Now — prototype access";
    return "No plan selected";
  }, [selectedPlan]);

  const adaptiveQuestions = useMemo<Question[]>(
    () => getAdaptiveQuestions(currentLocation, questionnaireAnswers),
    [currentLocation, questionnaireAnswers]
  );

  useEffect(() => {
    setQuestionnaireStep((prev) =>
      Math.min(prev, Math.max(adaptiveQuestions.length - 1, 0))
    );
  }, [adaptiveQuestions.length]);

  const currentQuestion =
    adaptiveQuestions[Math.min(questionnaireStep, adaptiveQuestions.length - 1)];

  const answeredCount = adaptiveQuestions.filter((question) => {
    const value = questionnaireAnswers[question.id];
    return String(value || "").trim().length > 0;
  }).length;

  const questionnaireComplete = answeredCount === adaptiveQuestions.length;
  const questionnaireProgressPercent = Math.round(
    (answeredCount / adaptiveQuestions.length) * 100
  );

  const initials = useMemo(() => {
    if (!email) return "U";
    return email.slice(0, 2).toUpperCase();
  }, [email]);

  const groupedSummary = useMemo<
    Record<string, { id: string; label: string; value: string }[]>
  >(() => {
    const summary: Record<string, { id: string; label: string; value: string }[]> = {};

    adaptiveQuestions.forEach((question) => {
      if (!summary[question.category]) summary[question.category] = [];
      summary[question.category].push({
        id: question.id,
        label: question.label,
        value: questionnaireAnswers[question.id] || "Not answered yet",
      });
    });

    const hasHouseholdSize = (summary["Status"] || []).some(
      (item) => item.id === "household_size"
    );

    if (questionnaireAnswers.household_size && !hasHouseholdSize) {
      if (!summary["Status"]) summary["Status"] = [];
      summary["Status"].splice(1, 0, {
        id: "household_size",
        label: "Household size",
        value: questionnaireAnswers.household_size,
      });
    }

    return summary;
  }, [adaptiveQuestions, questionnaireAnswers]);

  const recommendedProjects = useMemo<SharedProject[]>(() => {
    if (!questionnaireComplete) return [];

    const tokenSource = [currentLocation, ...Object.values(questionnaireAnswers)].join(" ");
    const tokens = tokenSource
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .map((item) => item.trim())
      .filter(Boolean);

    return sharedProjectsSeed
      .map((project) => {
        const blob = [
          project.location,
          project.category,
          project.description,
          ...project.tags,
          ...project.profileKeywords,
        ]
          .join(" ")
          .toLowerCase();

        let score = 0;
        const reasons: string[] = [];

        tokens.forEach((token) => {
          if (token.length > 2 && blob.includes(token)) score += 1;
        });

        if (project.state === selectedRegion && project.country === selectedCountry) {
          score += 3;
          reasons.push(`Same state match: ${project.state}`);
        }

        const projectType = String(questionnaireAnswers.project_type || "").toLowerCase();
        if (projectType && blob.includes(projectType.split(" ")[0])) {
          score += 3;
          reasons.push(`Project type fit: ${questionnaireAnswers.project_type}`);
        }

        const strength = String(questionnaireAnswers.primary_strength || "").toLowerCase();
        if (strength && blob.includes(strength.split(" ")[0])) {
          score += 2;
          reasons.push(`Matches your strength: ${questionnaireAnswers.primary_strength}`);
        }

        return { ...project, score, reasons: reasons.slice(0, 3) };
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);
  }, [
    currentLocation,
    questionnaireAnswers,
    questionnaireComplete,
    selectedCountry,
    selectedRegion,
  ]);

  const nearbyProjects = useMemo(() => {
    if (!selectedRegion || !selectedCountry) return [];
    return sharedProjectsSeed.filter(
      (project) => project.state === selectedRegion && project.country === selectedCountry
    );
  }, [selectedCountry, selectedRegion]);

  const publicProjectsFiltered = useMemo(() => {
    const q = projectSearchQuery.trim().toLowerCase();
    if (!q) return sharedProjectsSeed;

    return sharedProjectsSeed.filter((project) => {
      const blob = [
        project.title,
        project.creator,
        project.category,
        project.location,
        project.description,
        ...project.tags,
      ]
        .join(" ")
        .toLowerCase();

      return blob.includes(q);
    });
  }, [projectSearchQuery]);

  const projectsPageHighlightedIds = useMemo(() => {
    if (!projectSearchQuery.trim()) return [];
    return publicProjectsFiltered.map((project) => project.id);
  }, [projectSearchQuery, publicProjectsFiltered]);

  const miniMapProjects = useMemo(() => {
    if (projectSearchQuery.trim()) return publicProjectsFiltered;
    const merged = uniqueProjectList([...recommendedProjects, ...nearbyProjects]);
    return merged.length > 0 ? merged : sharedProjectsSeed.slice(0, 5);
  }, [projectSearchQuery, publicProjectsFiltered, recommendedProjects, nearbyProjects]);

  const fullscreenMapProjects = useMemo(() => {
    return projectSearchQuery.trim() ? publicProjectsFiltered : sharedProjectsSeed;
  }, [projectSearchQuery, publicProjectsFiltered]);

  const favoriteProjects = useMemo<SharedProject[]>(
    () => sharedProjectsSeed.filter((project) => favoriteProjectIds.includes(project.id)),
    [favoriteProjectIds]
  );

  const publicProjectsCount = useMemo(
    () => userProjects.filter((project) => project.visibility === "public").length,
    [userProjects]
  );

  useEffect(() => {
    if (!fullscreenMapOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreenMapOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [fullscreenMapOpen]);

  useEffect(() => {
    if (!activeMapProject) return;
    const stillExists = fullscreenMapProjects.some(
      (project) => project.id === activeMapProject.id
    );
    if (!stillExists) setActiveMapProject(null);
  }, [fullscreenMapProjects, activeMapProject]);

  const addActivity = (entry: string) => {
    setRecentActivity((prev) => [entry, ...prev].slice(0, 8));
  };

  const toggleFavorite = (projectId: number, title: string) => {
    setFavoriteProjectIds((prev) => {
      const exists = prev.includes(projectId);
      addActivity(exists ? `Removed ${title} from favorites` : `Saved ${title} to favorites`);
      return exists ? prev.filter((id) => id !== projectId) : [projectId, ...prev];
    });
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setPage("project_detail");
    addActivity(`Viewed ${project.title}`);
  };

  const updateAnswer = (questionId: string, value: string) => {
    setQuestionnaireAnswers((prev) => {
      const next = { ...prev, [questionId]: value };

      if (questionId === "household_type") {
        if (value === "Individual") next.household_size = "1";
        else if (value === "Couple") next.household_size = "2";
        else delete next.household_size;
      }

      return next;
    });
  };

  const createProject = () => {
    if (!projectTitle.trim() || !projectLocation.trim() || !projectDescription.trim()) return;

    const newProject: UserProject = {
      id: Date.now(),
      title: projectTitle.trim(),
      city: selectedCity || "Custom",
      state: selectedRegion || "Custom",
      country: selectedCountry || "Custom",
      continent: selectedContinent || "Custom",
      location: projectLocation.trim(),
      category: projectCategory,
      description: projectDescription.trim(),
      tags: projectTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      visibility: projectVisibility,
      creator: email || "You",
      thumbnail: projectTitle.slice(0, 2).toUpperCase(),
      lat: 0,
      lng: 0,
    };

    setUserProjects((prev) => [newProject, ...prev]);
    addActivity(`Created ${newProject.title}`);
    setProjectTitle("");
    setProjectLocation("");
    setProjectCategory("Community Living");
    setProjectDescription("");
    setProjectTags("");
    setProjectVisibility("private");
    setShowCreateForm(false);
  };

  const handleContinentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedContinent(e.target.value);
    setSelectedCountry("");
    setSelectedRegion("");
    setSelectedCity("");
  };

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setSelectedRegion("");
    setSelectedCity("");
  };

  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setSelectedCity("");
  };

  const leafletAssets = (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        strategy="afterInteractive"
        onReady={() => {
          if (typeof window !== "undefined" && (window as any).L) {
            setLeafletReady(true);
          }
        }}
        onLoad={() => {
          if (typeof window !== "undefined" && (window as any).L) {
            setLeafletReady(true);
          }
        }}
      />
      <LeafletStyles />
    </>
  );
    const renderProjectCard = (
    project: Project,
    source: "shared" | "mine" | "favorite" = "shared"
  ) => {
    const isFavorite = favoriteProjectIds.includes(project.id);
    const isUserProject = "visibility" in project;
    const reasons =
      "reasons" in project && Array.isArray(project.reasons) ? project.reasons : [];

    return (
      <InfoCard
        key={`${source}-${project.id}`}
        themeStyles={themeStyles}
        className="p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold"
              style={{
                backgroundColor: themeStyles.pill,
                color: themeStyles.text,
              }}
            >
              {project.thumbnail || project.title.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold" style={{ color: themeStyles.text }}>
                  {project.title}
                </h3>

                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: themeStyles.pill,
                    color: themeStyles.muted,
                  }}
                >
                  {project.category}
                </span>

                {isUserProject ? (
                  <span
                    className="rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor:
                        project.visibility === "public" ? "#dcfce7" : "#ede9fe",
                      color: project.visibility === "public" ? "#166534" : "#5b21b6",
                    }}
                  >
                    {project.visibility === "public" ? "Public" : "Private"}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5" style={{ color: themeStyles.muted }}>
                  <User className="h-4 w-4" />
                  {project.creator}
                </span>
                <span className="inline-flex items-center gap-1.5" style={{ color: themeStyles.muted }}>
                  <MapPin className="h-4 w-4" />
                  {project.location}
                </span>
              </div>

              <p className="max-w-3xl text-sm leading-6" style={{ color: themeStyles.muted }}>
                {project.description}
              </p>

              {reasons.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: "#dbeafe",
                        color: "#1d4ed8",
                      }}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                    style={{
                      backgroundColor: themeStyles.pill,
                      color: themeStyles.muted,
                    }}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {!isUserProject ? (
              <button
                type="button"
                onClick={() => toggleFavorite(project.id, project.title)}
                className="rounded-full border p-2 transition"
                style={{
                  backgroundColor: isFavorite ? "#fee2e2" : themeStyles.card,
                  borderColor: isFavorite ? "#fecaca" : themeStyles.border,
                  color: isFavorite ? "#e11d48" : themeStyles.text,
                }}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
              </button>
            ) : null}

            <ThemeButton
              themeStyles={themeStyles}
              onClick={() => openProjectDetail(project)}
            >
              Open
            </ThemeButton>
          </div>
        </div>
      </InfoCard>
    );
  };

  const renderSigninDetails = () => (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
      <InfoCard themeStyles={themeStyles} className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: themeStyles.pill, color: themeStyles.primary }}>
              <Sparkles className="h-4 w-4" />
              Prototype 5
            </div>

            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
              Join the off-grid and intentional living network
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: themeStyles.muted }}>
              Start with your contact details and current location so the prototype can tailor
              projects, maps, and recommendations around you.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: themeStyles.text }}>
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <ThemeInput
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  themeStyles={themeStyles}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: themeStyles.text }}>
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                <ThemeInput
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  themeStyles={themeStyles}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: themeStyles.text }}>
                  <Globe className="h-4 w-4" />
                  Continent
                </label>
                <ThemeSelect
                  value={selectedContinent}
                  onChange={handleContinentChange}
                  options={Object.keys(LOCATION_DATA)}
                  placeholder="Select continent"
                  themeStyles={themeStyles}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: themeStyles.text }}>
                  <MapPin className="h-4 w-4" />
                  Country
                </label>
                <ThemeSelect
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  options={countriesForSelectedContinent}
                  placeholder="Select country"
                  themeStyles={themeStyles}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: themeStyles.text }}>
                  <MapPin className="h-4 w-4" />
                  {regionLabel}
                </label>
                <ThemeSelect
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  options={regionsForSelectedCountry}
                  placeholder={`Select ${regionLabel}`}
                  themeStyles={themeStyles}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium" style={{ color: themeStyles.text }}>
                  <MapPin className="h-4 w-4" />
                  {cityLabel}
                </label>
                <ThemeSelect
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  options={citiesForSelectedRegion}
                  placeholder={`Select ${cityLabel}`}
                  themeStyles={themeStyles}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (signInDetailsReady) setAppStage("signin_payment");
                }}
                className="rounded-2xl px-5 py-3 text-sm font-medium transition"
                style={{
                  backgroundColor: themeStyles.primary,
                  color: themeStyles.primaryText,
                  opacity: signInDetailsReady ? 1 : 0.45,
                  pointerEvents: signInDetailsReady ? "auto" : "none",
                }}
              >
                Continue to plan selection
              </button>

              <span className="text-sm" style={{ color: themeStyles.muted }}>
                Required to continue: email, phone, continent, country, region, and city
              </span>
            </div>
          </div>

          <div
            className="border-l p-6 md:p-8 lg:p-10"
            style={{
              backgroundColor: themeStyles.panel,
              borderColor: themeStyles.border,
            }}
          >
            <h2 className="text-lg font-semibold" style={{ color: themeStyles.text }}>
              Why this step exists
            </h2>

            <div className="mt-6 space-y-4">
              {[
                {
                  icon: Compass,
                  title: "Location-aware recommendations",
                  text: "The prototype uses your selected location to bias matching, nearby projects, and map defaults.",
                },
                {
                  icon: Users,
                  title: "Better project fit",
                  text: "Your sign-in details carry through the questionnaire, saved account info, and recommendations.",
                },
                {
                  icon: Lock,
                  title: "Prototype-safe onboarding",
                  text: "This flow is for testing structure, not live production billing or authentication.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor: themeStyles.card,
                    borderColor: themeStyles.border,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 rounded-xl p-2"
                      style={{
                        backgroundColor: themeStyles.pill,
                        color: themeStyles.primary,
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: themeStyles.text }}>
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6" style={{ color: themeStyles.muted }}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {currentLocation ? (
              <div
                className="mt-6 rounded-2xl border p-4"
                style={{
                  backgroundColor: themeStyles.card,
                  borderColor: themeStyles.border,
                }}
              >
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: themeStyles.muted }}>
                  Current location
                </p>
                <p className="mt-2 text-sm font-medium" style={{ color: themeStyles.text }}>
                  {currentLocation}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </InfoCard>
    </div>
  );

  const renderSigninPayment = () => (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
      <InfoCard themeStyles={themeStyles} className="p-6 md:p-8 lg:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: themeStyles.pill, color: themeStyles.primary }}>
              <CreditCard className="h-4 w-4" />
              Step 2
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
              Choose a prototype access plan
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: themeStyles.muted }}>
              This screen is structured like a real subscription flow, but it is still a prototype.
            </p>
          </div>

          <ThemeButton
            themeStyles={themeStyles}
            onClick={() => setAppStage("signin_details")}
          >
            <ArrowLeft className="mr-2 inline h-4 w-4" />
            Back
          </ThemeButton>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {PLAN_OPTIONS.map((plan) => {
            const active = selectedPlan === plan.key;

            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => setSelectedPlan(plan.key)}
                className="rounded-3xl border p-5 text-left transition"
                style={{
                  backgroundColor: active ? themeStyles.pill : themeStyles.card,
                  borderColor: active ? themeStyles.primary : themeStyles.border,
                  boxShadow: active ? themeStyles.shadow : "none",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: themeStyles.text }}>
                      {plan.title}
                    </p>
                    <p className="mt-2 text-2xl font-semibold" style={{ color: themeStyles.text }}>
                      {plan.price}
                    </p>
                    <p className="mt-2 text-sm leading-6" style={{ color: themeStyles.muted }}>
                      {plan.subtitle}
                    </p>
                  </div>

                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-full border"
                    style={{
                      borderColor: active ? themeStyles.primary : themeStyles.border,
                      backgroundColor: active ? themeStyles.primary : "transparent",
                      color: active ? themeStyles.primaryText : "transparent",
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedPlan && selectedPlan !== "skip" ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                Cardholder name
              </label>
              <ThemeInput
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Name on card"
                themeStyles={themeStyles}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                Card number
              </label>
              <ThemeInput
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 1234 1234 1234"
                themeStyles={themeStyles}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                Expiry
              </label>
              <ThemeInput
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM / YY"
                themeStyles={themeStyles}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                CVC
              </label>
              <ThemeInput
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                placeholder="123"
                themeStyles={themeStyles}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                Billing address
              </label>
              <ThemeInput
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                placeholder="Street, city, region, postal code"
                themeStyles={themeStyles}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (signInPaymentReady) setAppStage("signin_confirmation");
            }}
            className="rounded-2xl px-5 py-3 text-sm font-medium transition"
            style={{
              backgroundColor: themeStyles.primary,
              color: themeStyles.primaryText,
              opacity: signInPaymentReady ? 1 : 0.45,
              pointerEvents: signInPaymentReady ? "auto" : "none",
            }}
          >
            Continue
          </button>

          <span className="text-sm" style={{ color: themeStyles.muted }}>
            Selected: {planLabel}
          </span>
        </div>
      </InfoCard>
    </div>
  );

  const renderSigninConfirmation = () => (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8">
      <InfoCard themeStyles={themeStyles} className="p-6 md:p-8 lg:p-10">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
              You’re ready to enter the app
            </h1>
            <p className="mt-3 text-sm leading-6" style={{ color: themeStyles.muted }}>
              Your sign-in details, location, and plan selection are set for the prototype flow.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div
                className="rounded-2xl border p-4"
                style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border }}
              >
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: themeStyles.muted }}>
                  Contact
                </p>
                <p className="mt-2 text-sm font-medium" style={{ color: themeStyles.text }}>
                  {email || "No email"}
                </p>
                <p className="mt-1 text-sm" style={{ color: themeStyles.muted }}>
                  {phone || "No phone"}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border }}
              >
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: themeStyles.muted }}>
                  Location + Plan
                </p>
                <p className="mt-2 text-sm font-medium" style={{ color: themeStyles.text }}>
                  {currentLocation || "No location selected"}
                </p>
                <p className="mt-1 text-sm" style={{ color: themeStyles.muted }}>
                  {planLabel}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ThemeButton
                themeStyles={themeStyles}
                onClick={() => setAppStage("signin_payment")}
              >
                <ArrowLeft className="mr-2 inline h-4 w-4" />
                Back
              </ThemeButton>

              <button
                type="button"
                onClick={() => {
                  setAppStage("app");
                  setPage("questionnaire");
                  addActivity("Completed sign-in flow");
                }}
                className="rounded-2xl px-5 py-3 text-sm font-medium transition"
                style={{
                  backgroundColor: themeStyles.primary,
                  color: themeStyles.primaryText,
                }}
              >
                Enter prototype
              </button>
            </div>
          </div>
        </div>
      </InfoCard>
    </div>
  );
  const renderHomePage = () => (
    <div className="space-y-6">
      <InfoCard themeStyles={themeStyles} className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: themeStyles.pill, color: themeStyles.primary }}>
              <Sparkles className="h-4 w-4" />
              Personalized discovery
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
              Build your next chapter around the right place and people
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: themeStyles.muted }}>
              Explore off-grid, family, education, and intentional living projects. Take the adaptive
              questionnaire to improve match quality and reveal smarter recommendations.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <ThemeButton
                themeStyles={themeStyles}
                onClick={() => setPage("questionnaire")}
              >
                <PenSquare className="mr-2 inline h-4 w-4" />
                {questionnaireComplete ? "Review questionnaire" : "Start questionnaire"}
              </ThemeButton>

              <ThemeButton
                themeStyles={themeStyles}
                onClick={() => setPage("projects")}
              >
                <FolderKanban className="mr-2 inline h-4 w-4" />
                Browse projects
              </ThemeButton>
            </div>
          </div>

          <div
            className="border-l p-6 md:p-8"
            style={{
              backgroundColor: themeStyles.panel,
              borderColor: themeStyles.border,
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {[
                {
                  label: "Questionnaire progress",
                  value: `${questionnaireProgressPercent}%`,
                  icon: Compass,
                },
                {
                  label: "Saved favorites",
                  value: `${favoriteProjects.length}`,
                  icon: Heart,
                },
                {
                  label: "My projects",
                  value: `${userProjects.length}`,
                  icon: FolderKanban,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor: themeStyles.card,
                    borderColor: themeStyles.border,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: themeStyles.muted }}>
                      {item.label}
                    </p>
                    <item.icon className="h-4 w-4" style={{ color: themeStyles.primary }} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold" style={{ color: themeStyles.text }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </InfoCard>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <InfoCard themeStyles={themeStyles} className="p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: themeStyles.text }}>
                Map preview
              </h2>
              <p className="mt-1 text-sm" style={{ color: themeStyles.muted }}>
                Click a marker to focus a project. Open the full map for a larger view.
              </p>
            </div>

            <ThemeButton
              themeStyles={themeStyles}
              onClick={() => setFullscreenMapOpen(true)}
            >
              Full screen
            </ThemeButton>
          </div>

          <div className="h-[360px] overflow-hidden rounded-3xl border"
            style={{ borderColor: themeStyles.border }}>
            <LeafletMap
              projects={miniMapProjects}
              highlightedIds={projectsPageHighlightedIds}
              activeProjectId={activeMapProject?.id ?? null}
              onSelectProject={(project) => {
                setActiveMapProject(project);
                addActivity(`Focused map on ${project.title}`);
              }}
              mode="mini"
              isReady={leafletReady}
            />
          </div>

          {activeMapProject ? (
            <div
              className="mt-4 rounded-2xl border p-4"
              style={{
                backgroundColor: themeStyles.panel,
                borderColor: themeStyles.border,
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: themeStyles.text }}>
                    {activeMapProject.title}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: themeStyles.muted }}>
                    {activeMapProject.location}
                  </p>
                </div>

                <ThemeButton
                  themeStyles={themeStyles}
                  onClick={() => openProjectDetail(activeMapProject)}
                >
                  Open project
                </ThemeButton>
              </div>
            </div>
          ) : null}
        </InfoCard>

        <div className="space-y-6">
          <InfoCard themeStyles={themeStyles} className="p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: themeStyles.text }}>
                Recommended for you
              </h2>
              <Star className="h-5 w-5" style={{ color: "#f59e0b" }} />
            </div>

            <div className="mt-4 space-y-4">
              {(recommendedProjects.length > 0 ? recommendedProjects : sharedProjectsSeed.slice(0, 3)).map(
                (project) => renderProjectCard(project, "shared")
              )}
            </div>
          </InfoCard>

          <InfoCard themeStyles={themeStyles} className="p-5 md:p-6">
            <h2 className="text-lg font-semibold" style={{ color: themeStyles.text }}>
              Recent activity
            </h2>

            <div className="mt-4 space-y-3">
              {recentActivity.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-start gap-3">
                  <div
                    className="mt-1 rounded-full p-1.5"
                    style={{
                      backgroundColor: themeStyles.pill,
                      color: themeStyles.primary,
                    }}
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm leading-6" style={{ color: themeStyles.muted }}>
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );

  const renderFavoritesPage = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
          Favorites
        </h1>
        <p className="mt-2 text-sm" style={{ color: themeStyles.muted }}>
          Your saved shared projects live here.
        </p>
      </div>

      {favoriteProjects.length > 0 ? (
        <div className="space-y-4">
          {favoriteProjects.map((project) => renderProjectCard(project, "favorite"))}
        </div>
      ) : (
        <InfoCard themeStyles={themeStyles} className="p-8 text-center">
          <Heart className="mx-auto h-8 w-8" style={{ color: themeStyles.muted }} />
          <p className="mt-4 text-base font-medium" style={{ color: themeStyles.text }}>
            No favorites yet
          </p>
          <p className="mt-2 text-sm" style={{ color: themeStyles.muted }}>
            Save projects from the Projects page and they will appear here.
          </p>
        </InfoCard>
      )}
    </div>
  );

  const renderProjectsPage = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
            Projects
          </h1>
          <p className="mt-2 text-sm" style={{ color: themeStyles.muted }}>
            Browse public projects or manage the ones you create.
          </p>
        </div>

        <div className="flex gap-3">
          <ThemeButton
            themeStyles={themeStyles}
            active={projectsTab === "projects"}
            onClick={() => setProjectsTab("projects")}
          >
            Shared projects
          </ThemeButton>
          <ThemeButton
            themeStyles={themeStyles}
            active={projectsTab === "my_projects"}
            onClick={() => setProjectsTab("my_projects")}
          >
            My projects
          </ThemeButton>
        </div>
      </div>

      {projectsTab === "projects" ? (
        <>
          <InfoCard themeStyles={themeStyles} className="p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-xl">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: themeStyles.muted }}
                />
                <input
                  value={projectSearchQuery}
                  onChange={(e) => setProjectSearchQuery(e.target.value)}
                  placeholder="Search by title, location, category, creator, or tag"
                  className={`w-full rounded-2xl border py-3 pl-11 pr-4 text-sm outline-none ${placeholderClass}`}
                  style={{
                    backgroundColor: themeStyles.panel,
                    color: themeStyles.text,
                    borderColor: themeStyles.border,
                  }}
                />
              </div>

              <ThemeButton
                themeStyles={themeStyles}
                onClick={() => setFullscreenMapOpen(true)}
              >
                Open full map
              </ThemeButton>
            </div>

            <div className="mt-5 h-[360px] overflow-hidden rounded-3xl border"
              style={{ borderColor: themeStyles.border }}>
              <LeafletMap
                projects={fullscreenMapProjects}
                highlightedIds={projectsPageHighlightedIds}
                activeProjectId={activeMapProject?.id ?? null}
                onSelectProject={(project) => setActiveMapProject(project)}
                mode="mini"
                isReady={leafletReady}
              />
            </div>
          </InfoCard>

          <div className="space-y-4">
            {publicProjectsFiltered.map((project) => renderProjectCard(project, "shared"))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm" style={{ color: themeStyles.muted }}>
              {userProjects.length} total · {publicProjectsCount} public
            </div>

            <ThemeButton
              themeStyles={themeStyles}
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              <Plus className="mr-2 inline h-4 w-4" />
              {showCreateForm ? "Close form" : "Create project"}
            </ThemeButton>
          </div>

          {showCreateForm ? (
            <InfoCard themeStyles={themeStyles} className="p-5 md:p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                    Project title
                  </label>
                  <ThemeInput
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Ex: Desert Family Build Collective"
                    themeStyles={themeStyles}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                    Location label
                  </label>
                  <ThemeInput
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="Ex: San Diego County, California"
                    themeStyles={themeStyles}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                    Category
                  </label>
                  <ThemeSelect
                    value={projectCategory}
                    onChange={(e) =>
                      setProjectCategory(e.target.value as (typeof myProjectCategories)[number])
                    }
                    options={[...myProjectCategories]}
                    placeholder="Select category"
                    themeStyles={themeStyles}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                    Visibility
                  </label>
                  <ThemeSelect
                    value={projectVisibility}
                    onChange={(e) =>
                      setProjectVisibility(e.target.value as "private" | "public")
                    }
                    options={["private", "public"]}
                    placeholder="Select visibility"
                    themeStyles={themeStyles}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                    Description
                  </label>
                  <ThemeInput
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe the project, its goals, who it is for, and what makes it special."
                    themeStyles={themeStyles}
                    multiline
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium" style={{ color: themeStyles.text }}>
                    Tags
                  </label>
                  <ThemeInput
                    value={projectTags}
                    onChange={(e) => setProjectTags(e.target.value)}
                    placeholder="family, off-grid, build, land, education"
                    themeStyles={themeStyles}
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={createProject}
                  className="rounded-2xl px-5 py-3 text-sm font-medium transition"
                  style={{
                    backgroundColor: themeStyles.primary,
                    color: themeStyles.primaryText,
                  }}
                >
                  Save project
                </button>

                <ThemeButton
                  themeStyles={themeStyles}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </ThemeButton>
              </div>
            </InfoCard>
          ) : null}

          {userProjects.length > 0 ? (
            <div className="space-y-4">
              {userProjects.map((project) => renderProjectCard(project, "mine"))}
            </div>
          ) : (
            <InfoCard themeStyles={themeStyles} className="p-8 text-center">
              <FolderKanban className="mx-auto h-8 w-8" style={{ color: themeStyles.muted }} />
              <p className="mt-4 text-base font-medium" style={{ color: themeStyles.text }}>
                No projects created yet
              </p>
              <p className="mt-2 text-sm" style={{ color: themeStyles.muted }}>
                Create your first project to test the authoring flow.
              </p>
            </InfoCard>
          )}
        </>
      )}
    </div>
  );
    const renderSettingsPage = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
          Settings
        </h1>
        <p className="mt-2 text-sm" style={{ color: themeStyles.muted }}>
          Adjust prototype display and notification preferences.
        </p>
      </div>

      <InfoCard themeStyles={themeStyles} className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold" style={{ color: themeStyles.text }}>
              Theme mode
            </p>
            <p className="mt-1 text-sm" style={{ color: themeStyles.muted }}>
              Toggle between light and dark interface states.
            </p>
          </div>

          <div className="flex gap-3">
            <ThemeButton
              themeStyles={themeStyles}
              active={theme === "light"}
              onClick={() => setTheme("light")}
            >
              <Sun className="mr-2 inline h-4 w-4" />
              Light
            </ThemeButton>
            <ThemeButton
              themeStyles={themeStyles}
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
            >
              <Moon className="mr-2 inline h-4 w-4" />
              Dark
            </ThemeButton>
          </div>
        </div>
      </InfoCard>

      <InfoCard themeStyles={themeStyles} className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold" style={{ color: themeStyles.text }}>
              Notifications
            </p>
            <p className="mt-1 text-sm" style={{ color: themeStyles.muted }}>
              Enable or disable in-app activity alerts for the prototype.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setNotificationsEnabled((prev) => !prev)}
            className="rounded-2xl px-4 py-2.5 text-sm font-medium transition"
            style={{
              backgroundColor: notificationsEnabled ? themeStyles.primary : themeStyles.card,
              color: notificationsEnabled ? themeStyles.primaryText : themeStyles.text,
              border: `1px solid ${notificationsEnabled ? themeStyles.primary : themeStyles.border}`,
            }}
          >
            {notificationsEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>
      </InfoCard>
    </div>
  );

  const renderAccountInfoPage = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
          Account Info
        </h1>
        <p className="mt-2 text-sm" style={{ color: themeStyles.muted }}>
          Prototype account details captured during onboarding.
        </p>
      </div>

      <InfoCard themeStyles={themeStyles} className="p-5 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4" style={{ borderColor: themeStyles.border }}>
            <p className="text-sm" style={{ color: themeStyles.muted }}>Email</p>
            <p className="mt-2 text-base font-semibold" style={{ color: themeStyles.text }}>
              {email || "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: themeStyles.border }}>
            <p className="text-sm" style={{ color: themeStyles.muted }}>Phone</p>
            <p className="mt-2 text-base font-semibold" style={{ color: themeStyles.text }}>
              {phone || "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: themeStyles.border }}>
            <p className="text-sm" style={{ color: themeStyles.muted }}>Location</p>
            <p className="mt-2 text-base font-semibold" style={{ color: themeStyles.text }}>
              {currentLocation || "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: themeStyles.border }}>
            <p className="text-sm" style={{ color: themeStyles.muted }}>Plan</p>
            <p className="mt-2 text-base font-semibold" style={{ color: themeStyles.text }}>
              {planLabel}
            </p>
          </div>
        </div>
      </InfoCard>
    </div>
  );

  const renderAnswersSummaryPage = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
            Answers Summary
          </h1>
          <p className="mt-2 text-sm" style={{ color: themeStyles.muted }}>
            Review all adaptive questionnaire answers grouped by category.
          </p>
        </div>

        <ThemeButton
          themeStyles={themeStyles}
          onClick={() => setPage("questionnaire")}
        >
          <PenSquare className="mr-2 inline h-4 w-4" />
          Edit answers
        </ThemeButton>
      </div>

      {categoryOrder.map((category) => {
        const items = groupedSummary[category];
        if (!items || items.length === 0) return null;

        return (
          <InfoCard key={category} themeStyles={themeStyles} className="p-5 md:p-6">
            <h2 className="text-lg font-semibold" style={{ color: themeStyles.text }}>
              {category}
            </h2>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border p-4"
                  style={{
                    backgroundColor: themeStyles.panel,
                    borderColor: themeStyles.border,
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: themeStyles.text }}>
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm leading-6" style={{ color: themeStyles.muted }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </InfoCard>
        );
      })}
    </div>
  );

  const renderQuestionnairePage = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
            Adaptive questionnaire
          </h1>
          <p className="mt-2 text-sm" style={{ color: themeStyles.muted }}>
            The questions change based on your location and earlier answers.
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium" style={{ color: themeStyles.text }}>
            {answeredCount} / {adaptiveQuestions.length} answered
          </p>
          <p className="mt-1 text-sm" style={{ color: themeStyles.muted }}>
            {questionnaireProgressPercent}% complete
          </p>
        </div>
      </div>

      <InfoCard themeStyles={themeStyles} className="p-5 md:p-6">
        <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: themeStyles.pill }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${questionnaireProgressPercent}%`,
              backgroundColor: themeStyles.primary,
            }}
          />
        </div>

        {currentQuestion ? (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: themeStyles.muted }}>
              {currentQuestion.category}
            </p>
            <h2 className="mt-3 text-xl font-semibold" style={{ color: themeStyles.text }}>
              {currentQuestion.label}
            </h2>

            <div className="mt-6">
              {currentQuestion.type === "select" ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {(currentQuestion.options || []).map((option) => {
                    const active = questionnaireAnswers[currentQuestion.id] === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateAnswer(currentQuestion.id, option)}
                        className="rounded-2xl border p-4 text-left transition"
                        style={{
                          backgroundColor: active ? themeStyles.pill : themeStyles.card,
                          borderColor: active ? themeStyles.primary : themeStyles.border,
                        }}
                      >
                        <p className="text-sm font-medium" style={{ color: themeStyles.text }}>
                          {option}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <ThemeInput
                  value={questionnaireAnswers[currentQuestion.id] || ""}
                  onChange={(e) => updateAnswer(currentQuestion.id, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  themeStyles={themeStyles}
                  multiline
                />
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <ThemeButton
                themeStyles={themeStyles}
                onClick={() => setQuestionnaireStep((prev) => Math.max(prev - 1, 0))}
              >
                Previous
              </ThemeButton>

              <ThemeButton
                themeStyles={themeStyles}
                onClick={() =>
                  setQuestionnaireStep((prev) =>
                    Math.min(prev + 1, adaptiveQuestions.length - 1)
                  )
                }
              >
                Next
              </ThemeButton>

              <button
                type="button"
                onClick={() => {
                  if (questionnaireComplete) {
                    setPage("answers_summary");
                    addActivity("Completed adaptive questionnaire");
                  }
                }}
                className="rounded-2xl px-5 py-3 text-sm font-medium transition"
                style={{
                  backgroundColor: themeStyles.primary,
                  color: themeStyles.primaryText,
                  opacity: questionnaireComplete ? 1 : 0.45,
                  pointerEvents: questionnaireComplete ? "auto" : "none",
                }}
              >
                Finish questionnaire
              </button>
            </div>
          </div>
        ) : null}
      </InfoCard>
    </div>
  );

  const renderProjectDetailPage = () => {
    if (!selectedProject) {
      return (
        <InfoCard themeStyles={themeStyles} className="p-8 text-center">
          <p className="text-base font-medium" style={{ color: themeStyles.text }}>
            No project selected
          </p>
        </InfoCard>
      );
    }

    const isUserProject = "visibility" in selectedProject;

    return (
      <div className="space-y-6">
        <ThemeButton
          themeStyles={themeStyles}
          onClick={() => setPage(isUserProject ? "projects" : "projects")}
        >
          <ArrowLeft className="mr-2 inline h-4 w-4" />
          Back to projects
        </ThemeButton>

        <InfoCard themeStyles={themeStyles} className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
                  {selectedProject.title}
                </h1>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ backgroundColor: themeStyles.pill, color: themeStyles.muted }}
                >
                  {selectedProject.category}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5" style={{ color: themeStyles.muted }}>
                  <User className="h-4 w-4" />
                  {selectedProject.creator}
                </span>
                <span className="inline-flex items-center gap-1.5" style={{ color: themeStyles.muted }}>
                  <MapPin className="h-4 w-4" />
                  {selectedProject.location}
                </span>
              </div>
            </div>

            {!isUserProject ? (
              <ThemeButton
                themeStyles={themeStyles}
                onClick={() => toggleFavorite(selectedProject.id, selectedProject.title)}
              >
                <Heart className="mr-2 inline h-4 w-4" />
                {favoriteProjectIds.includes(selectedProject.id) ? "Unsave" : "Save"}
              </ThemeButton>
            ) : null}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: themeStyles.text }}>
                About this project
              </h2>
              <p className="mt-3 text-sm leading-7" style={{ color: themeStyles.muted }}>
                {selectedProject.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {selectedProject.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                    style={{ backgroundColor: themeStyles.pill, color: themeStyles.muted }}
                  >
                    <Tag className="h-3.5 w-3.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div
                className="rounded-2xl border p-4"
                style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border }}
              >
                <p className="text-sm" style={{ color: themeStyles.muted }}>Region</p>
                <p className="mt-2 text-base font-semibold" style={{ color: themeStyles.text }}>
                  {selectedProject.city}, {selectedProject.state}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border }}
              >
                <p className="text-sm" style={{ color: themeStyles.muted }}>Type</p>
                <p className="mt-2 text-base font-semibold" style={{ color: themeStyles.text }}>
                  {selectedProject.category}
                </p>
              </div>

              {isUserProject ? (
                <div
                  className="rounded-2xl border p-4"
                  style={{ backgroundColor: themeStyles.panel, borderColor: themeStyles.border }}
                >
                  <p className="text-sm" style={{ color: themeStyles.muted }}>Visibility</p>
                  <p className="mt-2 text-base font-semibold" style={{ color: themeStyles.text }}>
                    {selectedProject.visibility}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </InfoCard>
      </div>
    );
  };

  let content: ReactNode = null;

  switch (page) {
    case "home":
      content = renderHomePage();
      break;
    case "favorites":
      content = renderFavoritesPage();
      break;
    case "projects":
      content = renderProjectsPage();
      break;
    case "settings":
      content = renderSettingsPage();
      break;
    case "account_info":
      content = renderAccountInfoPage();
      break;
    case "answers_summary":
      content = renderAnswersSummaryPage();
      break;
    case "questionnaire":
      content = renderQuestionnairePage();
      break;
    case "project_detail":
      content = renderProjectDetailPage();
      break;
    default:
      content = renderHomePage();
  }

  if (appStage === "signin_details") {
    return (
      <>
        {leafletAssets}
        <div style={{ backgroundColor: themeStyles.appBg, minHeight: "100vh" }}>
          {renderSigninDetails()}
        </div>
      </>
    );
  }

  if (appStage === "signin_payment") {
    return (
      <>
        {leafletAssets}
        <div style={{ backgroundColor: themeStyles.appBg, minHeight: "100vh" }}>
          {renderSigninPayment()}
        </div>
      </>
    );
  }

  if (appStage === "signin_confirmation") {
    return (
      <>
        {leafletAssets}
        <div style={{ backgroundColor: themeStyles.appBg, minHeight: "100vh" }}>
          {renderSigninConfirmation()}
        </div>
      </>
    );
  }

  return (
    <>
      {leafletAssets}

      <div style={{ backgroundColor: themeStyles.appBg, minHeight: "100vh" }}>
        <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
          <aside
            className="border-r px-4 py-6 md:px-6"
            style={{
              backgroundColor: themeStyles.panel,
              borderColor: themeStyles.border,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl font-semibold"
                style={{ backgroundColor: themeStyles.primary, color: themeStyles.primaryText }}
              >
                OG
              </div>
              <div>
                <p className="text-base font-semibold" style={{ color: themeStyles.text }}>
                  Off Grid
                </p>
                <p className="text-sm" style={{ color: themeStyles.muted }}>
                  Prototype 5
                </p>
              </div>
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => {
                const active = page === item.key;
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPage(item.key)}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition"
                    style={{
                      backgroundColor: active ? themeStyles.pill : "transparent",
                      color: active ? themeStyles.text : themeStyles.muted,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage("questionnaire")}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition"
                style={{
                  backgroundColor: page === "questionnaire" ? themeStyles.pill : "transparent",
                  color: page === "questionnaire" ? themeStyles.text : themeStyles.muted,
                }}
              >
                <PenSquare className="h-4 w-4" />
                Questionnaire
              </button>
            </nav>
          </aside>

          <main className="min-w-0 px-4 py-5 md:px-6 lg:px-8">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm" style={{ color: themeStyles.muted }}>
                  Welcome back
                </p>
                <h2 className="text-xl font-semibold tracking-tight" style={{ color: themeStyles.text }}>
                  {email || "Prototype user"}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled((prev) => !prev)}
                  className="rounded-2xl border p-3 transition"
                  style={{
                    backgroundColor: themeStyles.card,
                    borderColor: themeStyles.border,
                    color: notificationsEnabled ? themeStyles.text : themeStyles.muted,
                  }}
                >
                  <Bell className="h-4 w-4" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileMenuOpen((prev) => !prev)}
                    className="flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition"
                    style={{
                      backgroundColor: themeStyles.card,
                      borderColor: themeStyles.border,
                      color: themeStyles.text,
                    }}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold"
                      style={{
                        backgroundColor: themeStyles.pill,
                        color: themeStyles.text,
                      }}
                    >
                      {initials}
                    </div>
                    <span className="hidden text-sm font-medium sm:inline">Profile</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {profileMenuOpen ? (
                    <div
                      className="absolute right-0 top-[calc(100%+10px)] z-20 w-60 rounded-2xl border p-2"
                      style={{
                        backgroundColor: themeStyles.card,
                        borderColor: themeStyles.border,
                        boxShadow: themeStyles.shadow,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPage("account_info");
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition"
                        style={{ color: themeStyles.text }}
                      >
                        <User className="h-4 w-4" />
                        Account info
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPage("settings");
                          setProfileMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition"
                        style={{ color: themeStyles.text }}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </header>

            {content}
          </main>
        </div>

        {fullscreenMapOpen ? (
          <div className="fixed inset-0 z-[1000] bg-slate-950/80 p-3 md:p-6">
            <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b px-4 py-3 md:px-6"
                style={{ borderColor: "#e2e8f0" }}>
                <div>
                  <p className="text-base font-semibold text-slate-900">
                    Project map
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {fullscreenMapProjects.length} visible project{fullscreenMapProjects.length === 1 ? "" : "s"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFullscreenMapOpen(false)}
                  className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_360px]">
                <div className="min-h-[420px]">
                  <LeafletMap
                    projects={fullscreenMapProjects}
                    highlightedIds={projectsPageHighlightedIds}
                    activeProjectId={activeMapProject?.id ?? null}
                    onSelectProject={(project) => setActiveMapProject(project)}
                    mode="full"
                    isReady={leafletReady}
                  />
                </div>

                <div className="overflow-y-auto border-l bg-slate-50 p-4 md:p-5"
                  style={{ borderColor: "#e2e8f0" }}>
                  <div className="space-y-3">
                    {fullscreenMapProjects.map((project) => {
                      const active = activeMapProject?.id === project.id;

                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => setActiveMapProject(project)}
                          className="w-full rounded-2xl border p-4 text-left transition"
                          style={{
                            backgroundColor: active ? "#dbeafe" : "#ffffff",
                            borderColor: active ? "#60a5fa" : "#e2e8f0",
                          }}
                        >
                          <p className="text-sm font-semibold text-slate-900">{project.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{project.location}</p>
                          <p className="mt-2 text-xs text-slate-500">{project.category}</p>
                        </button>
                      );
                    })}
                  </div>

                  {activeMapProject ? (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {activeMapProject.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {activeMapProject.description}
                      </p>
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setFullscreenMapOpen(false);
                            openProjectDetail(activeMapProject);
                          }}
                          className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-95"
                        >
                          Open project
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
