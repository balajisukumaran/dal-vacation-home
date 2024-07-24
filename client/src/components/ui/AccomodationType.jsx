import React from 'react';

const RoomTypes = ({ selected, handleFormData }) => {
  const roomTypes = [
    { name: 'StandardRoom', label: 'Standard', icon: <StandardRoom /> },
    {
      name: 'RecreationRoom',
      label: 'Recreational',
      icon: <RecreationRoom />,
    },
  ];

  return (
    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
      {roomTypes.map((roomTypes) => (
        <label
          className="flex cursor-pointer items-center gap-2 rounded-2xl border p-4"
          key={roomTypes.name}
        >
          <input
            type="radio"
            checked={selected === roomTypes.name}
            name="roomType"
            value={roomTypes.name}
            onChange={handleFormData}
          />
          {roomTypes.icon}
          <span>{roomTypes.label}</span>
        </label>
      ))}
    </div>
  );
};

// Example SVG icon components
const StandardRoom = () => (
  <img
    style={{ height: '25px' }}
    src="https://dalvacation-home-profile.s3.amazonaws.com/icons8-home-50.png"
    alt="StandardRoom"
  />
);

const RecreationRoom = () => (
  <img
    style={{ height: '25px' }}
    src="https://dalvacation-home-profile.s3.amazonaws.com/stilt-house.png"
    alt="RecreationRoom"
  />
);

export default RoomTypes;
