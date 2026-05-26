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
    title: 'PKI',
    products: [
      {
        id: 'pki-guide',
        name: 'Certificação Digital',
        description: 'Conceitos e guias sobre certificação digital, ICP-Brasil e infraestrutura de chaves públicas.',
        href: '/docs-v2/docs/pki-guide/',
      },
      {
        id: 'web-pki',
        name: 'Web PKI',
        description: 'Componente para uso de certificados digitais diretamente no navegador.',
        href: '/docs-v2/docs/web-pki/',
      },
      {
        id: 'rest-pki',
        name: 'Rest PKI',
        description: 'API REST para assinatura digital, validação e carimbo de tempo de documentos.',
        href: '/docs-v2/docs/rest-pki/',
      },
      {
        id: 'rest-pki-core',
        name: 'Rest PKI Core',
        description: 'Versão moderna do Rest PKI com suporte a sessões de assinatura e biometria.',
        href: '/docs-v2/docs/rest-pki-core/',
      },
      {
        id: 'pki-sdk',
        name: 'PKI SDK',
        description: 'SDK .NET para operações criptográficas, assinatura e validação de certificados.',
        href: '/docs-v2/docs/pki-sdk/',
      },
      {
        id: 'pki-express',
        name: 'PKI Express',
        description: 'Biblioteca multiplataforma para assinatura digital em qualquer linguagem via linha de comando.',
        href: '/docs-v2/docs/pki-express/',
      },
    ],
  },
  {
    title: 'Assinatura & CA',
    products: [
      {
        id: 'signer',
        name: 'Signer',
        description: 'Plataforma de assinatura digital de documentos com suporte a múltiplos formatos e certificados.',
        href: '/docs-v2/docs/signer/',
      },
      {
        id: 'amplia',
        name: 'Amplia',
        description: 'Autoridade certificadora para emissão e gestão de certificados digitais.',
        href: '/docs-v2/docs/amplia/',
      },
      {
        id: 'amplia-reg',
        name: 'Amplia Reg',
        description: 'Módulo de registro e validação de identidade para emissão de certificados.',
        href: '/docs-v2/docs/amplia-reg/',
      },
    ],
  },
  {
    title: 'Outros Produtos',
    products: [
      {
        id: 'grant-id',
        name: 'GrantID',
        description: 'Solução de identidade e controle de acesso com suporte a OpenID Connect e OAuth 2.0.',
        href: '/docs-v2/docs/grant-id/',
      },
      {
        id: 'scanner',
        name: 'Scanner',
        description: 'Serviço para digitalização, reconhecimento e processamento de documentos.',
        href: '/docs-v2/docs/scanner/',
      },
      {
        id: 'psc',
        name: 'PSC',
        description: 'Prestador de Serviço de Confiança para emissão de certificados em nuvem.',
        href: '/docs-v2/docs/psc/',
      },
      {
        id: 'tsa',
        name: 'TSA',
        description: 'Autoridade de carimbo de tempo para certificação de data e hora de documentos.',
        href: '/docs-v2/docs/tsa/',
      },
      {
        id: 'digiploma',
        name: 'Digiploma',
        description: 'Plataforma para emissão e validação de diplomas digitais conforme padrões MEC.',
        href: '/docs-v2/docs/digiploma/',
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
      description="Documentação técnica para produtos Lacuna Software">

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Documentação Lacuna Software</h1>
        <p className={styles.heroSubtitle}>
          Documentação técnica para <strong>desenvolvedores</strong>
        </p>
      </header>

      <main>
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
