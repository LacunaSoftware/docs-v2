---
sidebar_label: "Validar assinaturas"
sidebar_position: 4
slug: /signer/integration/validation
---

# Validar assinaturas de um documento

Você pode validar as assinaturas de um documento de duas formas:

* com a **chave de validação do documento**, caso ele tenha sido assinado nesta instância do Signer;
* com o **arquivo assinado**, útil para validar documentos assinados em qualquer lugar.

## Validação com chave de validação

Para validar um documento com chave de validação, use a [API de Validação de Chave](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents_keys__key__signatures) informando a chave correspondente.

Serão retornados os dados básicos do documento e as informações de cada uma das assinaturas encontradas:

```javascript
GET /api/documents/keys/AX4F8FV8NNAX25TENE2S/signatures

{
    "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
    "name": "Contrato Integração",
    "filename": "Contrato.pdf",
    "mimeType": "application/pdf",
    "isConcluded": true,
    ...
    "creationDate": "2020-08-18T16:38:40.538Z",
    "updateDate": "2020-08-18T16:38:40.538Z",
    "signers": [
        {
            "subjectName": "John Wick",
            "emailAddress": "john.wick@mailinator.com",
            "issuerName": "Lacuna CA",
            "identifier": "81976153069",
            "companyName": null,
            "companyIdentifier": null,
            "isElectronic": false,
            "signingTime": "2020-08-18T16:38:40.538Z",
            "certificateThumbprint": "a0sRR9cWOc0PORMhTBg49ub/5BO3W5vWQ1w7+YquK5g=",
            ...
            "validationResults":
            {
                ...
                "isValid": true
            }
        }
    ]
}
```

## Validação com arquivo assinado

Para validar um documento a partir do arquivo assinado, primeiro faça o upload do arquivo usando a [API de Upload](https://www.dropsigner.com/swagger/index.html#operations-Upload-post_api_uploads) ou a [API simplificada de Upload (POST /api/uploads/bytes)](https://www.dropsigner.com/swagger/index.html#operations-Upload-post_api_uploads_bytes), assim como descrito em [Criar documentos](./criar-documentos.md).

Em seguida, utilize a [API de validação de arquivo assinado](https://www.dropsigner.com/swagger/index.html#operations-Documents-post_api_documents_validate_signatures):

```javascript
POST /api/documents/validate-signatures

{
  "fileId": "f5ea05d7-0a5f-4933-a6d6-9a8aa3955b14",
  "mimeType": "application/pdf"
}
```

Serão retornados os dados de cada uma das assinaturas encontradas no documento:

```javascript
[
    {
        "subjectName": "John Wick",
        "emailAddress": "john.wick@mailinator.com",
        "issuerName": "Lacuna CA",
        "identifier": "81976153069",
        "companyName": null,
        "companyIdentifier": null,
        "isElectronic": false,
        "signingTime": "2020-08-18T16:38:40.538Z",
        "certificateThumbprint": "a0sRR9cWOc0PORMhTBg49ub/5BO3W5vWQ1w7+YquK5g=",
        ...
        "validationResults":
        {
            ...
            "isValid": true
        }
    }
]
```

:::tip
Em ambas as formas, verifique `validationResults.isValid` de cada assinatura para saber se ela é válida.
:::
