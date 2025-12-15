import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Navbar from "../../components/NavBar/NavBar";
import "./PaymentPage.css";

// Validation Schema
const paymentSchema = yup.object().shape({
  name: yup.string().required("Cardholder Name is required"),
  number: yup
    .string()
    .required("Card Number is required")
    .matches(/^\d{4} \d{4} \d{4} \d{4}$/, "Must be 16 digits formatted as 0000 0000 0000 0000"),
  expiry: yup
    .string()
    .required("Expiry Date is required")
    .matches(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Invalid date format (MM/YY)"),
  cvv: yup
    .string()
    .required("CVV is required")
    .matches(/^\d{3}$/, "CVV must be 3 digits"),
});

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { updateBooking } = useData();

  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(paymentSchema),
    defaultValues: {
      number: "4242 4242 4242 4242",
      expiry: "12/30",
      cvv: "123",
      name: "Demo User",
    },
  });

  // 1. Safety Check
  useEffect(() => {
    if (!state || !state.bookingData) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state) return null;
  const { bookingData } = state;

  // 2. Handle The Dummy Payment
  const onSubmit = (data) => {
    // Simulate Processing
    setIsProcessing(true);

    setTimeout(() => {
      // A. Add Final Metadata
      const finalBooking = {
        ...bookingData,
        status: "Confirmed",
        paymentStatus: "Paid",
        bookedAt: new Date().toISOString(),
        paymentId: `PAY_${Date.now()}`, // Fake Transaction ID
      };

      // B. SAVE TO DATABASE (Context)
      updateBooking(finalBooking);

      // C. Success & Redirect
      setIsProcessing(false);
      toast.success("Payment Successful! Booking Confirmed.");
      navigate("/"); // Ideally redirect to a Ticket View page
    }, 1000); // 2 Second Delay for realism
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="payment-container">
        {/* LEFT: PAYMENT FORM */}
        <div className="payment-box">
          <div className="payment-header">
            <h2>Secure Payment</h2>
            <div className="card-icons">
              <span className="material-symbols-outlined">credit_card</span>
              <span className="secure-text">Encrypted</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="payment-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                maxLength="19"
                {...register("number")}
                className={errors.number ? "input-error" : ""}
              />
              {errors.number && <p className="error-text">{errors.number.message}</p>}
            </div>

            <div className="row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength="5"
                  {...register("expiry")}
                  className={errors.expiry ? "input-error" : ""}
                />
                {errors.expiry && <p className="error-text">{errors.expiry.message}</p>}
              </div>
              <div className="form-group">
                <label>CVV / CVC</label>
                <input
                  type="password"
                  placeholder="123"
                  maxLength="3"
                  {...register("cvv")}
                  className={errors.cvv ? "input-error" : ""}
                />
                {errors.cvv && <p className="error-text">{errors.cvv.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                {...register("name")}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>

            <button
              type="submit"
              className={`btn-pay-final ${isProcessing ? "processing" : ""}`}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing Payment..."
                : `Pay $${bookingData.totalFare}`}
            </button>
          </form>
        </div>

        {/* RIGHT: ORDER SUMMARY */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Bus Operator</span>
            <span>IntrCity SmartBus</span>
          </div>
          <div className="summary-row">
            <span>Passengers</span>
            <span>{bookingData.passengerDetails.length}</span>
          </div>
          <div className="summary-row">
            <span>Seats</span>
            <span>{bookingData.seatsBooked.join(", ")}</span>
          </div>
          <div className="divider"></div>
          <div className="summary-total">
            <span>Total Amount</span>
            <span>₹{bookingData.totalFare}</span>
          </div>

          <div className="secure-badge">
            <span className="material-symbols-outlined">lock</span>
            Secure 256-bit SSL Encrypted
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
