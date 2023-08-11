import { mockRequests } from "./mock"

context('AuthorizationTests', function () {

    beforeEach(function () {
        mockRequests()

        cy.intercept('POST', '**/login').as('login')

        cy.visit('/')

    })

    it("PositiveAuthorizationTest", () => {
        cy.login('admin','admin')

        cy.wait('@login').its('response.statusCode').should('eq', 200)

        cy.url().should('include', 'http://51.250.1.158:49153/files/')
    })

    it("NegativeAuthorizationTest (incorrect login)", () => {
        cy.login('dev','admin')

        cy.wait('@login').its('response.statusCode').should('eq', 403)

        cy.get('.wrong').should('include.text', 'Неверные данные')
    })

    it("NegativeAuthorizationTest (incorrect password)", () => {
        cy.login('admin','dev')

        cy.wait('@login').its('response.statusCode').should('eq', 403)

        cy.get('.wrong').should('include.text', 'Неверные данные')
    })

    it("NegativeAuthorizationTest (incorrect login, password)", () => {
        cy.login('dev','dev')

        cy.wait('@login').its('response.statusCode').should('eq', 403)

        cy.get('.wrong').should('include.text', 'Неверные данные')
    })

    it("NegativeAuthorizationTest (login is empty)", () => {
        cy.get('[type="text"]').focus().blur()
        cy.get('[type="password"]').type('admin')
        cy.get('.button').click()

        cy.wait('@login').its('response.statusCode').should('eq', 403)

        cy.get('.wrong').should('include.text', 'Неверные данные')
    })

    it("NegativeAuthorizationTest (password is empty)", () => {
        cy.get('[type="text"]').type('admin')
        cy.get('[type="password"]').focus().blur()
        cy.get('.button').click()

        cy.wait('@login').its('response.statusCode').should('eq', 403)

        cy.get('.wrong').should('include.text', 'Неверные данные')
    })
    
    it("NegativeAuthorizationTest (login and password are empty)", () => {
        cy.get('[type="text"]').focus().blur()
        cy.get('[type="password"]').focus().blur()
        cy.get('.button').click()

        cy.wait('@login').its('response.statusCode').should('eq', 403)

        cy.get('.wrong').should('include.text', 'Неверные данные')
    })

    it.only("AuthorizationTest (statuscode 500)", () => {
        cy.login('admin','admin')

        cy.wait('@serverError').its('response.statusCode').should('eq', 500)

        cy.get('.wrong').should('include.text', 'Неверные данные')
    })
}
)
