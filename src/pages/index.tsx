import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

interface Product {
  id: string;
  name: string;
  description: string;
  href: string;
}

interface Section {
  title: string;
  products: Product[];
}

const SECTIONS: Section[] = [
  {
    title: 'Assinatura e Certificado Digitais',
    products: [
      {
        id: 'pki-guide',
        name: 'Signer',
        description: 'Plataforma de assinatura digital de documentos com suporte a múltiplos formatos e certificados.',
        href: '/articles/signer',
      },
      {
        id: 'web-pki',
        name: 'Web PKI',
        description: 'Componente para uso de certificados digitais diretamente no navegador.',
        href: '/articles/web-pki',
      },
      {
        id: 'rest-pki-core',
        name: 'RestPKICore',
        description: 'Versão moderna do Rest PKI com suporte a sessões de assinatura e biometria.',
        href: '/articles/rest-pki/core',
      },
      {
        id: 'pki-express',
        name: 'PKI Express',
        description: 'Biblioteca multiplataforma para assinatura digital em qualquer linguagem via linha de comando.',
        href: '/articles/pki-express',
      },
      {
        id: 'pki-sdk',
        name: 'PKI SDK',
        description: 'SDK .NET para operações criptográficas, assinatura e validação de certificados.',
        href: '/articles/pki-sdk',
      },
      {
        id: 'rest-pki',
        name: 'Rest PKI',
        description: 'API REST para assinatura digital, validação e carimbo de tempo de documentos.',
        href: '/articles/rest-pki',
      },
    ],
  },
  {
    title: 'Soluções para Autoridade Certificadora',
    products: [
      {
        id: 'amplia',
        name: 'Amplia',
        description: 'Autoridade certificadora para emissão e gestão de certificados digitais.',
        href: '/articles/amplia',
      },
      {
        id: 'amplia-reg',
        name: 'Amplia Reg',
        description: 'Módulo de registro e validação de identidade para emissão de certificados.',
        href: '/articles/amplia-reg',
      },
      {
        id: 'psc',
        name: 'PSC',
        description: 'Prestador de Serviço de Confiança para emissão de certificados em nuvem.',
        href: '/articles/psc',
      },
      {
        id: 'tsa',
        name: 'TSA',
        description: 'Autoridade de carimbo de tempo para certificação de data e hora de documentos.',
        href: '/articles/tsa',
      },
    ],
  },
  {
    title: 'Artigos',
    products: [
      {
        id: 'pki-guide',
        name: 'Certificação Digital',
        description: 'Conceitos e guias sobre certificação digital, ICP-Brasil e infraestrutura de chaves públicas.',
        href: '/articles/pki-guide',
      },
    ],
  },
  {
    title: 'Outros Produtos',
    products: [
      {
        id: 'bem-vindo',
        name: 'Bem-vindo',
        description: 'Bem-vindo ao docs.lacunasoftware.com, a nossa nova experiência unificada de documentação técnica.',
        href: '/articles/welcome',
      },
      {
        id: 'bulk-signer',
        name: 'Bulk Signer',
        description: 'Solução para assinatura digital em massa de documentos, com suporte a filas e processamento assíncrono.',
        href: '/articles/bulk-signer',
      },
      {
        id: 'scanner',
        name: 'Scanner',
        description: 'Serviço para digitalização, reconhecimento e processamento de documentos.',
        href: '/articles/scanner',
      },
      {
        id: 'digiploma',
        name: 'Digiploma',
        description: 'Plataforma para emissão e validação de diplomas digitais conforme padrões MEC.',
        href: '/articles/digiploma',
      },
      {
        id: 'grant-id',
        name: 'GrantID',
        description: 'Solução de identidade e controle de acesso com suporte a OpenID Connect e OAuth 2.0.',
        href: '/articles/grant-id',
      },
    ],
  },
];

function ProductCard({product}: {product: Product}): ReactNode {
  return (
    <Link to={product.href} className={styles.card}>
      <p className={styles.cardName}>{product.name}</p>
      <p className={styles.cardDescription}>{product.description}</p>
      <span className={styles.cardBadge}>Ver documentação →</span>
    </Link>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Documentação"
      description="Technical documentation for Lacuna Software products">

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Documentação Lacuna Software</h1>
        <p className={styles.heroSubtitle}>
          Bem-vindo ao docs.lacunasoftware.com, a nossa nova experiência unificada de documentação técnica.
          <br />
          {' '}Para suporte a usuário final, por favor visite nossa{' '}
          <a href="https://lacuna.movidesk.com/" target="_blank" rel="noopener noreferrer" className={styles.heroLink}>
            Central de Suporte
          </a>.
        </p>
      </header>

      <main>
        {/* <div className={styles.productsHeader} style={{textAlign: 'center'}}>
          <h2 className={styles.productsTitle}>
            <Link to="/articles/pki-guide" className={styles.heroLink}>
              Soluções para certificação digital
            </Link>
          </h2>
          <p className={styles.productsSubtitle}>Ou siga diretamente para a documentação de um produto específico:</p>
        </div> */}
        {SECTIONS.map(section => (
          <section key={section.title} className={styles.section}>
            <p className={styles.sectionTitle}>{section.title}</p>
            <div className={styles.grid}>
              {section.products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        ))}
      </main>

    </Layout>
  );
}
