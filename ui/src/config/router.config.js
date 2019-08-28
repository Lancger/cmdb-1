// eslint-disable-next-line
import store from '@/store'

import { UserLayout, BasicLayout, RouteView, PageView } from '@/layouts'
import { getPreference } from '@/api/cmdb/preference'

const cmdbRouter = [
  // preference
  {
    path: '/preference',
    component: () => import('@/views/cmdb/preference'),
    name: 'cmdb_preference',
    meta: { title: '我的订阅', icon: 'book', keepAlive: true }
  },
  // views
  {
    path: '/tree_views',
    component: () => import('@/views/cmdb/tree_views'),
    name: 'cmdb_tree_views',
    meta: { title: '树形视图', icon: 'share-alt', keepAlive: true },
    hideChildrenInMenu: true,
    children: [
      {
        path: '/tree_views/:typeId',
        name: 'cmdb_tree_views_item',
        component: () => import('@/views/cmdb/tree_views'),
        meta: { title: '树形视图', keepAlive: true },
        hidden: true
      }]
  },
  // batch
  {
    path: '/batch',
    component: () => import('@/views/cmdb/batch'),
    name: 'cmdb_batch',
    meta: { 'title': '批量导入', icon: 'upload', keepAlive: true }
  },
  {
    path: '/ci_types',
    name: 'cmdb_ci_type',
    component: RouteView,
    redirect: '/ci_type',
    meta: { title: '模型配置', icon: 'setting', permission: ['admin'] },
    children: [
      {
        path: '/ci_types',
        name: 'ci_type',
        hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
        component: () => import('@/views/cmdb/ci_type/list'),
        meta: { title: '模型定义', keepAlive: true }
      },
      {
        path: '/ci_types/:CITypeName/detail/:CITypeId',
        name: 'ci_type_detail',
        hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
        component: () => import('@/views/cmdb/ci_type/detail'),
        meta: { title: '模型配置', keepAlive: true, hidden: true },
        hidden: true
      },
      {
        path: '/attributes',
        name: 'attributes',
        hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
        component: () => import('@/views/cmdb/attributes/index'),
        meta: { title: '属性库', keepAlive: true }
      }
    ]
  }
]

function copyArray(arr) {
  return arr.map((e) => {
    if (typeof e === 'object') {
      return Object.assign({}, e)
    } else {
      return e
    }
  })
}

export const generatorDynamicRouter = () => {
  return new Promise((resolve, reject) => {
    // cmdb 订阅的模型
    getPreference().then(res => {
      const routers = copyArray(asyncRouterMap)
      routers[0].children = copyArray(cmdbRouter)
      for (let i = 0; i < res.length; i++) {
        const item = res[i]
        routers[0].children.unshift({
          path: `/instances/types/${item.id}`,
          component: () => import(`@/views/cmdb/ci/index`),
          name: `cmdb_${item.id}`,
          meta: { title: item.alias, icon: 'table', keepAlive: true, typeId: item.id },
          hideChildrenInMenu: true // 强制显示 MenuItem 而不是 SubMenu
        })
      }

      resolve(routers)
    })
  })
}

const asyncRouterMap = [
  {
    path: '/',
    name: 'cmdb',
    component: BasicLayout,
    meta: { title: 'CMDB', keepAlive: true },
    redirect: () => {
      return store.getters.addRouters[0].children.find(item => !item.hidden)
    }
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
