import React from 'react'
import { AssistantContextProvider } from "@/components/shared/assistant-context";
import Header from '../../components/site/shared/header'

const SiteLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AssistantContextProvider>
      <div>
        <Header />
        {children}
      </div>
    </AssistantContextProvider>
  )
}

export default SiteLayout
