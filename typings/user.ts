type UserType = "admin" | "agent" | "user" | null;


interface UserInfo {
    openid: string;
    session_key: string;
    user_type?: UserType;
    organization?: {
        company: string;
        department: string;
        position: string;
        phone_number: string;
        principal: string;
    };
}



export type {
    UserInfo,
    UserType
}