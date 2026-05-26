# Atualização do Lacuna TSA em Linux

Para atualizar sua on premises do [Lacuna TSA](../index.md), siga os passos abaixo:

:::info
Essas instruções assumem que você está autenticado como **root**. Se você não estiver, execute `sudo su -` antes de continuar!
:::


```sh
curl -O https://cdn.lacunasoftware.com/tsa/tsa-1.2.1.tar.gz
systemctl stop lacuna-tsa
rm -fR /usr/share/lacuna-tsa/*
tar xzf tsa-1.2.1.tar.gz -C /usr/share/lacuna-tsa
chmod -R a=,u+rwX,go+rX /usr/share/lacuna-tsa
systemctl start lacuna-tsa
```

{/* <a name="vnext" /> ## Testando a próxima versão do Lacuna TSA Para testar a próxima versão do Lacuna TSA, atualmente em estágio *Release Candidate*: {/* include: ../../../../../includes/tsa/linux/update-vnext.md */} :::warning Versões em *Release Candidate* não são adequadas para produção e, portanto, devem ser instaladas apenas em ambientes de homologação/testes. ::: */}

## Veja também

* [Setup do Lacuna TSA em Linux](index.md)
* [Resolução de problemas](troubleshoot/index.md)
