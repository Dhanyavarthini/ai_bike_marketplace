import React from 'react'
import BikesList from './_components/bikes-list'

export const metadata = {
  title: 'Bikes | BikeBay Admin',
  description: 'Manage your bike listings',
}

const BikePage = () => {
  return (
    <div className='p-6'>
      <h1 className="text-2xl font-bold mb-6">Bikes Management</h1>
      <BikesList />
    </div>
  )
}

export default BikePage;