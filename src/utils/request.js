import Vue from 'vue'
// 配置axios
import axios from 'axios'
axios.defaults.baseURL = 'http://8.131.91.46:7000/api/private/v1'

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  config.headers.Authorization = sessionStorage.getItem('token')
  // 在发送请求之前做些什么
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

Vue.prototype.$http = axios
