import Vue from "vue";
import App from "./App.vue";
import VueRouter from "vue-router";
import routes from "./routes";
import Vuex from "vuex";
import VueMaterial from "vue-material";
import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import properties from "./properties";

import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/default.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "./assets/style.scss";

Vue.use(VueMaterial);
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.use(VueRouter);
const router = new VueRouter({ mode: "history", routes });

Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    access_token: null,
    refresh_token: null,
  },
  mutations: {
    saveAccessToken(state, token) {
      state.access_token = token;
    },
    saveRefreshToken(state, token) {
      state.refresh_token = token;
    },
  },
});

Vue.config.productionTip = false;
Vue.prototype.$properties = properties;

new Vue({
  render: (h) => h(App),
  router,
  store,
}).$mount("#app");
