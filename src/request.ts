import axios from 'axios';

const instance = axios.create({
    baseURL: `${import.meta.env.VITE_URL_PREFIX}/api`,
    timeout: 1000,
})


// 生产状态切换
if (import.meta.env.DEV) {
    instance.interceptors.request.use((config) => {
        console.log(config)
        return config
    })
    instance.interceptors.response.use((response) => {
        console.log(response)
        return response
    })
}

export default instance