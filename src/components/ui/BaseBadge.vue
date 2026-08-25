<script setup lang="ts">
type Variant = 'default' | 'success' | 'info' | 'warning' | 'danger' | 'outline'

withDefaults(defineProps<{ variant?: Variant }>(), { variant: 'default' })

const variants: Record<Variant, string> = {
  default: 'bg-surface text-ink-muted',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  info: 'bg-accent-soft text-accent border border-accent/20',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200',
  outline: 'bg-white text-ink-muted border border-line'
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
    :class="variants[variant]"
  >
    <slot />
  </span>
</template>
