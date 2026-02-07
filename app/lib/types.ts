/**
 * TicketCategory
 * Defines the category of the ticket (Individual, Duo, Trio, Group).
 */
export enum TicketCategory {
    INDIVIDUAL = 'Individual',
    DUO = 'Duo',
    TRIO = 'Trio',
    GROUP = 'Group'
}

/**
 * TicketType
 * Represents a single ticket option with its properties.
 */
export interface TicketType {
    id: string; // Unique identifier for the ticket
    name: string; // Display name
    price: number; // Cost in INR
    description: string; // Brief description
    category: TicketCategory; // Ticket category
    capacity?: number; // Optional limit on number of tickets
    maxPeople: number; // Number of people allowed per ticket
    emoji: string; // Decorative emoji
}

/**
 * FormData
 * Represents the state of the registration form.
 */
export interface FormData {
    fullName: string; // Primary registrant's name
    phone: string; // Contact number
    email: string; // Email address
    ticketId: string; // ID of the selected ticket
    additionalNames: string[]; // Names of additional guests (if applicable)
    wantsUpdates: boolean; // Opt-in for updates
}
