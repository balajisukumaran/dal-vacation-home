import React, { useState, useEffect } from 'react';
import '../styles/TicketTable.css';

const TicketTable = ({ tickets }) => {
  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Status</th>
          <th>Comments</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map(ticket => (
          <tr key={ticket.ticketId}>
            <td>{ticket.ticketId}</td>
            <td>{ticket.status}</td>
            <td>{ticket.comments}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const UserTicketView = () => {
  const [tickets, setTickets] = useState([]);
  const userId = 'usertest'; // Replace with actual userId

  useEffect(() => {
    // Fetch user's tickets from the backend
    fetch(`https://t3djsxcam8.execute-api.us-east-1.amazonaws.com/dev?userId=${userId}`)
      .then(response => response.json())
      .then(data => {
        if (data && data.tickets) {
          setTickets(data.tickets);
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(error => console.error('Error fetching tickets:', error));
  }, [userId]);

  return (
    <div>
      <h1>User Ticket View</h1>
      <TicketTable tickets={tickets} />
    </div>
  );
};

export default UserTicketView;
