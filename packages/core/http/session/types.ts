export interface SessionInterface {
    id: string;
    user_id?: string;
    ip?: string;
    userAgent?: string;
    payload: Record<string, any>;
    lastActivity: number;
}