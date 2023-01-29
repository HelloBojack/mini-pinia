<script setup lang="ts">
import CounterCom from "./components/CounterCom.vue";
import { useCounterStore } from "./stores/counter2";

const counterStore = useCounterStore();
const click = () => {
  counterStore.increment();
};
// counterStore.$subscribe(function (state) {
//   console.log("subscribe state", state);
// });
// counterStore.$onAction(({ after }) => {
//   console.log("action");
//   after(() => console.log("after"));
// });
</script>

<template>
  <header>
    <img
      alt="Vue logo"
      class="logo"
      src="./assets/logo.svg"
      width="125"
      height="125"
    />

    <div>
      <div>count:{{ counterStore.count }}</div>
      <div>doubleCount:{{ counterStore.doubleCount }}</div>
      <div>trCount:{{ counterStore.trCount }}</div>
      <button @click="click">Add</button>
    </div>

    <CounterCom />
  </header>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }
}
</style>
