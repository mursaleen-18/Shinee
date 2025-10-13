import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const Login = () => {
	const [currentState, setCurrentState] = useState('Login');
	const { token, setToken, navigate, backendUrl } = useContext(ShopContext)
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');

	const onSubmitHandler = async (event) => {
		event.preventDefault();
		try {
			if (currentState === 'Sign Up') {

				const response = await axios.post(backendUrl + '/api/user/register', { name, email, password })
				if (response.data.success) {
					setToken(response.data.token)
					localStorage.setItem('token', response.data.token)
				}
				else {
					toast.error(response.data.message)
				}
			}
			else {
				const response = await axios.post(backendUrl + '/api/user/login', { email, password })
				if (response.data.success) {
					setToken(response.data.token)
					localStorage.setItem('token', response.data.token)

				} else {
					toast.error(response.data.message)
				}
			}
		} catch (error) {
			console.log(error);
			toast.error(error.message)
		}
	}

	useEffect(() => {
		if (token) {
			navigate('/');
		}
	}, [token])

	return (
		<div className='min-h-[70vh] grid place-items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-100'>
			<form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m:auto mt-14 gap-4 text-gray-800 bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl px-6 py-7 shadow-xl'>
				<div className='inline-flex items-center gap-2 mb-2 mt-2'>
					<p className='prata-regular text-3xl'>{currentState}</p>
					<hr className='border-none h-[1.5px] w-8 bg-gray-800' />
				</div>
				{currentState === 'Login' ? ' ' :
					<input type="text" onChange={(e) => setName(e.target.value)} value={name} className='w-full px-3.5 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 transition-all' placeholder='Name' required />
				}
				<input type="email" onChange={(e) => setEmail(e.target.value)} value={email} className='w-full px-3.5 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 transition-all' placeholder='Email' required />
				<input type="password" onChange={(e) => setPassword(e.target.value)} value={password} className='w-full px-3.5 py-2.5 rounded-lg border border-slate-300 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-200/70 transition-all' placeholder='Password' required />
				<div className='w-full flex justify-between text-sm mt-[-8px]'>
					<p className='cursor-pointer hover:underline hover:text-black transition-colors'>Forgot your password?</p>
					{
						currentState === 'Login'
							? <p onClick={() => setCurrentState('Sign Up')} className='cursor-pointer hover:underline hover:text-black transition-colors'>Create account</p>
							: <p onClick={() => setCurrentState('Login')} className='cursor-pointer hover:underline hover:text-black transition-colors'>Login Here</p>
					}

				</div>
				<button className='bg-black hover:bg-gray-900 active:scale-[0.99] text-white font-normal px-8 py-2 mt-2 rounded-lg shadow-sm hover:shadow transition-all duration-200'>{currentState === "Login" ? "Sign In" : "Sign Up"}</button>
			</form>
		</div>
	)
}

export default Login