Cypress.Commands.add('login', (username, password) => {
    cy.visit('/login')
    cy.get('[type="text"]').type(username) 
    cy.get('[type="password"]').type(password)
    cy.get('.button').click()
  })