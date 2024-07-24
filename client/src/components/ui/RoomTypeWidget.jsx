import React from 'react';

const RoomTypeWidget = ({ roomType }) => {
  return (
    <div className="mt-4">
      <hr className="mb-5 border" />
      <p className="text-2xl font-semibold">Type of Place</p>

      <div className="mt-4 grid flex-col gap-4 lg:grid-cols-2 lg:justify-items-stretch lg:gap-4">
        <div className="flex gap-4">
          <img
            style={{ height: '25px' }}
            src="https://dalvacation-home-profile.s3.amazonaws.com/icons8-home-50.png"
            alt="StandardRoom"
          />
          <span
            className={`${roomType === 'StandardRoom' ? '' : 'line-through'}`}
          >
            Standard
          </span>
        </div>
        <div className="flex gap-4">
          <img
            style={{ height: '25px' }}
            src="https://dalvacation-home-profile.s3.amazonaws.com/stilt-house.png"
            alt="RecreationRoom"
          />
          <span
            className={`${roomType === 'RecreationRoom' ? '' : 'line-through'}`}
          >
            Recreational
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoomTypeWidget;
