import { useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';
import AWS from 'aws-sdk';
import global from 'global';
import { Buffer } from 'buffer';

import { UserContext } from '@/providers/UserProvider';
import { PlaceContext } from '@/providers/PlaceProvider';
import { setupInterceptors } from '@/utils/setupInterceptors';
import {
  getItemFromLocalStorage,
  setItemsInLocalStorage,
  removeItemFromLocalStorage,
} from '@/utils';
import axiosInstance from '@/utils/axios';

const S3_BUCKET = 'dalvacation-home-profile';
const REGION = 'us-east-1';

// Ensure global and Buffer are available in the window
window.global = window;
window.Buffer = Buffer;

AWS.config.update({
  accessKeyId: 'AKIAYS2NSDRXTXLYXBZ7',
  secretAccessKey: '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',
});

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET },
  region: REGION,
});

setupInterceptors();

const uploadFileS3 = (file) => {
  return new Promise((resolve, reject) => {
    const params = {
      Body: file,
      Bucket: S3_BUCKET,
      Key: file.name,
    };

    myBucket
      .putObject(params)
      .on('httpUploadProgress', (evt) => {
        console.log(
          'Progress:',
          Math.round((evt.loaded / evt.total) * 100) + '%',
        );
      })
      .send((err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          const fileUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${file.name}`;
          resolve(fileUrl);
        }
      });
  });
};

// USER
export const useAuth = () => {
  return useContext(UserContext);
};

export const useProvideAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getItemFromLocalStorage('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (formData) => {
    const { name, email, password } = formData;

    try {
      const { data } = await axiosInstance.post('user/register', {
        name,
        email,
        password,
      });
      if (data.user && data.token) {
        setUser(data.user);
        setItemsInLocalStorage('user', data.user);
        setItemsInLocalStorage('token', data.token);
      }
      return { success: true, message: 'Registration successful' };
    } catch (error) {
      const { message } = error.response.data;
      return { success: false, message };
    }
  };

  const login = async (formData) => {
    const { email, password } = formData;

    try {
      const { data } = await axiosInstance.post('user/login', {
        email,
        password,
      });
      if (data.user && data.token) {
        setUser(data.user);
        setItemsInLocalStorage('user', data.user);
        setItemsInLocalStorage('token', data.token);
      }
      return { success: true, message: 'Login successful' };
    } catch (error) {
      const { message } = error.response.data;
      return { success: false, message };
    }
  };

  const googleLogin = async (credential) => {
    const decoded = jwt_decode(credential);
    try {
      const { data } = await axiosInstance.post('user/google/login', {
        name: `${decoded.given_name} ${decoded.family_name}`,
        email: decoded.email,
      });
      if (data.user && data.token) {
        setUser(data.user);
        setItemsInLocalStorage('user', data.user);
        setItemsInLocalStorage('token', data.token);
      }
      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      const { data } = await axiosInstance.get('/user/logout');
      if (data.success) {
        setUser(null);
        removeItemFromLocalStorage('user');
        removeItemFromLocalStorage('token');
      }
      return { success: true, message: 'Logout successful' };
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Something went wrong!' };
    }
  };

  const uploadPicture = async (picture) => {
    try {
      const fileUrl = await uploadFileS3(picture);
      return { success: true, url: fileUrl };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message };
    }
  };

  const updateUser = async (userDetails) => {
    const { name, password, picture } = userDetails;
    const email = JSON.parse(getItemFromLocalStorage('user')).email;
    try {
      const { data } = await axiosInstance.put('/user/update-user', {
        name,
        password,
        email,
        picture,
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  return {
    user,
    setUser,
    register,
    login,
    googleLogin,
    logout,
    loading,
    uploadPicture,
    updateUser,
  };
};

// PLACES
export const usePlaces = () => {
  return useContext(PlaceContext);
};

export const useProvidePlaces = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPlaces = async () => {
    const { data } = await axiosInstance.get('/places');
    setPlaces(data);
    setLoading(false);
  };

  useEffect(() => {
    getPlaces();
  }, []);

  return {
    places,
    setPlaces,
    loading,
    setLoading,
  };
};
