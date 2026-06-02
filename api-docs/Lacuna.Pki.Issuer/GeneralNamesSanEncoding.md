---
sidebar_label: "GeneralNamesSanEncoding"
---

# GeneralNamesSanEncoding

**Namespace:** `Lacuna.Pki.Issuer`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class GeneralNamesSanEncoding : ISanEncoding
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `GeneralNamesSanEncoding`

## Construtores

### `GeneralNamesSanEncoding()` {#ctor}

```csharp
public GeneralNamesSanEncoding()
```

---

## Propriedades

### `DirectoryNames` {#directorynames}

```csharp
public List<Name> DirectoryNames { get; set; }
```

**Retorno**

[`List<Name>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `DnsNames` {#dnsnames}

```csharp
public List<string> DnsNames { get; set; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `IPAddresses` {#ipaddresses}

```csharp
public List<IPAddress> IPAddresses { get; set; }
```

**Retorno**

[`List<IPAddress>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Rfc822Names` {#rfc822names}

```csharp
public List<string> Rfc822Names { get; set; }
```

**Retorno**

[`List<string>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Uris` {#uris}

```csharp
public List<Uri> Uris { get; set; }
```

**Retorno**

[`List<Uri>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `Encode()` {#encode}

Returns an ASN1 Sequence DER encoded containing the intended Subject Alternative Name fields

```csharp
public byte[] Encode()
```

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — ASN1 Sequence DER encoded

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
