import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
const CopyLink = ({ id, text }) => {
  const copyToClipboard = (e) => {
    e.preventDefault();
    navigator.clipboard
      .writeText(id)
      .then(() => {
        toast('ID copied to clipboard!');
      })
      .catch((err) => {
        toast.error('Failed to copy: ', err);
      });
  };

  return (
    <a href="#" onClick={copyToClipboard} style={linkStyle}>
      <FontAwesomeIcon icon={faCopy} /> {text}
    </a>
  );
};

const linkStyle = {
  display: 'inline-block',
  padding: '10px 20px',
  margin: '10px 0',
  fontSize: '16px',
  color: '#fff',
  backgroundColor: 'rgb(245, 56, 93)',
  borderRadius: '4px',
  textDecoration: 'none',
  cursor: 'pointer',
  textAlign: 'center',
};

export default CopyLink;
