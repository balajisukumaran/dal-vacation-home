import { useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { UserContext } from '@/providers/UserProvider';
import { PlaceContext } from '@/providers/PlaceProvider';
import { setupInterceptors } from '@/utils/setupInterceptors';
import {
  getItemFromLocalStorage,
  setItemsInLocalStorage,
  removeItemFromLocalStorage,
} from '@/utils';
import axiosInstance from '@/utils/axios';
import { Auth } from 'aws-amplify';

const S3_BUCKET = 'dalvacation-home-profile';
const REGION = 'us-east-1';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: 'AKIAYS2NSDRXTXLYXBZ7',
    secretAccessKey: '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',
  },
});

setupInterceptors();

const uploadFileS3 = async (file) => {
  const params = {
    Bucket: S3_BUCKET,
    Key: file.name,
    Body: file,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    const fileUrl = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${file.name}`;
    return fileUrl;
  } catch (err) {
    console.log('Error', err);
    throw err;
  }
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
      let isAgent = 'y';

      const { user } = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          name,
        },
      });

      const { data } = await axiosInstance.post('user/register', {
        firstName,
        lastName,
        email,
        isAgent,
        jwtToken,
      });

      if (data.user) {
        setUser(data.user);
        setItemsInLocalStorage('user', data.user);
        setItemsInLocalStorage('token', jwtToken);
      }

      return { success: true, message: 'Registration successful' };
    } catch (error) {
      const { message } = error.code;
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

  const login = async (formData) => {
    const { email, password } = formData;

    try {
      const user = await Auth.signIn(email, password);
      const token = user.signInUserSession.idToken.jwtToken; // Get the JWT token

      const { data } = await axiosInstance.post('user/login', {
        email,
        token,
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
