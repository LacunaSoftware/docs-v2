# Referencing files - Rest PKI Core

There are multiple ways to reference files when calling [Rest PKI Core](../index.md)'s APIs, for instance when
[creating a signature session with predefined documents](signature-sessions/index.md#predefined-documents).

## .NET

You can reference a file by its path:

```cs
var fileRef = FileReference.FromFile(@"C:\AppData\Documents\document.pdf");
```

By a `FileInfo` containing the file's path:

```cs
var fileInfo = new FileInfo(@"C:\AppData\Documents\document.pdf");
var fileRef = FileReference.FromFile(fileInfo);
```

By the file's bytes, in which case you must also give its filename:

```cs
byte[] bytes = ...;
var fileRef = FileReference.FromBytes(bytes, "document.pdf");
```

By a stream. Like when referencing by the file's bytes, the filename must also be given:

```cs
var fileRef = FileReference.FromStream(stream, "document.pdf");
```

By absolute URL. In this case, the API backend will download the file from your application's backend. The URL must be publicly accessible with the `GET`
http method. Any authorization arguments must be embedded within the URL itself:

```cs
var fileRef = FileReference.FromUrl("https://yourapp.com/docs/document1.pdf?token=xxxxxxxxx");
```

## Java

You can reference a file by its path:

```java
FileReference fileRef = FileReference.fromFile("C:/AppData/Documents/document.pdf", null, null);
```

By a `FileInfo` containing the file's path:

```java
File file = new File("C:/AppData/Documents/document.pdf");
File fileRef = FileReference.fromFile(file);
```

By the file's bytes, in which case you must also give its filename:

```java
byte[] bytes = ...;
FileReference fileRef = FileReference.fromBytes(bytes, "document.pdf", null);
```

By a stream. Like when referencing by the file's bytes, the filename must also be given:

```java
FileReference fileRef = FileReference.fromStream(stream, "document.pdf", "application/pdf");
```

By absolute URL. In this case, the API backend will download the file from your application's backend. The URL must be publicly accessible with the `GET`
http method. Any authorization arguments must be embedded withing the URL itself:

```java
FileReference fileRef = FileReference.fromUrl("https://yourapp.com/docs/document1.pdf?token=xxxxxxxxx", null, null);
```

## Direct API integration

:::note
The samples here show file referencing during the creation of a [signature session](signature-sessions/index.md), but the same applies for any API
that accepts files as input.
:::


You can reference a file by including its contents directly on the request, encoded in Base64, in which case you must also give its filename:

```plaintext
POST {endpoint}/api/signature-sessions
{
	...
	"documents": [
		{
			"file": {
				"content": "Base64EncodedBytes==",
				"name": "doc1.pdf"
			}
		},
		...
	]
}
```

Also by absolute URL. In this case, the API backend will download the file from your application's backend. The URL must be publicly accessible with the `GET`
http method. Any authorization arguments must be embedded withing the URL itself:

```plaintext
POST {endpoint}/api/signature-sessions
{
	...
	"documents": [
		{
			"file": {
				"url": "https://yourapp.com/docs/document1.pdf?token=xxxxxxxxx"
			}
		},
		...
	]
}
```
