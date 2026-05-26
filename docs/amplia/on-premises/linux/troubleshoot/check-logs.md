# Verificando os logs de sistema (Linux)

Quanto instalado em Linux, o [Amplia](../../../index.md) escreve seus logs no *systemd journal*, uma solução para gerenciamento de logs centralizada do Linux. Para
visualizar os logs, utiliza-se o utilitário `journalctl`.

Para verificar os logs do Amplia:

```sh
journalctl -u amplia
```

Utilize a flag `-f` para acompanhar o log de maneira contínua (como o comando `tail -f`):

```sh
journalctl -u amplia -f
```

Utilize o parâmetro `--since` para visualizar apenas os logs mais recentes:

```sh
journalctl -u amplia --since "1 min ago"
```

## Veja também

* [*How To Use Journalctl to View and Manipulate Systemd Logs*](https://www.digitalocean.com/community/tutorials/how-to-use-journalctl-to-view-and-manipulate-systemd-logs) (artigo da DigitalOcean)
* [Resolução de problemas em Linux](index.md)
