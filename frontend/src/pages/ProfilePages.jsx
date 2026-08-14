import { useState, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, LogOut, Shield, Calendar, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Image upload handler with validation
 */
const ImageUploadSection = ({ onImageUpload, isUpdating, currentImage }) => {
  const fileInputRef = useState(null)[0];
  const [preview, setPreview] = useState(currentImage);

  const handleFileChange = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      if (file.size > maxSize) {
        alert("File size must be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        setPreview(base64);
        onImageUpload(base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageUpload]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <img
          src={preview || "/avatar.png"}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 group-hover:border-purple-400 transition-colors"
        />
        <label
          htmlFor="avatar-upload"
          className={`
            absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 
            flex items-center justify-center cursor-pointer transition-all
            ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <div className="bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-5 h-5 text-gray-700" />
          </div>
          <input
            type="file"
            id="avatar-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUpdating}
          />
        </label>
      </div>

      <p className="text-sm text-gray-500 text-center">
        {isUpdating ? (
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-gray-400 border-t-purple-600 animate-spin" />
            Uploading...
          </span>
        ) : (
          "Hover over avatar to update photo"
        )}
      </p>
    </div>
  );
};

/**
 * Info field component
 */
const InfoField = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      <Icon size={16} className="text-purple-600" />
      {label}
    </div>
    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm">
      {value}
    </div>
  </div>
);

/**
 * Account stats component
 */
const AccountStats = ({ createdAt }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Shield size={20} className="text-purple-600" />
        Account Information
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-200">
          <span className="text-sm text-gray-700 flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            Member Since
          </span>
          <span className="font-medium text-gray-900">{formatDate(createdAt)}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-700 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-500" />
            Account Status
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Main profile page component
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { authUser, isUpdatingProfile, updateProfile, logout } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = useCallback(
    async (base64Image) => {
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    },
    [updateProfile]
  );

  const handleLogout = useCallback(async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await logout();
      navigate("/login");
    }
  }, [logout, navigate]);

  if (!authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Your Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information and settings</p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-8">
          {/* Profile picture section */}
          <div className="border-b border-gray-200 pb-8">
            <ImageUploadSection
              onImageUpload={handleImageUpload}
              isUpdating={isUpdatingProfile}
              currentImage={selectedImg || authUser.profilePic}
            />
          </div>

          {/* User information section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoField
                icon={User}
                label="Full Name"
                value={authUser.fullName || "Not provided"}
              />
              <InfoField
                icon={Mail}
                label="Email Address"
                value={authUser.email || "Not provided"}
              />
            </div>
          </div>

          {/* Account stats section */}
          <AccountStats createdAt={authUser.createdAt} />

          {/* Action buttons */}
          <div className="border-t border-gray-200 pt-8 flex gap-3">
            <button
              onClick={() => navigate("/settings")}
              className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Shield size={18} />
              Settings
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Need help? <a href="#" className="text-purple-600 hover:underline">Contact support</a></p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
