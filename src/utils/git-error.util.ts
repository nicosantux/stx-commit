export class NotInGitRepositoryError extends Error {
  constructor() {
    super('Not in git repository')
  }
}
