import Vue from 'vue'
// 配置axios
import axios from 'axios'
axios.defaults.baseURL = 'http://8.131.91.46:7000/api/private/v1'

Vue.prototype.$http = axios
