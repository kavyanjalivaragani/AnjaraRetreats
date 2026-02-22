import React, { useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'

const AddRoom = () => {

  const { axios, getToken } = useAppContext()

  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  })

  const [inputs, setInputs] = useState({
    roomType: '',
    pricePerNight: '',
    amenities: {
      'Free WiFi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Pool Access': false,
    },
  })

  const [loading, setLoading] = useState(false)

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    // validation
    if (!inputs.roomType || !inputs.pricePerNight || !Object.values(images).some(img => img)) {
      toast.error("Please fill in all the details")
      return;
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('roomType', inputs.roomType)
      formData.append('pricePerNight', inputs.pricePerNight)

  //convertin amenities to Array &keeping only enabled amenities
      const amenities = Object.keys(inputs.amenities).filter(key => inputs.amenities[key])
      formData.append('amenities', JSON.stringify(amenities))

      // images
      Object.keys(images).forEach((key) => {
        if (images[key]) {
          formData.append('images', images[key])
        }
      })

      const token = await getToken()

      const { data } = await axios.post(
        '/api/rooms',
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,}})
          
       
      if (data.success) {
        toast.success(data.message)

        // reset form
        setInputs({
          roomType: '',
          pricePerNight:0,
          amenities: {
            'Free WiFi': false,
            'Free Breakfast': false,
            'Room Service': false,
            'mountain view':false,
            'Pool Access': false
          }
        })

        setImages({ 1: null, 2: null, 3: null, 4: null })
      }else{
        toast.error(data.message)
      }

    } catch (error) {
              toast.error(error.message)

    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Fill in the details carefully and provide accurate room details, pricing, and amenities."
      />

      <p className="text-gray-800 mt-10">Images</p>
      <div className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap">
        {Object.keys(images).map((key) => (
          <label key={key}>
            <img
              className="h-14 w-14 border rounded cursor-pointer"
              src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
              alt="upload"
            />
            <input
              type="file"
              hidden
              onChange={(e) => setImages({ ...images, [key]: e.target.files[0] })}
            />
          </label>
        ))}
      </div>

      <div className="flex gap-6 mt-6 flex-wrap">
        <div className="flex flex-col max-w-xs w-full">
          <label>Room Type</label>
          <select
            className="border p-2 rounded"
            value={inputs.roomType}
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
          >
            <option value="">Select</option>
            <option>Single Bed</option>
            <option>Double Bed</option>
            <option>Luxury Room</option>
            <option>Family Suite</option>
          </select>
        </div>

        <div className="flex flex-col max-w-xs w-full">
          <label>Price / Night</label>
          <input
            type="number"
            className="border p-2 rounded"
            value={inputs.pricePerNight}
            onChange={(e) => setInputs({ ...inputs, pricePerNight: e.target.value })}
          />
        </div>
      </div>

      <p className="mt-6">Amenities</p>
      <div className="flex flex-col gap-2">
        {Object.keys(inputs.amenities).map((a) => (
          <label key={a} className="flex gap-2">
            <input
              type="checkbox"
              checked={inputs.amenities[a]}
              onChange={() =>
                setInputs({
                  ...inputs,
                  amenities: { ...inputs.amenities, [a]: !inputs.amenities[a] }
                })
              }
            />
            {a}
          </label>
        ))}
      </div>

      {/* BUTTON */}
      <button 
        disabled={loading}
        className="bg-black text-white px-8 py-2 rounded mt-10 disabled:bg-gray-500"
      >
        {loading ? "Adding..." : "Add Room"}
      </button>
    </form>
  )
}

export default AddRoom
