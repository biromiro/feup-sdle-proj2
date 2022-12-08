import React from 'react';
import axios from 'axios';
import { Container, Typography, Button } from '@mui/material';


export default function Login() {
  const [username, setUsername] = React.useState("");

  function sendUsername(e) {
    e.preventDefault();
    var data = JSON.stringify({
      "username": "bruh"
    });
    
    var config = {
      method: 'get',
      url: 'http://localhost:3924/get-node',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };
    
    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h2" sx={{ margin: '1em 0em 0.25em 0em' }}>Login</Typography>
      <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            placeholder="What's boppin'?"
            type="text"
          />
      <Button
          onClick={sendUsername}
          type="submit"
        >submit</Button>
    </Container>
  );
}