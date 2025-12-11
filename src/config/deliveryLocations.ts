export interface DeliveryLocation {
  id: string;
  city: string;
  area: string;
  agencies: string[];
  instructions: string;
  workingHours: string;
  contactPerson: string;
  contactPhone: string;
  isActive: boolean;
}

const DELIVERY_LOCATIONS: DeliveryLocation[] = [
  {
    id: "bamenda-city-chemist",
    city: "Bamenda",
    area: "City Chemist / Mile 2 Nkwen",
    agencies: [
      "Moghamo Express – Mile 4 Park",
      "Nso Boys Express – Bambui & Mile 4 Park"
    ],
    instructions:
      "Our ProList agents will handle the delivery. They will collect the item from the transport agency or park and route it to ProList Warehouse.",
    workingHours: "08:00 – 18:00 (Tuesday–Saturday)",
    contactPerson: "Jam Ransom",
    contactPhone: "+237 671 308 991",
    isActive: true
  },
  {
    id: "bambili",
    city: "Bamenda",
    area: "Bambili",
    agencies: [
      "Moghamo Express – Mile 4 Park",
      "Nso Boys Express – Bambui & Mile 4 Park"
    ],
    instructions:
      "Our ProList agents will handle the delivery. They will collect the item from the transport agency or park and route it to ProList Warehouse.",
    workingHours: "08:00 – 18:00 (Tuesday–Saturday)",
    contactPerson: "Jam Ransom",
    contactPhone: "+237 671 308 991",
    isActive: true
  }
];

export default DELIVERY_LOCATIONS;

// Helper functions
export const getActiveLocations = () => 
  DELIVERY_LOCATIONS.filter(loc => loc.isActive);

export const getLocationsByCity = (city: string) => 
  DELIVERY_LOCATIONS.filter(loc => loc.city === city && loc.isActive);

export const getLocationById = (id: string) => 
  DELIVERY_LOCATIONS.find(loc => loc.id === id);

export const getUniqueCities = () => 
  [...new Set(DELIVERY_LOCATIONS.filter(loc => loc.isActive).map(loc => loc.city))];
