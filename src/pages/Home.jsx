import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'

function Home() {
  const navigate = useNavigate()

  const handleStartPractice = (mode) => {
    // モードに応じた開始位置を決定
    let startId = '1'
    if (mode === 'desc') {
      startId = '3' // 降順の場合は最後の曲から
    }
    navigate(`/practice/${startId}?mode=${mode}`)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>HarmonyTrainer</h1>
        <p className={styles.subtitle}>音楽理論学習アプリ</p>
      </header>

      <main className={styles.main}>
        {/* 練習開始セクション */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>練習開始</h2>
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.modeButton} ${styles.randomButton}`}
              onClick={() => handleStartPractice('random')}
            >
              <span className={styles.buttonIcon}>🎲</span>
              <span className={styles.buttonLabel}>ランダム</span>
              <p className={styles.buttonDescription}>
                曲をランダムな順序で練習
              </p>
            </button>
            <button
              className={`${styles.modeButton} ${styles.ascButton}`}
              onClick={() => handleStartPractice('asc')}
            >
              <span className={styles.buttonIcon}>➡️</span>
              <span className={styles.buttonLabel}>昇順</span>
              <p className={styles.buttonDescription}>
                1番から順番に練習
              </p>
            </button>
            <button
              className={`${styles.modeButton} ${styles.descButton}`}
              onClick={() => handleStartPractice('desc')}
            >
              <span className={styles.buttonIcon}>⬅️</span>
              <span className={styles.buttonLabel}>降順</span>
              <p className={styles.buttonDescription}>
                最後から逆順に練習
              </p>
            </button>
          </div>
        </section>

        {/* 曲の管理セクション */}
        <section className={styles.section}>
          <button
            className={styles.manageButton}
            onClick={() => navigate('/songs')}
          >
            <span className={styles.manageIcon}>📝</span>
            <span className={styles.manageLabel}>曲の管理</span>
          </button>
        </section>
      </main>
    </div>
  )
}

export default Home
