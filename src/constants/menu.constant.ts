import type { Action, Option } from '../types/index.js'

export const MENU_OPTIONS: Readonly<Option<Action>[]> = [
  { label: 'Files Status', value: 'status' },
  { label: 'Add files', value: 'add' },
  { label: 'Restore files', value: 'restore' },
  { label: 'Commit files', value: 'commit' },
  { label: 'Quit', value: 'quit' },
]
