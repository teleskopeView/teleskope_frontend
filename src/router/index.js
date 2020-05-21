import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
    scrollBehavior() {
        return window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../Components/home.vue'),
        },
        {
            path: '/namespaces/:namespace',
            name: 'namespace',
            component: () => import('../Components/namespace.vue'),
        },
        {
            path: '/namespaces/:namespace/deployments/:deployment',
            name: 'deployment',
            component: () => import('../Components/deployment.vue'),
        }
    ]
})
