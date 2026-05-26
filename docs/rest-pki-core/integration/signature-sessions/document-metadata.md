# Metadados de documentos - Sessões de assinatura

Ao criar uma [sessão de assinatura](index.md), é possível especificar uma coleção de metadados a serem associados aos documentos
criados durante a sessão. Metadados são especificados por um *nome* e uma coleção de *valores*.

Em .NET:

```cs
var metadata = new NameValueCollection {
	["organization"] = "Patorum Inc.",
	["priority"] = "10",
};
// Multi-valued metadata also supported
metadata.Add("categories", "Document");
metadata.Add("categories", "Forms");
var response = await restPkiService.CreateSignatureSessionAsync(new CreateSignatureSessionRequest() {
	...
}, documentMetadata: metadata);
```

Em .PHP:

```php
$metadata = [
	"organization" => "Patorum Inc.",
	"priority" => "10"
];

// Multi-valued metadata also supported
$metadata["categories"] = ["Document", "Forms"];

$request = new CreateSignatureSessionRequest();
...
$request->documentMetadata = $metadata;
```

Em Java:

```java
CreateSignatureSessionRequest request = new CreateSignatureSessionRequest();
...
List<String> firstElement = new ArrayList<>();
firstElement.add("Patorum Inc.");
request.putDocumentMetadataItem("organization", firstElement);

List<String> secondElement = new ArrayList<>();
secondElement.add("10");
request.putDocumentMetadataItem("priority", secondElement);

// Multi-valued metadata also supported
List<String> listOfElements = new ArrayList<>();
listOfElements.add("Document");
listOfElements.add("Forms");
request.putDocumentMetadataItem("categories", listOfElements);

```


## Regras e limites

* Nomes de metadados podem conter apenas letras, dígitos, hífens (`-`), *underscores* (`_`) e espaços (recomenda-se o uso de identificadores como `some-info`, `SomeInfo` ou `some_info` ao invés de textos legíveis)
* Nomes de metadados podem ter no máximo 50 caracteres
* Cada valor de metadado pode ter no máximo 500 caracteres

:::note
Nas APIs de busca de documentos por metadado o batimento de nomes é ***case insensitive*** (não há diferenciação entre maiúsculas e minúsculas)
:::

