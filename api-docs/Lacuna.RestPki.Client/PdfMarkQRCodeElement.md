---
sidebar_label: "PdfMarkQRCodeElement"
---

# PdfMarkQRCodeElement

**Namespace:** `Lacuna.RestPki.Client`  
**Assembly:** `Lacuna.RestPki.Client`  
_Class_

```csharp
public class PdfMarkQRCodeElement : PdfMarkElement
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`PdfMarkElement`](./PdfMarkElement.md) → `PdfMarkQRCodeElement`

## Construtores

### `PdfMarkQRCodeElement()` {#ctor}

```csharp
public PdfMarkQRCodeElement()
```

---

### `PdfMarkQRCodeElement(PadesVisualRectangle, string)` {#ctor-lacuna-restpki-client-padesvisualrectangle-system-string}

```csharp
public PdfMarkQRCodeElement(PadesVisualRectangle relativeContainer, string qrCodeData)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `relativeContainer` | [`PadesVisualRectangle`](./PadesVisualRectangle.md) |  |
| `qrCodeData` | [`string`](https://learn.microsoft.com/dotnet/api/system.string) |  |

---

## Propriedades

### `DrawQuietZones` {#drawquietzones}

```csharp
public bool DrawQuietZones { get; set; }
```

**Retorno**

[`bool`](https://learn.microsoft.com/dotnet/api/system.boolean)

---

### `QRCodeData` {#qrcodedata}

```csharp
public string QRCodeData { get; set; }
```

**Retorno**

[`string`](https://learn.microsoft.com/dotnet/api/system.string)

---

## Métodos

### `ToModel()` {#tomodel}

```csharp
public override PdfMarkElementModel ToModel()
```

**Retorno**

`PdfMarkElementModel`

---

## Membros herdados

[`ElementType`](./PdfMarkElement.md#elementtype), [`RelativeContainer`](./PdfMarkElement.md#relativecontainer), [`Rotation`](./PdfMarkElement.md#rotation), [`Opacity`](./PdfMarkElement.md#opacity), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object)>), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.object.gethashcode)
