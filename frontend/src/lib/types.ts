export type UserRole = "user" | "admin";

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: UserRole;
    is_active: boolean;
    credits: number;
    profile_image: string | null;
    created_at: string;
}

export interface Token {
    access_token: string;
    token_type: string;
    user: User;
}

export type ProcedureType =
    | "titre_sejour"
    | "naturalisation"
    | "carte_grise"
    | "passeport"
    | "carte_nationale_identite"
    | "autre";

export const PROCEDURE_LABELS: Record<ProcedureType, string> = {
    titre_sejour: "Titre de séjour",
    naturalisation: "Naturalisation",
    carte_grise: "Carte grise",
    passeport: "Passeport",
    carte_nationale_identite: "Carte Nationale d'Identité",
    autre: "Autre",
};

export interface Prefecture {
    id: number;
    name: string;
    department: string;
    city: string;
}

export interface Alert {
    id: number;
    user_id: number;
    prefecture: Prefecture;
    procedure_type: ProcedureType;
    date_from: string;
    date_to: string;
    is_active: boolean;
    notif_email: boolean;
    notif_sms: boolean;
    phone_number: string | null;
    created_at: string;
}

export interface AdminStats {
    total_users: number;
    active_alerts: number;
    total_slots_detected: number;
    available_slots: number;
    total_prefectures: number;
}
