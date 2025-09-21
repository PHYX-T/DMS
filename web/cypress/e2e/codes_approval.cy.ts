describe('Codes dual-approval', () => {
  it('Controller proposes, QMS approves', () => {
    // Controller proposes
    cy.visit('/login')
    cy.get('input#email').type('controller@example.com')
    cy.get('input#password').type('x')
    cy.get('select#role').select('DocumentController')
    cy.contains('button','Continue').click()
    cy.visit('/controller/codes')
    cy.contains('Companies').click()
    cy.get('input[placeholder^="Code"]').clear().type('NEW')
    cy.get('input[placeholder="Label"]').type('New Label')
    cy.contains('button','Propose').click()
    cy.contains('Proposals').click()
    cy.contains('NEW')

    // QMS approves
    cy.visit('/login')
    cy.get('input#email').type('qms@example.com')
    cy.get('input#password').type('x')
    cy.get('select#role').select('QMS')
    cy.contains('button','Continue').click()
    cy.visit('/controller/codes')
    cy.contains('Proposals').click()
    cy.contains('NEW').parent().parent().find('button').contains('Approve').click()
  })
})

