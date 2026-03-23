"use client"
import React from 'react'
import Header from '../../components/site/shared/header'
import { Footer } from '../../components/site/shared/footer'

const SiteLAyout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
        <Header />
        {children}
        <Footer />
    </div>
  )
}

export default SiteLAyout