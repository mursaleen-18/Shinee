import SearchBar from './components/SearchBar'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import About from './pages/About'
import Cart from './pages/Cart'
import Collection from './pages/Collection'
import Contact from './pages/Contact'
import Home from './pages/Home'
import Login from './pages/Login'
import Orders from './pages/Orders'
import PlaceOrder from './pages/PlaceOrder'
import Product from './pages/Product'
import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import Verify from './pages/Verify'
import { AnimatePresence, motion } from 'framer-motion'
import Profile from './pages/Profile'

const App = () => {
  const location = useLocation();

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Routes location={location}>
            <Route path='/' element={<Home />} />
            <Route path='/collection' element={<Collection />} />
            <Route path='/about' element={<About />} />
            <Route path='/contact' element={<Contact />} />
            <Route path='/product/:productId' element={<Product />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/login' element={<Login />} />
            <Route path='/place-order' element={<PlaceOrder />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/verify' element={<Verify />} />
            <Route path='/profile' element={<Profile />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <Footer />

    </div>
  )
}

export default App