import React, { useEffect } from 'react'
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';


const Verify = () => {
    const { navigate } = useContext(ShopContext);

    const verifyPayment = async () => {
        // Stripe verification endpoint is currently disabled in backend.
        // Keep this route safe by redirecting users away from a dead API flow.
        navigate('/orders');
    };
    useEffect(() => {
        verifyPayment();
    }, [navigate])
    return (
        <div>

        </div>
    )
}
export default Verify
