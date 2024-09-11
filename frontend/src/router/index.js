import Vue from "vue";
import VueRouter from "vue-router";
import AppLayOut from "../components/AppLayOut.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/upload-images",
    name: "AppLayOut",
    component: AppLayOut,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
