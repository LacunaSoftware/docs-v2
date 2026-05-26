# Gerando códigos alfanuméricos em Java

Ao gerar uma versão para impressão de um arquivo assinado, é necessário gerar um *código de verificação* a ser
incluido no documento para que um terceiro que porventura receba o documento impresso possa visitar o seu site e fornecer o
código, obtendo assim a versão assinada digitalmente (que é a que efetivamente tem validade jurídica):

![Codigo de verificacao](/images/verification-code.png)

No passado, nós províamos o código-fonte para geração desse código de verificação como parte dos exemplos, a ser copiado
para o código da sua aplicação. Por exemplo:

```cs
public static class Util {
   
   // ...

   public static string GenerateVerificationCode() {
      // String with exactly 32 letters and numbers to be used on the codes.
      const string Alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      // Allocate a byte array large enough to receive the necessary entropy
      var bytes = new byte[(int)Math.Ceiling(VerificationCodeSize * 5 / 8.0)];
      // ...
      return sb.ToString();
   }

   // ...

}
```

Entretanto, como o código de verificação desempenha um papel crucial na proteção do acesso aos seus documentos, nós
agora oferecemos a classe `AlphaCode` para fazer a geração dos códigos.

<a name="update-code" />
## Atualizando sua aplicação para usar a classe *AlphaCode*

:::warning
A lógica de geração de códigos de verificação passou por uma auditoria minuciosa e recebeu importantes melhorias.
Por isso, recomendamos que você atualize a sua aplicação para utilizar a classe *AlphaCode* ao invés de utilizar
o código-fonte antigo.
:::


Você provavelmente copiou anteriormente os métodos (agora obsoletos) `generateVerificationCode`, `formatVerificationCode` e `parseVerificationCode`
dos exemplos para o seu código. Para atualizar a sua aplicação:

1. Atualize o pacote de Maven *com.lacunasoftware.pkiexpress* para a versão **1.10.0** ou superior
1. Substitua a implementação desses métodos no seu código por chamadas aos métodos da classe *AlphaCode*:

   ```java
   public static String generateVerificationCode() {
      return AlphaCode.generate();
   }
   
   public static String formatVerificationCode(String code) {
      return AlphaCode.format(code);
   }
   
   public static String parseVerificationCode(String formattedCode) {
      return AlphaCode.parse(formattedCode);
   }
   ```

## Princípios de projeto

A classe *AlphaCode* gera códigos alfanuméricos feitos para serem lidos por pessoas seguindo os princípios abaixo:

1. Os códigos devem de fácil leitura
1. Os códigos devem poder ser facilmente digitados com baixo risco de confundir caracteres similares como `O` e `0`
1. Os códigos devem ter relativa alta entropia com relação ao tamanho do código (alto número de possíveis códigos relativo ao tamanho
   do código, permitindo ao desenvolvedor escolher um código de tamanho relativamente pequeno)

Para melhorar a legibilidade, são utilizadas apenas letras maiúsculas e não são utilizados os caracteres `O`, `0`, `1` e `I`. A entropia
por caractere é relativamente alta, se comparada com um código hexadecimal: como existem 32 possíveis caracteres, cada caractere contribui
com 5 bits à entropia total do código gerado (25% a mais do que num código hexadecimal), o que resulta em códigos menores para uma dada entropia mínima.

Por exemplo, para gerar um código com 80 bits de entropia (2^80 possíveis códigos):

* Em hexadecimal, seria necessário um código de 20 caracteres, ex: `90A0-F20F-5883-8D55-AD31`
* Com a classe *AlphaCode*, o código teria apenas 16 caracteres, ex: `FFWC-RHC5-9NLF-VM42`

## Veja também

* [Gerando códigos alfanuméricos em Java (Rest PKI)](../../rest-pki/java/alpha-codes.md)
* [Usando o PKI Express em Java](index.md)
