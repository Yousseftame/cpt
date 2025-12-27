import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../../service/firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";



const db = getFirestore();

interface AuthContextType {
    user: User | null;
    role: "admin" | "superAdmin" | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
    logout: async () => { },

});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<"admin" | "superAdmin" | null>(null);




    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                await currentUser.reload(); // تحديث emailVerified

                const docRef = doc(db, "admins", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setRole(data.role); // "admin" أو "superAdmin"
                } else {
                    setRole(null);
                }
            } else {
                setRole(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);


    const logout = async () => {
        await signOut(auth);
        setUser(null); // cleanup local state
       
localStorage.removeItem('userRole');
localStorage.removeItem('userName');
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
