---
sidebar_label: "Asn1ChoiceElementAttribute"
---

# Asn1ChoiceElementAttribute

**Namespace:** `Lacuna.Pki.Asn1`  
**Assembly:** `Lacuna.Pki`  
_Class_

```csharp
public class Asn1ChoiceElementAttribute : Attribute, _Attribute
```

**Hierarquia:** [`object`](https://learn.microsoft.com/dotnet/api/system.object) → [`Attribute`](https://learn.microsoft.com/dotnet/api/system.attribute) → `Asn1ChoiceElementAttribute`

## Construtores

### `Asn1ChoiceElementAttribute(int, Asn1PrimitiveTypes)` {#ctor-system-int32-lacuna-pki-asn1-asn1primitivetypes}

```csharp
public Asn1ChoiceElementAttribute(int tag, Asn1PrimitiveTypes type)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `tag` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |
| `type` | [`Asn1PrimitiveTypes`](./Asn1PrimitiveTypes.md) |  |

---

### `Asn1ChoiceElementAttribute(int)` {#ctor-system-int32}

```csharp
public Asn1ChoiceElementAttribute(int tag)
```

**Parâmetros**

| Nome | Tipo | Descrição |
|---|---|---|
| `tag` | [`int`](https://learn.microsoft.com/dotnet/api/system.int32) |  |

---

## Propriedades

### `PrimitiveType` {#primitivetype}

```csharp
public Asn1PrimitiveTypes? PrimitiveType { get; set; }
```

**Retorno**

`Asn1PrimitiveTypes?`

---

### `Tag` {#tag}

```csharp
public int Tag { get; }
```

**Retorno**

[`int`](https://learn.microsoft.com/dotnet/api/system.int32)

---

## Membros herdados

[`GetCustomAttributes(MemberInfo, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-memberinfo-system-type)>), [`GetCustomAttributes(MemberInfo, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-memberinfo-system-type-system-boolean)>), [`GetCustomAttributes(MemberInfo)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-memberinfo)>), [`GetCustomAttributes(MemberInfo, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-memberinfo-system-boolean)>), [`IsDefined(MemberInfo, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.isdefined#system-attribute-isdefined(system-reflection-memberinfo-system-type)>), [`IsDefined(MemberInfo, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.isdefined#system-attribute-isdefined(system-reflection-memberinfo-system-type-system-boolean)>), [`GetCustomAttribute(MemberInfo, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattribute#system-attribute-getcustomattribute(system-reflection-memberinfo-system-type)>), [`GetCustomAttribute(MemberInfo, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattribute#system-attribute-getcustomattribute(system-reflection-memberinfo-system-type-system-boolean)>), [`GetCustomAttributes(ParameterInfo)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-parameterinfo)>), [`GetCustomAttributes(ParameterInfo, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-parameterinfo-system-type)>), [`GetCustomAttributes(ParameterInfo, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-parameterinfo-system-type-system-boolean)>), [`GetCustomAttributes(ParameterInfo, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-parameterinfo-system-boolean)>), [`IsDefined(ParameterInfo, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.isdefined#system-attribute-isdefined(system-reflection-parameterinfo-system-type)>), [`IsDefined(ParameterInfo, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.isdefined#system-attribute-isdefined(system-reflection-parameterinfo-system-type-system-boolean)>), [`GetCustomAttribute(ParameterInfo, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattribute#system-attribute-getcustomattribute(system-reflection-parameterinfo-system-type)>), [`GetCustomAttribute(ParameterInfo, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattribute#system-attribute-getcustomattribute(system-reflection-parameterinfo-system-type-system-boolean)>), [`GetCustomAttributes(Module, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-module-system-type)>), [`GetCustomAttributes(Module)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-module)>), [`GetCustomAttributes(Module, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-module-system-boolean)>), [`GetCustomAttributes(Module, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-module-system-type-system-boolean)>), [`IsDefined(Module, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.isdefined#system-attribute-isdefined(system-reflection-module-system-type)>), [`IsDefined(Module, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.isdefined#system-attribute-isdefined(system-reflection-module-system-type-system-boolean)>), [`GetCustomAttribute(Module, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattribute#system-attribute-getcustomattribute(system-reflection-module-system-type)>), [`GetCustomAttribute(Module, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattribute#system-attribute-getcustomattribute(system-reflection-module-system-type-system-boolean)>), [`GetCustomAttributes(Assembly, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-assembly-system-type)>), [`GetCustomAttributes(Assembly, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-assembly-system-type-system-boolean)>), [`GetCustomAttributes(Assembly)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-assembly)>), [`GetCustomAttributes(Assembly, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattributes#system-attribute-getcustomattributes(system-reflection-assembly-system-boolean)>), [`IsDefined(Assembly, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.isdefined#system-attribute-isdefined(system-reflection-assembly-system-type)>), [`IsDefined(Assembly, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.isdefined#system-attribute-isdefined(system-reflection-assembly-system-type-system-boolean)>), [`GetCustomAttribute(Assembly, Type)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattribute#system-attribute-getcustomattribute(system-reflection-assembly-system-type)>), [`GetCustomAttribute(Assembly, Type, bool)`](<https://learn.microsoft.com/dotnet/api/system.attribute.getcustomattribute#system-attribute-getcustomattribute(system-reflection-assembly-system-type-system-boolean)>), [`Equals(object)`](https://learn.microsoft.com/dotnet/api/system.attribute.equals), [`GetHashCode()`](https://learn.microsoft.com/dotnet/api/system.attribute.gethashcode), [`Match(object)`](https://learn.microsoft.com/dotnet/api/system.attribute.match), [`IsDefaultAttribute()`](https://learn.microsoft.com/dotnet/api/system.attribute.isdefaultattribute), [`TypeId`](https://learn.microsoft.com/dotnet/api/system.attribute.typeid), [`ToString()`](https://learn.microsoft.com/dotnet/api/system.object.tostring), [`Equals(object, object)`](<https://learn.microsoft.com/dotnet/api/system.object.equals#system-object-equals(system-object-system-object)>), [`ReferenceEquals(object, object)`](https://learn.microsoft.com/dotnet/api/system.object.referenceequals), [`GetType()`](https://learn.microsoft.com/dotnet/api/system.object.gettype), [`MemberwiseClone()`](https://learn.microsoft.com/dotnet/api/system.object.memberwiseclone)
