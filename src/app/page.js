"use client";
import Head from 'next/head';
import app from './firebase/config';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [xp, setXp] = useState(1200);
  const [level, setLevel] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const xpToNextLevel = 1500;
  const [profilePic, setProfilePic] = useState(null)
  const [displayName, setDisplayName] = useState("")

  const auth = getAuth(app)
  const router = useRouter()

  useEffect(() => {
    const userInfo = auth.onAuthStateChanged((user) => {
      if (user) {
        setProfilePic(user.photoURL)
        setDisplayName(user.displayName)
      } else {
        setDisplayName(null);
        router.push('/login')
      }
    });

    return () => userInfo();
  }, [auth, router]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const openModal = () => setIsModalOpen(true); // Open modal
  const closeModal = () => setIsModalOpen(false); // Close modal

  const progress = (xp / xpToNextLevel) * 100;
  const addXp = (amount) => {
    setXp(prevXp => {
      const newXp = prevXp + amount;
      if (newXp >= xpToNextLevel) {
        setLevel(prevLevel => prevLevel + 1);
        return newXp - xpToNextLevel; // XP overflow to next level
      }
      return newXp;
    });
  };

  const practiceProblems = [
    { title: 'Problem 1', description: 'Description for problem 1' },
    // { title: 'Problem 2', description: 'Description for problem 2' },
    // { title: 'Problem 3', description: 'Description for problem 3' },
    // { title: 'Problem 4', description: 'Description for problem 4' },
    // { title: 'Problem 5', description: 'Description for problem 5' },
    // { title: 'Problem 6', description: 'Description for problem 6' },
  ];

  return (
    <div className={styles.container}>
      <Head>
        <title>ScratchSSLT</title>
        <meta name="description" content="A gamified OSSLT website" />
      </Head>

      <header className={styles.header}>
        <div className={styles.logo}>ScratchSSLT</div>
        <div className={styles.xpTracker}>
          <span className={styles.level}>Level {level} | </span>
          <span className={styles.xpText}>{xp} / {xpToNextLevel} XP</span>
        </div>
        <div className={styles.dropdown}>
          <a className={styles.host} onClick={toggleMenu}>Host</a>
          {isOpen && (
            <div className={styles.menu}>
              
              <a onClick={openModal} className={styles.menuItem}>Host Problem set</a>
              <a onClick={openModal} className={styles.menuItem}>Host OSSLT Competition</a>
            </div>
          )}
        </div>
        <div className={styles.profilePic}>
          <img src={profilePic} />
        </div>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome Back, {displayName}</h1>

        <div className={styles.grid}>
          <div className={styles.card_container}>
            <h2>Challenge Yourself</h2>
            <p>Compete with others in real-time to test your OSSLT skills.</p>
            <a className={styles.card_button1}>Start Competition</a>
          </div>

          <div className={styles.card_container}>
            <h2>Develop Your Skills</h2>
            <p>Browse and select problem sets to practice and improve your skills.</p>
            <a className={styles.card_button2}>Find Problem Sets</a>
          </div>
        </div>

        <div className={styles.scrollContainer}>
          <h2 className={styles.subtitle}>Top Practice Problems</h2>
          <div className={styles.practiceProblems}>
            {practiceProblems.map((problem, index) => (
              <div className={styles.problemCard} key={index}>
                <h3>{problem.title}</h3>
                <p>{problem.description}</p>
                <a className={styles.practiceButton}>Start Practice</a>
              </div>
            ))}
          </div>
        </div>

        <h2 className={styles.subtitle}>Leaderboard</h2>
        <div className={styles.scoreboard}>
          <div className={styles.scoreRow}>
            <span className={styles.rank}>1</span>
            <span className={styles.name}>Brandon</span>
            <span className={styles.score}>150</span>
          </div>
          <div className={styles.scoreRow}>
            <span className={styles.rank}>2</span>
            <span className={styles.name}>Alice</span>
            <span className={styles.score}>120</span>
          </div>
          <div className={styles.scoreRow}>
            <span className={styles.rank}>3</span>
            <span className={styles.name}>Bob</span>
            <span className={styles.score}>110</span>
          </div>
        </div>
      </main>
    </div>
  );
}
