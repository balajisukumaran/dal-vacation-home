import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AccountNav from '@/components/ui/AccountNav';
import PlaceImg from '@/components/ui/PlaceImg';
import BookingDates from '@/components/ui/BookingDates';
import Spinner from '@/components/ui/Spinner';
import axiosInstance from '@/utils/axios';
import { setupInterceptors } from '@/utils/setupInterceptors';
import { toast } from 'react-toastify';

setupInterceptors();

const ConcernsPage = () => {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [statuses, setStatuses] = useState({});
  const [closedTickets, setClosedTickets] = useState({});
  const user = JSON.parse(localStorage.user);
  const isAgent = user.isAgent === 'y' ? true : false;

  useEffect(() => {
    const getConcerns = async () => {
      try {
        const { data } = await axiosInstance.post('/concerns/ticket', {
          userId: user.userId,
        });

        setConcerns(data.tickets);
        setLoading(false);
      } catch (error) {
        console.log('Error: ', error);
        setLoading(false);
      }
    };

    getConcerns();
  }, []);

  const handleCommentChange = (ticketId, value) => {
    setComments({
      ...comments,
      [ticketId]: value,
    });
  };

  const handleStatusChange = (ticketId, value) => {
    setStatuses({
      ...statuses,
      [ticketId]: value,
    });
  };

  const handleUpdateTicket = async (ticketId) => {
    try {
      const response = await axiosInstance.post('/concerns/update', {
        ticketId: ticketId,
        updatedFields: {
          status: statuses[ticketId] || 'pending',
          comments: comments[ticketId] || '',
        },
      });

      toast.success('Status updated successfully.');

      // Update the closedTickets state to make the comment readonly if the status is closed
      if (statuses[ticketId] === 'closed') {
        setClosedTickets({
          ...closedTickets,
          [ticketId]: true,
        });
      }
    } catch (error) {
      console.log('Error:', error);
      toast.error('unable to update status.');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="flex flex-col items-center">
      <AccountNav />
      <div>
        {concerns?.length > 0 ? (
          concerns.map((concern) => (
            <div
              className="mx-4 my-8 flex gap-4 overflow-hidden rounded-2xl bg-gray-200 p-4 lg:mx-0"
              key={concern?.booking?.bookingId}
            >
              <div className="w-2/6 md:w-1/6">
                {concern?.place?.photos[0] && (
                  <PlaceImg
                    place={concern?.place}
                    className={'h-full w-full object-cover'}
                  />
                )}
              </div>
              <div className="grow">
                <h2 className="md:text-2xl">{concern?.place?.title}</h2>
                <div className="md:text-xl">
                  <BookingDates
                    booking={concern?.booking}
                    className="mb-2 mt-4 hidden items-center text-gray-600 md:flex"
                  />
                </div>
                <div className="md:text-xl">
                  <div className="flex gap-2 border-t pt-2"></div>
                  <div className="md:text-xl">
                    <span>Current status : {concern?.ticket?.status}</span>
                  </div>
                </div>
                <div className="md:text-xl">
                  <div className="flex gap-2 border-t pt-2"></div>
                  <div className="md:text-xl">
                    <span>Concern : {concern?.ticket?.concern}</span>
                  </div>
                </div>
                <div className="md:text-xl">
                  <div className="flex gap-2 border-t pt-2"></div>
                  <div className="md:text-xl">
                    <span>Comment : {concern?.ticket?.comments}</span>
                  </div>
                </div>
                <div
                  className="comment-section mt-4"
                  style={{ display: isAgent ? 'block' : 'none' }}
                >
                  <input
                    type="text"
                    value={comments[concern?.ticket?.ticketId] || ''}
                    onChange={(e) =>
                      handleCommentChange(
                        concern?.ticket?.ticketId,
                        e.target.value,
                      )
                    }
                    placeholder="Enter your comment"
                    className="w-full rounded border border-gray-300 p-2"
                    readOnly={closedTickets[concern?.ticket?.ticketId]}
                  />
                  <div
                    className="mt-2 flex items-center"
                    style={{ width: '250px', float: 'right' }}
                  >
                    <select
                      value={statuses[concern?.ticket?.ticketId] || 'pending'}
                      onChange={(e) =>
                        handleStatusChange(
                          concern?.ticket?.ticketId,
                          e.target.value,
                        )
                      }
                      className="mr-2 flex-grow rounded border border-gray-300 p-2"
                      disabled={closedTickets[concern?.ticket?.ticketId]}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                    {!closedTickets[concern?.ticket?.ticketId] && (
                      <button
                        onClick={() =>
                          handleUpdateTicket(concern?.ticket?.ticketId)
                        }
                        className="primary"
                      >
                        Update
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="">
            <div className="flex flex-col justify-start">
              <h1 className="my-6 text-3xl font-semibold">Trips</h1>
              <hr className="border border-gray-300" />
              <h3 className="pt-6 text-2xl font-semibold">
                No tickets raised... yet!
              </h3>
              <p>
                Time to dust off your bags and start planning your next
                adventure.
              </p>
              <Link to="/" className="my-4">
                <div className="flex w-40 justify-center rounded-lg border border-black p-3 text-lg font-semibold hover:bg-gray-50">
                  Start Searching
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConcernsPage;
