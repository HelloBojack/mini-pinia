import { createApp } from "vue";
import { createPinia } from "@/pinia";
import App from "./App.vue";

import "./assets/main.css";
import { piniaPluginPersistedState } from "./pinia-plugin-persisted-state";

const app = createApp(App);

const pinia = createPinia();

// pinia.use(function ({ store }) {
//   const localState = localStorage.getItem(store.$id);
//   if (localState) {
//     store.$state = JSON.parse(localState);
//   }

//   store.$subscribe(({ storeId }, state) => {
//     localStorage.setItem(storeId, JSON.stringify(state));
//   });
// });

pinia.use(piniaPluginPersistedState);

app.use(pinia);

app.mount("#app");
