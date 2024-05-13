#!/usr/bin/env node
/* eslint-disable no-await-in-loop */

import type { Action, GitStatus, Option } from './types/index.js'

import { intro, outro, select } from '@clack/prompts'
import { Command } from '@commander-js/extra-typings'
import color from 'picocolors'

import { DEFAULT_MAX_LENGTH, MENU_OPTIONS } from './constants/index.js'
import {
  buildCommit,
  getCommitBodyMessage,
  getCommitFooter,
  getCommitScope,
  getCommitTitle,
  getCommitType,
  getIsBreakingChange,
  showConfirmCommit,
  showFilesStatus,
  showFilesToAdd,
  showFilesToRestore,
} from './lib/index.js'
import {
  NotInGitRepositoryError,
  createCommit,
  getStatusFiles,
  handleCancelPrompt,
} from './utils/index.js'

const program = new Command('stx-commit')
  .description('CLI to help write commit messages according to conventional commits.')
  .option('-ml, --max-length <VALUE>', 'max length of each line', Number, DEFAULT_MAX_LENGTH)
  .option('-e, --emoji', 'add emojis to the commit', false)

program.parse(process.argv)

const options = program.opts()

let status: GitStatus = { staged: [], notStaged: [], untracked: [] }

let action: Action

intro(color.white(' Welcome to Santux Commit '))

do {
  try {
    status = await getStatusFiles()
  } catch (error) {
    if (!(error instanceof NotInGitRepositoryError)) {
      outro('An error occured. Please try again.')
      process.exit(1)
    }

    status = await getStatusFiles()
  }

  action = handleCancelPrompt(
    await select<Option<Partial<Action>>[], Action>({
      message: 'What do you want to do?',
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      options: MENU_OPTIONS.filter((option) => {
        if (option.value === 'add' && !status.notStaged.length && !status.untracked.length) {
          return false
        }

        if ((option.value === 'restore' || option.value === 'commit') && !status.staged.length) {
          return false
        }

        return true
      }),
    }),
  )

  if (action === 'status') {
    showFilesStatus(status)
  }

  if (action === 'add') {
    await showFilesToAdd(
      status.notStaged.concat(status.untracked.map((file) => `untracked: ${file}`)),
    )
  }

  if (action === 'restore') {
    await showFilesToRestore()
  }
} while (action !== 'commit' && action !== 'quit')

if (action === 'quit') {
  outro('👋 Bye')
  process.exit(0)
}

const commitType = await getCommitType()

const scope = await getCommitScope()

const commitTitle = await getCommitTitle({ commitType, scope, maxLength: options.maxLength })

const bodyMessage = await getCommitBodyMessage({ maxLength: options.maxLength })

const commitFooter = await getCommitFooter({ maxLength: options.maxLength })

const isBreakingChange = await getIsBreakingChange()

const commit = buildCommit({
  bodyMessage,
  commitFooter,
  commitTitle,
  commitType,
  isBreakingChange,
  scope,
  withEmoji: options.emoji,
})

const isCommitConfirmed = await showConfirmCommit({ commit, maxLength: options.maxLength })

if (!isCommitConfirmed) {
  outro('Your commit has been canceled')
  process.exit(0)
}

await createCommit(commit)

outro('✅ Commit created.')
