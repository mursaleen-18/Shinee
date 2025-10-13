import RelatedProducts from '../components/RelatedProducts';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const Product = () => {
    const { productId } = useParams();
    const { products, currency, addToCart } = useContext(ShopContext)
    const [productData, setProductData] = useState(false);
    const [image, setImage] = useState('');
    const [size, setSize] = useState('');

    const fetchProductData = async () => {
        products.map((item) => {
            if (item._id === productId) {
                setProductData(item);
                setImage(item.image[0]);
                return null;
            }
        })

    }
    useEffect(() => {
        fetchProductData();
    }, [productId, products])

    return productData ? (
        <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
            {/* -----------------------Product Data-------------------- */}
            <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
                {/* ------------Product Images---------------- */}
                <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
                    <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:w-[18.7%] w-full'>
                        {
                            productData.image.map((item, index) => (
                                <img onClick={() => setImage(item)} key={index} src={item} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' />
                            ))
                        }
                    </div>
                    <div className='w-full sm:w-[80%]'>
                        <img className='w-full h-auto' src={image} />
                    </div>
                </div>
                {/* -----------------Product Info--------------------------- */}
                <div className='flex-1'>
                    <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
                    <div className='flex items-center gap-1 mt-2'>
                        <img src={assets.star_icon} alt="" className="w-3 5" />
                        <img src={assets.star_icon} alt="" className="w-3 5" />
                        <img src={assets.star_icon} alt="" className="w-3 5" />
                        <img src={assets.star_icon} alt="" className="w-3 5" />
                        <img src={assets.star_dull_icon} alt="" className="w-3 5" />
                        <p className='pl-2'>(122)</p>
                    </div>
                    <p className='mt-5 text-xl font-medium'>{currency}{productData.price}</p>
                    <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
                    <div className="flex flex-col gap-4 my-8">
                        <p>Select Size</p>
                        <div className='flex gap-2'>
                            {productData.size.map((item, index) => (
                                <button onClick={() => setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => addToCart(productData._id, size)} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
                    <hr className='mt-8 sm:w-4/5' />
                    <div className=' text-sm text-gray-500 mt-5 flex flex-col gap-1'>
                        <p>100% Original Product</p>
                        <p>Cash on delivery is available on this product</p>
                        <p> Easy return and exchange policy within 7 days</p>
                    </div>
                </div>
            </div>
            {/* ----------------Description & Review Section--------------- */}
            <div className='mt-20'>
                <div className="flex">
                    <b className='border px-5 py-3 text-sm'>Description</b>
                    <p className='border px-5 py-3 text-sm'>Reviews(122)</p>
                </div>
                <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
                    <p>Upgrade your everyday style with this Men's Round Neck Pure Cotton T-Shirt. Crafted from 100% soft and breathable cotton, this T-shirt offers all-day comfort and a perfect fit. The classic round neck design and short sleeves make it a versatile piece—ideal for layering or wearing on its own. Whether you're lounging at home, heading to the gym, or stepping out casually, this T-shirt keeps you looking sharp and feeling relaxed. Durable, lightweight, and easy to maintain—it's a must-have staple for every wardrobe.</p>
                    <p>Perfect for daily wear, this T-shirt blends simplicity with style for a clean, modern look.</p>
                </div>
            </div>
            {/* ---------------Display Related Product----------------*/}
            <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
        </div>
    ) : <div className='opacity-0'> </div>
}

export default Product