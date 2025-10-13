import React, { useState } from 'react'
import { backendUrl } from '../App'
import axios from 'axios'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

const Login = ({ setToken }) => {

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const onSubmitHandler = async (e) => {
		try {
			e.preventDefault();
			const response = await axios.post(backendUrl + '/api/user/admin', { email, password })
			if (response.data.success) {
				// persist only for current session
				sessionStorage.setItem('token', response.data.token)
				setToken(response.data.token)
			}
			else {
				toast.error(response.data.message)
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message);
		}

	}
	return (
		<div className='flex justify-center items-center w-full min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-100'>
			<motion.div
				initial={{ opacity: 0, y: 10, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				transition={{ duration: 0.35, ease: 'easeOut' }}
				className='bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl rounded-2xl px-8 py-7 sm:px-10 sm:py-8 w-[90%] max-w-md'
			>
				<h1 className='text-2xl font-semibold tracking-tight mb-1 text-slate-800'>Admin Panel</h1>
				<p className='text-sm text-slate-500 mb-5'>Please sign in to continue</p>
				<form onSubmit={onSubmitHandler} className='space-y-4'>
					<div className='min-w-72'>
						<p className='text-sm font-medium text-gray-700 mb-2'>Email address</p>
						<input
							onChange={(e) => setEmail(e.target.value)}
							value={email}
							type="email"
							placeholder='you@email.com'
							required
							className='w-full px-3.5 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 transition-all'
						/>
					</div>
					<div className='min-w-72'>
						<p className='text-sm font-medium text-gray-700 mb-2'>Password</p>
						<input
							onChange={(e) => setPassword(e.target.value)}
							value={password}
							type="password"
							placeholder='Enter your password'
							required
							className='w-full px-3.5 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 transition-all'
						/>
					</div>
					<button
						className='mt-2 w-full py-2.5 px-4 rounded-lg text-white bg-gray-900 hover:bg-black active:scale-[0.99] shadow-sm hover:shadow transition-all duration-200'
						type='submit'
					>
						Login
					</button>
				</form>
			</motion.div>
		</div>
	)
}

export default Login