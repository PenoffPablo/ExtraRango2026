import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cart from '../Cart';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    };
  },
}));

describe('Cart Component (Checkout Action)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the checkout button disabled initially', () => {
    render(<Cart />);
    const reviewButton = screen.getByText(/REVISAR PEDIDO/i).closest('button');
    expect(reviewButton).toBeDisabled();
  });

  it('enables the checkout button when both tipoComprobante and metodoEnvio are selected', () => {
    render(<Cart />);
    
    // Select Factura A
    const facturaA = screen.getByText(/Factura A/i).closest('button');
    fireEvent.click(facturaA!);

    // Should still be disabled because shipping method is not selected
    let reviewButton = screen.getByText(/REVISAR PEDIDO/i).closest('button');
    expect(reviewButton).toBeDisabled();

    // Select OCA
    const ocaBtn = screen.getByText('OCA').closest('button');
    fireEvent.click(ocaBtn!);

    // Now it should be enabled
    expect(reviewButton).not.toBeDisabled();
  });

  it('dispatches checkoutPreview event with correct payload on click', () => {
    render(<Cart />);
    
    // Simulate user login and items in cart so validation passes
    localStorage.setItem('usuario_extrarango', JSON.stringify({ id: 1, nombre: 'Test' }));
    localStorage.setItem('cart_extrarango', JSON.stringify([{ id: 1, cantidad: 1 }]));

    const spy = vi.spyOn(window, 'dispatchEvent');

    const facturaA = screen.getByText(/Factura A/i).closest('button');
    fireEvent.click(facturaA!);

    const ocaBtn = screen.getByText('OCA').closest('button');
    fireEvent.click(ocaBtn!);

    const reviewButton = screen.getByText(/REVISAR PEDIDO/i).closest('button');
    fireEvent.click(reviewButton!);

    expect(spy).toHaveBeenCalled();
    const eventArg = spy.mock.calls[0][0] as CustomEvent;
    expect(eventArg.type).toBe('checkoutPreview');
    expect(eventArg.detail).toEqual({ tipoComprobante: 'FACTURA_A', metodoEnvio: 'OCA' });
  });
});
