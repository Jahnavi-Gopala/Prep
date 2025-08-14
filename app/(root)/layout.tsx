import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { isAuthenticated } from '@/lib/actions/auth.actions';
import { redirect } from 'next/navigation';

const RootLayout = async ({children}:{children:React.ReactNode}) => {
  const isUserAuthenticated =  await isAuthenticated();

  if (!isUserAuthenticated) redirect('');

  return (
    <div className='root-layout'>
      <nav>
        <Link href='/' className='flex items-center gap-2'>
          <Image src='/logo.svg' alt='logo' width={40} height={40} />
          <h2 className='text-primary-100'>PrepMock</h2>
        </Link>
      </nav>
      {children}
    </div>
  )
}

export default RootLayout 