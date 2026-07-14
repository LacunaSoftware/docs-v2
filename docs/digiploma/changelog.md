---
sidebar_label: "Changelog"
sidebar_position: 3
---

# Histórico de versões do Digiploma

:::note
Este histórico por ora contém informações apenas sobre as atualizações mais recentes ao sistema. Estamos
trabalhando para documentar as versões mais antigas.
:::


### 3.1.3 (2025-12-19) {#v3-1-3}

* Correções de bugs
    * [AUT-481] Filtro de data não funciona na listagem de diplomas

Atualiza modelo do banco de dados: não

### 3.1.2 (2025-11-10) {#v3-1-2}

* Correções de bugs
    * [AUT-480] Erro ao gerar relatório em ambientes linux

Atualiza modelo do banco de dados: não

### 3.1.1 (2025-11-10) {#v3-1-1}

* Correções de bugs
    * [AUT-478] Corrigir tela de acesso restrito
    * [AUT-479] Ao adicionar usuário aparece mensagem de usuário não encontrado

Atualiza modelo do banco de dados: não

### 3.1.0 (2025-11-06) {#v3-1-0}

* Melhorias
    * [AUT-477] Mascarar CPF na validação pública de Diplomas e Históricos

Atualiza modelo do banco de dados: não

### 3.0.0 (2025-10-17) {#v3-0-0}

* Melhorias
    * [AUT-467] Adicionar filtro por EntityTypes ao buscar a lista de eventos por EntityId
    * [AUT-474] Atualização para SPA 4
    * [AUT-476] Atualização para NET 8 e SPA 6

* Correções de bugs
    * [AUT-475] Não é possível chamar API de lista de cancelamento

Atualiza modelo do banco de dados: sim

:::warning
Antes de atualizar para esta versão, garanta que sua licença suporta versões do PKI SDK lançadas até 2025-08-03.
:::


### 2.29.0 (2025-07-31) {#v2-29-0}

* Melhorias
    * [AUT-473] Suporte a novas políticas da ICP Brasil

Atualiza modelo do banco de dados: não

### 2.28.0 (2025-03-13) {#v2-28-0}

* Melhorias
    * [AUT-452] Permitir assinatura dos documentos auxiliares no Assinador
    * [AUT-453] Gerar relatórios dos arquivos de Fiscalização e Diplomas Anulados
    * [AUT-454] Relatório do histórico
    * [AUT-455] Obter datas do JSON na pré-visualização do diploma

* Correções de bugs
    * [AUT-456] É apresentado o nome do aluno invés do nome social nas demais páginas da representação visual do histórico escolar
    * [AUT-457] Ordem incorreta dos elementos em LivroRegistro quando instituição é NSF

Atualiza modelo do banco de dados: sim

### 2.27.3 (2024-12-26) {#v2-27-3}

* Melhorias
    * [AUT-444] Adicionar campos de nome da habilitação e ênfase nas APIs de detalhes do diploma

### 2.27.2 (2024-12-12) {#v2-27-2}

* Melhorias
    * [AUT-450] Permitir que o código de validação seja preenchido pela IES Registradora nas Emissões
    * [AUT-451] Corrigir valores nas enums de TConceito

### 2.27.1 (2024-12-11) {#v2-27-1}

* Correções de bugs
    * [AUT-447] Retorno vazio nas tags da IES quando a Renovação de Recredenciamento está em tramitação
    * [AUT-449] Erro ao criar histórico escolar com modelo já existente

### 2.27.0 (2024-11-21) {#v2-27-0}

* Correções de bugs
    * [AUT-292] Complemento não preenchido gera tag vazia no XML
    * [AUT-437] Ordenação das fases do currículo
    * [AUT-439] Histórico escolar e currículos ainda sendo buscados no Signer após renotarização

* Melhorias
    * [AUT-435] Configuração no RVHE para o novo formato da carteira de identidade
    * [AUT-445] Adicionar o ID da organização no envio de webhook
    * [AUT-446] Enviar webhook de documento criado
* Novas funcionalidades
    * [AUT-442] Adicionar botão de pré-visualização da representação visual nos detalhes da emissão

### 2.26.2 (2024-10-20) {#v2-26-2}

* Novas funcionalidades
    * [AUT-440] Configuração de instância para desabilitar os webhooks das renotarizações


### 2.26.1 (2024-10-17) {#v2-26-1}

* Correções de bugs
    * [AUT-438] Erro ao baixar o diploma após renotarização

