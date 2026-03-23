import Header from '@/components/layout/Header';
import VisitorPanel from '@/components/layout/VisitorPanel';

export default function VisitorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 bg-white">
        <VisitorPanel />
      </main>
    </div>
  );
}
