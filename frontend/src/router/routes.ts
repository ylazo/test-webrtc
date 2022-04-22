import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/auth-layout.vue'),
    redirect: '/login',
    children: [
      {
        path: 'login',
        component: () => import('pages/page-login.vue')
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '/meet',
        component: () => import('pages/Index.vue'),
        children: [
          {
            path: '',
            component: () => import('components/video-call/room-options.vue')
          },
          {
            path: ':roomId',
            props: true,
            component: () => import('components/video-call/room-welcome.vue')
          }
        ]
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