### 2.26.0 (2024-10-16) {#v2-26-0}

* Novas funcionalidades
    * [AUT-72] Implementar a recarimbação dos documentos para longa duração

### 2.25.2 (2024-08-14) {#v2-25-2}

* Correções de bugs
    * [AUT-430] Não é exibido o nome do aluno em todas as páginas do RVHE

* Melhorias
    * [AUT-431] Permitir certificados A1 nas assinaturas dos históricos escolares parciais
    * [AUT-432] Remover espaços presente no código de validação 

### 2.25.1 (2024-08-09) {#v2-25-1}

* Correções de bugs
    * [AUT-429] Não é possível enviar modelo de Histórico Escolar ou Currículo


### 2.25.0 (2024-08-06) {#v2-25-0}

* Correções de bugs
    * [AUT-422] A API de validação de documentos permite acesso sem captcha

* Melhorias
    * [AUT-423] Pré-visualização do RVDD e RVHE no momento de emissão do Diploma
    * [AUT-425] Disparo de WebHook das ações da registradora para emissora

* Novas funcionalidades
    * [AUT-428] API para envio de textos para a representação visual do diploma

### 2.24.1 (2024-07-08) {#v2-24-1}

* Correções de bugs
    * [AUT-424] Não é possível adicionar docente em diploma de segunda via
    * [AUT-427] Não é possível anular diploma emitido com registradora credenciada

* Melhorias
    * [AUT-426] Mostrar Reconhecimento do curso no RVHE quando tiver Renovação

### 2.24.0 (2024-06-17) {#v2-24-0}

* Melhorias
    * [AUT-421] Permitir a alteração dos títulos de cada tabela do RVHE e RVCE

* Novas funcionalidades
    * [AUT-416] Exportar o diploma para arquivo JSON
    * [AUT-418] Permitir o pre-posicionamento do QR Code no RVDD

### 2.23.2 (2024-05-27) {#v2-23-2}

* Correções de bugs
    * [AUT-420] Formulário de filiação não aparece para diplomas de segunda via

* Novas funcionalidades
    * [AUT-419] API de representação visual em Base64

### 2.23.1 (2024-05-13) {#v2-23-1}

* Correções de bugs
    * [AUT-415] Mensagem de validação do histórico/currículo não está aparecendo

### 2.23.0 (2024-04-30) {#v2-23-0}

* Correções de bugs
    * [AUT-409] Não é possível gerar o diploma devido a validação de aprovação de disciplina

* Melhorias
    * [AUT-410] Adicionar propagação de valores na criação do histórico escolar
    * [AUT-413] Adicionar o nome social do aluno nas APIs necessárias

* Novas funcionalidades
    * [AUT-411] Adicionar envio de webhook em emissões por integração ou com registradora credenciada
    * [AUT-412] Criar tag para utilizar CPF ou RG ou outro documento de acordo com a nacionalidade

### 2.22.0 (2024-04-12) {#v2-22-0}

* Correções de bugs
    * [AUT-408] Corrigir valor incorreto dos valores de Conceito

* Novas funcionalidades
    * [AUT-374] API para restaurar status da Emissão
    * [AUT-406] Utilizar o nome social na representação visual do histórico escolar

### 2.21.3 (2024-04-04) {#v2-21-3}

* Correções de bugs
    * [AUT-407] Documentação comprobatória gerando erro de má requisição

### 2.21.2 (2024-04-01) {#v2-21-2}

* Correções de bugs
    * [AUT-403] Título conferido incorreto no RVDD quando outro título foi preenchido
    * [AUT-404] Propriedades do tipo enum aceitam valores não presentes na enum

* Melhorias
    * [AUT-400] Adicionar possibilidade de gerar histórico de diplomas já criados/emitidos
    

### 2.21.1 (2024-03-18) {#v2-21-1}

* Melhorias
    * [AUT-402] Adicionar casas decimais ao RVHE

* Novas funcionalidades
    * [AUT-401] Adicionar campo de informações adicionais ao histórico durante a criação de diploma

### 2.21.0 (2024-03-06) {#v2-21-0}

* Melhorias
    * [AUT-394] Melhorar tela de Eventos
    * [AUT-399] Melhorar a conversão das classes do diploma

### 2.20.2 (2024-03-05) {#v2-20-2}

* Melhorias
    * [AUT-397] Definir valor para data e hora de emissão do histórico quando nulos
    * [AUT-398] Permitir quebra de linha nas informações adicionais  utilizando pipe no no RVHE e RVCE

