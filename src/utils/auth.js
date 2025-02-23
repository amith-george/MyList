// src/utils/auth.js
import axios from 'axios';


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


export const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
  
      // Decode the token without validation
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Return the user ID from the token payload
      return payload.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
      return null;
    }
  };

export const fetchUserData = async (userId, token) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/users/${userId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      return null;
    }
  };


export const logout = () => {
  localStorage.removeItem('token');
};