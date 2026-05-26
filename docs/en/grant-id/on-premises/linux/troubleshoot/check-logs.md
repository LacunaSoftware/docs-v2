# GrantID - Checking the system logs (Linux)

When installed on Linux, [GrantID](../../../index.md) sends its logs to the systemd journal, a centralized management solution for logging
all kernel and userland processes. To view the logs, use the `journalctl` utility.

To check the Identity Service logs:

```sh
journalctl -u grantid-identity-service
```

To check the Auth Server logs:

```sh
journalctl -u grantid-auth-server
```

To check the Console logs:

```sh
journalctl -u grantid-console
```

## Useful parameters

The `journalctl` command has many parameters that can help you to find the information you seek on the logs.

Use the `-f` flag to view logs in "follow" mode (like `tail -f`):

```sh
journalctl -u grantid-identity-service -f
```

Use the `--since` parameter to view only recent logs:

```sh
journalctl -u grantid-identity-service --since "1 min ago"
```

## See also

* [How To Use Journalctl to View and Manipulate Systemd Logs](https://www.digitalocean.com/community/tutorials/how-to-use-journalctl-to-view-and-manipulate-systemd-logs) (DigitalOcean post)
* [Troubleshooting issues on your GrantID instance (Linux)](index.md)