### 2.20.1 (2024-03-04) {#v2-20-1}

* Correções de bugs
    * [AUT-396] Valor incorreto dos números decimais 

### 2.20.0 (2024-02-26) {#v2-20-0}

* Correções de bugs
    * [AUT-242] Permitir que o template do histórico escolar utilize TAGs 
    * [AUT-387] Adicionar validações para os campos do livro de registro
    * [AUT-388] Validar o XML de acordo com o XSD antes da sua criação
    * [AUT-392] Adicionar informações adicionais ao final do RVHE

* Melhorias
    * [AUT-389] Código dos elementos históricos não estão sendo validados no formulário
    * [AUT-390] Notas com mais de duas casas decimais
    * [AUT-391] Validação da estrutura através do XSD retornando campos em branco
    * [AUT-393] Texto por cima do outro na tela de revisão de diploma

### 2.19.1 (2023-12-23) {#v2-19-1}

* Correções de bugs
    * [AUT-254] Adicionar validação de quantidade de páginas para RVDD de Diplomas
    * [AUT-383] Apagar os arquivos salvos do formulário após 24h apenas
    * [AUT-384] Melhorar campo de pesquisar

* Melhorias
    * [AUT-385] O endereço da IES não é preenchido na IES Emissora e Mantenedora do Histórico Escolar
    * [AUT-386] Não aparece os campos de Autorização e Reconhecimento no formulário

### 2.19.0 (2023-12-12) {#v2-19-0}

* Correções de bugs
    * [AUT-378] Não é possível editar as informações da instituição

* Melhorias
    * [AUT-188] Visualização do termo de responsabilidade na revisão de requisição de registro
    * [AUT-379] Melhorar query que busca instituições para gerar lista de diplomas anulados
    * [AUT-380] Criação de novas tag para a representação visual do diploma

* Novas funcionalidades
    * [AUT-324] Salvar o progresso do formulário
    * [AUT-381] Adicionar o tema yby
    * [AUT-382] Adicionar validação no código dos elementos históricos

### 2.18.0 (2023-12-12) {#v2-18-0}

* Correções de bugs
    * [AUT-377] Não é possível criar registro por decisão judicial com XML sem documentação comprobatória

* Melhorias
    * [AUT-376] Melhorar a conversão de string nas requisições para remover tab e quebra de linha

* Novas funcionalidades
    * [AUT-169] Validar XML de acordo com o XSD

### 2.17.0 (2023-10-09) {#v2-17-0}

* Correções de bugs
    * [AUT-371] Nome e código de atividade complementar duplicado no RVCE
    * [AUT-372] Erro ao tentar converter senha do certificado quando possui caracteres especiais

* Melhorias
    * [AUT-219] Adicionar possibilidade de gerar histórico de diplomas já criados/emitidos

* Novas funcionalidades
    * [AUT-370] Adicionar validação ao trocar de página no formulário 
    * [AUT-373] Criar API para alterar representação visual do currículo escolar

### 2.16.0 (2023-09-27) {#v2-16-0}

* Correções de bugs
    * [AUT-296] Documentos duplicados no Assinador quando ocorre erro ao persistir o histórico escolar
    * [AUT-365] Texto incorreto no Recredencimanto da IES na tela de validação quando está em tramitação
    * [AUT-367] Não é possível criar currículo por API
    * [AUT-368] Areas é um elemento opcional, mas é sempre utilizado na representação visual do Currículo

* Melhorias
    * [AUT-364] Permitir que registros pulem a etapa de validação das assinaturas
    * [AUT-369] Adicionar novos motivos de anulação nos webhooks

* Novas funcionalidades
    * [AUT-357] Permitir o envio do registro na emissão após mudança de versão
    * [AUT-362] API para alterar a representação visual do diploma e histórico escolar
    * [AUT-366] Validar CNPJ do certificado pertence a IES Emissora no momento do Registro

### 2.15.0 (2023-09-04) {#v2-15-0}

* Melhorias
    * [AUT-186] Mover data ingresso e conclusão para o banco de dados para novos diplomas

* Novas funcionalidades
    * [AUT-316] Implementar o curriculo digital

### 2.14.0 (2023-08-28) {#v2-14-0}

* Correções de bugs
    * [AUT-358] Ao pesquisar pelo documento pressionando Enter, o botão de Apenas assinados é pressionado

* Melhorias
    * [AUT-359] Remover obrigatoriedade da propriedade RegistrationBookCode

### 2.13.1 (2023-08-08) {#v2-13-1}

