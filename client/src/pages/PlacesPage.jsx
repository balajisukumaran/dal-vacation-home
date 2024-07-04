import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import axiosInstance from '@/utils/axios';
import { setupInterceptors } from '@/utils/setupInterceptors';

import AccountNav from '@/components/ui/AccountNav';
import InfoCard from '@/components/ui/InfoCard';
import Spinner from '@/components/ui/Spinner';

setupInterceptors();
const PlacesPage = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPlaces = async () => {
      try {
        const { data } = await axiosInstance.get('places/user-places');
        setPlaces(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    getPlaces();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <AccountNav />
      <div className="text-center ">
        <Link
          className="inline-flex gap-1 rounded-full bg-primary px-6 py-2 text-white"
          to={'/account/places/new'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add new place
        </Link>
      </div>
      <div className="mx-4 mt-4">
        {places.length > 0 &&
          places.map((place) => <InfoCard place={place} key={place.placeId} />)}
      </div>
    </div>
  );
};

export default PlacesPage;
