---
sidebar_label: "Licenciamento"
sidebar_position: 1.5
description: "Como adquirir, ativar, atualizar e usar as licenças dos produtos da Lacuna Software: Web PKI, Rest PKI, Rest PKI Core, PKI SDK, PKI Express, Signer e Bulk Signer."
---

# Licenciamento dos produtos Lacuna

Esta página reúne, em um só lugar, o que é preciso para **adquirir, ativar, atualizar e usar** as licenças dos
produtos da Lacuna Software. O conteúdo foi compilado a partir da documentação de cada produto, que continua sendo a
referência detalhada: a seção de cada produto termina com os links para os artigos de origem.

:::tip Você é usuário final?
Se você apenas usa um site ou sistema que pede o Web PKI para assinar documentos ou fazer login com certificado
digital, **não precisa comprar nem configurar nenhuma licença**. A licença é de quem desenvolve e mantém o site.
Veja [Para usuários finais](#usuario-final).
:::

## Resumo por produto {#resumo}

| Produto e cenário | Precisa de licença? | O que é usado |
|---|---|---|
| [Web PKI](#web-pki) em aplicação no *localhost* (desenvolvimento) | Não | — |
| [Web PKI](#web-pki) com o Rest PKI em nuvem (`https://pki.rest`) | Não, inclusive em produção | — |
| [Web PKI](#web-pki) nos demais casos, fora do *localhost* | Sim | Licença do Web PKI, informada no JavaScript da página |
| [Rest PKI](#rest-pki) em nuvem | Não usa arquivo de licença | Conta em `pki.rest` e token de acesso |
| [Rest PKI](#rest-pki) *on-premises* | Sim | Licença do PKI SDK (arquivo `LacunaPkiLicense.txt`) |
| [Rest PKI Core](#rest-pki-core) em nuvem (`core.pki.rest`) | Não usa arquivo de licença | Endpoint e chave de API, fornecidos pelo suporte |
| [Rest PKI Core](#rest-pki-core) *on-premises* | Sim | Licença do PKI SDK (obrigatória) e licença do Web PKI (para assinatura no navegador) |
| [PKI SDK](#pki-sdk) | Sim | Licença do PKI SDK (arquivo `LacunaPKILicense.config` ou texto em Base64) |
| [PKI Express](#pki-express) | Sim | Arquivo `LacunaPkiLicense.config`, usado para ativar o PKI Express na máquina |
| [Signer](#signer) *on-premises* | Sim | Licença do PKI SDK e licença do Web PKI |
| [Bulk Signer](#bulk-signer) | Sim | Licença do PKI SDK (texto em Base64) |
| [Usuário final](#usuario-final) de um site ou sistema | Não | — |

## Entendendo as licenças {#conceitos}

Os produtos desta página usam uma ou mais destas licenças:

- **Licença do PKI SDK**: licença da biblioteca .NET da Lacuna. Ela é usada diretamente pelas aplicações que usam o
  [PKI SDK](#pki-sdk) e também é exigida na instalação *on-premises* do [Rest PKI](#rest-pki), do
  [Rest PKI Core](#rest-pki-core), do [Signer](#signer) e do [Bulk Signer](#bulk-signer). É entregue como arquivo
  (`LacunaPKILicense.config` ou, no Rest PKI *on-premises*, `LacunaPkiLicense.txt`) ou como texto em Base64. Uma
  licença do PKI SDK pode ter uso restrito ao Rest PKI.
- **Licença do Web PKI**: autoriza o uso do componente de navegador nos domínios de um site. É informada pelo
  desenvolvedor no código JavaScript da página e, nas instalações *on-premises* do Rest PKI Core e do Signer, também
  na configuração do servidor.
- **Licença do PKI Express**: arquivo `LacunaPkiLicense.config`, usado para ativar o PKI Express na máquina onde ele
  está instalado.

Os serviços em nuvem não usam arquivo de licença: o acesso é feito com credenciais da sua conta, como o **token de
acesso** do Rest PKI e a **chave de API** do Rest PKI Core. Essas credenciais não substituem a licença do Web PKI nos
cenários em que ela é necessária (veja [Quando a licença do Web PKI é necessária](#web-pki-quando)).

:::info O que significa "atualizar a versão da licença"
Na prática, é uma destas situações:

1. **A licença venceu, vai vencer ou precisa cobrir algo novo**, como um novo domínio no Web PKI. Você recebe uma
   nova licença e troca o valor configurado.
2. **Você vai atualizar a versão de um produto *on-premises*.** A licença do PKI SDK aceita apenas versões do SDK
   lançadas até uma certa data. Por isso, antes de atualizar o Signer ou o Rest PKI Core, confira no histórico de
   versões se a sua licença cobre a versão de destino. Se não cobrir, peça uma licença atualizada antes de atualizar.

O [passo a passo para atualizar uma licença](#atualizar) vale para os dois casos.
:::

## Como adquirir uma licença {#adquirir}

| Produto | Como solicitar |
|---|---|
| PKI SDK | Licença de *trial* gratuita pelo site pki.lacunasoftware.com |
| Web PKI | Pelo [Fale conosco](https://www.lacunasoftware.com/pt/home/purchase) ou pelo e-mail [suporte@lacunasoftware.com](mailto:suporte@lacunasoftware.com), informando os *hostnames* ou URLs onde o componente será usado. As licenças do PKI SDK geralmente já vêm acompanhadas de uma licença do Web PKI |
| PKI Express | Licença para testes pelo [Fale conosco](https://www.lacunasoftware.com/pt/home/purchase) |
| Rest PKI *on-premises* | Licença de teste pelo [Fale conosco](https://www.lacunasoftware.com/pt/home/purchase) |
| Rest PKI Core e Signer *on-premises* | Usam as licenças do PKI SDK e do Web PKI (linhas acima) |
| Bulk Signer | A Lacuna fornece a licença (texto em Base64) junto com as credenciais de acesso ao produto |
| Rest PKI em nuvem | Crie uma conta em [pki.rest](https://pki.rest/) e gere um token de acesso no **Painel de Controle**. Veja os [preços](https://www.lacunasoftware.com/pt-br/pricing/#cloud-simulator) |
| Rest PKI Core em nuvem | Peça o endpoint e a chave de API ao [suporte ao desenvolvedor](mailto:suporte@lacunasoftware.com) |

Ao solicitar, recomendamos informar:

- o produto e o ambiente em que a licença será usada (produção, homologação ou testes);
- no caso do **Web PKI**, os *hostnames* ou URLs de produção e de homologação. As faixas de IP privado já vêm
  liberadas para homologação (veja [Uso em IPs internos](../web-pki/licensing.md#uso-em-ips-internos));
- se a licença é para **atualizar a versão** de um produto *on-premises*, a versão que você pretende instalar.

## Passo a passo para atualizar uma licença {#atualizar}

1. **Identifique a licença e onde ela está configurada**, usando a tabela abaixo. Um mesmo produto pode usar mais de
   uma licença: o Signer, por exemplo, usa a do PKI SDK e a do Web PKI.
2. **Se a troca acompanha uma atualização de versão**, consulte o histórico de versões (*changelog*) do produto entre
   a versão atual e a de destino. Procure avisos como *"garanta que sua licença suporta versões do PKI SDK lançadas
   até AAAA-MM-DD"*.
3. **Obtenha a nova licença** pelos canais de [Como adquirir uma licença](#adquirir).
4. **Substitua o valor inteiro**, no mesmo lugar onde a licença antiga está configurada. Licenças em Base64 devem ser
   coladas completas, em uma única linha. A licença JSON do Web PKI deve ser usada inteira.
5. **Reinicie a aplicação ou o serviço** nos produtos que leem a licença na inicialização (PKI SDK, Rest PKI Core,
   Signer e Bulk Signer). No Rest PKI *on-premises*, a troca é feita pela tela de administração.
6. **Confirme que a nova licença foi carregada**, com a verificação indicada para o produto.

| Produto | Onde a licença fica | Como confirmar |
|---|---|---|
| [Web PKI](#web-pki-atualizar) | JavaScript da página: `new LacunaWebPKI(licença)` ou parâmetro `license` do `init()` | Nenhum erro de licença no componente. No formato JSON, confira `expiration` e os domínios |
| [Rest PKI *on-premises*](#rest-pki-trocar) | **Administração** > **Status do sistema** > **SDK license loaded** | A mesma tela mostra o licenciado e a data de expiração |
| [Rest PKI Core *on-premises*](#rest-pki-core-trocar) | Arquivo de configuração ou variáveis de ambiente (no Azure, `PkiSuite__SdkLicense` e `PkiSuite__WebLicense`) | O serviço volta a responder em `/api/system/info` (que mostra só a versão, não os dados da licença); teste uma assinatura |
| [PKI SDK](#pki-sdk-atualizar) | `LacunaPKILicense.config`, `Web.config`/`App.config` ou `PkiConfig.LoadLicense` | `PkiInfo.License` (licenciado e expiração) |
| [PKI Express](#pki-express-atualizar) | Ativação da máquina (`pkie activate` ou `pkiemgr.exe`) | Comandos executados sem os códigos de erro de ativação e licença (17 a 21) |
| [Signer *on-premises*](#signer-trocar) | Seção `PkiSuite` (`SdkLicense` e `WebLicense`) | A partir da 2.2.0, licença do PKI SDK inválida impede a inicialização: confira `/api/system/info`. Para a do Web PKI, teste uma assinatura no navegador |
| [Bulk Signer](#bulk-signer-trocar) | `Signing__PkiSdkLicense` (ou `Signing:PkiSdkLicense`) | Impressão digital da licença no *banner* de inicialização e no painel |

## Web PKI {#web-pki}

O [Web PKI](../web-pki/index.md) é o componente que permite a um site usar os certificados digitais do computador do
usuário. A licença do Web PKI é **do site**: ela vale para os domínios da aplicação e é configurada pelo
desenvolvedor, no código da página.

### Quando a licença é necessária {#web-pki-quando}

A licença **não** é necessária:

- para testar em uma aplicação rodando no *localhost* (qualquer porta);
- quando o Web PKI é usado com o **Rest PKI em nuvem** (`https://pki.rest`), inclusive em produção.

Nos demais casos fora do *localhost*, a licença é necessária. Isso inclui:

- aplicações que usam o Web PKI com o [PKI SDK](#pki-sdk), o [PKI Express](#pki-express) ou qualquer outro
  *backend* (as licenças do PKI SDK geralmente já vêm acompanhadas de uma licença do Web PKI);
- aplicações que usam uma [instância *on-premises* do Rest PKI](#rest-pki-on-premises), ou seja, um Rest PKI
  diferente de `https://pki.rest`. Nesse caso, informe também a URL da instância em `restPkiUrl`;
- aplicações que usam o [Rest PKI Core](#rest-pki-core), inclusive em nuvem (`core.pki.rest`): a dispensa vale
  apenas para o Rest PKI em nuvem (`https://pki.rest`).

A licença do Web PKI também entra na configuração do servidor de produtos *on-premises*: no
[Signer](#signer-licencas), ela consta como obrigatória nas instalações em Linux e Azure; no
[Rest PKI Core](#rest-pki-core-licencas), ela é necessária quando os usuários assinam no navegador via Web PKI.

**Homologação:** as licenças são emitidas permitindo uso em caráter de homologação em qualquer IP privado
(`10.x.x.x`, `127.x.x.x`, `172.16.0.0` a `172.31.255.255` e `192.168.x.x`). Domínios de homologação, como
`staging.patorum.com`, ficam no campo `homologDomains` da licença.

### Formatos da licença {#web-pki-formatos}

Você recebe a licença em dois formatos equivalentes:

```javascript
// Licença binária
var webPkiLicense = 'ASYAanNma...Q==';

// Licença JSON
var webPkiLicense = {
  "format": 1,
  "allowedDomains": [
    "www.patorum.com"
  ],
  "homologDomains": [
    "staging.patorum.com",
    "ip4:10.0.0.0/8",
    "ip4:127.0.0.0/8",
    "ip4:172.16.0.0/12",
    "ip4:192.168.0.0/16"
  ],
  "productLevel": "Standard",
  "expiration": null,
  "signature": "LzdT1cgp...w=="
};
```

- O formato **binário** esconde os detalhes da licença. Eles não ficam cifrados, apenas codificados em Base64.
- O formato **JSON** deixa os detalhes legíveis, o que facilita o diagnóstico de problemas como uma licença expirada.
- Nas configurações de servidor do Rest PKI Core e do Signer, use a licença **binária**.

:::warning
O campo `signature` da licença JSON não funciona sozinho como licença. Use a licença binária inteira ou a licença
JSON inteira: qualquer tentativa de usar só uma parte da licença faz o componente rejeitá-la.
:::

### Como configurar {#web-pki-configurar}

Passe a licença no construtor da classe `LacunaWebPKI`:

```javascript
var pki = new LacunaWebPKI('ASYAanNma...Q==');  // ou o objeto JSON completo
pki.init({
    ready: onWebPkiReady
});
```

A licença também pode ser informada no parâmetro `license` do método `init()`, caso não tenha sido passada no
construtor. Com um Rest PKI diferente de `https://pki.rest`, informe também a URL da instância:

```javascript
var pki = new LacunaWebPKI('ASYAanNma...Q==');
pki.init({
    restPkiUrl: 'https://YourRestPKI.com/',
    ready: onWebPkiReady
});
```

### Como atualizar a licença {#web-pki-atualizar}

1. Solicite a nova licença pelo e-mail [suporte@lacunasoftware.com](mailto:suporte@lacunasoftware.com) ou pelo
   [Fale conosco](https://www.lacunasoftware.com/pt/home/purchase) (por vencimento ou para incluir um domínio, por
   exemplo), informando os *hostnames* ou URLs de produção e de homologação.
2. Substitua a licença antiga pela nova **no mesmo lugar** em que ela é informada: no construtor
   `new LacunaWebPKI(...)`, no parâmetro `license` do `init()` ou, na
   [substituição do ICPBravoAccess](../web-pki/icpbravo-replacement.md), em `window.lacunaWebPkiLicense`. Troque a
   licença inteira.
3. Publique a página e teste nos domínios de homologação e de produção.
4. Se a licença do Web PKI também estiver configurada em um produto *on-premises*, troque-a lá:
   [Rest PKI Core](#rest-pki-core-trocar) e [Signer](#signer-trocar).

:::note
Não confunda a licença com a versão do componente. O Web PKI é atualizado automaticamente nos computadores dos
usuários, e a biblioteca JavaScript (`lacuna-web-pki-{version}.js`) deve ser atualizada pelo desenvolvedor. Veja
[Atualizações do Web PKI](../web-pki/update.md).
:::

### Erros de licença {#web-pki-erros}

Quando há um problema com a licença, o componente retorna um destes códigos de erro
([`LacunaWebPKI.ErrorCodes`](pathname:///content/typedocs/web-pki/enums/_lacuna_web_pki_d_.lacunawebpki.errorcodes.html)):

| Código | Significado |
|---|---|
| `license_not_set` | A licença é necessária e não foi configurada |
| `license_invalid` | A licença informada não é válida |
| `license_restricted` | A licença não permite o comando solicitado |
| `license_expired` | A licença expirou |
| `license_domain_not_allowed` | A licença não permite o domínio em uso |

**Artigos de origem:** [Licenciamento do Web PKI](../web-pki/licensing.md) ·
[Primeiros passos](../web-pki/get-started.md) ·
[Especificando a URL do Rest PKI](../web-pki/customizing-restpki-url.md) ·
[Atualizações](../web-pki/update.md)

## Rest PKI {#rest-pki}

:::note Rest PKI e Rest PKI Core são produtos diferentes
Cada um tem a sua documentação, a sua nuvem (`pki.rest` e `core.pki.rest`) e a sua forma de acesso. Esta seção trata
do [Rest PKI](../rest-pki/index.md). O Rest PKI Core tem [seção própria](#rest-pki-core).
:::

### Rest PKI em nuvem {#rest-pki-nuvem}

O Rest PKI em nuvem não usa arquivo de licença. O acesso é feito com um **token de acesso** da sua conta:

1. Autentique-se no site do Rest PKI ([pki.rest](https://pki.rest/)).
2. No **Painel de Controle**, clique em **Gerar novo token de acesso** e copie o valor gerado.
3. Configure o token na sua aplicação (nos projetos de exemplo, no arquivo de configuração, como o `web.config`).
   Nas chamadas HTTP diretas, como as de carimbo de tempo, envie-o no header `Authorization: Bearer <token de acesso>`.

A resposta **401 Unauthorized** indica que o token informado não é válido. Com o Rest PKI em nuvem, o Web PKI não
precisa de licença, inclusive em produção.

### Rest PKI *on-premises* {#rest-pki-on-premises}

Uma instância *on-premises* do Rest PKI, em Windows Server ou Azure App Service, exige uma **licença do Lacuna PKI
SDK**, solicitada durante a instalação. Desde a versão 1.5.0, o Rest PKI também aceita licenças do PKI SDK de uso
restrito ao Rest PKI. Para instalar, você precisa de:

- o pacote de binários do Rest PKI;
- a licença binária do PKI SDK (arquivo `LacunaPkiLicense.txt`). Se ainda não tiver uma,
  [solicite uma licença de teste](https://www.lacunasoftware.com/pt/home/purchase).

No Windows Server, a instalação segue o capítulo 2 do
[Manual de instalação](https://cdn.lacunasoftware.com/restpki/restpki-admin-guide-pt.pdf). No Azure App Service, com o
pacote e a licença em mãos, [entre em contato](https://www.lacunasoftware.com/pt/home/purchase) para obter as
instruções de instalação.

Se a sua aplicação usa o Web PKI com a instância *on-premises*, configure também a **licença do Web PKI** e a URL da
instância (veja [Como configurar o Web PKI](#web-pki-configurar)).

A partir da versão 1.14.0, o painel do Rest PKI exibe um aviso quando a licença do PKI SDK está próxima do vencimento.
A versão 1.12.0 corrigiu um erro que ocorria ao alterar a licença do PKI SDK; em instâncias mais antigas, considere
atualizar antes de trocar a licença.

### Como trocar a licença {#rest-pki-trocar}

1. Autentique-se como administrador na sua instância do Rest PKI. Se não souber a senha, veja
   [Recuperação de senha de admin](../rest-pki/on-premises/admin-recover.md).
2. No menu superior, clique em **Administração** > **Status do sistema**.
3. No item **SDK license loaded**, clique no botão **Alterar**.
4. No arquivo `LacunaPkiLicense.txt`, localize a licença binária do PKI SDK, na seção
   *Binary license content (Base64-encoded)*:
   ```
   Binary license content (Base64-encoded)
   ---------------------------------------

   AxAA........................................iw==
   ```
5. Copie e cole **a linha inteira** e clique no botão **Configurar licença**.

![Item SDK license loaded na tela de status do sistema do Rest PKI](/images/rest-pki/sdk-license.png)

A mesma tela mostra o licenciado e a data de expiração da licença carregada.

**Artigos de origem:** [Alterando a licença de uso](../rest-pki/on-premises/change-license.md) ·
[Rest PKI *on premises*](../rest-pki/on-premises/index.md) ·
[Instalação em Windows Server](../rest-pki/on-premises/windows-setup/index.md) ·
[Instalação em Azure App Service](../rest-pki/on-premises/azure-setup.md) ·
[Solicitando carimbos de tempo](../rest-pki/requesting-timestamps.md)

## Rest PKI Core {#rest-pki-core}

O [Rest PKI Core](../rest-pki-core/index.md) pode ser usado em nuvem (SaaS), no endereço
[core.pki.rest](https://core.pki.rest/), ou em uma instância própria (*on-premises*).

### Rest PKI Core em nuvem {#rest-pki-core-saas}

No SaaS, a aplicação não usa arquivo de licença. São necessários dois parâmetros, que devem ser solicitados ao
[suporte ao desenvolvedor](mailto:suporte@lacunasoftware.com):

- o **endpoint** da API;
- a **chave de API**.

Em ASP.NET Core, os dois ficam na seção `RestPki` do `appsettings.json` (chaves `Endpoint` e `ApiKey`). Chamando a
API diretamente, a chave de API vai no header `X-Api-Key` (nos endpoints de carimbo de tempo, use
`Authorization: ApiKey SUA_CHAVE_DE_API`; veja [Solicitando carimbos de tempo](../rest-pki-core/operation/requesting-timestamps.md)). A resposta **401** indica chave ausente ou inválida, e a
**403**, que a aplicação não tem permissão para a operação.

Se a sua aplicação usa o Web PKI com o Rest PKI Core, a licença do Web PKI é necessária: a dispensa vale apenas para o
Rest PKI em nuvem (`https://pki.rest`).

### Licenças da instância *on-premises* {#rest-pki-core-licencas}

Uma instância *on-premises* precisa de duas licenças:

- **licença do PKI SDK**, em Base64;
- **licença do Web PKI**, em formato binário (Base64).

| Plataforma | Onde as licenças são configuradas |
|---|---|
| [Windows Server](../rest-pki-core/on-premises/windows-server.md) | Arquivo `appsettings.ini` na pasta `C:\Program Data\Lacuna Software\Rest PKI Core` (não a cópia em `config-templates`) |
| [Linux (Ubuntu)](../rest-pki-core/on-premises/linux/install-ubuntu.md) | Arquivo `/etc/restpkicore/appsettings.conf` |
| [Docker](../rest-pki-core/on-premises/docker.md) | Variáveis de ambiente (arquivo de exemplo `restpkicore.env`) |
| [Azure App Services](../rest-pki-core/on-premises/azure/install.md) | *Configuration* do App Service: `PkiSuite__SdkLicense` e `PkiSuite__WebLicense` |

No Azure, a `PkiSuite__SdkLicense` é obrigatória, e a `PkiSuite__WebLicense` só é obrigatória se os usuários forem
assinar documentos com certificados em seus computadores (assinatura no navegador via Web PKI). Nas demais
plataformas, as duas licenças constam como pré-requisito da instalação. Para Rocky Linux, veja o
[artigo em inglês](/en-us/articles/rest-pki/core/on-premises/linux/install-rocky).

Nos arquivos de configuração (Windows, Linux e Docker), preencha as licenças seguindo as instruções do próprio arquivo
de modelo. Nas variáveis de ambiente, o nome é formado pela seção e pela configuração separadas por `__` (dois
*underscores*): a configuração `SdkLicense` da seção `PkiSuite`, por exemplo, vira `PkiSuite__SdkLicense`.

### Como trocar a licença {#rest-pki-core-trocar}

:::note
A documentação do Rest PKI Core não tem um artigo específico sobre troca de licença. Os passos abaixo seguem os
procedimentos de configuração e de reinício de cada plataforma.
:::

- **Linux**: edite `/etc/restpkicore/appsettings.conf`, substitua a licença e reinicie o serviço com
  `systemctl restart restpkicore`. Acompanhe os logs com `journalctl -u restpkicore -f`.
- **Windows Server**: edite o `appsettings.ini`, substitua a licença e reinicie o site no IIS (*Stop* e *Start*).
- **Docker**: altere a licença no arquivo de variáveis de ambiente (por exemplo, `restpkicore.env`). Como as
  variáveis são lidas na criação do contêiner, remova o contêiner atual (`docker rm -f restpkicore`) e crie-o
  novamente com o mesmo comando `docker run --name restpkicore --env-file restpkicore.env ...` da instalação.
  Confira os logs com `docker logs -f restpkicore`.
- **Azure App Services**: em *Configuration*, altere `PkiSuite__SdkLicense` e/ou `PkiSuite__WebLicense` e clique em
  **Save**.

Depois da troca, confira se a instância responde em `https://endereco-do-seu-restpki-core/api/system/info`.

### Antes de atualizar a versão {#rest-pki-core-versao}

Algumas versões exigem que a licença do PKI SDK suporte versões lançadas até uma certa data:

| Versão do Rest PKI Core | A licença do PKI SDK deve suportar versões lançadas até |
|---|---|
| [2.0.0 RC 8](../rest-pki-core/changelog.md#v2.0.0-rc08) | 2023-06-27 |
| [2.0.0 RC 7](../rest-pki-core/changelog.md#v2.0.0-rc07) | 2022-10-19 |

Antes de atualizar, consulte o [histórico de versões](../rest-pki-core/changelog.md) entre a sua versão e a de
destino. A versão instalada aparece em `/api/system/info` (veja
[Verificando a versão instalada](../rest-pki-core/on-premises/check-version.md)).

**Artigos de origem:** [Rest PKI Core](../rest-pki-core/index.md) ·
[Primeiros passos para integração](../rest-pki-core/integration/get-started.md) ·
[Ambientes *on premises*](../rest-pki-core/on-premises/index.md#platforms) ·
[Setup em Azure App Services](../rest-pki-core/on-premises/azure/install.md) ·
[Histórico de versões](../rest-pki-core/changelog.md)

## PKI SDK {#pki-sdk}

O [Lacuna PKI SDK](../pki-sdk/index.md) é uma biblioteca .NET, distribuída pelo NuGet (pacote `Lacuna.Pki`). Para
usá-lo, é necessário carregar a licença na inicialização da aplicação.

### Como obter a licença {#pki-sdk-obter}

Se você ainda não tem uma licença, entre em contato pelo site pki.lacunasoftware.com para obter uma licença de *trial*
gratuita. A licença pode ser usada em dois formatos:

- arquivo `LacunaPKILicense.config`;
- texto em Base64.

Se a sua aplicação faz assinatura no navegador, ela também usa o [Web PKI](#web-pki), que precisa de licença própria
fora do *localhost*. As licenças do PKI SDK geralmente já vêm acompanhadas de uma licença do Web PKI.

### Como carregar a licença {#pki-sdk-carregar}

Existem três formas. A recomendada depende do tipo de aplicação:

| Forma | Recomendada para |
|---|---|
| Arquivo `LacunaPKILicense.config` no diretório da DLL | Aplicações web |
| Chave no `Web.config` ou no `App.config` | — |
| Programaticamente, com `PkiConfig.LoadLicense` | Aplicações desktop |

**1. Arquivo no diretório da DLL.** O SDK procura automaticamente o arquivo `LacunaPKILicense.config` junto à
`Lacuna.Pki.dll`. Uma forma prática é incluir o arquivo no projeto com **Build Action** = **Content** e
**Copy to Output Directory** = **Copy Always**.

**2. `Web.config` ou `App.config`.** Na seção `appSettings`, informe o caminho do arquivo ou a licença em Base64:

```xml
<appSettings>
  <!-- Caminho do arquivo LacunaPKILicense.config -->
  <add key="LacunaPKI.LicensePath" value="[caminho do arquivo LacunaPKILicense.config]"/>

  <!-- ou a licença em Base64 -->
  <add key="LacunaPKI.BinaryLicense" value="[licença em Base64]"/>
</appSettings>
```

**3. Programaticamente.** No código de inicialização do site ou da aplicação, carregue a licença decodificada:

```csharp
byte[] binLicense = Convert.FromBase64String("[licença em Base64]");
PkiConfig.LoadLicense(binLicense);
```

Essa forma deixa a licença embutida no código-fonte, o que dificulta o vazamento para terceiros. Também existe
`PkiConfig.LoadLicense(string)`, que recebe o caminho do arquivo `.config`, mas ela não é recomendada para aplicações
desktop.

### Como atualizar a licença {#pki-sdk-atualizar}

:::note
A página de licenciamento do PKI SDK não descreve a troca de licença. Como a licença é carregada na inicialização, o
procedimento é substituí-la onde ela foi configurada e reiniciar a aplicação.
:::

1. Substitua a licença no mesmo lugar em que ela foi configurada: o arquivo `LacunaPKILicense.config`, a chave
   `LacunaPKI.LicensePath` ou `LacunaPKI.BinaryLicense`, ou o valor passado a `PkiConfig.LoadLicense`.
2. Se a licença está incluída no projeto ou embutida no código, recompile e publique a aplicação.
3. Reinicie a aplicação ou o site.
4. Para conferir a licença carregada, use a propriedade `PkiInfo.License` (classe
   [`PkiInfo`](/api/Lacuna.Pki.Util/PkiInfo)), que informa o licenciado (`Licensee`) e a data de expiração
   (`Expiration`).

Nos produtos *on-premises* que usam a licença do PKI SDK, a troca é feita na configuração de cada produto: veja
[Rest PKI](#rest-pki-trocar), [Rest PKI Core](#rest-pki-core-trocar), [Signer](#signer-trocar) e
[Bulk Signer](#bulk-signer-trocar).

### Licença e versões do SDK {#pki-sdk-versoes}

A licença do PKI SDK pode ter data de expiração (confira em `PkiInfo.License.Expiration`) e aceita apenas versões do
SDK lançadas até uma certa data. Por isso, os
produtos que usam o PKI SDK avisam, no histórico de versões, qual cobertura a licença precisa ter antes de uma
atualização (veja [Signer](#signer-versao) e [Rest PKI Core](#rest-pki-core-versao)).

**Artigos de origem:** [Licenciamento do PKI SDK](../pki-sdk/get-started/licensing.md) ·
[Acessando pacotes NuGet](../pki-sdk/get-started/nuget.md) ·
[Assinatura no browser](../pki-sdk/signatures/web-remote.md)

## PKI Express {#pki-express}

O [PKI Express](../pki-express/index.md) é instalado em Windows ou Linux e **precisa de uma licença**: o arquivo
`LacunaPkiLicense.config`, usado para ativar o PKI Express na máquina.

### Como obter a licença {#pki-express-obter}

[Fale conosco](https://www.lacunasoftware.com/pt/home/purchase) para obter uma licença para testes.

### Ativação no Windows {#pki-express-windows}

1. Instale o PKI Express com o instalador ou, sem permissões de administrador, com um dos pacotes zip (veja
   [Instalação em Windows](../pki-express/setup/windows.md)).
2. Abra a pasta de instalação e execute o **PKI Express Configuration Manager** (arquivo `pkiemgr.exe`). Não há
   atalho no menu Iniciar: é preciso navegar até a pasta.
3. Siga as instruções do aplicativo para ativar o PKI Express. No Windows, tanto a ativação pela rede quanto a manual
   são feitas por esse aplicativo.

### Ativação no Linux {#pki-express-linux}

Depois de instalar o pacote e configurar a pasta de logs (veja [Ubuntu ou Mint](../pki-express/setup/linux-ubuntu.md#install),
[Red Hat Enterprise Linux](../pki-express/setup/linux-rhel.md#install) ou
[CentOS, Oracle Linux ou Fedora](../pki-express/setup/linux-centos.md#install)), ative o PKI Express com o arquivo de
licença:

```sh
sudo pkie activate LacunaPkiLicense.config
```

Se a ativação automática falhar, faça a [ativação manual](#pki-express-manual).

### Ativação manual (Linux) {#pki-express-manual}

1. Gere o pedido de ativação:
   ```sh
   pkie activate LacunaPkiLicense.config --request
   ```
   Um arquivo chamado `pkie-activation-request.pem` é salvo na pasta atual.
2. Envie esse arquivo pela [Central de Suporte](http://lacuna.help).
3. Você receberá de volta o arquivo de ativação `pkie-activation.pem`. Copie-o para a pasta atual e execute:
   ```sh
   sudo pkie activate
   ```
   Ou, se preferir, informe o caminho do arquivo:
   ```sh
   sudo pkie activate --file /path/to/pkie-activation.pem
   ```

### Trocar a licença e atualizar a versão {#pki-express-atualizar}

:::note
A documentação do PKI Express não tem um artigo específico sobre troca de licença. Para aplicar uma nova licença,
refaça a ativação com o novo arquivo `LacunaPkiLicense.config`: no Linux, com
`sudo pkie activate LacunaPkiLicense.config` (ou pela [ativação manual](#pki-express-manual)); no Windows, pelo
`pkiemgr.exe`. A ativação manual com uma nova licença foi corrigida na versão
[1.6.2](../pki-express/changelog.md#v1-6-2); use essa versão ou superior.
:::

Atualizar a **versão** do PKI Express é outro procedimento:

- **Windows**: baixe a nova versão e execute o instalador (veja [Atualização](../pki-express/setup/windows.md#update)).
- **Linux**: baixe o novo pacote, apague o conteúdo da pasta de destino e extraia o novo pacote nela (veja
  Atualização em [Ubuntu ou Mint](../pki-express/setup/linux-ubuntu.md#update),
  [RHEL](../pki-express/setup/linux-rhel.md#update) ou
  [CentOS, Oracle Linux ou Fedora](../pki-express/setup/linux-centos.md#update)). Se estiver atualizando a partir de uma versão 1.0.x,
  refaça também a configuração da pasta de logs e a ativação.

### Códigos de retorno {#pki-express-codigos}

| Código | Nome | Significado |
|---|---|---|
| 17 | `NotActivated` | PKI Express não ativado |
| 18 | `ActivationError` | Falha na ativação do PKI Express |
| 19 | `BadLicense` | Base64 inválida (da licença de ativação) |
| 20 | `LicenseNeeded` | Nenhum arquivo de licença fornecido |
| 21 | `InvalidLicense` | Licença inválida |

**Artigos de origem:** [PKI Express](../pki-express/index.md) ·
[Instalação](../pki-express/setup/index.md) ·
[Ativação manual](../pki-express/setup/manual-activation.md) ·
[Códigos de retorno](../pki-express/return-codes.md)

## Signer {#signer}

Uma instância *on-premises* do [Signer](../signer/index.md) precisa de duas licenças:

- **licença do PKI SDK**, em Base64;
- **licença do Web PKI**, em formato binário (Base64).

### Onde as licenças são configuradas {#signer-licencas}

| Plataforma | Onde configurar |
|---|---|
| [Linux (Ubuntu)](../signer/on-premises/como-instalar/linux/install-ubuntu.md) | Arquivo `/etc/lacuna-signer/appsettings.linux.json`, seção `PkiSuite`: `SdkLicense` e `WebLicense` |
| [Azure App Services](../signer/on-premises/como-instalar/azure/index.md) | *Configuration* do App Service: `PKiSuite__SdkLicense` e `PKiSuite__WebLicense` |
| [Windows Server](/en-us/articles/signer/on-premises/windows) (artigo em inglês) | Arquivo `appsettings.iis.json`, seção `PkiSuite`: `SdkLicense` e `WebLicense` |
| [Docker](/en-us/articles/signer/on-premises/docker) (artigo em inglês) | Variáveis de ambiente `PkiSuite__SdkLicense` e `PkiSuite__WebLicense` |

Nas páginas de instalação em Linux e em Azure, as duas licenças são obrigatórias. Nos artigos de Windows Server e
Docker (em inglês), apenas a `SdkLicense` consta como obrigatória, e a `WebLicense` aparece como condicional. De
qualquer forma, a licença do Web PKI é necessária para a [assinatura embutida](#signer-embutida). A partir da versão 2.2.0, a
licença do PKI SDK é validada na inicialização: se ela não for válida, a inicialização é interrompida.

### Como trocar a licença {#signer-trocar}

:::note
A documentação do Signer não tem um artigo específico sobre troca de licença. Os passos abaixo seguem os
procedimentos de instalação e de atualização de cada plataforma.
:::

- **Linux**: edite `/etc/lacuna-signer/appsettings.linux.json`, substitua `SdkLicense` e/ou `WebLicense` na seção
  `PkiSuite` e reinicie o serviço com `systemctl restart lacuna-signer`. Confira com `systemctl status lacuna-signer`
  e acompanhe os logs com `journalctl -u lacuna-signer -f`.
- **Azure App Services**: em *Configuration*, altere `PKiSuite__SdkLicense` e/ou `PKiSuite__WebLicense` e clique em
  **Save**.
- **Windows Server**: pare o site no IIS, altere a seção `PkiSuite` do `appsettings.iis.json` e inicie o site
  novamente.
- **Docker**: altere as variáveis `PkiSuite__SdkLicense` e/ou `PkiSuite__WebLicense` e recrie o contêiner.

Depois da troca, confira se a instância responde em `/api/system/info` (no Linux, por exemplo,
`curl http://localhost:5001/api/system/info`).

### Antes de atualizar a versão do Signer {#signer-versao}

Algumas versões exigem que a licença do PKI SDK suporte versões do SDK lançadas até uma certa data. Confira o
[histórico de versões](../signer/changelog.md) entre a versão atual e a de destino:

| Versão do Signer | A licença deve suportar versões do PKI SDK lançadas |
|---|---|
| [2.2.0](../signer/changelog.md#v2-2-0) | até 2025-08-01 |
| [2.0.0](../signer/changelog.md#v2-0-0) | até 2025-05-20 |
| [1.72.0](../signer/changelog.md#v1-72-0) | até 2024-07-03 |
| [1.64.0](../signer/changelog.md#v1-64-0) | até 2023-09-27 |
| [1.61.0](../signer/changelog.md#v1-61-0) | até 2023-08-01 |
| [1.59.0](../signer/changelog.md#v1-59-0) | até 2023-06-28 |
| [1.58.0](../signer/changelog.md#v1-58-0) | até 2023-05-25 |
| [1.43.0](../signer/changelog.md#v1-43-0) | após 2022-04-29 |

Se a sua licença não cobre a data exigida, obtenha uma licença atualizada do PKI SDK antes de atualizar.

### Assinatura embutida {#signer-embutida}

Para usar a [assinatura embutida](../signer/apis/embedded-signature.md) (componente `LacunaSignerWidget`) em outra
aplicação, o Signer deve estar configurado com uma licença do Web PKI que tenha o domínio no qual o componente será
carregado. Para incluir um novo domínio, obtenha uma nova licença do Web PKI e troque-a conforme
[Como trocar a licença](#signer-trocar).

**Artigos de origem:** [Instalação em Ubuntu Server](../signer/on-premises/como-instalar/linux/install-ubuntu.md) ·
[Setup em Azure App Services](../signer/on-premises/como-instalar/azure/index.md) ·
[Atualização em Linux](../signer/on-premises/como-instalar/linux/update.md) ·
[Histórico de versões](../signer/changelog.md)

## Bulk Signer {#bulk-signer}

O [Bulk Signer](../bulk-signer/index.md) usa uma única licença: a **licença do Lacuna PKI SDK**, um texto em Base64
fornecido pela Lacuna Software. Ela é obrigatória: sem ela, o serviço não inicia.

### Como obter {#bulk-signer-obter}

A Lacuna entrega três itens, que não são intercambiáveis:

- as credenciais do *registry* (usuário e token de acesso), para baixar a imagem de contêiner;
- um identificador único, usado nas URLs de download dos binários;
- a licença do PKI SDK, que libera o serviço em execução.

Como a licença é apenas um texto, e não um download, ela também funciona em servidores isolados da rede.

### Onde configurar {#bulk-signer-configurar}

A forma preferida é a variável de ambiente `Signing__PkiSdkLicense`. Também é possível usar a chave
`Signing:PkiSdkLicense` no `appsettings.Production.json`, desde que o arquivo esteja fora do controle de versão e
com acesso restrito à conta de serviço. A variável é preferida porque mantém a licença fora da árvore de arquivos, e
ela tem precedência na inicialização.

| Alvo | Onde definir `Signing__PkiSdkLicense` | Como aplicar |
|---|---|---|
| Linux (systemd) | Arquivo `/etc/bulksigner/bulksigner.env` (modo `0640`, dono `bulksigner`) | `sudo systemctl restart bulksigner` |
| Windows (serviço) | Variável de ambiente de escopo de máquina | `Restart-Service LacunaBulkSigner` |
| Docker / Compose | Arquivo `deploy/docker/.env` | `docker compose up -d` |
| Azure App Service | *App settings*, como referência ao Key Vault | Veja [Azure App Service](../bulk-signer/azure.md) |

No Windows, defina a variável em um PowerShell com privilégios elevados:

```powershell
[Environment]::SetEnvironmentVariable("Signing__PkiSdkLicense", "<licença-base64>", "Machine")
Restart-Service LacunaBulkSigner
```

:::warning Atualizando a partir da 1.0.x
Na versão 1.0.x, a chave se chamava `Signing:License` (`Signing__License`). Ela foi renomeada na 1.1.0 e o nome
antigo não é mais lido: uma instalação atualizada que ainda usa o nome antigo falha na inicialização com
`Signing:PkiSdkLicense is required`. Renomeie a chave durante a atualização.
:::

### Como trocar a licença {#bulk-signer-trocar}

1. Anote a impressão digital da licença atual: linha `pki license` do *banner* de inicialização, ou página
   **Sistema** (`/system`) do painel, campo **Impressão digital da licença**.
2. Substitua o valor de `Signing__PkiSdkLicense` no local indicado para o seu alvo (tabela acima). Se você usa
   `Signing:PkiSdkLicense` no `appsettings.Production.json`, verifique se não há uma variável de ambiente antiga
   definida, porque ela tem precedência.
3. Reinicie o serviço.
4. Confira se a impressão digital da licença mudou e se o endpoint `/api/ready` não aponta falha na verificação
   `license`.

### Diagnóstico {#bulk-signer-diagnostico}

- **`Signing:PkiSdkLicense is required`**: nem a variável de ambiente nem a configuração têm valor. Defina a variável
  no alvo e reinicie o serviço.
- **`/api/ready` retorna 503 com falha na verificação `license`**: a licença não foi carregada. Se a impressão
  digital não aparece no *banner*, a licença foi rejeitada na inicialização.

**Artigos de origem:** [Instalação](../bulk-signer/installation.md) ·
[Configuração](../bulk-signer/configuration.md) ·
[Segurança](../bulk-signer/security.md) ·
[Resolução de problemas](../bulk-signer/troubleshooting.md)

## Para usuários finais {#usuario-final}

Esta seção é para quem usa um site ou sistema que pede o **Web PKI**, a extensão de navegador da Lacuna, para assinar
documentos ou fazer login com certificado digital.

### Preciso comprar ou configurar uma licença? {#usuario-final-licenca}

Não. Quando o Web PKI exige licença, ela é do site: vale para os domínios do site e é configurada por quem o
desenvolve, no código da página (sites que usam o Rest PKI em nuvem nem precisam dela). Quem apenas instala a extensão para usar o site não compra nem configura licença.

Se o site exibir um erro de licença do Web PKI (por exemplo, licença expirada ou domínio não permitido), o problema
está na configuração do site. Informe a empresa responsável por ele.

### Certificado digital: quem emite? {#usuario-final-certificado}

O Web PKI não emite certificados digitais. Ele permite que o site use um certificado que você já tem, seja um
certificado A1, instalado no computador, seja um A3, em um dispositivo criptográfico como token ou cartão.

Certificados ICP-Brasil são adquiridos de uma Autoridade Certificadora (AC) credenciada, que consta na
[lista oficial do ITI](https://www.gov.br/iti/pt-br/assuntos/icp-brasil/entidades-icp-brasil). Dúvidas sobre compra,
validade ou renovação do certificado devem ser tratadas com a AC que o emitiu.

Para conferir, no Windows, se há um certificado com chave privada no computador:

1. **Iniciar** > **Executar...** > **certmgr.msc**
2. Na pasta **Pessoal**, dê um duplo clique no certificado.
3. Deve aparecer a mensagem "Tem uma chave particular correspondente a este certificado."

### Instalação do Web PKI {#usuario-final-instalacao}

- Se o componente não estiver instalado, estiver desatualizado ou o navegador não for suportado, normalmente o site
  leva você à página de instalação e, ao final, você volta automaticamente ao site (o site pode exibir antes uma
  mensagem própria).
- A instalação do Web PKI é feita apenas a partir de [get.webpkiplugin.com](https://get.webpkiplugin.com): a extensão
  vem da loja oficial do navegador, e o aplicativo nativo é baixado desse mesmo domínio.
- Depois de instalado, o Web PKI é atualizado automaticamente.
- Veja os [navegadores suportados](../web-pki/browser-support.md).

### Onde pedir ajuda {#usuario-final-ajuda}

- **Erros de licença ou dúvidas sobre o serviço do site**: fale com a empresa responsável pelo site. Pedidos sobre os
  seus dados pessoais também devem ser feitos a ela, que é a controladora dos dados.
- **Problemas para instalar ou usar o Web PKI**: visite a [Central de Suporte](http://lacuna.help/) da Lacuna.
- Ao pedir suporte, ajuda ativar os logs detalhados: clique no ícone da extensão e vá em
  **Configurações** > **Avançadas** > **Logs detalhados** (veja [Logs](../web-pki/logs.md)).

## Contatos {#contatos}

| Canal | Para quê |
|---|---|
| [Fale conosco](https://www.lacunasoftware.com/pt/home/purchase) | Solicitar licenças, licenças de teste e informações comerciais |
| [suporte@lacunasoftware.com](mailto:suporte@lacunasoftware.com) | Suporte ao desenvolvedor, pedido de licença do Web PKI e parâmetros do Rest PKI Core em nuvem |
| [Central de Suporte](http://lacuna.help/) | Usuários finais e ativação manual do PKI Express |
| pki.lacunasoftware.com | Licença de *trial* gratuita do PKI SDK |
| +55 61 3030-5700 | Telefone. Endereço: EQN 102/103, Ed. Avenida 102, 2º andar, Asa Norte, Brasília-DF |
