# Ativação manual do PKI Express

Caso durante a instalação do [PKI Express](../index.md) o procedimento de ativação falhe, siga os passos abaixo
para ativar o produto manualmente.

:::note
Essas instruções se aplicam apenas à instalação em ambientes Linux. Para ativar o PKI Express no Windows,
tanto pela rede quanto maunalmente, utilize o utilitário *PKI Express Configuration Manager* (**pkiemgr.exe**)
:::


Para ativar manualmente o PKI Express, primeiramente solicite o *código de ativação*:

```sh
pkie activate LacunaPkiLicense.config --request
```

Um arquivo chamado **pkie-activation-request.pem** será salvado na pasta atual. Entre em contato através da nossa [Central de Suporte](http://lacuna.help)
enviando o arquivo.

Você receberá de volta o arquivo de ativação (**pkie-activation.pem**). Copie o arquivo para a pasta
atual e execute:

```sh
sudo pkie activate
```

Ou, caso prefira, execute o comando passando o caminho do arquivo:

```sh
sudo pkie activate --file /path/to/pkie-activation.pem
```
