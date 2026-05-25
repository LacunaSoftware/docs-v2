# Signer - Checking the system logs (Linux)

When installed on Linux, [Signer] (../../../ index.md) writes its logs to *systemd journal*, a 
centralized Linux log management solution. To view the logs, use the utility `journalctl`.

To check the Signer logs:

```sh
journalctl -u lacuna-signer
```

Use the `-f` flag to monitor the log continuously (like the` tail -f` command):

```sh
journalctl -u lacuna-signer -f
```

Use the `--since` parameter to view only the most recent logs:

```sh
journalctl -u lacuna-signer --since "1 min ago"
```

## See too

* [*How To Use Journalctl to View and Manipulate Systemd Logs*](https://www.digitalocean.com/community/tutorials/how-to-use-journalctl-to-view-and-manipulate-systemd-logs) (article from DigitalOcean)
* [Troubleshooting Linux](index.md)
