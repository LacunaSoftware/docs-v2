---
sidebar_label: "IcpBrasilSanEncoding.PessoaFisica"
---

# IcpBrasilSanEncoding.PessoaFisica

**Namespace:** `Lacuna.Pki.Issuer`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class IcpBrasilSanEncoding.PessoaFisica : IcpBrasilSanEncoding, ISanEncoding
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`IcpBrasilSanEncoding`](./IcpBrasilSanEncoding.md) → `IcpBrasilSanEncoding.PessoaFisica`

## Construtores

### `PessoaFisica()` {#ctor}

```csharp
public PessoaFisica()
```

---

## Propriedades

### `Inss` {#inss}

```csharp
public string Inss { set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `MunicipioEleitor` {#municipioeleitor}

```csharp
public string MunicipioEleitor { set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SecaoEleitoral` {#secaoeleitoral}

```csharp
public string SecaoEleitoral { set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TituloEleitor` {#tituloeleitor}

```csharp
public string TituloEleitor { set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `UfEleitor` {#ufeleitor}

```csharp
public string UfEleitor { set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `ZonaEleitoral` {#zonaeleitoral}

```csharp
public string ZonaEleitoral { set; }
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
