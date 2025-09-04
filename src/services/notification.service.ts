import { Resend } from 'resend';
import { logger } from '../utils/logger';
import { IParcel } from '../types/parcel.types';

// API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL = 'workof.graduation@gmail.com';

/**
 * Sends a booking confirmation email to the customer.
 * @param parcel - The parcel details
 * @param customerEmail - The customer's email address
 * @returns A promise that resolves when the email is sent
 */
export const sendBookingConfirmationEmail = async (
  parcel: IParcel,
  customerEmail: string
) => {
  try {
    await resend.emails.send({
      from: `ProCourier <${SENDER_EMAIL}>`,
      to: customerEmail,
      subject: `Your Parcel Booking is Confirmed! (ID: ${parcel.parcelId})`,

      html: `
      <h1>Booking Confirmed!</h1>
      <p>Hello,</p>
      <p>Your parcel with tracking ID <strong>${parcel.parcelId}</strong> has been successfully booked.</p>
      <p>You can track it here: <a href="${process.env.FRONTEND_URL}/track/${parcel.parcelId}">Track Parcel</a></p>
      <p>Thank you for using CourierPro!</p>
    `,
    });
    logger.info(`Booking confirmation email sent to ${customerEmail}`);
  } catch (error) {
    logger.error('Error sending booking confirmation email:', error);
  }
};
