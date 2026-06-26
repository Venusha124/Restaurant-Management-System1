'use client';

import React, { useState, useRef } from 'react';
import { useReservations } from '../ReservationsContext';

export default function AgreementPage() {
    const { data, refreshData, fetchAPI } = useReservations();
    const { reservations, settings } = data;

    const currency = settings?.currency_symbol || 'Rs.';
    const businessName = settings?.business_name || 'ASCENDIA BANQUETS';

    const confirmed = reservations.filter(r => r.status === 'Confirmed');

    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [currentReservationId, setCurrentReservationId] = useState<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const formatCurrency = (val: number) => `${currency}${(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '';

    const updateReservationStatus = async (id: number, status: string) => {
        try {
            await fetchAPI(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
            await refreshData();
        } catch (e: any) { alert('Failed to update: ' + e.message); }
    };

    const handlePrintAgreement = (r: any) => {
        if (!r.signature_data) {
            setCurrentReservationId(r.id);
            setIsSignatureModalOpen(true);
            setTimeout(() => {
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) {
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 3;
                        ctx.lineCap = 'round';
                    }
                }
            }, 100);
            return;
        }

        printDocument(r);
    };

    const printDocument = (r: any) => {
        const w = window.open('', '_blank');
        if (!w) return;

        const dateFormatted = formatDate(r.date_start);
        const dateEndFormatted = r.date_end ? formatDate(r.date_end) : dateFormatted;

        w.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Agreement - AGR-${String(r.id).padStart(4, '0')}</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Outfit', sans-serif; color: #222; padding: 40px; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
                    .header p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
                    .agreement-title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; text-decoration: underline; }
                    
                    .meta-table, .signature-table { width: 100%; border-collapse: collapse; border: none !important; margin-bottom: 30px; background: transparent !important; }
                    .meta-table td, .signature-table td { border: none !important; padding: 0 !important; background: transparent !important; text-align: left; vertical-align: top; }
                    
                    .meta-table { border-bottom: 1px solid #eee; font-weight: bold; font-size: 14px; }
                    .meta-table td { padding: 0 0 10px 0 !important; }
                    
                    .info-table { width: 100%; border: none; margin-bottom: 30px; border-collapse: collapse; }
                    .info-table td { border: none !important; padding: 10px 20px 10px 0 !important; background: transparent !important; }
                    .info-table td.right-col { border-left: 1px solid #eee !important; padding: 10px 0 10px 20px !important; }
                    
                    .section-title { font-weight: bold; font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; text-transform: uppercase; }
                    
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    
                    .terms { font-size: 12px; color: #555; border-top: 1px solid #eee; padding-top: 20px; margin-top: 50px; }
                    
                    .signature-table { margin-top: 80px; }
                    .signature-table td { width: 43%; vertical-align: bottom; text-align: center; }
                    .signature-table td.spacer { width: 14%; }
                    .signature-space { height: 90px; text-align: center; font-size: 0; line-height: 90px; margin-bottom: 10px; }
                    .signature-space img { max-height: 90px; max-width: 240px; vertical-align: bottom; display: inline-block; filter: invert(1); }
                    .signature-line-text { border-top: 1px solid #000; padding-top: 8px; font-size: 14px; line-height: 1.5; }
                    
                    .print-btn-container { text-align: center; margin-top: 40px; }
                    @media print { body { padding: 20px; } .print-btn-container { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${businessName}</h1>
                    <p>${businessName} · General Agreement</p>
                </div>
                
                <div class="agreement-title">${businessName.toUpperCase()} AGREEMENT</div>
                
                <table class="meta-table">
                    <tr>
                        <td style="text-align: left;">
                            Agreement Reference: AGR-${String(r.id).padStart(4, '0')}<br>
                            Booking Reference: ${r.booking_no || 'BKG-' + String(r.id).padStart(4, '0')}
                        </td>
                        <td style="text-align: right; vertical-align: bottom;">Date Generated: ${new Date().toLocaleDateString('en-GB')}</td>
                    </tr>
                </table>

                <table class="info-table">
                    <tr>
                        <td style="width: 50%; vertical-align: top;">
                            <div class="section-title">Client Information</div>
                            <div style="line-height: 1.8; font-size: 14px;">
                                <strong>Name:</strong> ${r.customer_name}<br>
                                <strong>Contact Phone:</strong> ${r.customer_phone || '—'}<br>
                            </div>
                        </td>
                        <td class="right-col" style="width: 50%; vertical-align: top;">
                            <div class="section-title">Venue & Event Details</div>
                            <div style="line-height: 1.8; font-size: 14px;">
                                <strong>Venue / Room:</strong> ${r.room_name || 'General Venue'}<br>
                                <strong>Event Name:</strong> ${r.event_name}<br>
                                <strong>Date of Event:</strong> ${dateFormatted} to ${dateEndFormatted}<br>
                                <strong>Number of Guests:</strong> ${r.num_guests || '—'}
                            </div>
                        </td>
                    </tr>
                </table>

                <div class="section-title">Billing & Financial Breakdown</div>
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Price Rate</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Banquet Hall / Event Room reservation for dates: ${dateFormatted} to ${dateEndFormatted}</td>
                            <td>${formatCurrency(r.price_per_day)} / day</td>
                            <td style="font-weight: bold; color: #000;">${formatCurrency(r.total_price)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="terms">
                    <strong>TERMS & CONDITIONS:</strong><br>
                    1. The client agrees to pay the total reservation fee at least 7 days before the event starts.<br>
                    2. Cancellations made within 48 hours of the event are non-refundable. Cancellations prior to this are eligible for 50% refund.<br>
                    3. The client is responsible for any damage caused to properties or venues during the event.<br>
                    4. ${businessName} guarantees the reserved room will be set up and prepared according to specification detailed in internal notes.
                </div>

                <table class="signature-table">
                    <tr>
                        <td>
                            <div class="signature-space"></div>
                            <div class="signature-line-text">
                                Authorized Signatory<br>
                                <span style="font-size: 12px; color: #666;">${businessName}</span>
                            </div>
                        </td>
                        <td class="spacer"></td>
                        <td>
                            <div class="signature-space">
                                <img src="${r.signature_data}" alt="Customer Signature">
                            </div>
                            <div class="signature-line-text">
                                <strong>${r.customer_name}</strong><br>
                                <span style="font-size: 12px; color: #666;">Customer Signature (E-Signed)</span>
                            </div>
                        </td>
                    </tr>
                </table>

                <div class="print-btn-container">
                    <button onclick="window.print();" style="padding: 10px 20px; font-size: 16px; background: #00f2fe; border: none; border-radius: 6px; cursor: pointer; color: black; font-weight: bold;">Print Document</button>
                </div>
            </body>
            </html>
        `);
        w.document.close();
    };

    const handleCanvasMouseDown = (e: any) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        const rect = canvasRef.current.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
    };

    const handleCanvasMouseMove = (e: any) => {
        if (!isDrawing || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        const rect = canvasRef.current.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const handleCanvasMouseUp = () => setIsDrawing(false);

    const clearCanvas = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const saveSignature = async () => {
        if (!currentReservationId || !canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL();

        try {
            await fetchAPI(`/reservations/${currentReservationId}/signature`, { method: 'PATCH', body: JSON.stringify({ signature_data: dataUrl }) });
            setIsSignatureModalOpen(false);
            await refreshData();
            
            // Re-fetch or re-evaluate to print immediately
            const updated = reservations.find(r => r.id === currentReservationId);
            if (updated) {
                printDocument({ ...updated, signature_data: dataUrl });
            }
        } catch (e: any) { alert('Failed to save signature: ' + e.message); }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div className="card">
                <div className="section-header" style={{ marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
                            <i className="fa-solid fa-file-contract" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
                            Agreements
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{confirmed.length} confirmed bookings from database</p>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Ref #</th><th>Event</th><th>Customer</th><th>Venue</th><th>Value</th><th>Event Date</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {confirmed.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>
                                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                            <i className="fa-solid fa-file-circle-xmark" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
                                            <h3>No Agreements</h3>
                                            <p>Confirm reservations to generate agreements</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                confirmed.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>AGR-{String(r.id).padStart(4, '0')}</td>
                                        <td style={{ fontWeight: 700 }}>{r.event_name}</td>
                                        <td>
                                            {r.customer_name}<br />
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.customer_phone || ''}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{r.room_name || '—'}</td>
                                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(r.total_price)}</td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDate(r.date_start)} → {formatDate(r.date_end)}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button className="btn btn-outline btn-sm" onClick={() => handlePrintAgreement(r)}>
                                                    <i className="fa-solid fa-print" style={{ marginRight: '5px' }}></i>Print
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => updateReservationStatus(r.id, 'Cancelled')}>
                                                    <i className="fa-solid fa-xmark"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Signature Modal */}
            {isSignatureModalOpen && (
                <div className="modal-overlay open" id="signatureModal">
                    <div className="modal-content" style={{ maxWidth: '600px', borderTop: '5px solid #00f2fe', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.6), 0 0 35px rgba(0, 242, 254, 0.15)' }}>
                        <button className="modal-close" onClick={() => setIsSignatureModalOpen(false)}><i className="fa-solid fa-xmark"></i></button>
                        <h3><i className="fa-solid fa-signature" style={{ color: '#00f2fe', marginRight: '10px' }}></i>Customer E-Signature</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Ask the customer to sign inside the box below to authorize the agreement.</p>
                        
                        <div style={{ background: 'rgba(0,0,0,0.3)', border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            <canvas 
                                ref={canvasRef}
                                width="500" 
                                height="200" 
                                style={{ background: 'transparent', cursor: 'crosshair', maxWidth: '100%', touchAction: 'none' }}
                                onMouseDown={handleCanvasMouseDown}
                                onMouseMove={handleCanvasMouseMove}
                                onMouseUp={handleCanvasMouseUp}
                                onMouseLeave={handleCanvasMouseUp}
                            ></canvas>
                        </div>
                        
                        <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
                            <button className="btn btn-outline" onClick={clearCanvas}>
                                <i className="fa-solid fa-eraser" style={{ marginRight: '8px' }}></i>Clear
                            </button>
                            <button className="btn btn-primary" onClick={saveSignature} style={{ background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#000', border: 'none' }}>
                                <i className="fa-solid fa-check" style={{ marginRight: '8px' }}></i>Save & Print Agreement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
