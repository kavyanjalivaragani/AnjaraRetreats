import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const MyBookings = () => {
  const { axios, getToken, user } = useAppContext()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // ================= FETCH BOOKINGS =================
  const fetchUserBookings = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/bookings/user', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setBookings(data.bookings)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // ================= PAYMENT HANDLER =================
  const handlePayment = async (bookingId) => {
    alert("PAY NOW CLICKED") // ✅ must show

    try {
      const token = await getToken()
      console.log("Pay clicked:", bookingId)
      console.log("Token:", token)

      const { data } = await axios.post(
        '/api/bookings/stripe-payment',
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log("Stripe response:", data)

      if (data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error(error.message)
    }
  }

  // ================= LOAD BOOKINGS =================
  useEffect(() => {
    if (user) fetchUserBookings()
  }, [user])

  if (loading) {
    return <div className='min-h-screen flex items-center justify-center'>Loading your trips...</div>
  }

  return (
    <div className='py-28 md:pb-36 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
      <Title
        title="My Bookings"
        subTitle="Easily manage your past, current, and upcoming hotel reservations in one place."
        align="left"
      />

      <div className='max-w-6xl mt-8 w-full text-gray-800'>

        {/* TABLE HEADER */}
        <div className='hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3'>
          <div>Hotels</div>
          <div>Date & Timings</div>
          <div>Payment</div>
        </div>

        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div
              key={booking._id}
              className='grid grid-cols-1 md:grid-cols-3 gap-6 w-full border-b border-gray-300 py-6 first:border-t'
            >

              {/* HOTEL INFO */} 
              <div className='flex flex-col md:flex-row min-w-0'>
                <img
                  src={booking.room?.images?.[0] || assets.placeholder_img}
                  alt='hotel-img'
                  className='md:w-44 h-32 rounded shadow object-cover bg-gray-100'
                />

                <div className='flex flex-col gap-1.5 max-md:mt-3 md:ml-4'>
                  <p className='font-playfair text-2xl'>
                    {booking.hotel?.name || "Unknown Hotel"}{' '}
                    <span className='text-sm text-gray-500'>
                      ({booking.room?.roomType || 'Standard'})
                    </span>
                  </p>

                  <div className='flex items-center gap-1 text-sm text-gray-500'>
                    <img src={assets.locationIcon} alt='location-icon' />
                    <span>{booking.hotel?.address || 'Address not available'}</span>
                  </div>

                  <div className='flex items-center gap-1 text-sm text-gray-500'>
                    <img src={assets.guestsIcon} alt='guests-icon' />
                    <span>{booking.guests} Guests</span>
                  </div>

                  <p className='text-base font-medium mt-1'>
                    Total Price: <span className='text-orange-600'>${booking.totalPrice}</span>
                  </p>
                </div>
              </div>

              {/* DATES */}
              <div className='flex flex-row md:items-center md:gap-12 mt-3 gap-8'>
                <div>
                  <p className='text-xs font-semibold uppercase text-gray-400'>Check-In</p>
                  <p className='text-gray-700 font-medium'>
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className='text-xs font-semibold uppercase text-gray-400'>Check-Out</p>
                  <p className='text-gray-700 font-medium'>
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* PAYMENT */}
              <div className='flex flex-col items-start justify-center pt-3 relative z-50'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className={`h-2 w-2 rounded-full ${booking.isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <p className={`text-sm font-semibold ${booking.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                          {/* Show "Paid via Stripe" or "Unpaid (Pay At Hotel)" */}
                  {booking.isPaid ? `Paid via ${booking.paymentMethod}` : `Unpaid (${booking.paymentMethod})`}
                  </p>
                </div>
                
                {/* IMPORTANT FIX */}
                {booking.isPaid === false && (
                  <button
                    type="button"
                    onClick={() => handlePayment(booking._id)}
                    className='px-4 py-2 mt-2 text-xs font-bold text-white bg-black rounded shadow hover:bg-gray-800 transition-all uppercase tracking-wider pointer-events-auto'
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className='py-20 text-center text-gray-500'>
            <p>You haven't made any bookings yet.</p>
          </div>
        )}

      </div>
    </div>
  )
}
export default MyBookings
