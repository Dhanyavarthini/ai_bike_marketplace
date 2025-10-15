import React from 'react';
import AddBikeForm from './_components/add-bike-form';

export const metadata = {
    title: 'Add New Bike | BikeBay admin',
    description: 'Add a new bike to the inventory'
};

const AddBikePage = () => {
    return (
        <div className='p-6'>
            <h1 className="text-2xl font-bold mb-6">Add New Bike</h1>
            <AddBikeForm />
        </div>
    );
};

export default AddBikePage;
