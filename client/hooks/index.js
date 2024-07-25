import { useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode';
import { UserContext } from '@/providers/UserProvider';
import { PlaceContext } from '@/providers/PlaceProvider';
import { setupInterceptors } from '@/utils/setupInterceptors';
import {
  getItemFromLocalStorage,
  setItemsInLocalStorage,
  removeItemFromLocalStorage,
} from '@/utils';
import axiosInstance from '@/utils/axios';
import { signIn, signUp, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

setupInterceptors();

const S3_BUCKET = 'dalvacation-home-profile';
const REGION = 'us-east-1';

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: 'AKIAYS2NSDRXTXLYXBZ7',
    secretAccessKey: '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',
  },
});

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

    // const res = await axios.post(
    //   `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    //   data,
    // );

    // const fileUrl = res.data.secure_url;
    // return fileUrl;
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
    const {
      answerHash,
      email,
      firstName,
      lastName,
      password,
      passwordHash,
      questionId,
      agent,
      cipherCode,
    } = formData;

    try {
      let isAgent = agent;
      let name = firstName + ' ' + lastName;
      // const { user } = await Auth.signUp({
      //   username: email,
      //   password,
      //   attributes: {
      //     email,
      //     name,
      //   },
      // });

      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email,
            name,
          },
        },
      });

      const { data } = await axiosInstance.post('user/register', {
        name,
        email,
        isAgent,
        questionId,
        answerHash,
        cipherCode,
      });

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

  const sampleData = {
    success: true,
    token: 'your_token_here',
    user: {
      answerHash: 'Z2O+',
      questionId: '1',
      updatedAt: '2024-07-04T17:41:10.529Z',
      userId: '5ff290d4-0a6e-4924-9473-6ec52f50080e',
      email: 'test1@gmail.com',
      picture:
        'https://res.cloudinary.com/rahul141019/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1695133265/pnwging.com_zid4cre.png',
      name: 'test test',
    },
    allQuestions: [
      { questionId: '1', question: 'What was the name of your first school?' },
      { questionId: '2', question: "What is your mother's maiden name?" },
      { questionId: '3', question: 'What is your favorite color?' },
      { questionId: '4', question: "What was the name of your pet's name?" },
    ],
  };

  const login = async (formData) => {
    const { email, password } = formData;

    try {
      try {
        await signIn({
          username: email,
          password: password,
        });
      } catch (error) {
        if (error.name === 'UserAlreadyAuthenticatedException') {
          await signOut();
          setUser(null);
          removeItemFromLocalStorage('user');
          removeItemFromLocalStorage('token');
          await signIn({
            username: email,
            password: password,
          });
        }
      }
      const session = await fetchAuthSession();

      console.log('id token', session.tokens.idToken);
      console.log('access token', session.tokens.accessToken);

      const token = session.tokens.idToken.toString();

      const { data } = await axiosInstance.post('user/login', {
        email,
        token,
      });

      if (data.user && data.token) {
        setUser(data.user);
        setItemsInLocalStorage('user', data.user);
        setItemsInLocalStorage('allQuestions', data.allQuestion);
        setItemsInLocalStorage('token', data.token);
      }

      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      removeItemFromLocalStorage('user');
      removeItemFromLocalStorage('token');
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
    const { picture } = userDetails;
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
