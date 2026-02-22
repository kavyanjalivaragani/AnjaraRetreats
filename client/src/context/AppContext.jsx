import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";


axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms,setRooms] = useState([]);

const fetchRooms=async()=>{
  try{
    const {data}=await axios.get('/api/rooms')
    if(data.success){
      setRooms(data.rooms)
    }else{
      toast.error(data.message)
    }
  }
  catch(error){
    toast.error(error.message)
  }
}  
const fetchUser = async () => {
  try {
    const token = await getToken();

    // 1. First, sync the user to the database to ensure they exist
    // This sends Clerk's data to your MongoDB sync route
    await axios.post("/api/user/sync", {
      email: user.primaryEmailAddress?.emailAddress,
      username: user.fullName,
      image: user.imageUrl
    }, { 
      headers: { Authorization: `Bearer ${token}` } 
    });

    // 2. Now that we've ensured the user exists, fetch their details
    const { data } = await axios.get("/api/user", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (data.success) {
      setIsOwner(data.role === "hotelOwner");
      setSearchedCities(data.recentSearchedCities || []);
      console.log("✅ User synced and fetched successfully");
    } 
  } catch (error) {
    // If it's a 404, it means the sync failed or the user is truly missing
    if (error.response?.status === 404) {
      console.error("User could not be created or found.");
    } else {
      console.error("Connection error, retrying in 10s...");
      setTimeout(() => fetchUser(), 10000);
    }
  }
};

  useEffect(() => {
    if (user) {
      const syncAndFetch = async () => {
        try {
          const token = await getToken();
          const email = user?.email || user?.primaryEmailAddress?.emailAddress || user?.email_addresses?.[0]?.email_address || '';
          const username = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || '';
          const image = user?.imageUrl || user?.image_url || user?.profileImage || '';

          // Attempt to upsert the user in the backend so DB record exists immediately
          const resp = await axios.post(
            '/api/user/sync',
            { email, username, image },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('user sync response:', resp?.data);
        } catch (err) {
          console.warn('User sync failed:', err?.response?.data || err?.message || err);
        } finally {
          fetchUser();
        }
      };

      syncAndFetch();
    }
  }, [user])

  useEffect(()=>{
      fetchRooms();
  },[])


  const value = {
    currency,
    navigate,
    toast,      // FIXED: Added toast here so Dashboard doesn't crash
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios,
    //apiRequest, // Added this to make components cleaner
  
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);