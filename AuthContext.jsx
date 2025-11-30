import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // ✅ ADMIN FUNCTIONS
  const adminGetDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const adminGetPendingApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/pending-approvals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const adminApproveUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const adminRejectUser = async (userId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${userId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const adminGetAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  // ✅ UPDATED REGISTER FUNCTION - FIXED PARAMETER
  const register = async (payload) => {
    try {
      console.log('Registration payload:', payload);

      // ✅ CREATE DATA WITH ALL REQUIRED FIELDS
      const registrationData = {
        // Login credentials
        username: payload.stepFourData?.username,
        email: payload.stepFourData?.email,
        password: payload.stepFourData?.password,
        
        // Organization basic info - REQUIRED FIELDS
        organizationName: payload.stepOneData?.nameBlocks?.[0]?.name || "Default Organization Name",
        organizationType: payload.stepOneData?.orgType?.[0] || "Other",
        
        // Representative info - REQUIRED FIELDS
        representativeName: payload.stepFourData?.representative?.name || "Default Representative",
        representativeEmail: payload.stepFourData?.representative?.email || payload.stepFourData?.email,
        
        // Organization ID - REQUIRED FIELD
        organizationId: payload.stepFourData?.verification?.stateRegistrationId || "default-id-123",
        
        // Additional optional fields
        description: payload.stepOneData?.description || "",
        mission: payload.stepOneData?.mission || "",
        contactEmail: payload.stepTwoData?.orgContactEmail || payload.stepFourData?.email,
        contactPhone: payload.stepTwoData?.orgContactPhone || "",
        establishedYear: payload.stepOneData?.establishedYear || "",
        legalForm: payload.stepOneData?.legalForm?.[0] || "",
        focusAreas: payload.stepOneData?.focusAreas || [],
        targetAudience: payload.stepOneData?.audiences || [],
        networks: payload.stepTwoData?.networks || [],
        socialLinks: payload.stepTwoData?.socialLinks || [],
        authorizedMembers: payload.stepThreeData?.formData?.authorizedMembers || [],
        secureSealText: payload.stepThreeData?.formData?.secureSealText || "",
        verificationData: payload.stepFourData?.verification || {},
        documents: payload.stepFourData?.documents || {}
      };

      console.log('Final registration data:', registrationData);

      // ✅ VALIDATE REQUIRED FIELDS
      const requiredFields = [
        'username', 'email', 'password', 'organizationName', 
        'representativeName', 'representativeEmail', 'organizationId'
      ];
      
      const missingFields = requiredFields.filter(field => !registrationData[field]);
      
      if (missingFields.length > 0) {
        return { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        };
      }

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        // Check if user is an organization
        const isOrganization = data.user.organizationName && 
                              data.user.organizationName !== "Default Organization" && 
                              data.user.organizationName !== "";
        
        if (isOrganization) {
          setRedirectPath('/organization-account-profile');
        } else {
          setRedirectPath('/account-profile');
        }
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        
        if (data.user.role === 'admin') {
          setRedirectPath('/admin/dashboard');
        } else {
          // Check if user is an organization
          const isOrganization = data.user.organizationName && 
                                data.user.organizationName !== "Default Organization" && 
                                data.user.organizationName !== "";
          
          if (isOrganization) {
            setRedirectPath('/organization-account-profile');
          } else {
            setRedirectPath('/account-profile');
          }
        }
        
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error, requiresApproval: data.requiresApproval };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
    setRedirectPath(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const clearRedirect = () => {
    setRedirectPath(null);
  };

  const updateUserProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const updateUserInterests = async (interests) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interests })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUserProfile,
    updateUserInterests,
    redirectPath,
    clearRedirect,
    // ✅ ADMIN FUNCTIONS
    adminGetDashboardStats,
    adminGetPendingApprovals,
    adminApproveUser,
    adminRejectUser,
    adminGetAllUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};