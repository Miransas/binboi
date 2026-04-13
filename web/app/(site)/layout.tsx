import React from 'react'
import Header from '../../components/site/shared/header'
import { Footer } from '../../components/site/shared/footer'

const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <div>
        <Header />
        {children}
        <Footer/>
      </div>
    </main>
  )
}

export default SiteLayout
