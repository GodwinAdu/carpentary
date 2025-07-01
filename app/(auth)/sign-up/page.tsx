import React from 'react'
import SignUpForm from './components/sign-up-form'

const page = () => {
    return (
        <div className="w-[96%] md:max-w-xl max-h-[90vh] overflow-y-auto mx-auto my-10 p-4  rounded-lg shadow-lg">
            <SignUpForm />
        </div>
    )
}

export default page