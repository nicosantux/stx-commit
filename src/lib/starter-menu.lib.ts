import type { GitStatus, Option } from '../types/index.js'

import color from 'picocolors'
import { multiselect } from '@clack/prompts'

import {
  addToStagingArea,
  getStagedFiles,
  handleCancelPrompt,
  restoreFilesFromStaging,
} from '../utils/index.js'

export function showFilesStatus(status: GitStatus) {
  if (status.staged.length) {
    console.log(color.gray('│'))
    console.log(`${color.gray('│')}  Changes to be commited:`)
    console.log(color.gray('│'))
    status.staged.forEach((file) => console.log(`${color.gray('│')}\t${color.green(file)}`))
  }

  if (status.notStaged.length) {
    console.log(color.gray('│'))
    console.log(`${color.gray('│')}  Changes not staged for commit:`)
    console.log(color.gray('│'))
    status.notStaged.forEach((file) => console.log(`${color.gray('│')}\t${color.red(file)}`))
  }

  if (status.untracked.length) {
    console.log(color.gray('│'))
    console.log(`${color.gray('│')}  Untracked files:`)
    console.log(color.gray('│'))
    status.untracked.forEach((file) => console.log(`${color.gray('│')}\t${color.red(file)}`))
  }
}

export async function showFilesToAdd(files: string[]) {
  const fileToAdd = handleCancelPrompt(
    await multiselect<Option<string>[], string>({
      message: '',
      options: files.map((file) => ({ label: file, value: file.split(' ').at(-1) as string })),
    }),
  )

  await addToStagingArea(fileToAdd)
}

export async function showFilesToRestore() {
  const files = await getStagedFiles()

  const filesToRestore = handleCancelPrompt(
    await multiselect<Option<string>[], string>({
      message: '',
      options: files.map((file) => ({ label: file, value: file.split(' ').at(-1) as string })),
    }),
  )

  await restoreFilesFromStaging(filesToRestore)
}
