describe('Login', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('Deve retornar email ou senha invalidos num alert', () => {
        cy.on('window:alert', (str) => {
            expect(str).to.equal('Email ou senha inválidos');
        });

        cy.contains('button', 'Criar conta').click();
    });

    it('Deve retornar Login realizado com sucesso! no alert', () => {
        cy.get('input[placeholder="Digite seu email"]').type('josessilva1@gmail.com');
        cy.get('input[placeholder="Digite sua senha"]').type('senhaboa');

        cy.on('window:alert', (str) => {
            expect(str).to.equal('Login realizado com sucesso!');
        });

        cy.contains('button', 'Entrar').click();
    });

    // Add more tests as needed
});