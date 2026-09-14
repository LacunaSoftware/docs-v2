---
sidebar_label: "Validate signatures"
sidebar_position: 4
slug: /signer/integration/validation
---

# Validate document's signatures

You can validate a document's signatures in two different ways:

* with the **document validation key**, if it was signed in this instance of Signer;
* with the **signed file**, useful to validate documents signed anywhere.

## Validation with a validation key

To validate a document with a validation key, use the [Validation Key API](https://www.dropsigner.com/swagger/index.html#operations-Documents-get_api_documents_keys__key__signatures) providing its corresponding key.

The document's primary data and the information of each signature found will be returned:

```javascript
GET /api/documents/keys/AX4F8FV8NNAX25TENE2S/signatures

{
    "id": "b12cb1b2-5d6e-40b2-a050-097d068c4c11",
    "name": "Integration Contract",
    "filename": "Contract.pdf",
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

## Validation with the signed file

To validate a document from the signed file, first upload the file using the [Upload API](https://www.dropsigner.com/swagger/index.html#operations-Upload-post_api_uploads) or the [simplified Upload API (POST /api/uploads/bytes)](https://www.dropsigner.com/swagger/index.html#operations-Upload-post_api_uploads_bytes), as described in [Create documents](/signer/integration/documents).

Then use the [Signed File Validation API](https://www.dropsigner.com/swagger/index.html#operations-Documents-post_api_documents_validate_signatures):

```javascript
POST /api/documents/validate-signatures

{
  "fileId": "f5ea05d7-0a5f-4933-a6d6-9a8aa3955b14",
  "mimeType": "application/pdf"
}
```

The data of each signature found in the document will be returned:

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
In both approaches, check each signature's `validationResults.isValid` to know whether it is valid.
:::
