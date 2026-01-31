import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);
            return data;
        } catch (error) {
            throw error.response?.data?.message || "Login failed";
        }
    };

    const loginAdmin = async (email, password) => {
        try {
            const { data } = await axios.post("http://localhost:5000/api/admin/login", {
                email,
                password,
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            setUser(data);
            return data;
        } catch (error) {
            throw error.response?.data?.message || "Admin Login failed";
        }
    };

    const register = async (name, email, password, nid, dob, constituency) => {
        try {
            const { data } = await axios.post("http://localhost:5000/api/auth/register", {
                name,
                email,
                password,
                nid,
                dob,
                constituency
            });
            // localStorage.setItem("userInfo", JSON.stringify(data)); 
            // NOTE: We don't auto-login anymore because admin approval is needed.
            // setUser(data);
            return data;
        } catch (error) {
            throw error.response?.data?.message || "Registration failed";
        }
    };

    const logout = () => {
        localStorage.removeItem("userInfo");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, loginAdmin, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
