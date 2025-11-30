// C3.1 - Complete Booking Flow with Stripe Payment
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './BookingModal.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// Stripe card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

// Step 1: Select showtime and seats
const ShowtimeSelection = ({ showtimes, onNext, onClose }) => {
  const { t } = useTranslation();
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [numSeats, setNumSeats] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!selectedShowtime) {
      newErrors.showtime = t('booking.selectShowtimeError');
    }

    if (!customerName.trim()) {
      newErrors.name = t('booking.nameRequired');
    } else if (customerName.trim().length < 2) {
      newErrors.name = t('booking.nameTooShort');
    }

    if (!customerEmail.trim()) {
      newErrors.email = t('booking.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.email = t('booking.emailInvalid');
    }

    if (numSeats < 1) {
      newErrors.seats = t('booking.seatsMinimum');
    } else if (selectedShowtime && numSeats > selectedShowtime.available_seats) {
      newErrors.seats = t('booking.seatsExceeded');
    }

    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const totalPrice = selectedShowtime.price * numSeats;

    onNext({
      showtime: selectedShowtime,
      numSeats,
      totalPrice,
      customerName,
      customerEmail,
      customerPhone,
    });
  };

  return (
    <div className="booking-step">
      <h2>{t('booking.selectShowtime')}</h2>

      {showtimes.length === 0 ? (
        <div className="no-showtimes">
          <p>{t('booking.noShowtimes')}</p>
        </div>
      ) : (
        <>
          <div className="showtimes-list">
            {showtimes.map((showtime) => (
              <div
                key={showtime.showtime_id}
                className={`showtime-card ${
                  selectedShowtime?.showtime_id === showtime.showtime_id ? 'selected' : ''
                }`}
                onClick={() => setSelectedShowtime(showtime)}
              >
                <div className="showtime-info">
                  <div className="showtime-date">
                    📅 {new Date(showtime.show_date).toLocaleDateString()}
                  </div>
                  <div className="showtime-time">🕐 {showtime.show_time}</div>
                  <div className="showtime-theater">
                    🎬 {showtime.theater_name} - {showtime.auditorium_name}
                  </div>
                  <div className="showtime-price">💰 {showtime.price} EUR</div>
                  <div className="showtime-seats">
                    🪑 {showtime.available_seats} {t('booking.seatsAvailable')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!selectedShowtime && errors.showtime && (
            <div className="form-error">{errors.showtime}</div>
          )}

          {selectedShowtime && (
            <div className="customer-info-form">
              <h3>{t('booking.yourInformation')}</h3>
              
              <div className="form-group">
                <label>{t('booking.name')} *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  placeholder={t('booking.namePlaceholder')}
                  className={errors.name ? 'input-error' : ''}
                  required
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label>{t('booking.email')} *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  placeholder={t('booking.emailPlaceholder')}
                  className={errors.email ? 'input-error' : ''}
                  required
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label>{t('booking.phone')}</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t('booking.phonePlaceholder')}
                />
              </div>

              <div className="form-group">
                <label>{t('booking.numberOfSeats')} *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedShowtime.available_seats}
                  value={numSeats}
                  onChange={(e) => {
                    setNumSeats(parseInt(e.target.value) || 1);
                    if (errors.seats) setErrors({ ...errors, seats: null });
                  }}
                  className={errors.seats ? 'input-error' : ''}
                  required
                />
                {errors.seats && <div className="form-error">{errors.seats}</div>}
              </div>

              <div className="booking-summary">
                <div className="summary-row">
                  <span>{t('booking.ticketPrice')}:</span>
                  <span>{selectedShowtime.price} EUR</span>
                </div>
                <div className="summary-row">
                  <span>{t('booking.quantity')}:</span>
                  <span>{numSeats}</span>
                </div>
                <div className="summary-row total">
                  <span>{t('booking.total')}:</span>
                  <span>{(selectedShowtime.price * numSeats).toFixed(2)} EUR</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="modal-buttons">
        <button className="btn btn-secondary" onClick={onClose}>
          {t('booking.cancel')}
        </button>
        {selectedShowtime && (
          <button className="btn btn-primary" onClick={handleNext}>
            {t('booking.continue')} →
          </button>
        )}
      </div>
    </div>
  );
};

// Step 2: Payment with Stripe
const PaymentForm = ({ bookingData, onBack, onSuccess, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError(t('booking.pleaseLogin'));
      setProcessing(false);
      return;
    }

    try {
      // Step 1: Create payment intent
      const intentResponse = await fetch(`${API_BASE}/bookings/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          showtime_id: bookingData.showtime.showtime_id,
          customer_name: bookingData.customerName,
          customer_email: bookingData.customerEmail,
          customer_phone: bookingData.customerPhone,
          number_of_seats: bookingData.numSeats,
          total_price: bookingData.totalPrice,
        }),
      });

      const intentData = await intentResponse.json();

      if (!intentResponse.ok) {
        throw new Error(intentData.message || t('booking.paymentFailed'));
      }

      const { client_secret, payment_intent_id } = intentData;

      // Step 2: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: bookingData.customerName,
              email: bookingData.customerEmail,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Step 3: Confirm booking
        const confirmResponse = await fetch(`${API_BASE}/bookings/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            payment_intent_id,
            showtime_id: bookingData.showtime.showtime_id,
            customer_name: bookingData.customerName,
            customer_email: bookingData.customerEmail,
            customer_phone: bookingData.customerPhone,
            number_of_seats: bookingData.numSeats,
            total_price: bookingData.totalPrice,
          }),
        });

        const confirmData = await confirmResponse.json();

        if (!confirmResponse.ok) {
          throw new Error(confirmData.message || t('booking.confirmationFailed'));
        }

        onSuccess(confirmData.booking);
      } else {
        throw new Error(t('booking.paymentNotSuccessful'));
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || t('booking.paymentError'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="booking-step">
      <h2>{t('booking.paymentDetails')}</h2>

      <div className="payment-summary">
        <h3>{t('booking.bookingSummary')}</h3>
        <div className="summary-details">
          <p>
            <strong>{t('booking.movie')}:</strong> {bookingData.showtime.movie_title}
          </p>
          <p>
            <strong>{t('booking.date')}:</strong>{' '}
            {new Date(bookingData.showtime.show_date).toLocaleDateString()}
          </p>
          <p>
            <strong>{t('booking.time')}:</strong> {bookingData.showtime.show_time}
          </p>
          <p>
            <strong>{t('booking.theater')}:</strong> {bookingData.showtime.theater_name}
          </p>
          <p>
            <strong>{t('booking.seats')}:</strong> {bookingData.numSeats}
          </p>
          <p className="total-price">
            <strong>{t('booking.total')}:</strong> {bookingData.totalPrice.toFixed(2)} EUR
          </p>
        </div>
      </div>

      <form onSubmit={handlePayment} className="payment-form">
        <div className="form-group">
          <label>{t('booking.cardDetails')}</label>
          <div className="card-element-wrapper">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          <p className="test-card-info">
            {t('booking.testCard')}: 4242 4242 4242 4242
          </p>
        </div>

        {error && <div className="error-message">❌ {error}</div>}

        <div className="modal-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onBack}
            disabled={processing}
          >
            ← {t('booking.back')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!stripe || processing}
          >
            {processing ? t('booking.processing') : `${t('booking.pay')} ${bookingData.totalPrice.toFixed(2)} EUR`}
          </button>
        </div>
      </form>
    </div>
  );
};

// Success confirmation
const BookingConfirmation = ({ booking, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="booking-step confirmation">
      <div className="success-icon">✅</div>
      <h2>{t('booking.bookingConfirmed')}</h2>
      <p className="success-message">{t('booking.confirmationMessage')}</p>

      <div className="confirmation-details">
        <p>
          <strong>{t('booking.bookingId')}:</strong> #{booking.booking_id}
        </p>
        <p>
          <strong>{t('booking.email')}:</strong> {booking.customer_email}
        </p>
        <p className="confirmation-note">{t('booking.emailSent')}</p>
      </div>

      <div className="modal-buttons">
        <button className="btn btn-primary" onClick={onClose}>
          {t('booking.close')}
        </button>
      </div>
    </div>
  );
};

// Main Booking Modal Component
const BookingModal = ({ movie, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [showtimes, setShowtimes] = useState([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(true);
  const [bookingData, setBookingData] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  // Load Stripe and showtimes when modal opens
  useEffect(() => {
    if (isOpen && movie) {
      // Fetch Stripe publishable key
      const loadStripeKey = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const res = await fetch(`${API_BASE}/bookings/payment-config`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok && data.publishable_key) {
            setStripePromise(loadStripe(data.publishable_key));
          }
        } catch (error) {
          console.error('Failed to load Stripe key:', error);
        }
      };

      // Fetch showtimes for the movie
      const fetchShowtimes = async () => {
        setLoadingShowtimes(true);
        try {
          const res = await fetch(`${API_BASE}/showtimes?movie_id=${movie.id}`);
          const data = await res.json();
          // Filter showtimes for future dates only
          const futureShowtimes = data.filter((st) => new Date(st.show_date) >= new Date());
          setShowtimes(futureShowtimes);
        } catch (error) {
          console.error('Failed to fetch showtimes:', error);
          setShowtimes([]);
        } finally {
          setLoadingShowtimes(false);
        }
      };

      loadStripeKey();
      fetchShowtimes();
    }
  }, [isOpen, movie]);

  // Reset modal state when closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setBookingData(null);
      setConfirmedBooking(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStepNext = (data) => {
    setBookingData(data);
    setStep(2);
  };

  const handleStepBack = () => {
    setStep(1);
  };

  const handleSuccess = (booking) => {
    setConfirmedBooking(booking);
    setStep(3);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <h1 className="modal-title">{movie.title}</h1>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>

        <div className="modal-body">
          {loadingShowtimes ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>{t('booking.loadingShowtimes')}</p>
            </div>
          ) : step === 1 ? (
            <ShowtimeSelection
              showtimes={showtimes}
              onNext={handleStepNext}
              onClose={onClose}
            />
          ) : step === 2 && stripePromise ? (
            <Elements stripe={stripePromise}>
              <PaymentForm
                bookingData={bookingData}
                onBack={handleStepBack}
                onSuccess={handleSuccess}
                onClose={onClose}
              />
            </Elements>
          ) : step === 3 ? (
            <BookingConfirmation booking={confirmedBooking} onClose={onClose} />
          ) : (
            <div className="error-state">
              <p>{t('booking.stripeNotConfigured')}</p>
              <button className="btn btn-secondary" onClick={onClose}>
                {t('booking.close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

