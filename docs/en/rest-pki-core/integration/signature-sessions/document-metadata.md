# Document metadata - Sessões de assinatura

When creating a [signature session](index.md), you may specify a set of metadata to be associated to each document created during
the session. Metadata are specified by a *name* and have one or more *values*.

In .NET:

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

In PHP:

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

In Java:

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

## Bounds and limits

* Metadata names can only contain letters, digits, hyphens (`-`), underscores (`_`) and spaces (we recommend using identifiers as names such
  as `some-info`, `SomeInfo` or `some_info`, instead of human-readable labels)
* Metadata names may have up to 50 characters
* Each metadata value may have up to 500 characters

:::note
On APIs to search documents by metadata, name matching is **case insensitive**
:::

