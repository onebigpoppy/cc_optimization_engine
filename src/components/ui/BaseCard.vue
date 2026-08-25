<script setup lang="ts">
withDefaults(
  defineProps<{
    padded?: boolean
    hoverable?: boolean
  }>(),
  { padded: true, hoverable: false }
)
</script>

<template>
  <div
    class="rounded-2xl border border-line/60 bg-white shadow-card transition-all"
    :class="[padded ? 'p-5' : '', hoverable ? 'hover:-translate-y-0.5 hover:shadow-lg' : '']"
  >
    <slot />
  </div>
</template>
