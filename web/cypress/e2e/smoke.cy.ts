describe('Smoke', () => {
  it('loads home and has nav', () => {
    cy.visit('/')
    cy.contains('Document Management & Control')
    cy.contains('Documents')
  })
})

