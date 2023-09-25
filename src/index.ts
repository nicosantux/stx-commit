#!/usr/bin/env node

import { intro, select } from '@clack/prompts'
import color from 'picocolors'

import { handleCancelPrompt } from './utils/index.js'
import { Option } from './types/index.js'

intro(color.white(' Welcome to Santux Commit '))

type Action = 'add' | 'remove' | 'commit' | 'quit' | 'status'

let action: Action

do {
  action = handleCancelPrompt(
    await select<Option<Action>[], Action>({
      message: 'What do you want to do?',
      options: [
        { label: 'Files Status', value: 'status' },
        { label: 'Add files', value: 'add' },
        { label: 'Remove files', value: 'remove' },
        { label: 'Commit files', value: 'commit' },
        { label: 'Quit', value: 'quit' },
      ],
    }),
  )

  if (action === 'status') {
    console.log('show status')
  }

  if (action === 'add') {
    console.log('show add files')
  }

  if (action === 'remove') {
    console.log('show remove files')
  }
} while (action !== 'commit' && action !== 'quit')
