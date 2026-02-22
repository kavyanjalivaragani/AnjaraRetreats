import React, { useState, useEffect } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'

const ListRoom = () => {
  const [rooms, setRooms] = useState([])
  const { axios, getToken, user, toast, currency } = useAppContext()

  // Fetch rooms of the hotel owner
  const fetchRooms = async () => {
    try {
      const token = await getToken(); // Get token first
      const { data } = await axios.get('/api/rooms/owner', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        setRooms(data.rooms)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // Toggle availability of the room
  const toggleAvailability = async (roomId) => {
    try {
      const token = await getToken(); // Get token first
      const { data } = await axios.post('/api/rooms/toggle-availability',
        { roomId }, 
        { headers: { Authorization: `Bearer ${token}` } })
        
      if (data.success) {
        toast.success(data.message)
        fetchRooms() 
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchRooms()
    }
  }, [user])

  return (
    <div className="w-full px-6 md:px-10">
      <Title
        align="left"
        font="outfit"
        title="Room Listings"
        subTitle="View, edit, or manage all listed rooms."
      />
      <p className='text-gray-500 mt-8'>All Rooms</p>

      <div className='w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll mt-3'>
        <table className='w-full'>
          <thead className='bg-gray-50'>
            <tr className='text-center'>
              <th className='py-3 px-4 text-gray-800 font-medium text-left'>Name</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Facility</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Price/Night</th>
              <th className='py-3 px-4 text-gray-800 font-medium'>Action</th>
            </tr>
          </thead>

          <tbody className='text-sm'>
            {rooms.map((item, index) => (
              <tr key={index}>
                <td className='px-4 py-3 text-gray-700 border-t border-gray-300'>
                  {item.roomType}
                </td>
                <td className='px-4 py-3 text-gray-700 border-t border-gray-300 text-center'>
                  {item.amenities?.join(', ')}
                </td>
                <td className='px-4 py-3 text-gray-700 border-t border-gray-300 text-center'>
                  {currency}{item.pricePerNight}
                </td>
                <td className='px-4 py-3 border-t border-gray-300 text-center'>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input 
                      onChange={() => toggleAvailability(item._id)} 
                      type="checkbox" 
                      className='sr-only peer' 
                      checked={item.isAvailable} 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                                    peer-checked:after:translate-x-full peer-checked:after:border-white 
                                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                    after:bg-white after:border-gray-300 after:border after:rounded-full 
                                    after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                    </div>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListRoom