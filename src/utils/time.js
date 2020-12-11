import dayjs from 'dayjs'
import Vue from 'vue'
// 声明一个全局过滤器

Vue.filter('time', value => {
  return dayjs(value).format('YYYY-MM-DD hh:mm:ss')
})
