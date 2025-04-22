'use client';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function Login() {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push('/chat');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginContentWrapper}>
        <div className={styles.leftPanel}>
          <div className={styles.brandInfo}>
            <h1 className={styles.brandTitle}>Coaching Bot</h1>
            <p className={styles.brandTagline}>Your AI-powered coaching assistant</p>
          </div>
        </div>
        
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <h2 className={styles.formTitle}>Welcome</h2>
            <p className={styles.formSubtitle}>Start chatting with your coach</p>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <button 
                type="submit" 
                className={styles.submitButton}
              >
                Continue to Chat
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 