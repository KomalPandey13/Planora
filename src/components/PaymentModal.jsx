import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Ticket,
  Lock
} from 'lucide-react';
import {
  validateUPI,
  validateCard,
  validateNetBanking,
  processPayment,
  SUPPORTED_BANKS
} from '../services/paymentService';
import { sanitizeInput } from '../utils/security';
import './PaymentModal.css';

const DEMO_UPI_CHIPS = [
  { label: 'GPay', id: 'aarav.sharma@okaxis' },
  { label: 'PhonePe', id: 'student@ybl' },
  { label: 'Paytm', id: 'campusfest@paytm' }
];

export const PaymentModal = ({ event, user, isOpen, onClose, onPaymentSuccess, onViewTicket }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking'

  // Ephemeral Payment Form States (Never persisted)
  const [upiId, setUpiId] = useState('aarav.sharma@okaxis');
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('4532 0150 1234 5678');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCVV, setCardCVV] = useState('321');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  if (!isOpen || !event) return null;

  const unitPrice = Number(event.price) || 0;
  const totalAmount = unitPrice * quantity;

  // Format Card Number with space every 4 digits
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 19);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry with MM/YY slash
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Method-specific client validation
    if (activeTab === 'UPI') {
      const v = validateUPI(upiId);
      if (!v.isValid) {
        setFormError(v.message);
        return;
      }
    } else if (activeTab === 'Card') {
      const v = validateCard({
        number: cardNumber,
        expiry: cardExpiry,
        cvv: cardCVV,
        name: cardName
      });
      if (!v.isValid) {
        setFormError(v.message);
        return;
      }
    } else if (activeTab === 'NetBanking') {
      const v = validateNetBanking(selectedBank);
      if (!v.isValid) {
        setFormError(v.message);
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Ephemeral simulated gateway authorization
      const result = await processPayment({
        eventId: event.id,
        userId: user.id,
        quantity,
        unitPrice,
        method: activeTab
      });

      setReceipt(result);

      // Notify parent to store verified booking record under user account
      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...result,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          displayDate: event.displayDate,
          time: event.time,
          venue: event.venue,
          priceDisplay: `₹${totalAmount}`,
          paymentMethod: `${activeTab} (${activeTab === 'UPI' ? sanitizeInput(upiId) : activeTab === 'NetBanking' ? selectedBank : 'Debit/Credit Card'})`
        });
      }
    } catch (err) {
      setFormError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewTicketClick = () => {
    if (onViewTicket && receipt) {
      onViewTicket({
        ...receipt,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        displayDate: event.displayDate,
        time: event.time,
        venue: event.venue,
        priceDisplay: `₹${totalAmount}`,
        attendeeName: user.name,
        attendeeEmail: user.email
      });
    }
    onClose();
  };

  return (
    <div className="payment-modal-backdrop" onClick={!isProcessing ? onClose : undefined}>
      <div className="payment-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-modal-header">
          <div className="payment-modal-header-text">
            <h3>{receipt ? 'Booking Confirmed' : 'Campus Event Checkout'}</h3>
            <p>{receipt ? 'Official Digital Pass Issued' : 'Secure University Payment Gateway'}</p>
          </div>
          {!isProcessing && (
            <button type="button" className="payment-close-btn" onClick={onClose} aria-label="Close modal">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content Area */}
        {isProcessing ? (
          <div className="payment-processing-state animate-fade-in">
            <div className="payment-spinner" />
            <div className="processing-title">Authorizing Payment...</div>
            <p className="processing-desc">
              Contacting student gateway and securing your reserved seats. Do not refresh this page.
            </p>
          </div>
        ) : receipt ? (
          <div className="payment-receipt-screen animate-fade-in">
            <div className="receipt-success-badge">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="receipt-title">Payment Successful!</h4>
            <p className="receipt-subtitle">
              Your registration is confirmed. We&apos;ve generated your verified digital event ticket.
            </p>

            <div className="receipt-details-table">
              <div className="receipt-row">
                <span className="receipt-row-label">Booking ID</span>
                <span className="receipt-row-value">{receipt.bookingId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-row-label">Transaction ID</span>
                <span className="receipt-row-value">{receipt.transactionId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-row-label">Tickets Reserved</span>
                <span className="receipt-row-value">{receipt.quantity} {receipt.quantity === 1 ? 'Seat' : 'Seats'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-row-label">Payment Method</span>
                <span className="receipt-row-value">{receipt.method}</span>
              </div>
              <div className="receipt-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem' }}>
                <span className="receipt-row-label" style={{ fontWeight: 700 }}>Total Paid</span>
                <span className="receipt-row-value highlight-amount">₹{receipt.totalAmount}</span>
              </div>
            </div>

            <div className="receipt-actions">
              <button
                type="button"
                onClick={handleViewTicketClick}
                className="btn btn-primary"
                style={{ padding: '0.85rem' }}
              >
                <Ticket size={18} />
                <span>View Digital Ticket Pass</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                style={{ padding: '0.75rem' }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="payment-modal-body">
            {/* Step 1: Order Summary */}
            <div className="order-summary-box">
              <div className="order-event-title">{event.title}</div>
              <div className="order-event-meta">
                <span className="order-meta-item">
                  <Calendar size={14} color="var(--primary-violet)" />
                  <span>{event.date}</span>
                </span>
                <span className="order-meta-item">
                  <MapPin size={14} color="var(--primary-violet)" />
                  <span>{event.venue}</span>
                </span>
              </div>

              <div className="order-controls-row">
                <div className="quantity-picker">
                  <label htmlFor="ticket-quantity" className="quantity-label">
                    Quantity:
                  </label>
                  <select
                    id="ticket-quantity"
                    className="quantity-selector"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'ticket' : 'tickets'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="order-total-block">
                  <div className="order-total-label">Total Amount</div>
                  <div className="order-total-price">₹{totalAmount}</div>
                </div>
              </div>
            </div>

            {/* Error Notification */}
            {formError && (
              <div className="alert-banner alert-danger">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{formError}</span>
              </div>
            )}

            {/* Step 2: Payment Method Tabs */}
            <div className="payment-tabs-nav">
              <button
                type="button"
                className={`payment-tab-trigger ${activeTab === 'UPI' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('UPI');
                  setFormError('');
                }}
              >
                <Smartphone size={16} />
                <span>UPI / VPA</span>
              </button>

              <button
                type="button"
                className={`payment-tab-trigger ${activeTab === 'Card' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('Card');
                  setFormError('');
                }}
              >
                <CreditCard size={16} />
                <span>Debit / Card</span>
              </button>

              <button
                type="button"
                className={`payment-tab-trigger ${activeTab === 'NetBanking' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('NetBanking');
                  setFormError('');
                }}
              >
                <Building size={16} />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handlePaySubmit} className="payment-form-content">
              {activeTab === 'UPI' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label" htmlFor="upi-id-input">
                    Virtual Payment Address (UPI ID)
                  </label>
                  <input
                    id="upi-id-input"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    placeholder="e.g. yourname@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />

                  {/* Demo Helper Chips */}
                  <div className="upi-chips-row">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Fill:</span>
                    {DEMO_UPI_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        className="upi-chip-btn"
                        onClick={() => setUpiId(chip.id)}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Card' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-name-input">
                      Cardholder Name
                    </label>
                    <input
                      id="card-name-input"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '1rem' }}
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="card-number-input">
                      Card Number
                    </label>
                    <input
                      id="card-number-input"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '1rem' }}
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      required
                    />
                  </div>

                  <div className="card-grid-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="card-expiry-input">
                        Expiry (MM/YY)
                      </label>
                      <input
                        id="card-expiry-input"
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        maxLength={5}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="card-cvv-input">
                        CVV / CVC
                      </label>
                      <input
                        id="card-cvv-input"
                        type="password"
                        className="form-input"
                        style={{ paddingLeft: '1rem' }}
                        placeholder="•••"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value.slice(0, 4))}
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'NetBanking' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label" htmlFor="bank-selector">
                    Select Your Bank
                  </label>
                  <select
                    id="bank-selector"
                    className="form-select"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    {SUPPORTED_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Security Banner */}
              <div className="payment-security-notice">
                <Lock size={15} color="#166534" />
                <span>256-bit encrypted simulated university transaction. PCI-DSS compliant.</span>
              </div>

              {/* Pay Button */}
              <button type="submit" className="btn btn-primary payment-submit-btn">
                <ShieldCheck size={18} />
                <span>Pay ₹{totalAmount} & Confirm Registration</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

