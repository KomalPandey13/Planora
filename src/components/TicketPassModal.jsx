import React from 'react';
import {
  X,
  Printer,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  User,
  Ticket,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import './TicketPassModal.css';

/**
 * Generates a 21x21 deterministic QR code SVG matrix from a seed string (e.g. Booking ID)
 */
function renderDeterministicQR(seed = 'PLN-2026-X89K') {
  const size = 21;
  const matrix = Array.from({ length: size }, () => Array(size).fill(0));

  // Helper to mark a 7x7 finder pattern
  const setFinder = (startRow, startCol) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startRow + r][startCol + c] = isBorder || isCenter ? 1 : 0;
      }
    }
  };

  // 1. Position three corner finder patterns
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // 2. Timing patterns on row 6 & col 6
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0 ? 1 : 0;
    matrix[i][6] = i % 2 === 0 ? 1 : 0;
  }

  // 3. Hash the seed string to generate a repeatable pseudo-random sequence
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }

  const nextRand = () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return (hash % 100) / 100;
  };

  // 4. Fill remaining data modules deterministically
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Skip finder patterns and margins
      const inTopLeft = r <= 7 && c <= 7;
      const inTopRight = r <= 7 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c <= 7;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        matrix[r][c] = nextRand() > 0.48 ? 1 : 0;
      }
    }
  }

  // SVG representation
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="130"
      height="130"
      shapeRendering="crispEdges"
      style={{ display: 'block' }}
      aria-label={`QR Code for Booking ID ${seed}`}
    >
      <rect width={size} height={size} fill="#FAF8FF" />
      {matrix.map((row, r) =>
        row.map((val, c) => (val === 1 ? <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#1E1B4B" /> : null))
      )}
    </svg>
  );
}

export const TicketPassModal = ({ isOpen, onClose, ticketData }) => {
  if (!isOpen || !ticketData) return null;

  const {
    eventTitle = 'Campus Event Pass',
    attendeeName = 'Student Attendee',
    eventDate = '2026-11-20',
    time = '10:00 AM - 04:00 PM',
    venue = 'Campus Main Auditorium',
    quantity = 1,
    totalAmount = 0,
    bookingId = 'PLN-2026-CONFIRMED',
    passCode = 'PASS-982713',
    status = 'Confirmed'
  } = ticketData;

  const isFree = totalAmount === 0 || ticketData.paymentMethod === 'Free Entry';
  const amountPaidDisplay = isFree ? 'Free Entry' : `₹${totalAmount}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-modal-backdrop" onClick={onClose}>
      <div className="ticket-modal-wrapper animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Boarding Pass Ticket */}
        <div className="boarding-pass-card">
          {/* Header Banner */}
          <div className="ticket-header-banner">
            <div className="ticket-brand">
              <Sparkles size={20} />
              <span>Planora Official Entry Pass</span>
            </div>
            <div className="ticket-badge-pill">
              <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
              <span>{status}</span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="ticket-body-grid">
            <div className="ticket-left-info">
              <div className="ticket-event-title">{eventTitle}</div>

              <div className="ticket-info-columns-2">
                <div className="ticket-info-item">
                  <span className="ticket-info-label">Attendee Name</span>
                  <span className="ticket-info-value">
                    <User size={15} color="var(--primary-violet)" />
                    <span>{attendeeName}</span>
                  </span>
                </div>

                <div className="ticket-info-item">
                  <span className="ticket-info-label">Reserved Seats</span>
                  <span className="ticket-info-value">
                    <Ticket size={15} color="var(--primary-violet)" />
                    <span>{quantity} {quantity === 1 ? 'Admit' : 'Admits'}</span>
                  </span>
                </div>
              </div>

              <div className="ticket-info-columns-2">
                <div className="ticket-info-item">
                  <span className="ticket-info-label">Date & Time</span>
                  <span className="ticket-info-value" style={{ fontSize: '0.88rem' }}>
                    <Calendar size={14} color="var(--primary-violet)" />
                    <span>{eventDate} • {time}</span>
                  </span>
                </div>

                <div className="ticket-info-item">
                  <span className="ticket-info-label">Amount Paid</span>
                  <span
                    className="ticket-info-value"
                    style={{ color: isFree ? '#166534' : 'var(--primary-violet)' }}
                  >
                    {amountPaidDisplay}
                  </span>
                </div>
              </div>

              <div className="ticket-info-item">
                <span className="ticket-info-label">Venue Location</span>
                <span className="ticket-info-value" style={{ fontSize: '0.88rem' }}>
                  <MapPin size={14} color="var(--primary-violet)" />
                  <span>{venue}</span>
                </span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="ticket-qr-section">
              <div className="ticket-qr-box">
                {renderDeterministicQR(bookingId)}
              </div>
              <div className="ticket-qr-code-text">{passCode}</div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Scan at Gate Entrance</span>
            </div>
          </div>

          {/* Ticket Stub Footer */}
          <div className="ticket-stub-footer">
            <div>
              <span>Booking Ref: </span>
              <span className="ticket-booking-code">{bookingId}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="#166534" />
              <span>Verified Collegiate Event Network</span>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="ticket-modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.65rem 1.4rem' }}
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.6rem' }}
          >
            <Printer size={16} />
            <span>Print / Save Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};

