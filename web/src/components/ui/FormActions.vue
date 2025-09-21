<template>
  <div class="flex items-center gap-2 justify-end">
    <Button variant="secondary" @click="$emit('cancel')">Cancel</Button>
    <Button variant="primary" :disabled="disabled" @click="$emit('save')">Save</Button>
  </div>
</template>

<script setup lang="ts">
import Button from './Button.vue'
defineProps<{ disabled?: boolean }>()
defineEmits<{ (e:'save'): void; (e:'cancel'): void }>()
</script>

