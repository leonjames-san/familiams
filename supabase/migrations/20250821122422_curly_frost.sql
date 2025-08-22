/*
  # Atualizar nomes da família Santos

  1. Alterações
    - Alterar "Família Silva" para "Família Santos"
    - Roberto Silva → Leon James
    - Maria Silva → Hosana Santos  
    - Ana & João Silva → Linus & Luna
    - Atualizar todos os textos e referências
*/

-- Atualizar nomes dos vendedores da família
UPDATE sellers 
SET name = 'Leon James',
    email = 'leon.james@familasantos.com'
WHERE name = 'Roberto Silva';

UPDATE sellers 
SET name = 'Hosana Santos',
    email = 'hosana.santos@familasantos.com'
WHERE name = 'Maria Silva';

UPDATE sellers 
SET name = 'Linus & Luna',
    email = 'linus.luna@familasantos.com'
WHERE name = 'Ana & João Silva';