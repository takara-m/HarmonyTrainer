import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSongs, deleteSong } from '../utils/storage'
import styles from './Songs.module.css'
import * as backup from '../utils/backup'

// 後方互換性のためエクスポート（Practice.jsxで使用される可能性）
export const SAMPLE_SONGS = []

function Songs() {
  const [songs, setSongs] = useState([])
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [includeAudio, setIncludeAudio] = useState(true)
  const [backupSize, setBackupSize] = useState(null)
  const [restoreData, setRestoreData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleBackupClick = () => {
    const songs = getSongs()
    const size = backup.calculateBackupSize(songs, true)
    setBackupSize(size)
    setShowBackupModal(true)
  }

  const handleBackupConfirm = () => {
    setIsProcessing(true)
    try {
      const songs = getSongs()
      const backupData = backup.createBackup(songs, includeAudio)
      const result = backup.downloadBackup(backupData, includeAudio)

      if (result.success) {
        alert(`✓ バックアップを作成しました

ファイル: ${result.filename}
サイズ: ${includeAudio ? backupSize.sizeText : backup.calculateBackupSize(songs, false).sizeText}
曲数: ${songs.length}曲`)
        setShowBackupModal(false)
      } else {
        alert('バックアップの作成に失敗しました: ' + result.error)
      }
    } catch (error) {
      alert('エラーが発生しました: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRestoreClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      setIsProcessing(true)
      try {
        const backupData = await backup.readBackupFile(file)
        setRestoreData(backupData)
        setShowRestoreModal(true)
      } catch (error) {
        alert('バックアップファイルの読み込みに失敗しました:\n' + error.message)
      } finally {
        setIsProcessing(false)
      }
    }
    input.click()
  }

  const handleRestoreConfirm = () => {
    setIsProcessing(true)
    try {
      const result = backup.restoreBackup(restoreData)

      if (result.success) {
        alert(`✓ データを復元しました

曲数: ${result.importedCount}曲
音声付き: ${result.withAudio}曲`)
        setShowRestoreModal(false)
        setRestoreData(null)
        loadSongs()
      } else {
        alert('復元に失敗しました:
' + (result.errors ? result.errors.join('
') : result.error))
      }
    } catch (error) {
      alert('エラーが発生しました: ' + error.message)
    } finally {
      setIsProcessing(false)
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

        <div className={styles.backupRestoreContainer}>
          <button className={styles.backupButton} onClick={handleBackupClick}>
            ⬇ バックアップ
          </button>
          <button className={styles.restoreButton} onClick={handleRestoreClick}>
            ⬆ 復元
          </button>
        </div>

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

      {showBackupModal && (
        <div className={styles.modalOverlay} onClick={() => setShowBackupModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>バックアップを作成</h3>
            <div className={styles.modalContent}>
              <p>総曲数: {getSongs().length}曲</p>
              <p>ファイルサイズ: {includeAudio ? backupSize?.sizeText : backup.calculateBackupSize(getSongs(), false).sizeText}</p>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                />
                音声ファイルを含める
              </label>
              {!includeAudio && (
                <p className={styles.warningText}>※ コード進行のみ保存されます</p>
              )}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowBackupModal(false)}>
                キャンセル
              </button>
              <button className={styles.confirmButton} onClick={handleBackupConfirm} disabled={isProcessing}>
                {isProcessing ? 'ダウンロード中...' : 'ダウンロード'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRestoreModal && restoreData && (
        <div className={styles.modalOverlay} onClick={() => setShowRestoreModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>データを復元</h3>
            <div className={styles.modalContent}>
              <p>復元内容:</p>
              <p>- 曲数: {restoreData.totalSongs}曲</p>
              <p>- 音声付き: {restoreData.songsWithAudio}曲</p>
              <p className={styles.warningText}>⚠ 現在のデータは上書きされます</p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowRestoreModal(false)}>
                キャンセル
              </button>
              <button className={styles.confirmButton} onClick={handleRestoreConfirm} disabled={isProcessing}>
                {isProcessing ? '復元中...' : '復元する'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>処理中...</p>
        </div>
      )}
    </div>
  )
}

export default Songs
