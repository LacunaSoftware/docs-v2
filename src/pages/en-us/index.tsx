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
    title: 'Digital Signature & Certificates',
    products: [
      {
        id: 'pki-guide',
        name: 'Signer',
        description: 'Digital document signing platform with support for multiple formats and certificates.',
        href: '/en-us/articles/signer',
      },
      {
        id: 'web-pki',
        name: 'Web PKI',
        description: 'Component for using digital certificates directly in the browser.',
        href: '/en-us/articles/web-pki',
      },
      {
        id: 'rest-pki-core',
        name: 'RestPKI Core',
        description: 'Modern version of Rest PKI with support for signature sessions and biometrics.',
        href: '/en-us/articles/rest-pki/core',
      },
      {
        id: 'pki-express',
        name: 'PKI Express',
        description: 'Cross-platform library for digital signing in any language via command line.',
        href: '/en-us/articles/pki-express',
      },
      {
        id: 'pki-sdk',
        name: 'PKI SDK',
        description: '.NET SDK for cryptographic operations, certificate signing and validation.',
        href: '/en-us/articles/pki-sdk',
      },
      {
        id: 'rest-pki',
        name: 'Rest PKI',
        description: 'REST API for digital signature, validation and timestamping of documents.',
        href: '/en-us/articles/rest-pki',
      },
    ],
  },
  {
    title: 'Certificate Authority Solutions',
    products: [
      {
        id: 'amplia',
        name: 'Amplia',
        description: 'Certificate authority for issuing and managing digital certificates.',
        href: '/en-us/articles/amplia',
      },
      {
        id: 'amplia-reg',
        name: 'Amplia Reg',
        description: 'Registration and identity validation module for certificate issuance.',
        href: '/en-us/articles/amplia-reg',
      },
      {
        id: 'psc',
        name: 'PSC',
        description: 'Trust Service Provider for cloud-based certificate issuance.',
        href: '/en-us/articles/psc',
      },
      {
        id: 'tsa',
        name: 'TSA',
        description: 'Timestamp authority for certifying the date and time of documents.',
        href: '/en-us/articles/tsa',
      },
    ],
  },
  {
    title: 'Articles',
    products: [
      {
        id: 'pki-guide',
        name: 'Digital Certification',
        description: 'Concepts and guides on digital certification, ICP-Brasil and public key infrastructure.',
        href: '/en-us/articles/pki-guide',
      },
    ],
  },
  {
    title: 'Other Products',
    products: [
      {
        id: 'welcome',
        name: 'Welcome',
        description: 'Welcome to docs.lacunasoftware.com, our new unified technical documentation experience.',
        href: '/en-us/articles/welcome',
      },
      {
        id: 'bulk-signer',
        name: 'Bulk Signer',
        description: 'Solution for bulk digital document signing with support for queues and asynchronous processing.',
        href: '/en-us/articles/bulk-signer',
      },
      {
        id: 'scanner',
        name: 'Scanner',
        description: 'Service for scanning, recognition and processing of documents.',
        href: '/en-us/articles/scanner',
      },
      {
        id: 'digiploma',
        name: 'Digiploma',
        description: 'Platform for issuing and validating digital diplomas according to MEC standards.',
        href: '/en-us/articles/digiploma',
      },
      {
        id: 'grant-id',
        name: 'GrantID',
        description: 'Identity and access control solution with support for OpenID Connect and OAuth 2.0.',
        href: '/en-us/articles/grant-id',
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
       {/* <div className={styles.productsHeader} style={{textAlign: 'center'}}>
          <h2 className={styles.productsTitle}>
            <Link to="/en-us/articles/pki-guide" className={styles.heroLink}>
              Digital Certification Solutions
            </Link>
          </h2>
          <p className={styles.productsSubtitle}>Or go directly to a specific product's documentation:</p>
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
