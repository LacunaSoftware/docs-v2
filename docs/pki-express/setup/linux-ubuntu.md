# Instalação do PKI Express em Ubuntu ou Mint

Para instalar o PKI Express em um Linux Ubuntu (*desktop* ou *server*) ou Linux Mint você precisará de uma licença de uso. Caso ainda não tenha uma licença, [solicite uma licença de teste](https://www.lacunasoftware.com/pt/home/purchase).

De posse do arquivo de licença (**LacunaPkiLicense.config**), siga os passos abaixo:

<a name="install" />
## Instalando o PKI Express

Baixe o pacote do PKI Express e extraia para a pasta de destino:

```sh
wget https://cdn.lacunasoftware.com/pki-express/linux/pkie-1.36.2.tar.gz
sudo mkdir /usr/share/pkie
sudo tar xzf pkie-1.36.2.tar.gz -C /usr/share/pkie
sudo chmod +x /usr/share/pkie/pkie
sudo ln -s /usr/share/pkie/pkie /usr/local/bin/pkie
```


Crie uma pasta para os logs e configure o PKI Express para utilizá-la:

```sh
sudo mkdir /var/log/pkie
sudo chmod 777 /var/log/pkie
sudo pkie config --set logDir=/var/log/pkie
```

Ative o PKI Express:

```sh
sudo pkie activate LacunaPkiLicense.config
```

:::note
Se a ativação automática falhar, siga as instruções no artigo [Ativação manual](manual-activation.md).
:::


<a name="update" />
## Atualização

Para atualizar o PKI Express, apenas baixe o novo pacote e extraia para a pasta de destino:

```sh
wget https://cdn.lacunasoftware.com/pki-express/linux/pkie-1.36.2.tar.gz
sudo rm -R /usr/share/pkie/*
sudo tar xzf pkie-1.36.2.tar.gz -C /usr/share/pkie
sudo chmod -R a=r,a+X,u+w /usr/share/pkie
```

:::note
Caso você esteja atualizando o PKI Express a partir de uma versão 1.0.x, é preciso realizar as tarefas de configuração da pasta de logs e de ativação do PKI Express (veja procedimento acima)
:::

