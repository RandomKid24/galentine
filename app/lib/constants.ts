import { TicketType, TicketCategory } from './types';

/**
 * TICKETS
 * Array of available ticket options.
 */
export const TICKETS: TicketType[] = [
    {
        id: 'early-bird',
        name: 'Early Bird (First 10 Seats)',
        price: 249,
        description: 'Special early access',
        category: TicketCategory.INDIVIDUAL,
        capacity: 10,
        maxPeople: 1,
        emoji: '🌸'
    },
    {
        id: 'regular-pass',
        name: 'Regular Pass',
        price: 449,
        description: 'Standard Entry',
        category: TicketCategory.INDIVIDUAL,
        maxPeople: 1,
        emoji: '🌷'
    },
    {
        id: 'premium-pass',
        name: 'Premium Pass',
        price: 649,
        description: 'Curated Amenities',
        category: TicketCategory.INDIVIDUAL,
        maxPeople: 1,
        emoji: '💖'
    },
    {
        id: 'duo-regular',
        name: 'Duo Regular (2 people)',
        price: 799,
        description: 'For Two People',
        category: TicketCategory.DUO,
        maxPeople: 2,
        emoji: '👯'
    },
    {
        id: 'trio-regular',
        name: 'Trio Regular (3 people)',
        price: 1149,
        description: 'For Three People',
        category: TicketCategory.TRIO,
        maxPeople: 3,
        emoji: '🌿'
    },
    {
        id: 'premium-duo',
        name: 'Premium Duo (2 people)',
        price: 1190,
        description: 'Shared Premium Access',
        category: TicketCategory.DUO,
        maxPeople: 2,
        emoji: '💕'
    },
    {
        id: 'group-regular',
        name: 'Group Regular (5 people)',
        price: 2699,
        description: 'Collective Entry for Five',
        category: TicketCategory.GROUP,
        maxPeople: 5,
        emoji: '💐'
    },
    {
        id: 'group-premium',
        name: 'Group Premium (5 people)',
        price: 3149,
        description: 'Private Allocation for Five',
        category: TicketCategory.GROUP,
        maxPeople: 5,
        emoji: '🌹'
    }
];

export const TOTAL_EARLY_BIRD_SEATS = 10;
export const USED_EARLY_BIRD_SEATS = 0;
