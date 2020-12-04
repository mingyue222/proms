import Vue from 'vue'
import VueRouter from 'vue-router'

// 导入登录组件

import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import Welcome from '@/views/Welcome.vue'
import User from '@/views/User/User.vue'
import Rights from '@/views/rights/Rights.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights }
    ]
  }
]

const router = new VueRouter({
  routes
})
router.beforeEach((to, form, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数， 表示放行
  // next() 放行  next('/login') 强制跳转
  if (to.path === '/login') return next()

  const tokenStr = sessionStorage.getItem('token')

  if (!tokenStr) return next('/login')

  next()
})
export default router
