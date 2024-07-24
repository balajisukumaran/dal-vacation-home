import React, { useState, useEffect } from 'react';
import '../styles/TicketTable.css';

const TicketTable = ({ tickets, isAdmin, onUpdate }) => {
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [updatedComments, setUpdatedComments] = useState('');

  const handleEditClick = (ticketId, status, comments) => {
    setEditingTicketId(ticketId);
    setUpdatedStatus(status);
    setUpdatedComments(comments);
  };

  const handleUpdate = (ticketId) => {
    onUpdate(ticketId, { status: updatedStatus, comments: updatedComments });
    setEditingTicketId(null);
    setUpdatedStatus('');
    setUpdatedComments('');
  };

  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Status</th>
          <th>Comments</th>
          {isAdmin && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {tickets.map(ticket => (
          <tr key={ticket.ticketId}>
            <td>{ticket.ticketId}</td>
            <td>
              {editingTicketId === ticket.ticketId ? (
                <input
                  type="text"
                  value={updatedStatus}
                  onChange={(e) => setUpdatedStatus(e.target.value)}
                />
              ) : (
                ticket.status
              )}
            </td>
            <td>
              {editingTicketId === ticket.ticketId ? (
                <input
                  type="text"
                  value={updatedComments}
                  onChange={(e) => setUpdatedComments(e.target.value)}
                />
              ) : (
                ticket.comments
              )}
            </td>
            {isAdmin && (
              <td className="actions">
                {editingTicketId === ticket.ticketId ? (
                  <>
                    <button onClick={() => handleUpdate(ticket.ticketId)}>Save</button>
                    <button onClick={() => setEditingTicketId(null)}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => handleEditClick(ticket.ticketId, ticket.status, ticket.comments)}>Edit</button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const AdminTicketView = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Fetch all tickets from the backend
    fetch('https://gtfkmikbb8.execute-api.us-east-1.amazonaws.com/dev/getAll')
      .then(response => response.json())
      .then(data => {
        if (data && data.tickets) {
          // Filter to include only specific fields
          const filteredTickets = data.tickets.map(ticket => ({
            ticketId: ticket.ticketId,
            status: ticket.status,
            comments: ticket.comments,
            concern: ticket.concern // Assuming `concern` is the field name
          }));
          setTickets(filteredTickets);
        } else {
          throw new Error('Invalid response format');
        }
      })
      .catch(error => console.error('Error fetching tickets:', error));
  }, []);

  const handleUpdate = (ticketId, updatedFields) => {
    // Call API to update ticket
    fetch(`https://249eyh1z4h.execute-api.us-east-1.amazonaws.com/dev/update/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedFields),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setTickets(tickets.map(ticket =>
          ticket.ticketId === ticketId
            ? { ...ticket, ...updatedFields }
            : ticket
        ));
      } else {
        console.error('Error updating ticket:', data.message);
      }
    })
    .catch(error => console.error('Error updating ticket:', error));
  };

  return (
    <div>
      <h1>Admin Ticket View</h1>
      <TicketTable 
        tickets={tickets} 
        isAdmin={true} 
        onUpdate={handleUpdate} 
      />
    </div>
  );
};

export default AdminTicketView;
