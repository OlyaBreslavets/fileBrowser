describe('WorkingWithFilesTests', function () {

    beforeEach(function () {
        cy.intercept('GET', '**/resources/').as('resources');
        cy.intercept('GET', '**/usage/', {fixture: 'usage.json'}).as('usage');
        cy.intercept('POST', '**/login').as('login');
        
        cy.login('breslavets','1')
    })

    function waitingForRequests() {
        cy.wait('@login')
        cy.wait('@usage')
        cy.wait('@resources')
    }

    it("SelectedFile", () => {
        waitingForRequests()
        
        cy.get('[aria-label="breslavets"]').should('have.not.attr', 'aria-selected')

        cy.get('[aria-label="Переименовать"]').should('not.exist')
        cy.get('#copy-button').should('not.exist')
        cy.get('#move-button').should('not.exist')
        cy.get('#delete-button').should('not.exist')

        cy.get('[aria-label="breslavets"]').click()

        cy.get('[aria-label="breslavets"]').should('have.attr', 'aria-selected', 'true')

        cy.get('[aria-label="Переименовать"]').should('exist')
        cy.get('#copy-button').should('exist')
        cy.get('#move-button').should('exist')
        cy.get('#delete-button').should('exist')
    })

    it("ChangeView", () => { 
        cy.intercept('PUT', '**/users/3').as("view")

        waitingForRequests()

        for (let i = 0; i < 3; i++) {
            cy.get('[aria-label="Вид"] > .material-icons'). click()
            
            cy.get('[aria-label="Вид"] > .material-icons').then(el => {

                if (el.text() == 'view_module') {    

                    cy.get('#listing').should('have.class', 'list file-icons')

                    cy.wait('@view').its('request.body').should('include', 'list')
                }
                if (el.text() == 'grid_view') {    

                    cy.get('#listing').should('have.class', 'mosaic file-icons')

                    cy.wait('@view').its('request.body').should('include', 'mosaic')
                }
                if (el.text() == 'view_list') {    

                    cy.get('#listing').should('have.class', 'mosaic gallery file-icons')

                    cy.wait('@view').its('request.body').should('include', 'mosaic gallery')
                }
            })
        }
    })

    it("RenameFile", () => {
        cy.intercept('PATCH', '**/breslavets?action=rename**', { statusCode: 200 }).as('rename');

        waitingForRequests()

        cy.get('[aria-label="breslavets"]').click()

        cy.get('[aria-label="Переименовать"]').click()

        cy.get('.input').clear().type('test')

        cy.get('[type="submit"]').click()

        cy.wait('@rename').its('request.url').should('include', 'destination=%2Ftest')
            .and('include', 'rename=false')
        cy.wait('@resources')
    })

    it("CopyFile", () => {
        cy.intercept('PATCH', '**/resources/breslavets?action=copy**', { statusCode: 200 }).as('copy');

        waitingForRequests()

        cy.get('[aria-label="breslavets"]').click()

        cy.get('#copy-button').click()

        cy.get('[aria-label="Копировать"]').click()

        cy.wait('@copy').its('request.url').should('include', 'destination=%2Fbreslavets')
            .and('include', 'rename=true')
        cy.wait('@resources')
    })

    it("MoveFileInNewDirectory", () => {
        cy.intercept('POST', '**/resources/new/**').as('new')
        cy.intercept('PATCH','**/resources/breslavets?action=rename**', { statusCode: 200 }).as('move')

        waitingForRequests()

        cy.get('[aria-label="Новый каталог"]').click()

        cy.get('.input').type('new')

        cy.get('[aria-label="Создать"]').click()

        cy.wait('@new')

        cy.visit('/files/')

        cy.get('[aria-label="breslavets"]').click()

        cy.get('#move-button').click()

        cy.get('li').click()

        cy.get('[aria-label="Переместить"]').click()

        cy.wait('@move').its('request.url').should('include', 'destination=%2Fnew%2Fbreslavets')
            .and('include', 'rename=false')
        cy.wait('@resources')

        cy.visit('/files/')

        cy.get(':nth-child(3) > .item').click()

        cy.get('#delete-button').click()

        cy.get('.button--red').click()

        cy.get(':nth-child(3) > .item').should('not.exist')
    })

    it("DeleteFile", () => {
        cy.intercept('DELETE', '**/resources/breslavets', { statusCode: 200 }).as('delete');

        waitingForRequests()

        cy.get('[aria-label="breslavets"]').click()

        cy.get('#delete-button').click()

        cy.get('.button--red').click()

        cy.wait('@delete').its('response.statusCode').should('eq', 200)
        cy.wait('@resources')
    })
})