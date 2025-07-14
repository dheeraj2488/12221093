import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/shorten'); // or the route you defined
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the URL Shortener</h1>

      <h2>
        Click on this to shorten your URL:{" "}
        <span
          onClick={handleNavigate}
          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Shorten Url
        </span>
      </h2>
      <h2>
        Click on this to see your shortened urls.
        <span
          onClick={() => navigate('/urls')}
          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Shortened Url
        </span>
      </h2>
    </div>
  );
};

export default HomePage;
