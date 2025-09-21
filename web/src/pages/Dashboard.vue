<template>
  <component :is="component" />
  
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import EndUser from '@/pages/dashboard/EndUser.vue'
import Owner from '@/pages/dashboard/Owner.vue'
import Controller from '@/pages/dashboard/Controller.vue'
import Qms from '@/pages/dashboard/Qms.vue'
import Admin from '@/pages/dashboard/Admin.vue'
import Auditor from '@/pages/dashboard/Auditor.vue'

const auth = useAuthStore()
const role = computed(() => auth.effectiveRole)
const component = computed(() => ({
  EndUser: EndUser,
  DocumentOwner: Owner,
  DocumentController: Controller,
  QMS: Qms,
  Admin: Admin,
  ExternalAuditor: Auditor,
} as const)[role.value] || EndUser)
</script>
