import React from 'react'
import { AssistantContextProvider } from "@/components/shared/assistant-context";
import Header from '../../components/site/shared/header'
import { Footer } from '../../components/site/shared/footer'

const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AssistantContextProvider>
      <div>
          <Header />
          {children}
          {/* <Footer /> */}
      </div>
    </AssistantContextProvider>
  )
}

export default SiteLayout