* Correções de bugs
    * [AUT-355] Razão da anulação não é apresentado corretamente em tela

* Melhorias
    * [AUT-354] Ocultar configuração de NSF para organização Emissora
    * [AUT-360] Melhorar condições relacionadas ao diploma assinado

### 2.13.0 (2023-08-08) {#v2-13-0}

* Correções de bugs
    * [AUT-352] O Id do modelo do histórico escolar não é removido de emissões de segunda vida após finalizadas

* Melhorias
    * [AUT-160] Definir se IES segue o sistema federal separadamente
    * [AUT-338] Remover campos de data de colação, expedição e conclusão do RVHE quando não estiver formado
    * [AUT-347] Adicionar campo do motivo da anulação do registro
    * [AUT-348] Permitir o uso de certificado e-CPF para testes na Instituição em ambiente de homologação
    * [AUT-349] Melhorar busca da política de assinatura Xades para validação
    * [AUT-350] Melhorar a tag nacionalidade gênero para casos em que a nacionalidade esteja com caracteres maiúsculos
    * [AUT-351] Listar os diplomas assinados sem restrição de status ativo ou cancelado

### 2.12.1 (2023-07-17) {#v2-12-1}

* Melhorias
    * [AUT-343] Informar ao usuário que já existe instituição com aquele código ao cadastrar nova instituição
    * [AUT-345] Melhorar a forma de pegar a data de emissão e registro para fiscalização do tipo emissora

* Correções de bugs
    * [AUT-341] Informações da instituição não aparecem na tela ao editar as informações
    * [AUT-342] Formulário com campos condicionais não carrega ao alterar o tipo de instituição
    * [AUT-344] Tipo da instituição não é apresentado corretamente ao listá-las

### 2.12.0 (2023-07-13) {#v2-12-0}

* Novas funcionalidades
    * [AUT-273] Implementar diplomas anulados
    * [AUT-274] Implementar arquivos de fiscalização

### 2.11.2 (2023-07-05) {#v2-11-2}

* Correções de bugs
    * [AUT-340] Não é enviado webhook de conclusão de diploma

### 2.11.1 (2023-07-05) {#v2-11-1}

* Correções de bugs
    * [AUT-339] Não é possível anular registro após anularem o diploma no lado da Emissora

### 2.11.0 (2023-06-20) {#v2-11-0}

* Correções de bugs
  * [AUT-336] Erro ao gerar relatório por seleção

* Melhorias
  * [AUT-304] Atualizar a lista de dados necessários
  * [AUT-333] Remover validação da data de expedição para Histórico Escolar destacado

### 2.10.5 (2023-05-17) {#v2-10-5}

* Melhorias
  * [AUT-332] Criar tag referente aos campos de decisão judicial

### 2.10.4 (2023-05-12) {#v2-10-4}

* Correções de bugs
  * [AUT-320] Remover o Id do template do histórico de Emissões e Diplomas que forem cancelados
  * [AUT-334] Carga horária incorreta no RVHE

### 2.10.3 (2023-05-10) {#v2-10-3}

* Correções de bugs
  * [AUT-331] Erro de apresentação da avaliação em disciplina no formulário

* Melhorias
  * [AUT-330] Adicionar aviso de "Descartar mudanças" ao sair da página do formulário

### 2.10.2 (2023-05-08) {#v2-10-2}

* Correções de bugs
  * [AUT-328] Emissão manual não é enviado para registradora ao utilizar a opção de Registradora Credenciada
  * [AUT-329] Método para criar emissão unitária não salva o fluxo de assinaturas

### 2.10.1 (2023-05-05) {#v2-10-1}

* Correções de bugs
  * [AUT-325] Ausência de campos no formulário na etapa Elementos do histórico
  * [AUT-326] Remover obrigatoriedade do template na Emissão manual
  * [AUT-327] Erro habilitar ou desabilitar ato regulatório 

### 2.10.0 (2023-05-03) {#v2-10-0}

* Correções de bugs
  * [AUT-321] Exibição incorreta da naturalidade quando informada através do elemento `NomeMunicipioEstrangeiro`

* Novas funcionalidades
  * [AUT-174] Criação de tela para preenchimento dos dados dos alunos
  * [AUT-300] Permitir envio de XML após mudança de versão

### 2.9.5 (2023-04-18) {#v2-9-5}

* Correções de bugs
  * [AUT-318] Corrigir validação do campo de selecionar a versão na criação da emissão

### 2.9.4 (2023-04-17) {#v2-9-4}

