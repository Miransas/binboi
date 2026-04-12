import React from 'react'
import Header from '../../components/site/shared/header'

const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main>
      <div>
        <Header />
        {children}
      </div>
    </main>
  )
}

export default SiteLayout
