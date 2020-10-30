import Vue from 'vue'
import Router, { Route } from 'vue-router'
import { get } from 'lodash'
import store from '@/store/index'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { classifyNews } from '@/router/children/classifyNews'
import { infoDistribution } from '@/router/children/infoDistribution'

Vue.use(Router)

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/common/Login.vue')
        },
        {
            path: '/logout',
            name: 'logout',
            component: () => import('@/views/common/Logout.vue')
        },
        classifyNews,
        {
            path: '/error/:id',
            name: '404',
            component: () => import('@/views/common/404.vue')
        }
    ]
})

const whiteList = store.state.token_white_list

router.beforeEach((to, from, next) => {
    NProgress.start()
    let isNotNeedAuth = whiteList.some(whiteName => {
        return to.name === whiteName
    })

    if (isNotNeedAuth) {
        next()
        NProgress.done()
    } else {
        //需要token，判断是否有token
        if (!sessionStorage.getItem('Authorization')) {
            //没有获取到token，进入登录页面
            next({ name: 'login' })
            NProgress.done()
        } else {
            //已登录，但是没有挂载路由
            if (!store.state.is_mounted_routers) {
                //没有挂载权限路由
                store
                    .dispatch('COMMIT_MOUNT_ROUTER')
                    .then(allPermissionMenu => {
                        // 发布菜单由发布权限的actionCode来控制
                        let permissionCodes = get(store.state, 'Permission.all_has_permission_code', [])
                        if (permissionCodes.includes('info-distribution-manage')) {
                            router.addRoutes([infoDistribution])
                        }
                        router.addRoutes([allPermissionMenu])
                        router.addRoutes([{ path: '*', redirect: '/error/404' }])
                        next({ path: to.path })
                    })
                    .catch(e => {
                        console.log('routerBeforeEachErr: ', e)
                        router.addRoutes([{ path: '*', redirect: '/error/404' }])
                        next('/error/404')
                    })
            } else {
                //已挂载路由
                if (to.path === '/') {
                    let redirectName = getFirstChildDeep(store.getters.get_all_permission_menu)
                    next({ name: redirectName })
                } else {
                    next()
                }
                NProgress.done()
            }
        }
    }
})

function getFirstChildDeep(routes: any[]) {
    if (routes[0]) {
        if (!routes[0].children) {
            return routes[0].name
        } else {
            return getFirstChildDeep(routes[0].children)
        }
    } else {
        return '404'
    }
}

export default router
