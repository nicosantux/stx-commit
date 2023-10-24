#!/usr/bin/env node

import type { Action, GitStatus, Option } from './types/index.js'

import { intro, outro, select } from '@clack/prompts'
import color from 'picocolors'

import { MENU_OPTIONS } from './constants/index.js'
import {
  NotInGitRepositoryError,
  createCommit,
  getStatusFiles,
  handleCancelPrompt,
} from './utils/index.js'
import {
  showFilesToRestore,
  showFilesStatus,
  showFilesToAdd,
  getCommitType,
  getCommitScope,
  getCommitTitle,
  getCommitBodyMessage,
  getCommitFooter,
  getIsBreakingChange,
  buildCommit,
  showConfirmCommit,
} from './lib/index.js'

intro(color.white(' Welcome to Santux Commit '))

let status: GitStatus = { staged: [], notStaged: [], untracked: [] }

let action: Action

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

const commitTitle = await getCommitTitle({ commitType, scope })

const bodyMessage = await getCommitBodyMessage()

const commitFooter = await getCommitFooter()

const isBreakingChange = await getIsBreakingChange()

const commit = buildCommit({
  bodyMessage,
  commitFooter,
  commitTitle,
  commitType,
  isBreakingChange,
  scope,
})

const isCommitConfirmed = await showConfirmCommit(commit)

if (!isCommitConfirmed) {
  outro('Your commit has been canceled')
  process.exit(0)
}

await createCommit(commit)

outro('✅ Commit created.')
