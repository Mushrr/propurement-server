import axios from 'axios';

const instance = axios.create({
<<<<<<< HEAD
    baseURL: `${import.meta.env.VITE_URL_PREFIX}`,
    timeout: 10000,
=======
    baseURL: `${import.meta.env.VITE_URL_PREFIX}/api`,
    timeout: 1000,
>>>>>>> parent of 67641c7 (日期修改 增加了点选)
})


// 生产状态切换
if (import.meta.env.DEV) {
    instance.interceptors.request.use((config) => {
        console.log('------------------------------[START]----------------------------------')
        console.log(`[${new Date().toLocaleString()}] --> ${config.method} ${config.url}`)
        console.log(`[${new Date().toLocaleString()}] --> data: ${JSON.stringify(config.data)}`)
        console.log(`[${new Date().toLocaleString()}] --> params: ${JSON.stringify(config.params)}`)
        return config
    }, (error) => {
        console.log('------------------------------[START]----------------------------------')
        console.warn(`[${new Date().toLocaleString()}] --> ${error.method} ${error.url} ${error.message}`)
        return Promise.reject(error)
    })

    instance.interceptors.response.use((response) => {
        console.log(`[${new Date().toLocaleString()}] <-- ${response.status} ${response.config.method} ${response.config.url}`)
        console.log(`[${new Date().toLocaleString()}] <-- ${JSON.stringify(response.data)}`)
        console.log('------------------------------[END]-------------------------------------')
        return response
    }, (error) => {
        console.warn(`[${new Date().toLocaleString()}] <-- ${error.status} ${error.config.url} ${error.message}`)
        console.log('------------------------------[END]-------------------------------------')

        return Promise.reject(error)
    })
}

export default instance