* Melhorias
  * [AUT-317] Atualizar versão do pacote da API do Signer

### 2.9.3 (2023-04-03) {#v2-9-3}

* Melhorias
  * [AUT-314] Validar a data de expedição de acordo com a versão

### 2.9.2 (2023-03-21) {#v2-9-2}

* Correções de bugs
  * [AUT-313] Versão errada do diploma ao criar diploma na versão anterior

### 2.9.1 (2023-03-20) {#v2-9-1}

* Correções de bugs
  * [AUT-312] Erro ao enviar documentação de forma manual para a instância da versão anterior

### 2.9.0 (2023-03-17) {#v2-9-0}

* Novas funcionalidades
  * [AUT-305] Permitir que a aplicação aceite a versão do diploma a ser emitido

### 2.8.2 (2023-03-13) {#v2-8-2}

* Correções de bugs
  * [AUT-308] Corrigir ordem das informações da Concedente do Estágio
  * [AUT-310] Não é enviado e-mail quando o XML de dados públicos é enviado para o Assinador

* Melhorias
  * [AUT-306] Corrigir data do início da vigência da versão do diploma
  * [AUT-307] Corrigir JSON de template do histórico escolar
  * [AUT-311] Implementar o reenvio de Webhook para Histórico Escolar

* Novas funcionalidades
  * [AUT-309] Criar tag preposição com gênero na naturalidade dos estados no RVDD

### 2.8.1 (2023-02-27) {#v2-8-1}

* Correções de bugs
  * [AUT-303] JSON de emissão sem documentação comprobatória não é validado corretamente

* Melhorias
  * [AUT-301] Tornar opcional o campo ProcessoDoDiploma em LivroRegistro
  * [AUT-302] Informações do ato regulatório não está aparecendo no RVHE

* Novas funcionalidades
  * [AUT-299] Criar tag de Ênfase no RVDD

### 2.8.0 (2023-02-14) {#v2-8-0}

* Correções de bugs
  * [AUT-298] Corrigir erros identificados na versão 1.05 em homologação

* Novas funcionalidades
  * [AUT-270] Atualizar Diploma Digital para a versão 1.05
  * [AUT-271] Atualizar Documentação Acadêmica para a versão 1.05
  * [AUT-272] Atualizar Histórico Escolar para a versão 1.05

### 2.7.0 (2023-01-19) {#v2-7-0}

* Correções de bugs
  * [AUT-293] Erro ao gerar RVHE para Disciplina com Aprovação nula
  * [AUT-295] Data de publicação no RVHE incorreta

* Melhorias
  * [AUT-294] Adicionar validação se data de expedição está na vigência da versão atual
  * [AUT-297] Atualizar framework para .NET 6

* Novas funcionalidades
  * [AUT-291] Implementar a anulação temporária para histórico escolar

### 2.6.0 (2022-12-21) {#v2-6-0}

* Correções de bugs
  * [AUT-290] Erro ao gerar histórico escolar de emissão anterior a melhoria de informações faltantes

* Melhorias
  * [AUT-284] Relatório de documentos no SysAdmin
  * [AUT-285] Emissões de histórico no relatório
  * [AUT-288] Adicionar coluna Forma de Integralização da disciplina no RVHE
  * [AUT-289] Refatorar a validação do elemento Assinantes

### 2.5.0 (2022-12-12) {#v2-5-0}

* Correções de bugs
  * [AUT-279] Erro quando não é informado ato regulatório para instituição que não pertence ao sistema federal
  * [AUT-281] Elemento de informações adicionais é adicionado com valor vazio utilizando CSV

* Melhorias
  * [AUT-227] Melhorar validação do código de verificação no momento de registro
  * [AUT-275] Reconhecimento dos dados do Curso não deve ser obrigatório para histórico escolar
  * [AUT-278] Remover obrigatoriedade da nota das disciplinas
  * [AUT-280] Incluir a data de publicação do D.O.U nas informações de reconhecimento de curso no RVHE
  * [AUT-282] Criar checkbox para desabilitar validação das assinaturas

* Novas funcionalidades
  * [AUT-264] Criar status "Aguardando aceitação" para organização Registradora
  * [AUT-286] Criar tag para informar apenas a data da habilitação no RVDD

### 2.4.1 (2022-11-16) {#v2-4-1}

