export const mockRequests = () => {
    cy.intercept('POST', '**/login', { statusCode: 500 }).as('serverError')
}