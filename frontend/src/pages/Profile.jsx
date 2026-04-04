import React, { useContext, useEffect, useState, useCallback } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Profile = () => {
  const { backendUrl, token, profile, setProfile, sellerProfile, fetchSellerStatus, navigate } = useContext(ShopContext)
  const [loading, setLoading] = useState(!profile)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(profile)
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [submittingSeller, setSubmittingSeller] = useState(false)
  const [sellerForm, setSellerForm] = useState({
    storeName: '',
    businessType: '',
    gstNumber: '',
    idDocumentType: 'Aadhar',
    idDocumentNumber: '',
    idDocument: null,
    addressProof: null
  })

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: { line1: '', city: '', state: '', zip: '', country: '' }
  })

  // local fetch only if context didn't provide profile
  const fetchProfileLocal = useCallback(async () => {
    if (!token) return
    try {
      setLoading(true)
      const res = await axios.post(backendUrl + '/api/user/me', {}, { headers: { token } })
      if (res.data.success) {
        setUser(res.data.user)
        setProfile(res.data.user)
        const u = res.data.user
        setForm({
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || '',
          address: { line1: u.address?.line1 || '', city: u.address?.city || '', state: u.address?.state || '', zip: u.address?.zip || '', country: u.address?.country || '' },
          addresses: u.addresses || [],
          defaultAddressIndex: typeof u.defaultAddressIndex === 'number' ? u.defaultAddressIndex : -1,
          dob: u.dob ? new Date(u.dob).toISOString().slice(0,10) : '',
          gender: u.gender || '',
          preferences: u.preferences || {}
        })
      } else {
        toast.error(res.data.message || 'Failed to load profile')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [backendUrl, token, setProfile])

  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      // optimistic update
      const optimistic = { ...user, name: form.name, phone: form.phone }
      setUser(optimistic)
      setProfile(optimistic)
      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        addresses: form.addresses,
        defaultAddressIndex: form.defaultAddressIndex,
        dob: form.dob,
        gender: form.gender,
        preferences: form.preferences
      }
      const res = await axios.post(backendUrl + '/api/user/me/update', payload, { headers: { token } })
      if (res.data.success) {
        setUser(res.data.user)
        setProfile(res.data.user)
        toast.success('Profile updated')
        setIsEditing(false)
      } else {
        toast.error(res.data.message || 'Failed to update profile')
        // revert optimistic
        await fetchProfileLocal()
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    try {
      setSaving(true)
      const res = await axios.post(backendUrl + '/api/user/me/avatar', formData, { headers: { token } })
      if (res.data.success) {
        setUser(res.data.user)
        setProfile(res.data.user)
        toast.success('Profile photo updated')
      } else {
        toast.error(res.data.message || 'Failed to update photo')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeAvatar = async () => {
    if (!window.confirm('Remove avatar?')) return
    try {
      setSaving(true)
      const res = await axios.post(backendUrl + '/api/user/me/avatar/remove', {}, { headers: { token } })
      if (res.data.success) {
        setUser(res.data.user)
        setProfile(res.data.user)
        toast.success('Avatar removed')
      }
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const submitSellerApplication = async (e) => {
    e.preventDefault()
    try {
      setSubmittingSeller(true)
      const formData = new FormData()
      formData.append('storeName', sellerForm.storeName)
      formData.append('businessType', sellerForm.businessType || '')
      formData.append('gstNumber', sellerForm.gstNumber || '')
      formData.append('idDocumentType', sellerForm.idDocumentType)
      formData.append('idDocumentNumber', sellerForm.idDocumentNumber)
      if (sellerForm.idDocument) formData.append('idDocument', sellerForm.idDocument)
      if (sellerForm.addressProof) formData.append('addressProof', sellerForm.addressProof)

      const res = await axios.post(
        backendUrl + '/api/user/seller/apply',
        formData,
        { headers: { token } }
      )
      if (res.data.success) {
        toast.success(res.data.message || 'Seller onboarding submitted')
        fetchSellerStatus(token)
      } else {
        toast.error(res.data.message || 'Failed to submit seller onboarding')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmittingSeller(false)
    }
  }

  useEffect(() => {
    if (token) fetchSellerStatus(token)
    if (!profile) fetchProfileLocal();
    else {
      setUser(profile);
      setLoading(false);
      const u = profile;
      setForm({
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        address: { line1: u.address?.line1 || '', city: u.address?.city || '', state: u.address?.state || '', zip: u.address?.zip || '', country: u.address?.country || '' },
        addresses: u.addresses || [],
        defaultAddressIndex: typeof u.defaultAddressIndex === 'number' ? u.defaultAddressIndex : -1,
        dob: u.dob ? new Date(u.dob).toISOString().slice(0,10) : '',
        gender: u.gender || '',
        preferences: u.preferences || {}
      })
    }
  }, [profile, fetchProfileLocal, token])

  if (!token || !user) {
    return <div className='py-10'>Please login to view your profile.</div>;
  }

  if (loading) return <div className='py-10'>
    <div className='space-y-2 max-w-2xl'>
      <div className='h-8 bg-gray-200 rounded w-1/3 animate-pulse' />
      <div className='h-20 bg-gray-200 rounded-full w-20 animate-pulse' />
      <div className='h-6 bg-gray-200 rounded w-full animate-pulse' />
    </div>
  </div>;

  return (
    <div className='py-8'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-semibold'>My Profile</h2>
        <button onClick={() => setIsEditing(v => !v)} className='border px-4 py-2 rounded hover:bg-gray-50'>{isEditing ? 'Cancel' : 'Edit Profile'}</button>
      </div>

      <div className='flex items-center gap-4 mb-6'>
        <img src={user?.avatar || 'https://via.placeholder.com/80'} className='w-20 h-20 rounded-full object-cover border' />
        <div>
          <label className='text-sm text-gray-600 block mb-1'>Change photo</label>
          <input type='file' accept='image/*' onChange={onAvatarChange} />
          {user?.avatar && <button onClick={removeAvatar} className='text-sm text-red-500 mt-2'>Remove avatar</button>}
        </div>
      </div>

      <form onSubmit={saveProfile} className='grid gap-4 max-w-2xl'>
        <div className='grid gap-2'>
          <label className='text-sm text-gray-600'>Name</label>
          <input disabled={!isEditing} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className='border rounded px-3 py-2 disabled:bg-gray-50' required />
        </div>
        <div className='grid gap-2'>
          <label className='text-sm text-gray-600'>Email <span className='text-xs text-gray-500'>(verification)</span></label>
          <div className='flex gap-3 items-center'>
            <input value={form.email} disabled className='border rounded px-3 py-2 bg-gray-50 text-gray-500' />
            {user?.isVerified ? <span className='text-green-600'>Verified</span> : <button type='button' onClick={async () => { try { const r = await axios.post(backendUrl + '/api/user/me/resend-verification', {}, { headers: { token } }); if (r.data.success) { toast.success(r.data.message || 'Verification request sent') } else toast.error(r.data.message) } catch (e) { toast.error(e.message) } }} className='text-sm text-blue-600'>Resend</button>}
          </div>
        </div>
        <div className='grid gap-2'>
          <label className='text-sm text-gray-600'>Phone</label>
          <input disabled={!isEditing} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className='border rounded px-3 py-2 disabled:bg-gray-50' />
        </div>
        <div className='grid gap-2'>
          <label className='text-sm text-gray-600'>Address line</label>
          <input disabled={!isEditing} value={form.address.line1} onChange={e => setForm({ ...form, address: { ...form.address, line1: e.target.value } })} className='border rounded px-3 py-2 disabled:bg-gray-50' />
        </div>
        <div className='grid gap-2'>
          <label className='text-sm text-gray-600'>Date of birth</label>
          <input type='date' disabled={!isEditing} value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className='border rounded px-3 py-2 disabled:bg-gray-50' />
        </div>
        <div className='grid gap-2'>
          <label className='text-sm text-gray-600'>Gender</label>
          <select disabled={!isEditing} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className='border rounded px-3 py-2 disabled:bg-gray-50'>
            <option value=''>Prefer not to say</option>
            <option value='male'>Male</option>
            <option value='female'>Female</option>
            <option value='other'>Other</option>
          </select>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className='grid gap-2'>
            <label className='text-sm text-gray-600'>City</label>
            <input disabled={!isEditing} value={form.address.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} className='border rounded px-3 py-2 disabled:bg-gray-50' />
          </div>
          <div className='grid gap-2'>
            <label className='text-sm text-gray-600'>State</label>
            <input disabled={!isEditing} value={form.address.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} className='border rounded px-3 py-2 disabled:bg-gray-50' />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className='grid gap-2'>
            <label className='text-sm text-gray-600'>ZIP</label>
            <input disabled={!isEditing} value={form.address.zip} onChange={e => setForm({ ...form, address: { ...form.address, zip: e.target.value } })} className='border rounded px-3 py-2 disabled:bg-gray-50' />
          </div>
          <div className='grid gap-2'>
            <label className='text-sm text-gray-600'>Country</label>
            <input disabled={!isEditing} value={form.address.country} onChange={e => setForm({ ...form, address: { ...form.address, country: e.target.value } })} className='border rounded px-3 py-2 disabled:bg-gray-50' />
          </div>
        </div>
        {isEditing && <button disabled={saving} className='bg-black text-white px-4 py-2 rounded disabled:opacity-60'>{saving ? 'Saving...' : 'Save changes'}</button>}
        {!isEditing && <button type='button' onClick={() => setShowChangePassword(true)} className='border px-4 py-2 rounded hover:bg-gray-50'>Change password</button>}
      </form>

      {/* Addresses management */}
      <div className='mt-6 max-w-2xl'>
        <h4 className='font-medium mb-2'>Saved Addresses</h4>
        {form.addresses?.length ? form.addresses.map((a, idx) => (
          <div key={idx} className='p-2 border rounded mb-2 flex justify-between items-center'>
            <div>
              <div className='font-medium'>{a.line1}</div>
              <div className='text-sm text-gray-600'>{a.city}, {a.state} {a.zip} - {a.country}</div>
            </div>
            <div className='flex gap-2 items-center'>
              <button onClick={() => { const arr = [...form.addresses]; arr.splice(idx,1); setForm({ ...form, addresses: arr }); }} className='text-sm text-red-500'>Remove</button>
              <button onClick={() => { setForm({ ...form, defaultAddressIndex: idx }); toast.success('Default address set') }} className='text-sm text-blue-600'>{form.defaultAddressIndex === idx ? 'Default' : 'Set default'}</button>
            </div>
          </div>
        )) : <div className='text-sm text-gray-600'>No saved addresses.</div>}
        <AddAddress onAdd={(a) => { setForm({ ...form, addresses: [...(form.addresses||[]), a] }) }} disabled={!isEditing} />
      </div>

      {/* Seller onboarding */}
      <div className='mt-8 max-w-2xl border rounded p-4'>
        <h4 className='font-medium mb-2'>Become a Seller</h4>
        <p className='text-sm text-gray-600 mb-3'>
          Seller status: <span className='font-medium capitalize'>{sellerProfile?.status || 'none'}</span>
        </p>
        {sellerProfile?.status === 'approved' && (
          <button
            type='button'
            onClick={() => navigate('/seller')}
            className='bg-black text-white px-4 py-2 rounded'
          >
            Open Seller Dashboard
          </button>
        )}
        {sellerProfile?.status === 'pending' && (
          <p className='text-sm text-blue-600'>Your onboarding is under admin review.</p>
        )}
        {sellerProfile?.status === 'rejected' && (
          <p className='text-sm text-red-600 mb-3'>
            Rejected: {sellerProfile?.rejectionReason || 'Please update documents and re-apply.'}
          </p>
        )}
        {(sellerProfile?.status === 'none' || sellerProfile?.status === 'rejected') && (
          <form onSubmit={submitSellerApplication} className='grid gap-2 mt-2'>
            <input required placeholder='Store name' value={sellerForm.storeName} onChange={e => setSellerForm({ ...sellerForm, storeName: e.target.value })} className='border rounded px-3 py-2' />
            <div className='grid grid-cols-2 gap-2'>
              <input placeholder='Business type' value={sellerForm.businessType} onChange={e => setSellerForm({ ...sellerForm, businessType: e.target.value })} className='border rounded px-3 py-2' />
              <input placeholder='GST number (optional)' value={sellerForm.gstNumber} onChange={e => setSellerForm({ ...sellerForm, gstNumber: e.target.value })} className='border rounded px-3 py-2' />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <select value={sellerForm.idDocumentType} onChange={e => setSellerForm({ ...sellerForm, idDocumentType: e.target.value })} className='border rounded px-3 py-2'>
                <option value='Aadhar'>Aadhar</option>
                <option value='PAN'>PAN</option>
                <option value='Passport'>Passport</option>
                <option value='DrivingLicense'>Driving License</option>
              </select>
              <input required placeholder='ID document number' value={sellerForm.idDocumentNumber} onChange={e => setSellerForm({ ...sellerForm, idDocumentNumber: e.target.value })} className='border rounded px-3 py-2' />
            </div>
            <div className='grid gap-1'>
              <label className='text-sm text-gray-600'>ID document image</label>
              <input required type='file' accept='image/*,application/pdf' onChange={e => setSellerForm({ ...sellerForm, idDocument: e.target.files?.[0] || null })} className='border rounded px-3 py-2' />
            </div>
            <div className='grid gap-1'>
              <label className='text-sm text-gray-600'>Address proof image (optional)</label>
              <input type='file' accept='image/*,application/pdf' onChange={e => setSellerForm({ ...sellerForm, addressProof: e.target.files?.[0] || null })} className='border rounded px-3 py-2' />
            </div>
            <button disabled={submittingSeller} className='bg-black text-white px-4 py-2 rounded w-fit'>
              {submittingSeller ? 'Submitting...' : 'Submit Seller Onboarding'}
            </button>
          </form>
        )}
      </div>

      {/* Change password modal */}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} backendUrl={backendUrl} token={token} />}

      <div className='mt-10'>
        <h3 className='text-xl font-medium mb-3'>Previous Orders</h3>
        <OrdersList />
      </div>
    </div>
  )
}

const OrdersList = () => {
  const { backendUrl, token, currency } = useContext(ShopContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axios.post(backendUrl + '/api/orders/userorders', {}, { headers: { token } })
      if (res.data.success) setOrders(res.data.orders)
    } catch (err) {
      console.log('Failed to fetch orders', err)
    } finally {
      setLoading(false)
    }
  }, [backendUrl, token])

  useEffect(() => { if (token) fetchOrders() }, [token, fetchOrders])

  if (loading) return <div>Loading orders...</div>
  if (!orders.length) return <div>No orders yet.</div>

  return (
    <div className='divide-y border rounded'>
      {orders.map(o => (
        <div key={o._id} className='p-4 text-sm flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='font-medium'>Order #{o._id.slice(-6)}</p>
            <p className='text-gray-600'>{new Date(o.date).toLocaleString()}</p>
            <p className='text-gray-600'>Status: {o.status}</p>
          </div>
          <div className='text-right'>
            <p className='font-semibold'>{currency}{o.amount}</p>
            <p className='text-gray-600'>{o.items?.length || 0} items</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Profile

// Small component to add an address
const AddAddress = ({ onAdd, disabled }) => {
  const [open, setOpen] = useState(false)
  const [a, setA] = useState({ line1: '', city: '', state: '', zip: '', country: '' })
  return (
    <div className='mt-3'>
      {open ? (
        <div className='grid gap-2'>
          <input placeholder='Address line' value={a.line1} onChange={e => setA({ ...a, line1: e.target.value })} className='border px-2 py-1 rounded' />
          <div className='grid grid-cols-3 gap-2'>
            <input placeholder='City' value={a.city} onChange={e => setA({ ...a, city: e.target.value })} className='border px-2 py-1 rounded' />
            <input placeholder='State' value={a.state} onChange={e => setA({ ...a, state: e.target.value })} className='border px-2 py-1 rounded' />
            <input placeholder='ZIP' value={a.zip} onChange={e => setA({ ...a, zip: e.target.value })} className='border px-2 py-1 rounded' />
          </div>
          <input placeholder='Country' value={a.country} onChange={e => setA({ ...a, country: e.target.value })} className='border px-2 py-1 rounded' />
          <div className='flex gap-2'>
            <button disabled={disabled} onClick={() => { onAdd(a); setA({ line1: '', city: '', state: '', zip: '', country: '' }); setOpen(false) }} className='bg-black text-white px-3 py-1 rounded'>Add</button>
            <button onClick={() => setOpen(false)} className='px-3 py-1 rounded border'>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className='text-sm text-blue-600'>Add address</button>
      )}
    </div>
  )
}

// Change password modal (inline)
const ChangePasswordModal = ({ onClose, backendUrl, token }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!currentPassword || !newPassword) return alert('Enter both')
    setLoading(true)
    try {
      const res = await axios.post(backendUrl + '/api/user/me/change-password', { currentPassword, newPassword }, { headers: { token } })
      if (res.data.success) {
        toast.success('Password changed')
        onClose()
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center'>
      <div className='bg-white p-6 rounded max-w-md w-full'>
        <h4 className='text-lg font-medium mb-3'>Change password</h4>
        <input placeholder='Current password' type='password' value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className='w-full border rounded px-3 py-2 mb-2' />
        <input placeholder='New password' type='password' value={newPassword} onChange={e => setNewPassword(e.target.value)} className='w-full border rounded px-3 py-2 mb-4' />
        <div className='flex justify-end gap-2'>
          <button onClick={onClose} className='px-3 py-2 rounded border'>Cancel</button>
          <button onClick={submit} disabled={loading} className='px-3 py-2 rounded bg-black text-white'>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}


