
import { TicketType, TicketCategory } from './types';

export const TICKETS: TicketType[] = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    price: 249,
    description: 'The First Selection',
    category: TicketCategory.INDIVIDUAL,
    capacity: 15,
    maxPeople: 1
  },
  {
    id: 'regular-pass',
    name: 'Regular Pass',
    price: 449,
    description: 'Standard Entry',
    category: TicketCategory.INDIVIDUAL,
    maxPeople: 1
  },
  {
    id: 'premium-pass',
    name: 'Premium Pass',
    price: 649,
    description: 'Curated Amenities',
    category: TicketCategory.INDIVIDUAL,
    maxPeople: 1
  },
  {
    id: 'duo-regular',
    name: 'Duo Regular',
    price: 799,
    description: 'For Two People',
    category: TicketCategory.DUO,
    maxPeople: 2
  },
  {
    id: 'premium-duo',
    name: 'Premium Duo',
    price: 1190,
    description: 'Shared Premium Access',
    category: TicketCategory.DUO,
    maxPeople: 2
  },
  {
    id: 'trio-regular',
    name: 'Trio Regular',
    price: 1149,
    description: 'For Three People',
    category: TicketCategory.TRIO,
    maxPeople: 3
  },
  {
    id: 'premium-trio',
    name: 'Premium Trio',
    price: 1899,
    description: 'Artisanal Experience for Three',
    category: TicketCategory.TRIO,
    maxPeople: 3
  },
  {
    id: 'group-regular',
    name: 'Group Regular',
    price: 2699,
    description: 'Collective Entry for Five',
    category: TicketCategory.GROUP,
    maxPeople: 5
  },
  {
    id: 'group-premium',
    name: 'Group Premium',
    price: 3149,
    description: 'Private Allocation for Five',
    category: TicketCategory.GROUP,
    maxPeople: 5
  }
];

export const TOTAL_EARLY_BIRD_SEATS = 15;
export const USED_EARLY_BIRD_SEATS = 0; // Keeping as 0 for demo as requested
