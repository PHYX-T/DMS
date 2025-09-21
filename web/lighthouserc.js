module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173/'],
      startServerCommand: 'vite preview --port=5173',
      numberOfRuns: 1,
      budgetsPath: 'budgets.json'
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }]
      }
    }
  }
}
