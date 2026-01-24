"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";

export default function RemitoPage() {
    const params = useParams();
    const [pedido, setPedido] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Buscar los datos del pedido específico
        fetch(`/api/admin/pedidos/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setPedido(data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [params.id]);

    if (loading) return <div className="p-10 text-center">Cargando remito...</div>;
    if (!pedido || pedido.error) return <div className="p-10 text-center text-red-500">Pedido no encontrado</div>;

    return (
        <div className="bg-white min-h-screen text-black pt-32 px-8 pb-8 font-sans">

            {/* Estilos específicos para impresión */}
            <style jsx global>{`
                @media print {
                    /* Ocultamos el botón de imprimir */
                    .no-print { display: none !important; }
                    
                    /* CAMBIO 2: Ocultamos el Header y Footer de la web para que no salgan en el PDF */
                    header, footer { display: none !important; }
                    
                    /* Ajustes para la hoja */
                    body { -webkit-print-color-adjust: exact; background: white; }
                    @page { margin: 0; size: A4; }
                    .remito-container { border: none; } /* Opcional: quitar borde en impresión */
                }

                /* Estilos normales (Pantalla) */
                .remito-container {
                    border: 1px solid #000;
                    position: relative;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1); /* Sombrita para que destaque */
                }
                /* ... (resto de tus estilos CSS igual que antes) ... */
                .header {
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 2px solid #000;
                    padding-bottom: 20px;
                    position: relative;
                    margin-bottom: 20px;
                }
                .r-box {
                    position: absolute;
                    left: 50%;
                    top: -21px;
                    transform: translateX(-50%);
                    width: 50px;
                    height: 50px;
                    background: white;
                    border: 1px solid #000;
                    border-top: none;
                    text-align: center;
                    font-size: 30px;
                    font-weight: bold;
                    line-height: 50px;
                }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-45deg);
                    font-size: 100px;
                    color: rgba(0,0,0,0.05);
                    pointer-events: none;
                    font-weight: bold;
                    z-index: 0;
                }
                .info-row {
                    display: flex;
                    margin-bottom: 5px;
                }
                .info-label {
                    font-weight: bold;
                    width: 100px;
                }
                .items-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    margin-bottom: 20px;
                }
                .items-table th {
                    border: 1px solid #000;
                    background-color: #f0f0f0;
                    padding: 8px;
                    font-size: 12px;
                    text-transform: uppercase;
                }
                .items-table td {
                    border: 1px solid #000;
                    padding: 8px;
                    font-size: 12px;
                }
            `}</style>

            {/* BOTÓN IMPRIMIR*/}
            <div className="no-print text-center mb-8">
                <button
                    onClick={() => window.print()}
                    className="bg-[#1F4E79] text-white px-8 py-4 rounded-xl font-black text-lg flex items-center gap-3 mx-auto hover:bg-[#153a5a] transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                >
                    <Printer size={24} />
                    IMPRIMIR / GUARDAR PDF
                </button>
                <p className="text-gray-400 text-sm mt-2">
                    Tip: En la ventana que se abre, selecciona "Destino: Guardar como PDF"
                </p>
            </div>
            <div className="remito-container">
                <div className="watermark">EXTRARANGO</div>

                <div className="header">
                    <div className="r-box">R</div>
                    <div className="w-1/2 pr-8 border-r border-gray-300">
                        <h1 className="text-3xl font-black tracking-tighter mb-4">EXTRARANGO</h1>
                        <div className="text-xs leading-relaxed">
                            <p><strong>Domicilio:</strong> Córdoba 270, Mendoza</p>
                            <p><strong>Teléfono:</strong> 2615542045</p>
                            <p><strong>Código Postal:</strong> 5500</p>
                            <p className="mt-2 text-gray-500">AP</p>
                        </div>
                    </div>
                    <div className="w-1/2 pl-8 text-right flex flex-col justify-between">
                        <div>
                            <div className="font-bold text-lg mb-1">REMITO</div>
                            <div className="text-[10px] font-bold uppercase mb-4">"Documento no válido como factura"</div>
                            <div className="text-xl font-mono font-bold">
                                Nro: {String(pedido.id).padStart(4, '0')} - {String(pedido.id).padStart(8, '0')}
                            </div>
                        </div>
                        <div className="text-sm">
                            <strong>FECHA:</strong> {new Date(pedido.fecha_pedido).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div className="border border-black p-4 mb-6 text-sm bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="info-row">
                            <span className="info-label">Destinatario:</span>
                            <span className="uppercase">{pedido.usuarios.nombre} {pedido.usuarios.apellido}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">CUIT/CUIL:</span>
                            <span>{pedido.usuarios.cuil}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span>{pedido.usuarios.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Dirección:</span>
                            <span className="uppercase">
                                {pedido.usuarios.calle || '-'} {pedido.usuarios.numeracion}
                                {pedido.usuarios.departamento ? ` Dpto ${pedido.usuarios.departamento}` : ''}
                                {pedido.usuarios.provincia ? ` - ${pedido.usuarios.provincia}` : ''}
                                {pedido.usuarios.cuil ? ` - ${pedido.usuarios.cuil}` : ''}
                            </span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Teléfono:</span>
                            <span>{pedido.usuarios.telefono || 'No especificado'}</span>
                        </div>
                    </div>
                </div>

                <table className="items-table">
                    <thead>
                        <tr>
                            <th className="w-[10%] text-center">Cant.</th>
                            <th className="w-[60%] text-left">Descripción</th>
                            <th className="w-[15%] text-center">Detalle</th>
                            <th className="w-[15%] text-right">Unitario (ARS)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedido.detalles_pedido.map((item: any, i: number) => (
                            <tr key={i}>
                                <td className="text-center font-bold">{item.cantidad}</td>
                                <td>
                                    <span className="font-bold">{item.productos?.nombre || "Producto Personalizado"}</span>
                                    <div className="text-[10px] text-gray-500">{item.productos?.codigo_sku}</div>
                                </td>
                                <td className="text-center text-[10px]">
                                    {item.ojo !== 'AMBOS' && <div>Ojo: {item.ojo}</div>}
                                    {item.esfera && <div>Esf: {item.esfera}</div>}
                                </td>
                                <td className="text-right font-mono">
                                    ${(Number(item.precio_unitario_usd) * Number(pedido.cotizacion_dolar_dia)).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-between items-end mt-8 border-t border-black pt-4">
                    <div className="text-[10px] w-[60%] text-gray-600">
                        Declaramos que los bienes detallados en este remito son propiedad del destinatario.<br />
                        Controlar mercadería antes de firmar. <br />
                    </div>

                    <div className="text-right">
                        <div className="text-xs font-bold uppercase text-gray-500">Total en ARS</div>
                        <div className="text-2xl font-black">
                            ${Number(pedido.total_ars).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-16 px-8 pb-4">
                    <div className="border-t border-black w-40 text-center text-xs pt-2">Firma del Remitente</div>
                    <div className="border-t border-black w-40 text-center text-xs pt-2">Firma del Destinatario</div>
                </div>
            </div>
        </div>
    );
}