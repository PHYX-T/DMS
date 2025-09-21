import { SetMetadata } from '@nestjs/common'
export const POLICIES_KEY = 'policies'
export type PolicyHandler = (user: any, resource?: any) => boolean | Promise<boolean>
export const Policies = (...handlers: PolicyHandler[]) => SetMetadata(POLICIES_KEY, handlers)

