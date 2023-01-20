<script setup lang="ts">
import { useCounterStore } from "./stores/counter1";

const counterStore = useCounterStore();
const click = () => {
  counterStore.increment();
};
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
