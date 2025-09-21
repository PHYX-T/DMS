<template>
  <section class="max-w-md mx-auto p-6 bg-[var(--surface)] border border-[var(--border)] rounded-lg space-y-4">
    <h2 class="text-xl font-semibold">Sign in</h2>
    <form @submit.prevent="loginPassword" class="space-y-3">
      <Input id="email" v-model="email" label="Email" type="email" required />
      <Input id="password" v-model="password" label="Password" type="password" required />
      <Select id="role" v-model="role" label="Role" :options="roles" />
      <Button block type="submit">Continue</Button>
    </form>
    <div class="relative">
      <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[var(--content-muted)] text-xs">or</div>
      <Divider />
    </div>
    <div>
      <Button block variant="secondary" @click="loginSSO">Sign in with Microsoft</Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Divider from '@/components/ui/Divider.vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTelemetryStore } from '@/stores/telemetry'

const router = useRouter(); const route = useRoute(); const auth = useAuthStore()
const email = ref(''); const password = ref(''); const role = ref('EndUser')
const roles = [ 'EndUser','DocumentOwner','DocumentController','QMS','Admin','ExternalAuditor' ].map(r => ({ value: r, label: r }))

function afterLogin() {
  try { useTelemetryStore().trackAction('login', { role: role.value }) } catch {}
  auth.setRole(role.value as any)
  const redirect = (route.query.redirect as string) || '/'
  router.replace(redirect)
}

function loginPassword() {
  auth.signInPassword(email.value, password.value)
  afterLogin()
}

async function loginSSO() {
  await auth.signInSSO()
  afterLogin()
}
</script>
