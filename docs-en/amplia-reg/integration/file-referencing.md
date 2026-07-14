# Referencing files - Amplia Reg

There are multiple ways to reference files when calling [Amplia Reg](../index.md)'s APIs, for instance when
[creating a preapproved order](preapproved-orders.md).

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

{/* By absolute URL. In this case, the API backend will download the file from your application's backend. The URL must be publicly accessible with the `GET` http method. Any authorization arguments must be embedded withing the URL itself: {/* include: ../../../../includes/amplia-reg/file-reference-url-dotnet.md */} */}

{/* ## Direct API integration :::note The samples here show file referencing during the [creation of a preapproved order](preapproved-orders.md), but the same applies for any API that accepts files as input. ::: You can reference a file by including its contents directly on the request, encoded in Base64, in which case you must also give its filename: ```plaintext POST {endpoint}/api/signature-sessions { ... "documents": [ { "file": { "content": "Base64EncodedBytes==", "name": "doc1.pdf" } }, ... ] } ``` Also by absolute URL. In this case, the API backend will download the file from your application's backend. The URL must be publicly accessible with the `GET` http method. Any authorization arguments must be embedded withing the URL itself: {/* include: ../../../../includes/amplia-reg/file-reference-url-api.md */} */}
