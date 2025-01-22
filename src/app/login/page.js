"use client"
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import { app } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
  // user login status
  const [user, setUser] = useState(null);
  const router = useRouter();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        // Redirect to home if user is logged in
        router.push('/');
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/');  // Redirect to home page after successful login
    } catch (error) {
      console.error("Error signing in with Google", error.message);
    }
  };

  if (user) {
    return null; // User is logged in, no need to render the login UI
  }

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <h1 className={styles.title}>ScratchSSLT</h1>
        <p className={styles.subtitle}>Be engaged in your OSSLT practice</p>
        <a onClick={signInWithGoogle} className={styles.googleButton}>
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
