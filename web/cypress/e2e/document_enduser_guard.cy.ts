describe('End User blocked from obsolete', () => {
  it('redirects to latest approved version', () => {
    cy.visit('/login')
    cy.get('input#email').type('user@example.com')
    cy.get('input#password').type('x')
    cy.get('select#role').select('EndUser')
    cy.contains('button','Continue').click()
    cy.visit('/documents/ABC-XY-ENG-PRO-001?v=2.0')
    cy.contains("latest approved version", { matchCase: false })
  })
})

