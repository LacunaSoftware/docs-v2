import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from '../index.module.css';

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
        name: 'Digital Certification',
        description: 'Concepts and guides on digital certification, ICP-Brasil and public key infrastructure.',
        href: '/docs-v2/docs/en/pki-guide/',
      },
      {
        id: 'web-pki',
        name: 'Web PKI',
        description: 'Component for using digital certificates directly in the browser.',
        href: '/docs-v2/docs/en/web-pki/',
      },
      {
        id: 'rest-pki',
        name: 'Rest PKI',
        description: 'REST API for digital signature, validation and timestamping of documents.',
        href: '/docs-v2/docs/en/rest-pki/',
      },
      {
        id: 'rest-pki-core',
        name: 'Rest PKI Core',
        description: 'Modern version of Rest PKI with support for signature sessions and biometrics.',
        href: '/docs-v2/docs/en/rest-pki-core/',
      },
      {
        id: 'pki-sdk',
        name: 'PKI SDK',
        description: '.NET SDK for cryptographic operations, certificate signing and validation.',
        href: '/docs-v2/docs/en/pki-sdk/',
      },
      {
        id: 'pki-express',
        name: 'PKI Express',
        description: 'Cross-platform library for digital signing in any language via command line.',
        href: '/docs-v2/docs/en/pki-express/',
      },
    ],
  },
  {
    title: 'Signature & CA',
    products: [
      {
        id: 'signer',
        name: 'Signer',
        description: 'Digital document signing platform with support for multiple formats and certificates.',
        href: '/docs-v2/docs/en/signer/',
      },
      {
        id: 'amplia',
        name: 'Amplia',
        description: 'Certificate authority for issuing and managing digital certificates.',
        href: '/docs-v2/docs/en/amplia/',
      },
      {
        id: 'amplia-reg',
        name: 'Amplia Reg',
        description: 'Registration and identity validation module for certificate issuance.',
        href: '/docs-v2/docs/en/amplia-reg/',
      },
    ],
  },
  {
    title: 'Other Products',
    products: [
      {
        id: 'grant-id',
        name: 'GrantID',
        description: 'Identity and access control solution with support for OpenID Connect and OAuth 2.0.',
        href: '/docs-v2/docs/en/grant-id/',
      },
      {
        id: 'scanner',
        name: 'Scanner',
        description: 'Service for scanning, recognition and processing of documents.',
        href: '/docs-v2/docs/en/scanner/',
      },
      {
        id: 'psc',
        name: 'PSC',
        description: 'Trust Service Provider for cloud-based certificate issuance.',
        href: '/docs-v2/docs/en/psc/',
      },
      {
        id: 'tsa',
        name: 'TSA',
        description: 'Timestamp authority for certifying the date and time of documents.',
        href: '/docs-v2/docs/en/tsa/',
      },
      {
        id: 'digiploma',
        name: 'Digiploma',
        description: 'Platform for issuing and validating digital diplomas according to MEC standards.',
        href: '/docs-v2/docs/en/digiploma/',
      },
    ],
  },
];

function ProductCard({product}: {product: Product}): ReactNode {
  return (
    <Link to={product.href} className={styles.card}>
      <p className={styles.cardName}>{product.name}</p>
      <p className={styles.cardDescription}>{product.description}</p>
      <span className={styles.cardBadge}>View docs →</span>
    </Link>
  );
}

export default function HomeEn(): ReactNode {
  return (
    <Layout
      title="Documentation"
      description="Technical documentation for Lacuna Software products">

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Lacuna Software Documentation</h1>
        <p className={styles.heroSubtitle}>
          Welcome to docs.lacunasoftware.com, our new unified technical documentation experience.
          <br />
          {' '}For end-user support, please visit our{' '}
          <a href="https://lacuna.movidesk.com/" target="_blank" rel="noopener noreferrer" className={styles.heroLink}>
            Support Center
          </a>.
        </p>
      </header>

      <main>
       <div className={styles.productsHeader} style={{textAlign: 'center'}}>
          <h2 className={styles.productsTitle}>
            <Link to="/docs-v2/docs/pki-guide/" className={styles.heroLink}>
              Digital Certification Solutions
            </Link>
          </h2>
          <p className={styles.productsSubtitle}>Or go directly to a specific product's documentation:</p>
        </div>
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
