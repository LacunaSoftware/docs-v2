# Amplia - Checking the system logs (Linux)

When installed on Linux, [Amplia](../../../index.md) sends its logs to the systemd journal, a centralized management solution for logging
all kernel and userland processes. To view the logs, use the `journalctl` utility.

To check the Amplia logs:

```sh
journalctl -u amplia
```

Use the `-f` flag to view logs in "follow" mode (like `tail -f`):

```sh
journalctl -u amplia -f
```

Use the `--since` parameter to view only recent logs:

```sh
journalctl -u amplia --since "1 min ago"
```

## See also

* [How To Use Journalctl to View and Manipulate Systemd Logs](https://www.digitalocean.com/community/tutorials/how-to-use-journalctl-to-view-and-manipulate-systemd-logs) (DigitalOcean post)
* [Troubleshooting issues on your Amplia instance (Linux)](index.md)
