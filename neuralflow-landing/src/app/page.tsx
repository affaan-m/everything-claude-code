import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductPreview from '@/components/ProductPreview';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <ProductPreview />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}