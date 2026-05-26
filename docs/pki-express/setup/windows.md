# Instalação do PKI Express em Windows

O PKI Express é compatível com os seguintes ambientes Windows:

* Server: Windows Server 2008 R2 ou superior
* Desktop: Windows 7 ou superior

Para instalar o PKI Express, baixe e execute o instalador:

<br />
<center>
**[PKI Express (64-bit) 1.36.2 installer](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x64.msi) (recomendado)**
</center>
<br />

Após a instalação, execute o aplicativo *PKI Express Configuration Manager* (**arquivo `pkiemgr.exe` na pasta de instalação**) e siga as instruções
para ativar o PKI Express.

:::note
Só é possível encontrar o aplicativo navegando até a pasta, não há atalho no menu iniciar (isso será corrigido em uma versão futura)
:::


## Downloads alternativos

Caso prefira, você pode optar por um dos downloads alternativos:

Arquivo                                                                         | Descrição
------------------------------------------------------------------------------- | ------------------
**[pkie-1.36.2-x64.msi](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x64.msi)** | **Instalador 64 bits**
[pkie-1.36.2-x86.msi](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x86.msi)     | Instalador 32 bits
[pkie-1.36.2-x64.zip](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x64.zip)     | Pacote zip 64 bits
[pkie-1.36.2-x86.zip](https://cdn.lacunasoftware.com/pki-express/windows/pkie-1.36.2-x86.zip)     | Pacote zip 32 bits

Sempre que possível, escolha a versão 64 bits do PKI Express.

:::note
Para instalar o PKI Express em um ambiente de desenvolvimento para o qual você não tenha permissões de administrador,
utilize um dos pacotes zip.
:::


## .NET Framework

O PKI Express requer o .NET Framework 4.6.1, o qual provavelmente já encontra-se instalado em seu sistema. Entretanto,
caso durante a instalação você receba uma mensagem dizendo que o .NET Framework 4.6.1 não está instalado, utilize
um dos links abaixo:

* [Microsoft .NET Framework 4.6.1 (Web Installer)](https://www.microsoft.com/en-us/download/details.aspx?id=49981)
* [Microsoft .NET Framework 4.6.1 (Offline Installer)](https://www.microsoft.com/en-us/download/details.aspx?id=49982)

:::note
A instalação do .NET Framework 4.6.1 no Windows 7 e no Windows Server 2008 R2 exige que o Service Pack 1
esteja instalado.
:::


<a name="update" />
## Atualização

Para atualizar o PKI Express, apenas baixe a nova versão e execute o instalador.