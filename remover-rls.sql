-- Desativar RLS
alter table produtos disable row level security;

-- Remover políticas de segurança
drop policy if exists "Somente o dono vê seus produtos" on produtos;
drop policy if exists "Somente o dono pode inserir" on produtos;
drop policy if exists "Somente o dono pode deletar" on produtos;

-- Remover coluna user_id
alter table produtos drop column if exists user_id;