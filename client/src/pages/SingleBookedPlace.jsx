import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AccountNav from '../components/ui/AccountNav';
import AddressLink from '../components/ui/AddressLink';
import BookingDates from '../components/ui/BookingDates';
import PlaceGallery from '../components/ui/PlaceGallery';
import Spinner from '../components/ui/Spinner';
import axiosInstance from '../utils/axios';
import { setupInterceptors } from '@/utils/setupInterceptors';
import CopyLink from '@/components/ui/CopyToClipboard';
import { toast } from 'react-toastify';

setupInterceptors();

const SingleBookedPlace = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState({});
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');

  const getBookings = async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get('/bookings');

      // filter the data to get current booking
      const filteredBooking = data.bookings.filter(
        (booking) => booking.bookingId === id,
      );

      setBooking(filteredBooking[0]);
    } catch (error) {
      console.log('Error: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBookings();
  }, [id]);

  const handleReviewChange = (e) => {
    setReview(e.target.value);
  };

  const handleSubmitReview = async () => {
    try {
      const userId = JSON.parse(localStorage.user).userId;
      const { data } = await axiosInstance.post('/user/reviewAnalysis', {
        userId: userId,
        placeId: booking.placeId,
        review: review,
      });

      toast.success('Feedback submitted successfully');
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <AccountNav />
      {booking?.place ? (
        <div className="p-4">
          <h1 className="text-3xl">{booking?.place?.title}</h1>

          <AddressLink
            className="my-2 block"
            placeAddress={booking.place?.address}
          />
          <CopyLink id={id} text={'Copy booking id'} />
          <div className="my-6 flex flex-col items-center justify-between rounded-2xl bg-gray-200 p-6 sm:flex-row">
            <div className=" ">
              <h2 className="mb-4 text-2xl md:text-2xl">
                Your booking information
              </h2>
              <BookingDates booking={booking} />
            </div>
            <div className="mt-5 w-full rounded-2xl bg-primary p-6 text-white sm:mt-0 sm:w-auto">
              <div className="hidden md:block">Total price</div>
              <div className="flex justify-center text-3xl">
                <span>${booking?.price}</span>
              </div>
            </div>
          </div>
          <PlaceGallery place={booking?.place} />

          <div className="my-4">
            <div className="my-4">
              <textarea
                value={review}
                onChange={handleReviewChange}
                placeholder="Please enter your feedback. Note that it will be used by our internal team to gain insights and improve the app experience."
                className="w-full rounded border border-gray-300 p-2"
              ></textarea>
              <button
                onClick={handleSubmitReview}
                className="mt-2 rounded bg-primary px-4 py-2 text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <h1> No data</h1>
      )}
    </div>
  );
};

export default SingleBookedPlace;
