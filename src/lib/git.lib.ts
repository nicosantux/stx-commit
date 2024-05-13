/* eslint-disable no-console */
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

  if (!addScope) return

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
  maxLength,
  scope,
}: {
  commitType: CommitType
  maxLength: number
  scope?: string
}) {
  return handleCancelPrompt(
    await text({
      message: 'Enter your commit title:',
      validate: (value) => {
        if (!value.trim().length) return 'Title cannot be empty.'
        if (value.trim().length + commitType.length + (scope?.length ?? 0) > maxLength)
          return 'Title too long. Consider add a body message.'
      },
    }),
  ).trim()
}

export async function getCommitBodyMessage({ maxLength }: { maxLength: number }) {
  const addBodyMessage = handleCancelPrompt(
    await confirm({
      initialValue: false,
      message: 'Do you want to add a body message?',
    }),
  )

  if (!addBodyMessage) return

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

  return wrapText(bodyMessage, maxLength)
}

export async function getCommitFooter({ maxLength }: { maxLength: number }) {
  const addFooter = handleCancelPrompt(
    await confirm({
      initialValue: false,
      message: 'Do you want to add a footer message?',
    }),
  )

  if (!addFooter) return

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

  return wrapText(footer, maxLength)
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
  withEmoji,
}: {
  bodyMessage?: string
  commitFooter?: string
  commitTitle: string
  commitType: CommitType
  isBreakingChange: boolean
  scope?: string
  withEmoji: boolean
}) {
  const emojiFormat = withEmoji ? `${COMMIT_TYPES[commitType].emoji} ` : ''
  const scopeFormat = scope ? `(${scope})` : ''
  const breakingChangeFormat = isBreakingChange ? '!:' : ':'

  return [
    `${emojiFormat}${commitType}${scopeFormat}${breakingChangeFormat} ${commitTitle}`,
    bodyMessage ? bodyMessage : '',
    commitFooter ? commitFooter : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

export async function showConfirmCommit({
  commit,
  maxLength,
}: {
  commit: string
  maxLength: number
}) {
  const lines = commit.split('\n')
  const boxPadding = maxLength + 3

  console.log(color.gray('│'))
  console.log(`${color.gray('│')} This will be your commit:`)
  console.log(`${color.gray('│ ') + '╭'.padEnd(boxPadding, '─')}╮`)
  console.log(`${color.gray('│ ') + '│'.padEnd(boxPadding, ' ')}│`)
  lines.forEach((line) => {
    console.log(`${color.gray('│ ') + `│ ${line}`.padEnd(boxPadding, ' ')}│`)
  })
  console.log(`${color.gray('│ ') + '│'.padEnd(boxPadding, ' ')}│`)
  console.log(`${color.gray('│ ') + '╰'.padEnd(boxPadding, '─')}╯`)

  return handleCancelPrompt(
    await confirm({
      message: 'Do you want to continue?',
      initialValue: true,
    }),
  )
}
