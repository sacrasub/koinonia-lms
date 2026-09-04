import { TccAuthGuard } from "./TccAuthGuard";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Painel do TCC - Cristiano Sacramento | Koinonia LMS',
  description: 'Área exclusiva para desenvolvimento do TCC de Cristiano Sacramento sobre Koinonia e Distância Transacional no Ensino Teológico Virtual.',
};

export default function Page() {
  return <TccAuthGuard />;
}
