<script setup lang="ts">
import { useCounterStore } from "@/stores/counter1";
const counterStore = useCounterStore();
const click = () => {
  counterStore.$patch((state) => (state.count = 3));
};
const reset = () => {
  counterStore.$reset();
};
</script>
<template>
  <div>
    <div>Counter</div>

    <div>count:{{ counterStore.count }}</div>
    <div>doubleCount:{{ counterStore.doubleCount }}</div>
    <div>trCount:{{ counterStore.trCount }}</div>
    <button @click="click">Add</button>
    <button @click="reset">reset</button>
  </div>
</template>
