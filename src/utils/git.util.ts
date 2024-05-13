import type { GitFileStatus, GitStatus } from '../types/index.js'

import fs from 'node:fs/promises'
import path from 'node:path'

import { confirm, outro } from '@clack/prompts'

import { GIT_FILE_STATUS } from '../constants/index.js'

import { NotInGitRepositoryError, execCmd, handleCancelPrompt } from './index.js'

export async function getStatusFiles() {
  try {
    const { stdout } = await execCmd('git status -u --porcelain')

    const files = stdout.split('\n').filter(Boolean)

    return parseGitStatus(files)
  } catch (_) {
    const initializeGit = handleCancelPrompt(
      await confirm({
        message: 'You are not in a git repository. Do you want to initialize git?',
        initialValue: true,
      }),
    )

    if (!initializeGit) {
      outro('Santux commit canceled')
      process.exit(0)
    }

    await execCmd('git init -b main')

    throw new NotInGitRepositoryError()
  }
}

function parseGitStatus(lines: string[]) {
  return lines.reduce<GitStatus>(
    (obj, line) => {
      const status = line.slice(0, 2)

      const [indexStatus, workTreeStatus] = status.split('').map((letter) => letter.trim()) as [
        GitFileStatus,
        GitFileStatus,
      ]

      const fileName = line.slice(2).trim()

      if (indexStatus === '?') {
        obj.untracked.push(fileName)
      }

      if (indexStatus && indexStatus !== '?') {
        obj.staged.push(`${GIT_FILE_STATUS[indexStatus]}: ${fileName}`)
      }

      if (workTreeStatus && workTreeStatus !== '?') {
        obj.notStaged.push(`${GIT_FILE_STATUS[workTreeStatus]}: ${fileName}`)
      }

      return obj
    },
    { notStaged: [], staged: [], untracked: [] },
  )
}

export async function getStagedFiles() {
  try {
    const { stdout } = await execCmd('git diff --name-status --cached')

    const fileLines = stdout.split('\n').filter(Boolean)

    return fileLines.reduce<string[]>((arr, line) => {
      const parts = line.split('\t')

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (parts[0]?.startsWith('R')) arr.push(parts[1]!, parts[2]!)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      else arr.push(parts[1]!)

      return arr
    }, [])
  } catch (_) {
    outro('An error occurred getting the files. Please try again.')
    process.exit(1)
  }
}

export async function addToStagingArea(files: string[]) {
  await execCmd(`git add ${files.join(' ')}`)
}

export async function restoreFilesFromStaging(files: string[]) {
  try {
    await execCmd(`git restore --staged ${files.join(' ')}`)
  } catch (error) {
    const headErrorRegex = /fatal: could not resolve head/i

    if (!headErrorRegex.test(error as string)) {
      throw new Error(error as string)
    }

    await execCmd(`git rm --cached ${files.join(' ')}`)
  }
}

export async function createCommit(commit: string) {
  const commitFilePath = path.join(process.cwd(), 'commit.txt')

  try {
    await fs.writeFile(commitFilePath, commit)
    await execCmd(`git commit -F ${commitFilePath}`)
    await fs.unlink(commitFilePath)
  } catch (_) {
    outro('An error occurred creating the commit. Please try again.')
    process.exit(1)
  }
}
