import React, { useState, useMemo } from 'react'
import { roomsDummyData, facilityIcons, assets } from '../assets/assets'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'

/* ---------- Reusable Inputs ---------- */

const CheckBox = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
    <input
      type="checkbox"
      checked={selected}
      onChange={(e) => onChange(e.target.checked, label)}
    />
    <span className="font-light select-none">{label}</span>
  </label>
)

const RadioButton = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
    <input
      type="radio"
      name="sortOptions"
      checked={selected}
      onChange={() => onChange(label)}
    />
    <span className="font-light select-none">{label}</span>
  </label>
)

/* ---------- Main Component ---------- */

const AllRooms = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { rooms, currency } = useAppContext()
  const navigate = useNavigate()

  const [openFilters, setOpenFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    roomType: [],
    priceRange: [],
  })
  const [selectedSort, setSelectedSort] = useState('')

  /* Filter Options */
  const roomTypes = ['Single Bed', 'Double Bed', 'Luxury Room', 'Family Suite']
  const priceRanges = ['0 - 500', '500 - 1000', '1000 - 2000', '2000 - 3000']
  const sortOptions = ['Price Low to High', 'Price High to Low', 'Newest First']

  // handle filter change
  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prev) => {
      const updated = { ...prev }
      if (checked) updated[type].push(value)
      else updated[type] = updated[type].filter((item) => item !== value)
      return updated
    })
  }

  // handle sorting
  const handleSortingChange = (value) => {
    setSelectedSort(value)
  }

  // match room type
  const matchesRoomType = (room) => {
    return (
      selectedFilters.roomType.length === 0 ||
      selectedFilters.roomType.includes(room.roomType)
    )
  }

  // match price range
  const matchesPriceRange = (room) => {
    return (
      selectedFilters.priceRange.length === 0 ||
      selectedFilters.priceRange.some((range) => {
        const [min, max] = range.split(' - ').map(Number)
        return room.pricePerNight >= min && room.pricePerNight <= max
      })
    )
  }

  // sorting function
  const sortRooms = (a, b) => {
    if (selectedSort === 'Price Low to High')
      return a.pricePerNight - b.pricePerNight

    if (selectedSort === 'Price High to Low')
      return b.pricePerNight - a.pricePerNight

    if (selectedSort === 'Newest First')
      return new Date(b.createdAt) - new Date(a.createdAt)

    return 0
  }

  // filter destination - ADDED OPTIONAL CHAINING
  const filterDestination = (room) => {
    const destination = searchParams.get('destination')
    if (!destination) return true
    return room.hotel?.city?.toLowerCase().includes(destination.toLowerCase()) || false
  }

  // filter + sort rooms - ADDED SAFETY FILTER
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms
      .filter(
        (room) =>
          room.hotel && // <--- Critical: Only include rooms that HAVE a hotel object
          matchesRoomType(room) &&
          matchesPriceRange(room) &&
          filterDestination(room)
      )
      .sort(sortRooms)
  }, [rooms, selectedFilters, selectedSort, searchParams])

  // clear filters
  const clearFilters = () => {
    setSelectedFilters({ roomType: [], priceRange: [] })
    setSelectedSort('')
    setSearchParams({})
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-10 pt-28 md:pt-36 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* ---------------- Rooms Section ---------------- */}
      <div className="flex-1">
        <div className="mb-10">
          <h1 className="font-playfair text-4xl md:text-[40px]">Hotel Rooms</h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-2xl">
            Take advantage of our limited-time offers and special packages to
            enhance your stay and create unforgettable memories.
          </p>
        </div>

        {filteredRooms.map((room) => (
          <div
            key={room._id}
            className="flex flex-col md:flex-row gap-6 py-10 border-b border-gray-300 last:border-0"
          >
            <img
              src={room.images?.[0] || ''}
              alt="room"
              className="max-h-64 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer"
              onClick={() => {
                navigate(`/rooms/${room._id}`)
                window.scrollTo(0, 0)
              }}
            />

            <div className="md:w-1/2 flex flex-col gap-2">
              {/* FIXED: Added optional chaining */}
              <p className="text-gray-500">{room.hotel?.city || "Unknown City"}</p>

              <p
                className="text-3xl font-playfair cursor-pointer"
                onClick={() => {
                  navigate(`/rooms/${room._id}`)
                  window.scrollTo(0, 0)
                }}
              >
                {/* FIXED: Added optional chaining */}
                {room.hotel?.name || "Hotel Unavailable"}
              </p>

              <div className="flex items-center">
                <StarRating />
                <span className="ml-2 text-sm">200+ reviews</span>
              </div>

              <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                <img src={assets.locationIcon} alt="location" />
                {/* FIXED: Added optional chaining */}
                <span>{room.hotel?.address || "Address not available"}</span>
              </div>

              <div className="flex flex-wrap gap-4 mt-3 mb-6">
                {room.amenities?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70"
                  >
                    <img src={facilityIcons[item]} alt={item} className="w-5 h-5" />
                    <span className="text-xs">{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-xl font-medium text-gray-700">
                {currency}
                {room.pricePerNight}/night
              </p>
            </div>
          </div>
        ))}
        {filteredRooms.length === 0 && (
            <div className="text-center py-20 text-gray-500">No rooms found matching your criteria.</div>
        )}
      </div>

      {/* ---------------- Filters Section ---------------- */}
      <div className="w-full lg:w-72">
        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-300">
          <p className="font-medium text-gray-800">FILTERS</p>

          <div className="text-xs">
            <span
              onClick={() => setOpenFilters(!openFilters)}
              className="lg:hidden cursor-pointer mr-4"
            >
              {openFilters ? 'HIDE' : 'SHOW'}
            </span>

            <span
              onClick={clearFilters}
              className="hidden lg:inline cursor-pointer text-gray-500 hover:text-gray-800"
            >
              CLEAR
            </span>
          </div>
        </div>

        <div
          className={`${openFilters ? 'h-auto' : 'h-0'} lg:h-auto overflow-hidden transition-all duration-700`}
        >
          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2">Room Type</p>
            {roomTypes.map((room, index) => (
              <CheckBox
                key={index}
                label={room}
                selected={selectedFilters.roomType.includes(room)}
                onChange={(checked) => handleFilterChange(checked, room, 'roomType')}
              />
            ))}
          </div>

          <div className="px-5 pt-5">
            <p className="font-medium text-gray-800 pb-2">Price Range</p>
            {priceRanges.map((range, index) => (
              <CheckBox
                key={index}
                label={`${currency} ${range}`}
                selected={selectedFilters.priceRange.includes(range)}
                onChange={(checked) => handleFilterChange(checked, range, 'priceRange')}
              />
            ))}
          </div>

          <div className="px-5 pt-5 pb-7">
            <p className="font-medium text-gray-800 pb-2">Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton
                key={index}
                label={option}
                selected={selectedSort === option}
                onChange={handleSortingChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllRooms