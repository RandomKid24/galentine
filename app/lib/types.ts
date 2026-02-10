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
 * RegistrationFormData
 * Represents the state of the registration form.
 */
export interface RegistrationFormData {
    fullName: string; // Primary registrant's name
    phone: string; // Contact number
    email: string; // Email address
    ticketId: string; // ID of the selected ticket
    additionalNames: string[]; // Names of additional guests (if applicable)
    wantsUpdates: boolean; // Opt-in for updates
}

/**
 * Pass
 * Represents a pass/ticket from the database
 */
export interface Pass {
    id: number;
    title: string;
    price: number;
    description: string | null;
    total_seats: number;
    max_people: number;
    emoji: string;
    upi_id: string | null;
    qr_code_base64: string | null;
    is_active: boolean;
    is_early_bird: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

/**
 * SeatConfig
 * Represents seat availability configuration
 */
export interface SeatConfig {
    id: number;
    config_key: 'early_bird' | 'general';
    total_seats: number;
    used_seats: number;
    updated_at: string;
}
