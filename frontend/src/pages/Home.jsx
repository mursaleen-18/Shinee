import LatestCollection from '../components/LatestCollection'
import Hero from '../components/Hero'
import React from 'react'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import NewsLetterBox from '../components/NewsLetterBox'

const Home = () => {
    return (
        <div>
            <Hero />
            <LatestCollection />
            <BestSeller />
            <OurPolicy />
            <NewsLetterBox />
        </div>
    )
}

export default Home