import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from '../index.module.css';

interface Product {
  id: string;
  name: string;
  description: string;
  href: string;
  badge: string;
  available: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: 'signer',
    name: 'Signer',
    description: 'Digital document signing platform with support for multiple formats and certificates.',
    href: '/docs-v2/docs/en/signer/',
    badge: 'Available',
    available: true,
  },
  // Add more products here as they are migrated
];

function ProductCard({product}: {product: Product}): ReactNode {
  if (!product.available) return null;

  return (
    <Link to={product.href} className={styles.card}>
      <p className={styles.cardName}>{product.name}</p>
      <p className={styles.cardDescription}>{product.description}</p>
      <span className={styles.cardBadge}>{product.badge} →</span>
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
          Technical documentation for <strong>developers</strong>
        </p>
      </header>

      <main>
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Products</p>
          <div className={styles.grid}>
            {PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </main>

    </Layout>
  );
}
