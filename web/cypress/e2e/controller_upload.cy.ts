describe('Controller Upload flow', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input#email').type('controller@example.com')
    cy.get('input#password').type('x')
    cy.get('select#role').select('DocumentController')
    cy.contains('button','Continue').click()
  })
  it('requires PDF, allows next after attach', () => {
    cy.visit('/controller/upload')
    // PDF required
    cy.contains('Next').should('be.disabled')
    // attach PDF via hidden file input
    cy.get('input[type=file][accept*="application/pdf"]').selectFile({ contents: Cypress.Buffer.from('%PDF-1.4'), fileName: 'a.pdf', mimeType: 'application/pdf' }, { force: true })
    cy.contains('Next').should('not.be.disabled')
  })
})
