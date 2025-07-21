// cypress/e2e/cadastro.cy.js

describe('Fluxo de Cadastro de Usuário', () => {
  it('deve permitir que um novo usuário se cadastre com sucesso e veja as mensagens de confirmação', () => {
    // Passo 1: Estar na página inicial
    cy.visit('/');

    // Passo 2: Clicar no botão "Criar conta" na página inicial
    // cy.contains() encontra um elemento que contém o texto especificado.
    // É ótimo para botões, links e títulos.
    cy.contains('button', 'Criar conta').click();

    // Cypress espera automaticamente a página carregar após o clique.
    // Assumimos que a URL mudou para a página de cadastro.
    // cy.url().should('include', '/cadastro'); // Descomente se quiser verificar a URL

    // Passo 3 a 6: Preencher o formulário de cadastro
    // cy.get() com seletor de atributo é perfeito para encontrar campos sem ID.
    cy.get('input[placeholder="Digite seu nome"]').type('Jose Silva');
    cy.get('input[placeholder="Digite seu email"]').type('josessilva1@gmail.com');
    cy.get('input[placeholder="Crie uma senha"]').type('senhaboa');
    cy.get('input[placeholder="Confirme sua senha"]').type('senhaboa');

    // --- MANIPULANDO OS POP-UPS ---
    // Cypress "ouve" os eventos da janela antes que eles aconteçam.

    // Passo 8 (Parte 1): Preparar para o primeiro popup (confirm)
    // Usamos cy.on() para escutar o evento 'window:confirm'
    /* cy.on('window:alert', (str) => {
      // 'str' é o texto dentro do popup. Aqui fazemos nossa verificação.
      expect(str).to.equal('Sign up with: josessilva1@gmail.com');
      // Por padrão, Cypress clica em "OK". Se precisasse clicar em "Cancelar",
      // você retornaria 'false' desta função.
    }); */

    // Passo 8 (Parte 2): Preparar para o segundo popup (alert)
    // Escutamos o evento 'window:alert' para o segundo popup.
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Cadastro realizado com sucesso!');
    });

    // Passo 7: Clicar no botão "Criar conta" do formulário para submeter
    // O comando de clique aqui irá disparar os eventos que preparamos acima.
    cy.contains('button', 'Criar conta').click();

    // O teste terminará com sucesso se todos os passos, incluindo
    // as verificações dos popups, forem executados sem erro.
  });
});