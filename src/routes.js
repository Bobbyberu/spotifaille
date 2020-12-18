import Auth from './components/Auth.vue';
import Callback from './components/Callback.vue';
import Search from './components/Search.vue';

const routes = [
    {path: '/', component: Search},
    {path: '/auth', component: Auth},
    {path: '/callback', component: Callback},
];

export default routes;