import React, { useState, useEffect } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast' // Importing directly to fix the 'undefined' error

const Dashboard = () => {

  const { currency, user, getToken, axios } = useAppContext();

  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
  })

  const fetchDashboardData = async () => {
    try {
      const token = await getToken(); // Get token first
      const { data } = await axios.get('/api/bookings/hotel', {
        headers: { Authorization: `Bearer ${token}` }})
     
      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message || "Failed to fetch data")
      }
    } catch (error) {
      
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user])

  return (
    <div className="w-full px-6 md:px-10">
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subTitle="Monitor your room listings, track bookings and analyze revenue all in one place."
      />

      <div className="flex gap-4 my-8">
        {/* Total Bookings Card */}
        <div className="bg-blue-50/50 border border-blue-100 rounded flex p-4 pr-8 items-center">
          <img src={assets.totalBookingIcon} alt="total-bookings" className="max-sm:hidden h-10" />
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-blue-600 text-lg">Total Bookings</p>
            <p className="text-neutral-600 text-xl font-bold">{dashboardData.totalBookings}</p>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-blue-50/50 border border-blue-100 rounded flex p-4 pr-8 items-center">
          <img src={assets.totalRevenueIcon} alt="total-revenue" className="max-sm:hidden h-10" />
          <div className="flex flex-col sm:ml-4 font-medium">
            <p className="text-blue-600 text-lg">Total Revenue</p>
            <p className="text-neutral-600 text-xl font-bold">
              {currency}{dashboardData.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <h2 className='text-xl text-blue-950/70 font-medium mb-5'>Recent Bookings</h2>
      <div className='w-full max-w-4xl text-left border border-gray-200 rounded-lg overflow-hidden shadow-sm'>
        <div className="max-h-96 overflow-y-auto">
          <table className='w-full border-collapse'>
            <thead className='bg-gray-50 sticky top-0 z-10'>
              <tr>
                <th className='py-3 px-4 text-gray-800 font-semibold text-sm border-b'>User Name</th>
                <th className='py-3 px-4 text-gray-800 font-semibold text-sm border-b text-center'>Room Name</th>
                <th className='py-3 px-4 text-gray-800 font-semibold text-sm border-b text-center'>Total Amount</th>
                <th className='py-3 px-4 text-gray-800 font-semibold text-sm border-b text-center'>Payment Status</th>
              </tr>
            </thead>

            <tbody className='text-sm bg-white'>
              {dashboardData.bookings && dashboardData.bookings.length > 0 ? (
                dashboardData.bookings.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className='py-3 px-4 text-gray-700 border-b border-gray-100'>
                      {item.user?.username || 'N/A'}
                    </td>
                    <td className='py-3 px-4 text-gray-700 border-b border-gray-100 text-center'>
                      {item.room?.roomType || 'N/A'}
                    </td>
                    <td className='py-3 px-4 text-gray-700 border-b border-gray-100 text-center font-medium'>
                      {currency}{item.totalPrice}
                    </td>
                    <td className='py-3 px-4 border-b border-gray-100 text-center'>
                      <span className={`py-1 px-3 text-[11px] font-medium rounded-full inline-block {currency}{item.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {item.isPaid ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-gray-400">
                    No bookings found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard