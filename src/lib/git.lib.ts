import type { CommitType, Option } from '../types/index.js'

import { confirm, select, text } from '@clack/prompts'
import color from 'picocolors'

import { COMMIT_TYPES } from '../constants/index.js'
import { handleCancelPrompt, wrapText } from '../utils/index.js'

export async function getCommitType(): Promise<CommitType> {
  return handleCancelPrompt(
    await select<Option<CommitType>[], CommitType>({
      message: 'Select the commit type:',
      options: Object.entries(COMMIT_TYPES).map(([type, { emoji, description }]) => ({
        label: `${emoji} ${type.padEnd(8, ' ')} - ${description}`,
        value: type as CommitType,
      })),
    }),
  )
}

export async function getCommitScope() {
  const addScope = handleCancelPrompt(
    await confirm({
      initialValue: false,
      message: 'Do you want to add a scope?',
    }),
  )

  if (!addScope) return null

  return handleCancelPrompt(
    await text({
      message: 'Enter the scope:',
      validate: (value) => {
        if (!value.trim().length) return 'Scope cannot be empty.'
        if (value.trim().length > 10) return 'Scope cannot be longer than 10 characters.'
      },
    }),
  ).trim()
}

export async function getCommitTitle({
  commitType,
  scope,
}: {
  commitType: string
  scope: string | null
}) {
  return handleCancelPrompt(
    await text({
      message: 'Enter your commit title:',
      validate: (value) => {
        if (!value.trim().length) return 'Title cannot be empty.'
        if (value.trim().length + commitType.length + (scope?.length ?? 0) > 72)
          return 'Title too long. Consider add a body message.'
      },
    }),
  ).trim()
}

export async function getCommitBodyMessage() {
  const addBodyMessage = handleCancelPrompt(
    await confirm({
      initialValue: false,
      message: 'Do you want to add a body message?',
    }),
  )

  if (!addBodyMessage) return null

  const bodyMessage = handleCancelPrompt(
    await text({
      message: 'Enter your body message:',
      placeholder: 'You can use \\n for a new line.',
      validate: (value) => {
        if (!value.trim().length) return 'Body message cannot be empty.'
      },
    }),
  )
    .trim()
    .replaceAll('\\n', '\n')

  return wrapText(bodyMessage)
}

export async function getCommitFooter() {
  const addFooter = handleCancelPrompt(
    await confirm({
      initialValue: false,
      message: 'Do you want to add a footer message?',
    }),
  )

  if (!addFooter) return null

  const footer = handleCancelPrompt(
    await text({
      message: 'Enter your footer:',
      placeholder: 'You can use \\n for a new line.',
      validate: (value) => {
        if (!value.trim().length) return 'Footer cannot be empty'
      },
    }),
  )
    .trim()
    .replaceAll('\\n', '\n')

  return wrapText(footer)
}

export async function getIsBreakingChange() {
  return handleCancelPrompt(
    await confirm({
      initialValue: false,
      message: 'Is this commit a breaking chage?',
    }),
  )
}

export function buildCommit({
  bodyMessage,
  commitFooter,
  commitTitle,
  commitType,
  isBreakingChange,
  scope,
}: {
  bodyMessage: string | null
  commitFooter: string | null
  commitTitle: string
  commitType: CommitType
  isBreakingChange: boolean
  scope: string | null
}) {
  return `${commitType}${scope ? `(${scope})` : ''}${isBreakingChange ? '!:' : ':'} ${commitTitle}

${bodyMessage ? bodyMessage : ''}

${commitFooter ? commitFooter : ''}
`.trim()
}

export async function showConfirmCommit(commit: string) {
  const lines = commit.split('\n')

  console.log(color.gray('│'))
  console.log(`${color.gray('│')} This will be your commit:`)
  console.log(color.gray('│ ') + '╭'.padEnd(78, '─') + '╮')
  console.log(color.gray('│ ') + '│'.padEnd(78, ' ') + '│')
  lines.forEach((line) => {
    console.log(color.gray('│ ') + `│ ${line}`.padEnd(78, ' ') + '│')
  })
  console.log(color.gray('│ ') + '│'.padEnd(78, ' ') + '│')
  console.log(color.gray('│ ') + '╰'.padEnd(78, '─') + '╯')

  return handleCancelPrompt(
    await confirm({
      message: 'Do you want to continue?',
      initialValue: true,
    }),
  )
}