* Correções de bugs
  * [AUT-207] Adicionar DataRegistro e Descricao de Atividade complementar no CSV
  * [AUT-263] Arquivos da documentação comprobatória não são salvos para Doc. Acadêmica NSF
  * [AUT-265] Erro na validação do campo Assinantes
  * [AUT-268] Alterar o tipo da resposta da API de cancelamento da Lyceum

* Melhorias
  * [AUT-261] Criar API para listar histórico escolares de um lote

### 2.4.0 (2022-11-08) {#v2-4-0}

* Correções de bugs
  * [AUT-231] Não é possível utilizar a opção "Nova Pasta" ao registrar diplomas
  * [AUT-247] Tipo da situação atual do discente não é preenchida no XML do Histórico
  * [AUT-250] O texto de rodapé do RVHE está por cima das informações dos elementos históricos
  * [AUT-255] Hora de emissão no RVHE está em GMT
  * [AUT-256] Registro não é concluído caso já exista Histórico Escolar do mesmo aluno na IES Emissora
  * [AUT-258] Não é retornado Nonce em Doc. Academica NSF

* Melhorias
  * [AUT-226] Adicionar geração de histórico escolar no gerador
  * [AUT-237] Gerar XMLs codificados em UTF-8
  * [AUT-240] Adicionar nos testes possibilidade de gerar lista de tags do RVDD
  * [AUT-241] Implementar nos testes possibilidade de gerar RVDD de Documentação Acadêmica
  * [AUT-243] Adicionar informações faltantes ao RVHE
  * [AUT-248] Remover coluna Pendente da representação visual do Histórico Escolar
  * [AUT-249] Página de detalhes do modelo encaminhando para página errada ao clicar em "Gerar Diplomas"
  * [AUT-257] Retirar texto "Ministerial" para Portaria nos atos regulatórios
  * [AUT-260] Melhorar a lista de modelos na criação de diplomas ou históricos
  * [AUT-262] Alterar endpoint de cancelamento da Lyceum

* Novas funcionalidades
  * [AUT-252] Criar API para gerar RVHE novamente
  * [AUT-253] Erro ao gerar histórico escolar com diploma utilizando lote de diplomas por CSV

### 2.3.1 (2022-10-06) {#v2-3-1}

* Correções de bugs
  * [AUT-236] Tela de revisão não carrega quando a situação é não habilitado no Enade
  * [AUT-234] Não é possível gerar RVHE caso exista Estágio sem concedente

* Melhorias
  * [AUT-101] Tratar o caso do diploma ter sido excluido no signer ao anular diploma

* Novas funcionalidades
  * [AUT-239] Criar tag que retorne de forma dinâmica o documento de identificação juntamente com o tipo
  * [AUT-238] Criar tag para retornar texto tipo de ato regulatório em tramitação

Atualiza modelo do banco de dados: não

### 2.3.0 (2022-10-01) {#v2-3-0}

* Correções de bugs
  * [AUT-210] Conversão para dados mínimos da mantenedora não verifica se valor é nulo

* Melhorias
  * [AUT-233] Verificar se emissão possui informações sobre histórico escolar
  * [AUT-228] Permitir apenas que diplomas de 1º via gerem histórico automaticamente
  * [AUT-222] Unificar código que lança erro referente ao tipo esperado de template
  * [AUT-221] Adicionar validações referentes ao template do histórico
  * [AUT-218] Adicionar rota do histórico como filha da rota de detalhes do diploma

* Novas funcionalidades
  * [AUT-230] Gerar XMLs sem espaços e quebras de linha
  * [AUT-229] Criar API para criar histórico de forma unitária
  * [AUT-225] Validar o fluxo enviado quando criar um diploma pela API
  * [AUT-220] Adicionar documentação do histórico e novos webhooks ao Swagger
  * [AUT-217] Criar constante com mensagem de cancelamento automático para registro
  * [AUT-200] Permitir que diplomas de Emissoras com Lyceum sejam registrados por Integração
  * [AUT-195] Implementar o XML de Histórico Escolar

Atualiza modelo do banco de dados: sim

### 2.2.6 (2022-09-20) {#v2-2-6}

* Novas funcionalidades
  * [AUT-214] Criar API para reenviar webhooks

Atualiza modelo do banco de dados: não

### 2.2.5 (2022-09-15) {#v2-2-5}

* Correções de bugs
  * [AUT-213] A aplicação está permitindo a criação de diploma com HoraAula com valor 0
  * [AUT-212] Não é apresentado erro quando é enviado Enade sem Edição
  * [AUT-211] Tela de revisão não carrega caso possua estágio sem concedente

