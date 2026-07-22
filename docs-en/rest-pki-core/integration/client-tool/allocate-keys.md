---
sidebar_position: 2
slug: /rest-pki/core/integration/client-tool/allocate-keys
sidebar_label: "allocate-keys"
---

# Client tool command: **allocate-keys**

## Name

`allocate-keys` - Allocates document keys

## Syntax

```sh
rpkitool allocate-keys [<count>]
```

## Examples

To allocate a single document key:

```sh
rpkitool allocate-keys
```

To allocate 10 document keys:

```sh
rpkitool allocate-keys 10
```

## Output

Keys are written to `stdout`, one key per line, in formatted form, for instance:

```sh
AAAA-AAAA-AAAA-AAAA
BBBB-BBBB-BBBB-BBBB
CCCC-CCCC-CCCC-CCCC
```
