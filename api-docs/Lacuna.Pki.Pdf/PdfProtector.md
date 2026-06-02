---
sidebar_label: "PdfProtector"
---

# PdfProtector

**Namespace:** `Lacuna.Pki.Pdf`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public static class PdfProtector
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → `PdfProtector`

## Métodos

### `Protect(string, byte[])` {#protect-system-string-system-byte}

Protects a PDF with password

```csharp
public static byte[] Protect(string password, byte[] pdf)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `password` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Password for opening and editing the PDF |
| `pdf` | [`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) | PDF content bytes |

**Retorno**

[`byte[]`](https://learn.microsoft.com/dotnet/api/system.byte) — Password protected PDF content bytes

---

### `Protect(string, Stream, Stream)` {#protect-system-string-system-io-stream-system-io-stream}

Protects a PDF with password

```csharp
public static void Protect(string password, Stream pdf, Stream output)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `password` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) | Password for opening and editing the PDF |
| `pdf` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | PDF stream |
| `output` | [`Stream`](https://learn.microsoft.com/dotnet/api/system.io.stream) | Password protected PDF output stream |

---

## Membros herdados

[`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
