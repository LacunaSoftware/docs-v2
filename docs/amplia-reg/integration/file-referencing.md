# Referenciando arquivos - Amplia Reg

Existem diferentes maneiras de referenciar arquivos em chamadas à APIs do [Amplia Reg](../index.md), por exemplo ao
[criar um pedido de certificado pré-aprovado](preapproved-orders.md).

## .NET

Você pode referenciar um arquivo por seu *path*:

```cs
var fileRef = FileReference.FromFile(@"C:\AppData\Documents\document.pdf");
```

Por um objeto `FileInfo` contendo o *path* do arquivo:

```cs
var fileInfo = new FileInfo(@"C:\AppData\Documents\document.pdf");
var fileRef = FileReference.FromFile(fileInfo);
```

Pelo conteúdo do arquivo, passando um array de bytes, nesse caso é preciso também informar o nome do arquivo:

```cs
byte[] bytes = ...;
var fileRef = FileReference.FromBytes(bytes, "document.pdf");
```

Por uma `stream`. Assim como em referências pelo conteúdo do arquivo, é preciso fornecer o nome do arquivo:

```cs
var fileRef = FileReference.FromStream(stream, "document.pdf");
```

{/* Por URL absoluta. Nesse caso, o servidor da API irá baixar o arquivo do servidor da sua aplicação. A URL precisa ser acessível publicamente com método `GET`. Quaisquer argumentos de autorização devem estar embutidos na própria URL: {/* include: ../../../../includes/amplia-reg/file-reference-url-dotnet.md */} */}

{/* ## Direct API integration :::note Os exemplos nessa seção exemplificam o referenciamento de arquivos numa [criação de pedido pré-aprovado](preapproved-orders.md), entretanto o mesmo se aplica a qualquer API que receba arquivos. ::: Você pode referenciar um arquivo incluindo seu conteúdo diretamente no request, codificado em Base64, nesse caso é preciso também fornecer o nome do arquivo: ```plaintext POST {endpoint}/api/signature-sessions { ... "documents": [ { "file": { "content": "Base64EncodedBytes==", "name": "doc1.pdf" } }, ... ] } ``` Também por URL absoluta. Nesse caso, o servidor da API irá baixar o arquivo do servidor da sua aplicação. A URL precisa ser acessível publicamente com método `GET`. Quaisquer argumentos de autorização devem estar embutidos na própria URL: {/* include: ../../../../includes/amplia-reg/file-reference-url-api.md */} */}
