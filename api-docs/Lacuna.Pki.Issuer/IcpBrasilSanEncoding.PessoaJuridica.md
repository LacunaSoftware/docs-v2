---
sidebar_label: "IcpBrasilSanEncoding.PessoaJuridica"
---

# IcpBrasilSanEncoding.PessoaJuridica

**Namespace:** `Lacuna.Pki.Issuer`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class IcpBrasilSanEncoding.PessoaJuridica : IcpBrasilSanEncoding, ISanEncoding
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`IcpBrasilSanEncoding`](./IcpBrasilSanEncoding.md) → `IcpBrasilSanEncoding.PessoaJuridica`

## Construtores

### `PessoaJuridica()` {#ctor}

```csharp
public PessoaJuridica()
```

---

## Propriedades

### `Cnpj` {#cnpj}

```csharp
public string Cnpj { set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Inss` {#inss}

```csharp
public string Inss { set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `NomeResponsavel` {#nomeresponsavel}

```csharp
public string NomeResponsavel { set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

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

[`NormalizeParameters()`](./IcpBrasilSanEncoding.md#normalizeparameters), [`Email`](./IcpBrasilSanEncoding.md#email), [`Cpf`](./IcpBrasilSanEncoding.md#cpf), [`Rg`](./IcpBrasilSanEncoding.md#rg), [`DataNascimento`](./IcpBrasilSanEncoding.md#datanascimento), [`SocialId`](./IcpBrasilSanEncoding.md#socialid), [`RgEmissor`](./IcpBrasilSanEncoding.md#rgemissor), [`RgEmissorUf`](./IcpBrasilSanEncoding.md#rgemissoruf), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
