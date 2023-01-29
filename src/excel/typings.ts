interface User {
    _id: string
    openid: string,
    organization: {
        company: string,
        department: string,
        position: string
    },
    principals: {
        name: string,
        phone: string,
        password: string,
        session_key?: string,
        expired?: string
    }[]
}

interface HistoryData {
    _id: string,
    uuid: string,
    transitionId: string
    userComment: string,
    unit: string,
    state: string,
    propurename: string,
    propurement: {
        name: string,
        defaultUnits: string[],
        defaultPage: string,
        category: string[],
        brand: string,
        userPrice: {
            user: {
                openid: string,
                unit: string,
                price: string | number
            }[]
        }
        agentPrice?: {
            agent: 
            {
                agent: string,
                unit: string,
                price: string | number
            }[]
        } 
    },
    price: number | string,
    openid: string,
    number: number,
    isFree: boolean,
    buyer: User,
    agent: User,
    lastModified: string
}


export type {
    HistoryData
}