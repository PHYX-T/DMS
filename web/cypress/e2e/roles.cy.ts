describe('Role redirects', () => {
  it('logs in and redirects to dashboard', () => {
    cy.visit('/login')
    cy.get('input#email').type('user@example.com')
    cy.get('input#password').type('password')
    cy.get('select#role').select('Admin')
    cy.contains('button','Continue').click()
    cy.url().should('include', '/')
    cy.contains('Admin Dashboard')
  })
})

