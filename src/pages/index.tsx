import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

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
    description: 'Plataforma de assinatura digital de documentos com suporte a múltiplos formatos e certificados.',
    href: '/docusaurus/docs/signer/',
    badge: 'Disponível',
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
        <section className={styles.section}>
          <p className={styles.sectionTitle}>Produtos</p>
          <div className={styles.grid}>
            {PRODUCTS.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </main>

    </Layout>
  );
}
