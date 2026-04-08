import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RecetaModal from '../RecetaModal';

// Mock de fetch global
global.fetch = vi.fn();

const mockProducto = {
    id: 1,
    nombre: "Lente de Prueba",
    material: "Laboratorio Poly",
    linea: "Laboratorio Monofocal",
    esfera_desde: "-4.00",
    esfera_hasta: "4.00",
    cilindro_hasta: "-2.00",
    precio_base_usd: "100.00"
};

const mockTratamientos = [
    { id: 101, codigo: "T1", nombre: "Antirreflex", categoria: "Antirreflejo", precio_usd: 10 },
    { id: 102, codigo: "REC-ANTIPARRAS", nombre: "Recargo Antiparras", categoria: "Recargo Técnico", precio_usd: 20 },
    { id: 103, codigo: "C1", nombre: "Clariflex", categoria: "Tecnología", precio_usd: 15 },
    { id: 104, codigo: "C2", nombre: "Clariflex Plus", categoria: "Tecnología", precio_usd: 25 },
];

describe('RecetaModal - Pruebas de Lógica de Negocio', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        
        (global.fetch as any).mockImplementation((url: string) => {
            if (url.includes('/api/dolar')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ valor: 1000 }) });
            }
            if (url.includes('/api/tratamientos')) {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(mockTratamientos) });
            }
            return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
        });
        
        // Mock robusto de localStorage
        const store: Record<string, string> = {};
        const localStorageMock = {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
            clear: vi.fn(() => { for (const key in store) delete store[key]; }),
            removeItem: vi.fn((key: string) => { delete store[key]; }),
            length: 0,
            key: vi.fn((index: number) => null)
        };
        
        vi.stubGlobal('localStorage', localStorageMock);
        window.dispatchEvent = vi.fn();
    });

    it('debe calcular el precio total correctamente para AMBOS ojos (100% base)', async () => {
        render(<RecetaModal producto={mockProducto} onClose={() => {}} />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

        await waitFor(() => {
            const matches = screen.queryAllByText((content) => content.replace(/\D/g, '').includes('100000'));
            expect(matches.length).toBeGreaterThan(0);
        });
    });

    it('debe calcular el precio al 50% para un solo ojo (DERECHO)', async () => {
        render(<RecetaModal producto={mockProducto} onClose={() => {}} />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

        const btnDerecho = screen.getAllByText(/Ojo Derecho/i)[0];
        fireEvent.click(btnDerecho);

        await waitFor(() => {
            const matches = screen.queryAllByText((content) => content.replace(/\D/g, '').includes('50000'));
            expect(matches.length).toBeGreaterThan(0);
        });
    });

    it('debe aplicar mutua exclusión en tratamientos de la misma categoría', async () => {
        render(<RecetaModal producto={mockProducto} onClose={() => {}} />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

        // Usamos regex exactos para evitar colisión entre "Clariflex" y "Clariflex Plus"
        const checkClariflex = screen.getByText(/^Clariflex$/);
        const checkClariflexPlus = screen.getByText(/^Clariflex Plus$/);

        fireEvent.click(checkClariflex);
        await waitFor(() => {
            const matches = screen.queryAllByText((content) => content.replace(/\D/g, '').includes('115000'));
            expect(matches.length).toBeGreaterThan(0);
        });

        fireEvent.click(checkClariflexPlus);
        await waitFor(() => {
            const matches = screen.queryAllByText((content) => content.replace(/\D/g, '').includes('125000'));
            expect(matches.length).toBeGreaterThan(0);
        });
    });

    it('debe restringir el recargo de Antiparras solo a materiales Poly', async () => {
        const { rerender } = render(<RecetaModal producto={mockProducto} onClose={() => {}} />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());
        expect(screen.getByText(/Antiparras/i)).toBeInTheDocument();

        const mockProductoCR39 = { ...mockProducto, material: "CR-39" };
        rerender(<RecetaModal producto={mockProductoCR39} onClose={() => {}} />);
        expect(screen.queryByText(/Antiparras/i)).not.toBeInTheDocument();
    });

    it('debe validar la potencia meridional (ESF + CIL) fuera de rango', async () => {
        render(<RecetaModal producto={mockProducto} onClose={() => {}} />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

        const inputsEsfera = screen.getAllByPlaceholderText(/Ej: -4\.00/i);
        const inputsCilindro = screen.getAllByPlaceholderText(/Ej: -1\.00/i);

        fireEvent.change(inputsEsfera[0], { target: { value: '-4.00' } });
        fireEvent.change(inputsCilindro[0], { target: { value: '-2.00' } });

        expect(screen.getByText(/Fuera de rango/i)).toBeInTheDocument();
    });

    it('debe incluir Prisma y Armazón en el payload del carrito para AMBOS ojos', async () => {
        render(<RecetaModal producto={mockProducto} onClose={() => {}} />);
        await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

        const inputsEsfera = screen.getAllByPlaceholderText(/Ej: -4\.00/i);
        const inputsCilindro = screen.getAllByPlaceholderText(/Ej: -1\.00/i);
        
        // Completar datos para que el botón "Agregar" funcione
        fireEvent.change(inputsEsfera[0], { target: { value: '0.00' } });
        fireEvent.change(inputsCilindro[0], { target: { value: '0.00' } });
        fireEvent.change(inputsEsfera[1], { target: { value: '0.00' } });
        fireEvent.change(inputsCilindro[1], { target: { value: '0.00' } });

        const inputsPrisma = screen.getAllByPlaceholderText(/Opcional/i);
        fireEvent.change(inputsPrisma[0], { target: { value: '2.5' } }); // OD Prisma

        fireEvent.click(screen.getByText(/Medidas del Armazón/i));
        const inputsMm = screen.getAllByPlaceholderText('mm');
        fireEvent.change(inputsMm[0], { target: { value: '54' } }); // A

        const btnAgregar = screen.getByText(/Agregar al Pedido/i);
        fireEvent.click(btnAgregar);

        await waitFor(() => expect(localStorage.setItem).toHaveBeenCalled());
        
        const lastCall = (vi.mocked(localStorage.setItem)).mock.calls.find(c => c[0] === 'cart_extrarango');
        expect(lastCall).toBeDefined();
        const cartData = JSON.parse(lastCall![1]);
        const item = cartData[cartData.length - 1];

        expect(item.prismaOD).toBe(2.5);
        expect(item.armazonTransversal).toBe(54);
    });
});
