/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { useEffect, useState } from 'react';
import DashboardPage from '../../components/dashboard/dashboard'
import TerminalLog from '../../components/dashboard/terminal-log';

const page = () => {
  
  return (
    <div>
        <DashboardPage />
        
        {/* <DashboardWelcone /> */}
    </div>
  )
}

export default page