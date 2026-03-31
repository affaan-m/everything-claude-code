# Sistema de Hooks

## Tipos de Hook

- **PreToolUse**: Antes da execução da ferramenta (validação, modificação de parâmetros)
- **PostToolUse**: Após a execução da ferramenta (auto-formatação, verificações)
- **Stop**: Quando a sessão termina (verificação final)

## Permissões de Auto-Aceite

Use com cautela:
- Habilite para planos confiáveis e bem definidos
- Desabilite para trabalho exploratório
- Nunca use a flag dangerously-skip-permissions
- Configure `allowedTools` em `~/.claude.json` em vez disso

## Melhores Práticas para TodoWrite

Use a ferramenta TodoWrite para:
- Rastrear progresso em tarefas com múltiplos passos
- Verificar compreensão das instruções
- Habilitar direcionamento em tempo real
- Mostrar etapas de implementação granulares

A lista de tarefas revela:
- Etapas fora de ordem
- Itens faltando
- Itens extras desnecessários
- Granularidade incorreta
- Requisitos mal interpretados
