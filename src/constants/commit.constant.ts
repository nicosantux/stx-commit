import type { CommitType } from '../types/index.js'

export const COMMIT_TYPES: Readonly<Record<CommitType, { emoji: string; description: string }>> = {
  build: {
    emoji: '🏭',
    description: 'Changes that affect the build system or external dependencies',
  },
  chore: {
    emoji: '📝',
    description: 'Changes for routine maintenance, no impact on functionality.',
  },
  ci: {
    emoji: '⚙️',
    description: 'Changes to our CI configuration files and scripts',
  },
  docs: {
    emoji: '📚',
    description: 'Documentation only changes',
  },
  feat: {
    emoji: '🆕',
    description: 'A new feature',
  },
  fix: {
    emoji: '🐛',
    description: 'A bug fix',
  },
  perf: {
    emoji: '⚡️',
    description: 'A code change that improves performance',
  },
  refactor: {
    emoji: '🏗️',
    description: 'A code change that neither fixes a bug nor adds a feature',
  },
  style: {
    emoji: '🎨',
    description: 'Changes that do not affect the meaning of the code',
  },
  test: {
    emoji: '🧪',
    description: 'Adding missing tests or correcting existing tests',
  },
}
