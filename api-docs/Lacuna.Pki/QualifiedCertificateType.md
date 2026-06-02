---
sidebar_label: "QualifiedCertificateType"
---

# QualifiedCertificateType

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class QualifiedCertificateType
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `QualifiedCertificateType`

## Construtores

### `QualifiedCertificateType(string)` {#ctor-system-string}

```csharp
public QualifiedCertificateType(string typeId)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `typeId` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Campos

### `ElectronicSeal` {#electronicseal}

```csharp
public static readonly QualifiedCertificateType ElectronicSeal
```

**Retorno**

[`QualifiedCertificateType`](./QualifiedCertificateType.md)

---

### `ElectronicSignature` {#electronicsignature}

```csharp
public static readonly QualifiedCertificateType ElectronicSignature
```

**Retorno**

[`QualifiedCertificateType`](./QualifiedCertificateType.md)

---

### `WebsiteAuthentication` {#websiteauthentication}

```csharp
public static readonly QualifiedCertificateType WebsiteAuthentication
```

**Retorno**

[`QualifiedCertificateType`](./QualifiedCertificateType.md)

---

## Propriedades

### `Id` {#id}

```csharp
public string Id { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `Equals(object)` {#equals-system-object}

```csharp
public override bool Equals(object other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`object`](https://learn.microsoft.com/dotnet/api/system.object) |  |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetHashCode()` {#gethashcode}

```csharp
public override int GetHashCode()
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `ToString()` {#tostring}

```csharp
public override string ToString()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
