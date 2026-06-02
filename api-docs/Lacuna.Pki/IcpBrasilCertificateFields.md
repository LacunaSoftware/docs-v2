---
sidebar_label: "IcpBrasilCertificateFields"
---

# IcpBrasilCertificateFields

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class IcpBrasilCertificateFields
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `IcpBrasilCertificateFields`

## Construtores

### `IcpBrasilCertificateFields(PKCertificate)` {#ctor-lacuna-pki-pkcertificate}

```csharp
public IcpBrasilCertificateFields(PKCertificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`PKCertificate`](./PKCertificate.md) |  |

---

## Propriedades

### `Cei` {#cei}

Número do Cadastro Especifico do INSS (CEI).

```csharp
public string Cei { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `CertificateType` {#certificatetype}

The ICP-Brasil certificate type

```csharp
public IcpBrasilCertificateFields.CertificateTypes CertificateType { get; }
```

**Retorno**

[`IcpBrasilCertificateFields.CertificateTypes`](./IcpBrasilCertificateFields.CertificateTypes.md)

---

### `Cnpj` {#cnpj}

The company CNPJ if present and it is an company or application certificate. Returns null otherwise

```csharp
public string Cnpj { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `CnpjFormatted` {#cnpjformatted}

The Cnpj property formatted 00.000.000/0000-00

```csharp
public string CnpjFormatted { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `CompanyName` {#companyname}

The responsible company name if it is an ICP-Brasil application certificate.
The subject's common name without end id numbers if it is an ICP-Brasil company certificate. Null otherwise.

```csharp
public string CompanyName { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `CPF` {#cpf}

The certificate holder CPF (fiscal code) if it is a personal certificate (pessoa física).
The responsible CPF otherwise.

```csharp
public string CPF { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `CpfFormatted` {#cpfformatted}

The CPF property formatted 000.000.000-00

```csharp
public string CpfFormatted { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `DateOfBirth` {#dateofbirth}

The certificate holder date of birth if it is a personal certificate ("PF").
The responsible date of birth if it is a company or application certificate.

```csharp
public DateTime? DateOfBirth { get; }
```

**Retorno**

[`DateTime?`](https://learn.microsoft.com/dotnet/api/system.datetime)

---

### `IsAplicacao` {#isaplicacao}

If it is an application certificate

```csharp
public bool IsAplicacao { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsPessoaFisica` {#ispessoafisica}

If it is a personal certificate

```csharp
public bool IsPessoaFisica { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsPessoaJuridica` {#ispessoajuridica}

If it is a company certificate

```csharp
public bool IsPessoaJuridica { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `NIS` {#nis}

The certificate holder's "Número de Identificação Social - NIS (PIS, PASEP ou CI)". Returns value without leading zeroes.
Returns null if information is not present.

```csharp
public string NIS { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `OabNumero` {#oabnumero}

OAB's "Número de Inscrição junto a Seccional". Returns value without leading zeroes. Returns null if information is not present.

```csharp
public string OabNumero { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `OabUF` {#oabuf}

OAB's "sigla do Estado da Seccional"

```csharp
public string OabUF { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Responsavel` {#responsavel}

Name of the certificate's holder ("responsável"). Use this property instead of SubjectDisplayName to
obtain the holder's name, because, in case the certificate is a company certificate ("PJ"), the property
SubjectDisplayName will return the company's name, not the holder's. Also, even if the certificate is a
personal certificate ("PF"), the property SubjectDisplayName may return the subject's CPF number, while
this property returns only the holder's name.

```csharp
public string Responsavel { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `RGEmissor` {#rgemissor}

The issuing entity of the certificate holder's identity (órgão emissor do RG do titular/responsável).

```csharp
public string RGEmissor { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `RGEmissorUF` {#rgemissoruf}

The state code of the issuing entity of the certificate holder's identity (UF do órgão emissor do RG do titular/responsável).

```csharp
public string RGEmissorUF { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `RGNumero` {#rgnumero}

The certificate holder's identity number (número do RG do titular/responsável). Returns value without leading zeroes.
Returns null if information is not present.

```csharp
public string RGNumero { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Ric` {#ric}

Número de Registro de Identidade Civil.

```csharp
public string Ric { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `SigepeNumero` {#sigepenumero}

Número do cadastro único do servidor público da ativa e militares da União constante no Sistema
de Gestão de Pessoal(SIGEPE) mantido pelo Ministério do Planejamento ou nos sistemas correlatos,
no âmbito da esfera estadual e do Distrito Federal, e nos Sistemas de Gestão de Pessoal das Forças Armadas.

```csharp
public string SigepeNumero { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TituloEleitorMunicipio` {#tituloeleitormunicipio}

```csharp
public string TituloEleitorMunicipio { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TituloEleitorNumero` {#tituloeleitornumero}

Número de inscrição do Título de Eleitor

```csharp
public string TituloEleitorNumero { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TituloEleitorSecao` {#tituloeleitorsecao}

Seção Eleitoral

```csharp
public string TituloEleitorSecao { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TituloEleitorUF` {#tituloeleitoruf}

```csharp
public string TituloEleitorUF { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `TituloEleitorZona` {#tituloeleitorzona}

Zona Eleitoral

```csharp
public string TituloEleitorZona { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
