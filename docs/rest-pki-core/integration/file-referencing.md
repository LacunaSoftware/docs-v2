# Referenciando arquivos - Rest PKI Core

Existem diferentes maneiras de referenciar arquivos em chamadas à APIs do [Rest PKI Core](../index.md), por exemplo ao
[criar uma sessão de assinatura com documentos pré-definidos](signature-sessions/index.md#predefined-documents).

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

Por URL absoluta. Nesse caso, o servidor da API irá baixar o arquivo do servidor da sua aplicação. A URL precisa ser
acessível publicamente com método `GET`. Quaisquer argumentos de autorização devem estar embutidos na própria URL:

```cs
var fileRef = FileReference.FromUrl("https://yourapp.com/docs/document1.pdf?token=xxxxxxxxx");
```

## Java

Você pode referenciar um arquivo por seu *path*:

```java
FileReference fileRef = FileReference.fromFile("C:/AppData/Documents/document.pdf", null, null);
```

Por um objeto `FileInfo` contendo o *path* do arquivo:

```java
File file = new File("C:/AppData/Documents/document.pdf");
File fileRef = FileReference.fromFile(file);
```

Pelo conteúdo do arquivo, passando um array de bytes, nesse caso é preciso também informar o nome do arquivo:

```java
byte[] bytes = ...;
FileReference fileRef = FileReference.fromBytes(bytes, "document.pdf", null);
```

Por uma `stream`. Assim como em referências pelo conteúdo do arquivo, é preciso fornecer o nome do arquivo:

```java
FileReference fileRef = FileReference.fromStream(stream, "document.pdf", "application/pdf");
```

Por URL absoluta. Nesse caso, o servidor da API irá baixar o arquivo do servidor da sua aplicação. A URL precisa ser
acessível publicamente com método `GET`. Quaisquer argumentos de autorização devem estar embutidos na própria URL:

```java
FileReference fileRef = FileReference.fromUrl("https://yourapp.com/docs/document1.pdf?token=xxxxxxxxx", null, null);
```

## Direct API integration

:::note
Os exemplos nessa seção exemplificam o referenciamento de arquivos numa criação de [sessão de assinatura](signature-sessions/index.md),
entretanto o mesmo se aplica a qualquer API que receba arquivos.
:::


Você pode referenciar um arquivo incluindo seu conteúdo diretamente no request, codificado em Base64, nesse caso é preciso também fornecer o nome do arquivo:

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

Também por URL absoluta. Nesse caso, o servidor da API irá baixar o arquivo do servidor da sua aplicação. A URL precisa ser
acessível publicamente com método `GET`. Quaisquer argumentos de autorização devem estar embutidos na própria URL:

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
