import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CheckoutConfirmModal from '../CheckoutConfirmModal';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
    };
  },
}));

describe('CheckoutConfirmModal (Integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock fetch for /api/dolar
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ valor: 1500 }),
        ok: true,
      } as any)
    );
  });

  it('renders the correct shipping method text for OCA', () => {
    render(
      <CheckoutConfirmModal 
        tipoComprobante="REMITO" 
        metodoEnvio="OCA" 
        onClose={vi.fn()} 
      />
    );
    
    // We expect the text "OCA (Pago en Destino)" to be present
    expect(screen.getByText('OCA (Pago en Destino)')).toBeInTheDocument();
  });

  it('renders the correct shipping method text for ANDREANI', () => {
    render(
      <CheckoutConfirmModal 
        tipoComprobante="FACTURA_A" 
        metodoEnvio="ANDREANI" 
        onClose={vi.fn()} 
      />
    );
    
    expect(screen.getByText('Andreani (Pago en Destino)')).toBeInTheDocument();
  });
});
