import { type GIT_FILE_STATUS } from '../constants/index.js'

export type GitStatus = Record<'staged' | 'notStaged' | 'untracked', string[]>

export type GitFileStatus = keyof typeof GIT_FILE_STATUS | ''
