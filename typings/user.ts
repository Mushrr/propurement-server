import { type } from "os";


interface UserInfo {
    openid: string;
    session_key: string;
    user_type?: string;
    organization?: {
        company: string;
        department: string;
        position: string;
        phone_number: string;
        principal: string;
    };
}


export type {
    UserInfo
}