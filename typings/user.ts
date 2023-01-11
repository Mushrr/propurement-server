type UserType = "admin" | "agent" | "user" | null;

interface Principal {
    name: string;
    phone: string,
    password: string, // md5加密之后的
    session_key: string,
    privileges: [], // 权限
}

interface UserInfo {
    openid: string; // 还是叫做openid，只不过不与微信绑定了
    user_type?: UserType;
    principals: Principal[];
    organization?: {
        company: string;
        department: string;
        position: string;
    };
}



export type {
    UserInfo,
    UserType
}