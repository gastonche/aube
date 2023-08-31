export interface SessionInterface {
    id: string;
    user_id?: string;
    ip_address?: string;
    user_agent?: string;
    payload: Record<string, any>;
    last_activity: number;
}