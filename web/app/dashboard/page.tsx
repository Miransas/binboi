/* eslint-disable react-hooks/rules-of-hooks */
"use client"
import { useEffect, useState } from 'react';
import DashboardPage from '../../components/dashboard/shared/dashboard'
import TerminalLog from '../../components/dashboard/shared/terminal-log';

const page = () => {

  return (
    <div>
      <DashboardPage />

      {/* <DashboardWelcone /> */}
    </div>
  )
}

export default page