  import { useState, useEffect } from 'react'
  import { Link } from 'react-router-dom'
  import { getSongs, deleteSong } from '../utils/storage'
  import styles from './Songs.module.css'

  // 後方互換性のためエクスポート（Practice.jsxで使用される可能性）
  export const SAMPLE_SONGS = []

  function Songs() {
    const [songs, setSongs] = useState([])

    useEffect(() => {
      loadSongs()
    }, [])

    const loadSongs = () => {
      const loadedSongs = getSongs()
      setSongs(loadedSongs)
    }

    const handleDelete = (id, title) => {
      if (window.confirm(`「${title}」を削除しますか？`)) {
        const success = deleteSong(id)
        if (success) {
          loadSongs() // 再読み込み
          alert('削除しました')
        } else {
          alert('削除に失敗しました')
        }
      }
    }

    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <Link to="/" className={styles.backButton}>
            ← トップへ
          </Link>
          <h1 className={styles.title}>曲の管理</h1>
        </header>

        <main className={styles.main}>
          {/* 新規追加ボタン */}
          <Link to="/songs/new" className={styles.addButton}>
            <span className={styles.addIcon}>➕</span>
            <span className={styles.addText}>新しい曲を追加</span>
          </Link>

          <div className={styles.songList}>
            {songs.map((song) => (
              <div key={song.id} className={styles.songCard}>
                <div className={styles.songInfo}>
                  <h2 className={styles.songTitle}>{song.title}</h2>
                </div>
                <div className={styles.buttonContainer}>
                  <Link
                    to={`/practice/${song.id}`}
                    state={{ song }}
                    className={`${styles.button} ${styles.practiceButton}`}
                  >
                    練習
                  </Link>
                  <Link
                    to={`/edit/${song.id}`}
                    state={{ song }}
                    className={`${styles.button} ${styles.editButton}`}
                  >
                    編集
                  </Link>
                  <button
                    className={`${styles.button} ${styles.deleteButton}`}
                    onClick={() => handleDelete(song.id, song.title)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  export default Songs