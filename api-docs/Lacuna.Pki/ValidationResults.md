---
sidebar_label: "ValidationResults"
---

# ValidationResults

**Namespace:** `Lacuna.Pki`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class ValidationResults
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `ValidationResults`

## Construtores

### `ValidationResults()` {#ctor}

```csharp
public ValidationResults()
```

---

## Propriedades

### `ChecksPerformed` {#checksperformed}

```csharp
public int ChecksPerformed { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

### `DateReference` {#datereference}

The final date reference used for certificate validation. If null, the DateTimeOffset.Now was used.

```csharp
public DateTimeOffset? DateReference { get; }
```

**Retorno**

[`DateTimeOffset?`](https://learn.microsoft.com/dotnet/api/system.datetimeoffset)

---

### `Errors` {#errors}

```csharp
public List<ValidationItem> Errors { get; }
```

**Retorno**

[`List<ValidationItem>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `HasErrors` {#haserrors}

```csharp
public bool HasErrors { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `HasWarnings` {#haswarnings}

```csharp
public bool HasWarnings { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `IsValid` {#isvalid}

```csharp
public bool IsValid { get; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `PassedChecks` {#passedchecks}

```csharp
public List<ValidationItem> PassedChecks { get; }
```

**Retorno**

[`List<ValidationItem>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `Summary` {#summary}

```csharp
public string Summary { get; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

### `Warnings` {#warnings}

```csharp
public List<ValidationItem> Warnings { get; }
```

**Retorno**

[`List<ValidationItem>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

## Métodos

### `AddError(ValidationItem)` {#adderror-lacuna-pki-validationitem}

```csharp
public void AddError(ValidationItem item)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `item` | [`ValidationItem`](./ValidationItem.md) |  |

---

### `AddPassedCheck(string, params object[])` {#addpassedcheck-system-string-system-object}

```csharp
public void AddPassedCheck(string message, params object[] args)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `message` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |
| `args` | [`object[]`](https://learn.microsoft.com/dotnet/api/system.object) |  |

---

### `AddPassedCheck(ValidationItem)` {#addpassedcheck-lacuna-pki-validationitem}

```csharp
public void AddPassedCheck(ValidationItem item)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `item` | [`ValidationItem`](./ValidationItem.md) |  |

---

### `AddUsedCrl(Certificate, Crl)` {#addusedcrl-lacuna-pki-certificate-lacuna-pki-crl}

```csharp
public void AddUsedCrl(Certificate validatedCertificate, Crl crl)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `validatedCertificate` | [`Certificate`](./Certificate.md) |  |
| `crl` | [`Crl`](./Crl.md) |  |

---

### `AddUsedOcsp(Certificate, Ocsp)` {#addusedocsp-lacuna-pki-certificate-lacuna-pki-ocsp}

```csharp
public void AddUsedOcsp(Certificate validatedCertificate, Ocsp ocsp)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `validatedCertificate` | [`Certificate`](./Certificate.md) |  |
| `ocsp` | [`Ocsp`](./Ocsp.md) |  |

---

### `AddValidatedCertificate(Certificate)` {#addvalidatedcertificate-lacuna-pki-certificate}

```csharp
public void AddValidatedCertificate(Certificate certificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `certificate` | [`Certificate`](./Certificate.md) |  |

---

### `AddWarning(ValidationItem)` {#addwarning-lacuna-pki-validationitem}

```csharp
public void AddWarning(ValidationItem item)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `item` | [`ValidationItem`](./ValidationItem.md) |  |

---

### `ContainsFailure(ValidationItemTypes, bool)` {#containsfailure-lacuna-pki-validationitemtypes-system-boolean}

Verifies if there is any failure of type failureType on Errors or Warnings.

```csharp
public bool ContainsFailure(ValidationItemTypes failureType, bool recursive = false)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `failureType` | [`ValidationItemTypes`](./ValidationItemTypes.md) |  |
| `recursive` | [`bool`](https://learn.microsoft.com/dotnet/api/system.boolean) | Verify recursively in inner validations Errors and Warnings |

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `GetAllUsedCrls()` {#getallusedcrls}

```csharp
public List<Crl> GetAllUsedCrls()
```

**Retorno**

[`List<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetAllUsedOcsps()` {#getallusedocsps}

```csharp
public List<Ocsp> GetAllUsedOcsps()
```

**Retorno**

[`List<Ocsp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetAllUsedRevocationValues()` {#getallusedrevocationvalues}

```csharp
public List<UsedRevocationValues> GetAllUsedRevocationValues()
```

**Retorno**

[`List<UsedRevocationValues>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetUsedCrls(Certificate)` {#getusedcrls-lacuna-pki-certificate}

```csharp
public List<Crl> GetUsedCrls(Certificate validatedCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `validatedCertificate` | [`Certificate`](./Certificate.md) |  |

**Retorno**

[`List<Crl>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetUsedOcsps(Certificate)` {#getusedocsps-lacuna-pki-certificate}

```csharp
public List<Ocsp> GetUsedOcsps(Certificate validatedCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `validatedCertificate` | [`Certificate`](./Certificate.md) |  |

**Retorno**

[`List<Ocsp>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `GetUsedRevocationValues(Certificate)` {#getusedrevocationvalues-lacuna-pki-certificate}

```csharp
public UsedRevocationValues GetUsedRevocationValues(Certificate validatedCertificate)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `validatedCertificate` | [`Certificate`](./Certificate.md) |  |

**Retorno**

[`UsedRevocationValues`](./UsedRevocationValues.md)

---

### `GetValidatedCertificates()` {#getvalidatedcertificates}

Returns all the certificates validated during the validation, starting with leaf certificates and following the certification
path up to the root (if the validation specified issuer validation).

```csharp
public List<Certificate> GetValidatedCertificates()
```

**Retorno**

[`List<Certificate>`](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1)

---

### `MergeWith(ValidationResults)` {#mergewith-lacuna-pki-validationresults}

```csharp
public void MergeWith(ValidationResults other)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `other` | [`ValidationResults`](./ValidationResults.md) |  |

---

### `ToString()` {#tostring}

```csharp
public override string ToString()
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Membros herdados

[`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
