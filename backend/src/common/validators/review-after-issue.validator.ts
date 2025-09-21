import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'

export function ReviewAfterIssue(object: any, propertyName?: string) {
  return function (object: any, propertyName?: string) {
    registerDecorator({
      name: 'ReviewAfterIssue',
      target: object.constructor,
      propertyName: propertyName || 'ReviewDate',
      options: { message: 'ReviewDate must be on or after IssueDate' } as ValidationOptions,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const obj: any = args.object
          if (!obj?.IssueDate || !obj?.ReviewDate) return true
          try {
            return new Date(obj.ReviewDate).getTime() >= new Date(obj.IssueDate).getTime()
          } catch { return false }
        },
      },
    })
  }
}

