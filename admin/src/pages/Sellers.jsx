import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Sellers = ({ token }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadApplications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.post(
        backendUrl + "/api/user/admin/seller-applications",
        {},
        { headers: { token } }
      );
      if (res.data.success) {
        setApplications(res.data.applications || []);
      } else {
        toast.error(res.data.message || "Failed to fetch applications");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (userId) => {
    try {
      const res = await axios.post(
        backendUrl + "/api/user/admin/seller-approve",
        { userId },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Seller approved");
        loadApplications();
      } else {
        toast.error(res.data.message || "Approval failed");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const reject = async (userId) => {
    const rejectionReason = window.prompt("Rejection reason", "Incomplete KYC details");
    if (rejectionReason === null) return;
    try {
      const res = await axios.post(
        backendUrl + "/api/user/admin/seller-reject",
        { userId, rejectionReason },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Seller application rejected");
        loadApplications();
      } else {
        toast.error(res.data.message || "Rejection failed");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeSeller = async (userId, name) => {
    const ok = window.confirm(
      `This will permanently remove seller "${name}" and all their products. Continue?`
    );
    if (!ok) return;

    try {
      const res = await axios.post(
        backendUrl + "/api/user/admin/seller-remove",
        { userId },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Seller removed successfully");
        loadApplications();
      } else {
        toast.error(res.data.message || "Failed to remove seller");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [token]);

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Seller Applications</h3>
      {loading && <p>Loading...</p>}
      {!loading && !applications.length && <p>No seller applications found.</p>}
      <div className="space-y-3">
        {applications.map((app) => (
          <div key={app._id} className="border rounded p-4 bg-white">
            <div className="flex justify-between items-start gap-4">
              <div className="text-sm space-y-1">
                <p className="font-semibold">{app.name}</p>
                <p>{app.email}</p>
                <p>Status: <span className="capitalize">{app.sellerProfile?.status}</span></p>
                <p>Store: {app.sellerProfile?.storeName || "-"}</p>
                <p>Business type: {app.sellerProfile?.businessType || "-"}</p>
                <p>GST: {app.sellerProfile?.gstNumber || "-"}</p>
                <p>
                  ID: {app.sellerProfile?.idDocumentType} - {app.sellerProfile?.idDocumentNumber}
                </p>
                {app.sellerProfile?.idDocumentUrl && (
                  <a className="text-blue-600 underline" href={app.sellerProfile.idDocumentUrl} target="_blank" rel="noreferrer">
                    View ID document
                  </a>
                )}
                {app.sellerProfile?.addressProofUrl && (
                  <a className="text-blue-600 underline ml-4" href={app.sellerProfile.addressProofUrl} target="_blank" rel="noreferrer">
                    View address proof
                  </a>
                )}
                {app.sellerProfile?.rejectionReason && (
                  <p className="text-red-600">Reason: {app.sellerProfile.rejectionReason}</p>
                )}
              </div>
              {app.sellerProfile?.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => approve(app._id)} className="px-3 py-2 bg-black text-white rounded text-sm">
                    Approve
                  </button>
                  <button onClick={() => reject(app._id)} className="px-3 py-2 border rounded text-sm">
                    Reject
                  </button>
                </div>
              )}
              {app.sellerProfile?.status !== "pending" && app.sellerProfile?.status !== "none" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => removeSeller(app._id, app.name)}
                    className="px-3 py-2 border border-red-500 text-red-600 rounded text-sm"
                  >
                    Remove Seller
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sellers;