* Melhorias
  * [AUT-209] Remover referência a template ao anular Emissão
  * [AUT-198] Validar se XML da documentação acadêmica está assinado

Atualiza modelo do banco de dados: não

### 2.2.4 (2022-09-12) {#v2-2-4}

* Correções de bugs
  * [AUT-208] Remover obrigatoriedade da documentação comprobatória em diplomas de segunda via

Atualiza modelo do banco de dados: não

### 2.2.3 (2022-09-06) {#v2-2-3}

* Melhorias
  * [AUT-197] Melhorar a usabilidade no preenchimento das informações da IES Registradora

Atualiza modelo do banco de dados: não

### 2.2.2 (2022-08-30) {#v2-2-2}

* Correções de bugs
  * [AUT-206] Tela de revisão não carrega quando não existe Termo de Responsabilidade

Atualiza modelo do banco de dados: não

### 2.2.1 (2022-08-30) {#v2-2-1}

* Correções de bugs
  * [AUT-204] Data de publicação duplicada

Atualiza modelo do banco de dados: não

### 2.2.0 (2022-08-25) {#v2-2-0}

* Correções de bugs
  * [AUT-201] Mensagem de erro ao enviar "Psicólogo" em OutroTitulo

* Novas funcionalidades
  * [AUT-189] Relatório de diplomas por período

Atualiza modelo do banco de dados: não

### 2.1.2 (2022-08-10) {#v2-1-2}

* Correções de bugs
  * [AUT-181] Datas 01/01/0001 estão sendo permitidas pelo sistema

* Melhorias
  * [AUT-184] Não permitir assinatura de diplomas sem assinatura de e-CPF
  * [AUT-177] Melhorar a validação de textos que iniciam com espaço

* Novas funcionalidades
  * [AUT-76] Personalizar página de validação por organização

Atualiza modelo do banco de dados: não

### 2.1.1 (2022-04-28) {#v2-1-1}

* Correções de bugs
  * [AUT-178] Erro na escrita por extenso de alguns estados

* Melhorias
  * [AUT-180] Atualizar a condicional do texto de Naturalidade
  * [AUT-167] Melhorar a leitura de JSON com campos vazios

Atualiza modelo do banco de dados: não

### 2.0.0 (2022-04-04) {#v2-0-0}

* Correções de bugs
  * [AUT-150] Botão de envio desabilitado ao tentar enviar documentação

* Melhorias
  * [AUT-173] Criação de tag para data de colação por extenso
  * [AUT-164] Especificar CultureInfo em conversões de data para string
  * [AUT-162] Atualizar os campos informados na tela de validação
  * [AUT-152] Adicionar coluna de IES Emissora na tela da registradora
  * [AUT-151] Botão "Ir para assinador" somente para Administrador e Gerente
  * [AUT-149] Melhorar opção de deletar documento carregado
  * [AUT-146] "Não gerar" na lista de RVDD como última opção
  * [AUT-145] Esclarecer texto do campo para definir assinatura de PJ no fluxo

* Novas funcionalidades
  * [AUT-147] Pré-visualização dos documentos enviados
  * [AUT-134] Criação de Parcerias na administração de subscription
  * [AUT-133] Diferenciar lote por tipo
  * [AUT-132] Revisão de registro
  * [AUT-130] Listagem de Registros
  * [AUT-129] Permitir configurar dados da registradora
  * [AUT-128] Configurações de Integração de Emissora e Registradora
  * [AUT-127] Tela de listagem e criação de Emissões
  * [AUT-126] Permitir separar organizações por tipo
  * [AUT-125] Permitir separar tipos de fluxo por tipo

Atualiza modelo do banco de dados: sim

### 1.14.0 (2022-04-07) {#v1-14-0}

* Correções de bugs
  * [AUT-166] Seção não é retornada quando a Pagina não possui informação

* Melhorias
  * [AUT-171] Criar tag para texto relacionado ao processo de tramitação

* Novas funcionalidades
  * [AUT-176] Permitir atualização de RVDD de vários diplomas
  * [AUT-163] Tag de Segunda Via no RVDD

Atualiza modelo do banco de dados: não

### 1.13.1 (2022-02-23) {#v1-13-1}

* Melhorias
  * [AUT-161] Caractere pipe como quebra de linha na tag de Informação Adicional

Atualiza modelo do banco de dados: não

### 1.13.0 (2022-02-14) {#v1-13-0}

* Correções de bugs
  * [AUT-156] Obrigatoriedade indevida de campos na emissão de 2ª via
  * [AUT-154] Habilitação não é retornada no RVDD ao enviar mais de um nome

