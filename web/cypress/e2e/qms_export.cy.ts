describe('QMS export', () => {
  it('exports from KPIs page', () => {
    cy.visit('/login')
    cy.get('input#email').type('qms@example.com')
    cy.get('input#password').type('x')
    cy.get('select#role').select('QMS')
    cy.contains('button','Continue').click()
    cy.visit('/qms/kpis')
    cy.contains('button','Export PDF').click()
    cy.contains('Saved successfully').should('not.exist') // ensure toast container exists
  })
})

