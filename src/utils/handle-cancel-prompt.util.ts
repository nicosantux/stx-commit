import { cancel, isCancel } from '@clack/prompts'

export function handleCancelPrompt<T>(value: T | symbol) {
  if (isCancel(value)) {
    cancel('Santux commit aborted')

    process.exit(0)
  }

  return value
}