* Melhorias
  * [AUT-155] Permitir o uso de outras tags no Caminho de Validação

Atualiza modelo do banco de dados: não

### 1.12.0 (2022-01-26) {#v1-12-0}

* Correções de bugs
  * [AUT-143] Versão do diploma errada ao enviar webhook
  * [AUT-142] Erro de validação em regex do numero do ato

* Melhorias
  * [AUT-141] Permitir ter URLs com caminhos na URL base do modelo
  * [AUT-140] Criar novas chaves para o RVDD
  * [AUT-139] Melhorar mensagem de erro ao não preencher um campo uint como número processo da informacoesTramitacaoEmec

Atualiza modelo do banco de dados: não

### 1.11.1 (2022-01-18) {#v1-11-1}

* Correções de bugs
  * [AUT-138] Erro ao recuperar informações da documentação de registro

* Melhorias
  * [AUT-137] Novas chaves para data no RVDD e nova coluna na Pré-Visualização do aluno

Atualiza modelo do banco de dados: não

### 1.11.0 (2021-11-30) {#v1-11-0}

* Melhorias
  * [AUT-120] Adequações para versão 1.03 do XSD
  * [AUT-121] CPF do diplomado mascarado na tela de validação

Atualiza modelo do banco de dados: não

:::warning
Breaking changes da API:
TituloConferido: o valor "Psicólogo" não pode ser utilizado na propriedade "outroTitulo", já que foi adicionado à enum Titulo.
DisciplinaCursada: adicionada nova propriedade obrigatória "situacao" (SituacaoDisciplina).
"tipoAvaliacao" passa ser opcional e teve os valores "Aprovado" e "Reprovado" movidos para propriedade "situacao". Foram adicionados os valores "ConceitoRM" e "ConceitoEspecificoDoCurso".
:::


### 1.10.0 (2021-11-11) {#v1-10-0}

* Melhorias
  * [AUT-114] Anulação definitiva de diplomas

Atualiza modelo do banco de dados: não

### 1.9.2 (2021-11-05) {#v1-9-2}

* Correções de bugs
  * [AUT-118] Chave NacionalidadeGenero faz flexão de gênero apenas se a nacionalidade informada no diploma estiver no masculino
  * [AUT-117] Mensagens de erro de RG, Outro documento de identificação, naturalidade e Situação ENADE não exibem o caminho correto
  * [AUT-116] Termo responsabilidade não deveria ser obrigatório
  * [AUT-115] Erro ao gerar diploma sem livro registro
  * [AUT-113] Correções das chaves para geração de RVDD

Atualiza modelo do banco de dados: não

### 1.9.1 (2021-10-21) {#v1-9-1}

* Correções de bugs
  * [AUT-112] Recredenciamento está como obrigatório na IES Emissora

Atualiza modelo do banco de dados: não

### 1.9.0 (2021-10-20) {#v1-9-0}

* Novas funcionalidades
  * [AUT-111] Novos condicionais e flexões de gênero

* Correções de bugs
  * [AUT-110] Erro ao enviar diploma com enums sem acento
  * [AUT-109] Erro ao gerar diploma sem Autorizacao, Reconhecimento e Renovação
  * [AUT-108] Dados do reconhecimento estão sendo exibidos como sendo da renovação de reconhecimento

Atualiza modelo do banco de dados: não

### 1.8.0 (2021-10-13) {#v1-8-0}

* Novas funcionalidades
  * [AUT-106] Adicionar upload de novo arquivo no modelo para impressão em papel timbrado

Atualiza modelo do banco de dados: sim

### 1.7.0 (2021-10-01) {#v1-7-0}

* Novas funcionalidades
  * [AUT-103] Adicionar filtro por status e data na listagem de diplomas

* Melhorias
  * [AUT-104] Adicionar nova chave para fazer flexão de gênero do titulo conferido ao estudante
  * [AUT-100] Aceitar flow id na API de criação de diplomas

* Correções de bugs
  * [AUT-105] Tela de validação apresenta erros caso o diploma não esteja válido

Atualiza modelo do banco de dados: não

### 1.6.0 (2021-09-17) {#v1-6-0}

* Novas funcionalidades
  * [AUT-95] Download em lote dos documentos de Diploma
  * [AUT-26] Captcha de proteção para consulta pública

* Melhorias
  * [AUT-93] Assinatura de diploma com requisitos de certificados

Atualiza modelo do banco de dados: não
